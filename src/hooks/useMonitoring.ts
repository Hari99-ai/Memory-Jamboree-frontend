import { useCallback, useEffect, useRef, useState } from "react";

type MonitoringProps = {
  baseUrl: string;
  disciplineId: number | string;
  eventId: number | string;
  userId: number | string;
  token?: string;
};

type SocketPayload = {
  type: string;
  [key: string]: unknown;
};

const HEARTBEAT_MS = 5000;
const MAX_RECONNECT_MS = 10000;
const MAX_COUNTDOWN = 15;
const POLLING_INTERVAL = 5000;

export const useMonitoring = ({ baseUrl, disciplineId, eventId, userId, token }: MonitoringProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const connectRef = useRef<() => void>(() => {});
  const lastServerMessageAtRef = useRef(Date.now());
  const terminatedRef = useRef(false);
  const manualCloseRef = useRef(false);

  const [mobileWarningLevel, setMobileWarningLevel] = useState(0);
  const [disconnectTimer, setDisconnectTimer] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [phoneReady, setPhoneReady] = useState(false);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const buildWsUrl = useCallback(() => {
    try {
      const url = new URL(baseUrl);
      const protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${url.host}/ws/desktop/${disciplineId}/${eventId}/${userId}`;
    } catch {
      return null;
    }
  }, [baseUrl, disciplineId, eventId, userId]);

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const clearReconnect = () => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
  };

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setDisconnectTimer(0);
  }, []);

  const apiCall = async (url: string, options?: RequestInit) => {
    try {
      await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // no-op
    }
  };

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const forceTerminate = useCallback(
    async (reason: string) => {
      if (terminatedRef.current) return;

      terminatedRef.current = true;
      setIsTerminated(true);
      setTerminationReason(reason);

      stopCountdown();
      stopPolling();
      clearHeartbeat();
      clearReconnect();

      const ws = wsRef.current;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close(4001, "terminated");
      }

      await apiCall(`${baseUrl}/update-event-status/${eventId}`, {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          discipline_id: disciplineId,
          status: "terminated",
          reason,
        }),
      });
    },
    [baseUrl, disciplineId, eventId, stopCountdown, stopPolling, userId]
  );

  const startCountdown = useCallback(() => {
    if (countdownRef.current || terminatedRef.current) return;
    setDisconnectTimer(MAX_COUNTDOWN);

    countdownRef.current = setInterval(() => {
      setDisconnectTimer((prev) => {
        if (prev <= 1) {
          stopCountdown();
          void forceTerminate("Mobile disconnected too long");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [forceTerminate, stopCountdown]);

  const startPolling = useCallback(() => {
    if (pollingRef.current || terminatedRef.current) return;

    pollingRef.current = setInterval(async () => {
      try {
        const url = `${baseUrl}/api/connection-status/${eventId}/${disciplineId}/${userId}`;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "disconnected") startCountdown();
        else stopCountdown();
      } catch {
        // no-op
      }
    }, POLLING_INTERVAL);
  }, [baseUrl, disciplineId, eventId, startCountdown, stopCountdown, token, userId]);

  const flushQueue = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (queueRef.current.length > 0 && ws.readyState === WebSocket.OPEN) {
      const msg = queueRef.current.shift();
      if (msg) ws.send(msg);
    }
  };

  const send = useCallback((payload: SocketPayload) => {
    if (!payload?.type) return;
    const raw = JSON.stringify(payload);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(raw);
    else queueRef.current.push(raw);
  }, []);

  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatRef.current = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      send({ type: "heartbeat", timestamp: Date.now() });
      if (Date.now() - lastServerMessageAtRef.current > HEARTBEAT_MS * 3) {
        ws.close(4000, "heartbeat_timeout");
      }
    }, HEARTBEAT_MS);
  }, [send]);

  const scheduleReconnect = useCallback(() => {
    if (terminatedRef.current || manualCloseRef.current) return;
    clearReconnect();
    const attempt = reconnectAttemptRef.current + 1;
    reconnectAttemptRef.current = attempt;
    const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_RECONNECT_MS);
    reconnectRef.current = setTimeout(() => {
      connectRef.current();
    }, delay);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      let data: SocketPayload;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!data?.type) return;
      lastServerMessageAtRef.current = Date.now();

      if (data.type === "ping") {
        send({ type: "pong", timestamp: Date.now() });
        return;
      }

      if (data.type === "heartbeat") {
        send({ type: "heartbeat_ack", timestamp: Date.now() });
        return;
      }

      if (data.type === "phone_ready") {
        setPhoneReady(true);
        setPhoneConnected(true);
        return;
      }

      if (data.type === "phone_disconnected") {
        setPhoneReady(false);
        setPhoneConnected(false);
        return;
      }

      if (data.type === "status_response") {
        setPhoneReady(Boolean(data.phone_ready));
        setPhoneConnected(Boolean(data.phone_connected));
        return;
      }

      if (data.type === "warning" && typeof data.level === "number") {
        setMobileWarningLevel(data.level);
      }

      if (data.type === "terminated") {
        void forceTerminate(typeof data.reason === "string" ? data.reason : "Server terminated exam");
      }
    },
    [forceTerminate, send]
  );

  const connect = useCallback(() => {
    const wsUrl = buildWsUrl();
    if (!wsUrl) return;

    const current = wsRef.current;
    if (current && (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
      lastServerMessageAtRef.current = Date.now();
      startHeartbeat();
      send({ type: "status_request", timestamp: Date.now() });
      flushQueue();
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      // keep quiet; close path handles reconnect
    };

    ws.onclose = () => {
      setIsConnected(false);
      clearHeartbeat();
      scheduleReconnect();
    };
  }, [buildWsUrl, handleMessage, scheduleReconnect, send, startHeartbeat]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (baseUrl === undefined || disciplineId === undefined || eventId === undefined || userId === undefined) {
      return;
    }

    manualCloseRef.current = false;
    terminatedRef.current = false;

    connect();
    startPolling();

    return () => {
      manualCloseRef.current = true;
      stopPolling();
      stopCountdown();
      clearReconnect();
      clearHeartbeat();
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close(1000, "unmount");
      }
    };
  }, [baseUrl, connect, disciplineId, eventId, startPolling, stopCountdown, stopPolling, userId]);

  const startMonitoring = useCallback(() => {
    send({ type: "start_monitoring", timestamp: Date.now() });
  }, [send]);

  const stopMonitoring = useCallback(() => {
    send({ type: "stop_monitoring", timestamp: Date.now() });
  }, [send]);

  const requestStatus = useCallback(() => {
    send({ type: "status_request", timestamp: Date.now() });
  }, [send]);

  return {
    mobileWarningLevel,
    disconnectTimer,
    isTerminated,
    terminationReason,
    isConnected,
    phoneReady,
    phoneConnected,
    startMonitoring,
    stopMonitoring,
    requestStatus,
    forceTerminate,
  };
};

// import { useEffect, useRef, useState } from "react";

// type MonitoringProps = {
//   baseUrl: string;
//   disciplineId: number | string;
//   eventId: number | string;
//   userId: number | string;
//   token?: string;
// };

// type WarningPayload = {
//   type: "warning";
//   level: number;
//   timestamp: string;
// };

// type TerminatedPayload = {
//   type: "terminated";
//   reason?: string;
//   timestamp: string;
// };

// export const useMonitoring = ({
//   baseUrl,
//   disciplineId,
//   eventId,
//   userId,
//   token
// }: MonitoringProps) => {
//   const wsRef = useRef<WebSocket | null>(null);
//   const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const terminatedRef = useRef(false);

//   const [mobileWarningLevel, setMobileWarningLevel] = useState(0);
//   const [disconnectTimer, setDisconnectTimer] = useState(0);
//   const [isTerminated, setIsTerminated] = useState(false);
//   const [terminationReason, setTerminationReason] = useState("");

//   const MAX_COUNTDOWN = 15;
//   const POLLING_INTERVAL = 5000;
//   const RECONNECT_DELAY = 3000;

//   // =====================================================
//   // SAFE WS URL BUILDER
//   // =====================================================
//   const buildWsUrl = () => {
//     try {
//       const url = new URL(baseUrl);
//       const protocol = url.protocol === "https:" ? "wss:" : "ws:";
//       return `${protocol}//${url.host}/ws/desktop/${disciplineId}/${eventId}/${userId}`;
//     } catch (err) {
//       console.error("Invalid baseUrl:", baseUrl);
//       return null;
//     }
//   };

//   // =====================================================
//   // API CALL HELPER
//   // =====================================================
//   const apiCall = async (url: string, options?: RequestInit) => {
//     try {
//       console.log("📡 API CALL →", url);

//       await fetch(url, {
//         ...options,
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         }
//       });
//     } catch (err) {
//       console.error("API call failed:", err);
//     }
//   };

//   // =====================================================
//   // FORCE TERMINATE
//   // =====================================================
//   const forceTerminate = async (reason: string) => {
//     if (terminatedRef.current) return;

//     console.warn("❌ Force terminating:", reason);

//     terminatedRef.current = true;
//     setIsTerminated(true);
//     setTerminationReason(reason);

//     stopCountdown();
//     stopPolling();

//     try {
//       wsRef.current?.close(4001, "terminated");
//     } catch {}

//     await apiCall(`${baseUrl}/update-event-status/${eventId}`, {
//       method: "POST",
//       body: JSON.stringify({
//         user_id: userId,
//         discipline_id: disciplineId,
//         status: "terminated",
//         reason
//       })
//     });
//   };

//   // =====================================================
//   // COUNTDOWN
//   // =====================================================
//   const startCountdown = () => {
//     if (countdownRef.current || terminatedRef.current) return;

//     console.log("⏳ Countdown started");

//     setDisconnectTimer(MAX_COUNTDOWN);

//     countdownRef.current = setInterval(() => {
//       setDisconnectTimer((prev) => {
//         if (prev <= 1) {
//           stopCountdown();
//           forceTerminate("Mobile disconnected too long");
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const stopCountdown = () => {
//     if (countdownRef.current) {
//       clearInterval(countdownRef.current);
//       countdownRef.current = null;
//     }
//     setDisconnectTimer(0);
//   };

//   // =====================================================
//   // POLLING CONNECTION STATUS
//   // =====================================================
//   const startPolling = () => {
//     if (pollingRef.current || terminatedRef.current) return;

//     console.log("🚀 Polling started");

//     pollingRef.current = setInterval(async () => {
//       try {
//         const url = `${baseUrl}/api/connection-status/${eventId}/${disciplineId}/${userId}`;

//         console.log("📡 Polling →", url);

//         const res = await fetch(url, {
//           headers: token
//             ? { Authorization: `Bearer ${token}` }
//             : undefined
//         });

//         if (!res.ok) {
//           console.warn("Polling response not OK:", res.status);
//           return;
//         }

//         const data = await res.json();
//         console.log("📡 Poll result:", data);

//         if (data.status === "disconnected") {
//           startCountdown();
//         } else {
//           stopCountdown();
//         }
//       } catch (err) {
//         console.error("Polling error:", err);
//       }
//     }, POLLING_INTERVAL);
//   };

//   const stopPolling = () => {
//     if (pollingRef.current) {
//       clearInterval(pollingRef.current);
//       pollingRef.current = null;
//     }
//   };

//   // =====================================================
//   // HANDLE WS MESSAGE
//   // =====================================================
//   const handleMessage = (event: MessageEvent) => {
//     try {
//       const data: WarningPayload | TerminatedPayload = JSON.parse(event.data);

//       if (data.type === "warning") {
//         console.log("⚠️ Warning received:", data.level);
//         setMobileWarningLevel(data.level);
//       }

//       if (data.type === "terminated") {
//         forceTerminate(data.reason || "Server terminated exam");
//       }
//     } catch {
//       console.log("Raw WS:", event.data);
//     }
//   };

//   // =====================================================
//   // CONNECT WS
//   // =====================================================
//   const connectWebSocket = () => {
//     const wsUrl = buildWsUrl();
//     if (!wsUrl) return;

//     console.log("🔌 Connecting WS:", wsUrl);

//     const ws = new WebSocket(wsUrl);
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("🖥 Desktop connected");
//     };

//     ws.onmessage = handleMessage;

//     ws.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     ws.onclose = (e) => {
//       console.warn("WebSocket closed:", e.code, e.reason);

//       if (!terminatedRef.current) {
//         reconnectRef.current = setTimeout(() => {
//           connectWebSocket();
//         }, RECONNECT_DELAY);
//       }
//     };
//   };

//   // =====================================================
//   // MAIN EFFECT
//   // =====================================================
//   useEffect(() => {
//     // important: do NOT block 0 values
//     if (
//       baseUrl === undefined ||
//       disciplineId === undefined ||
//       eventId === undefined ||
//       userId === undefined
//     ) {
//       console.warn("❌ Monitoring not started. Missing values.");
//       return;
//     }

//     console.log("🔥 Monitoring hook mounted");

//     connectWebSocket();
//     startPolling();

//     return () => {
//       stopPolling();
//       stopCountdown();

//       if (reconnectRef.current) {
//         clearTimeout(reconnectRef.current);
//       }

//       wsRef.current?.close();
//     };
//   }, [baseUrl, disciplineId, eventId, userId]);

//   return {
//     mobileWarningLevel,
//     disconnectTimer,
//     isTerminated,
//     terminationReason,
//     forceTerminate
//   };
// };
