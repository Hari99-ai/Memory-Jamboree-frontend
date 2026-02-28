import { useEffect, useRef, useState } from "react";

type MonitoringProps = {
  baseUrl: string;
  disciplineId: number | string;
  eventId: number | string;
  userId: number | string;
  token?: string;
};

type WarningPayload = {
  type: "warning";
  level: number;
  timestamp: string;
};

type TerminatedPayload = {
  type: "terminated";
  reason?: string;
  timestamp: string;
};

export const useMonitoring = ({
  baseUrl,
  disciplineId,
  eventId,
  userId,
  token
}: MonitoringProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminatedRef = useRef(false);

  const [mobileWarningLevel, setMobileWarningLevel] = useState(0);
  const [disconnectTimer, setDisconnectTimer] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  const MAX_COUNTDOWN = 15;
  const POLLING_INTERVAL = 5000;
  const RECONNECT_DELAY = 3000;

  // =====================================================
  // SAFE WS URL BUILDER
  // =====================================================
  const buildWsUrl = () => {
    try {
      const url = new URL(baseUrl);
      const protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${url.host}/ws/desktop/${disciplineId}/${eventId}/${userId}`;
    } catch (err) {
      console.error("Invalid baseUrl:", baseUrl);
      return null;
    }
  };

  // =====================================================
  // API CALL HELPER
  // =====================================================
  const apiCall = async (url: string, options?: RequestInit) => {
    try {
      console.log("📡 API CALL →", url);

      await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
    } catch (err) {
      console.error("API call failed:", err);
    }
  };

  // =====================================================
  // FORCE TERMINATE
  // =====================================================
  const forceTerminate = async (reason: string) => {
    if (terminatedRef.current) return;

    console.warn("❌ Force terminating:", reason);

    terminatedRef.current = true;
    setIsTerminated(true);
    setTerminationReason(reason);

    stopCountdown();
    stopPolling();

    try {
      wsRef.current?.close(4001, "terminated");
    } catch {}

    await apiCall(`${baseUrl}/update-event-status/${eventId}`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        discipline_id: disciplineId,
        status: "terminated",
        reason
      })
    });
  };

  // =====================================================
  // COUNTDOWN
  // =====================================================
  const startCountdown = () => {
    if (countdownRef.current || terminatedRef.current) return;

    console.log("⏳ Countdown started");

    setDisconnectTimer(MAX_COUNTDOWN);

    countdownRef.current = setInterval(() => {
      setDisconnectTimer((prev) => {
        if (prev <= 1) {
          stopCountdown();
          forceTerminate("Mobile disconnected too long");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setDisconnectTimer(0);
  };

  // =====================================================
  // POLLING CONNECTION STATUS
  // =====================================================
  const startPolling = () => {
    if (pollingRef.current || terminatedRef.current) return;

    console.log("🚀 Polling started");

    pollingRef.current = setInterval(async () => {
      try {
        const url = `${baseUrl}/api/connection-status/${eventId}/${disciplineId}/${userId}`;

        console.log("📡 Polling →", url);

        const res = await fetch(url, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined
        });

        if (!res.ok) {
          console.warn("Polling response not OK:", res.status);
          return;
        }

        const data = await res.json();
        console.log("📡 Poll result:", data);

        if (data.status === "disconnected") {
          startCountdown();
        } else {
          stopCountdown();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // =====================================================
  // HANDLE WS MESSAGE
  // =====================================================
  const handleMessage = (event: MessageEvent) => {
    try {
      const data: WarningPayload | TerminatedPayload = JSON.parse(event.data);

      if (data.type === "warning") {
        console.log("⚠️ Warning received:", data.level);
        setMobileWarningLevel(data.level);
      }

      if (data.type === "terminated") {
        forceTerminate(data.reason || "Server terminated exam");
      }
    } catch {
      console.log("Raw WS:", event.data);
    }
  };

  // =====================================================
  // CONNECT WS
  // =====================================================
  const connectWebSocket = () => {
    const wsUrl = buildWsUrl();
    if (!wsUrl) return;

    console.log("🔌 Connecting WS:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🖥 Desktop connected");
    };

    ws.onmessage = handleMessage;

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = (e) => {
      console.warn("WebSocket closed:", e.code, e.reason);

      if (!terminatedRef.current) {
        reconnectRef.current = setTimeout(() => {
          connectWebSocket();
        }, RECONNECT_DELAY);
      }
    };
  };

  // =====================================================
  // MAIN EFFECT
  // =====================================================
  useEffect(() => {
    // important: do NOT block 0 values
    if (
      baseUrl === undefined ||
      disciplineId === undefined ||
      eventId === undefined ||
      userId === undefined
    ) {
      console.warn("❌ Monitoring not started. Missing values.");
      return;
    }

    console.log("🔥 Monitoring hook mounted");

    connectWebSocket();
    startPolling();

    return () => {
      stopPolling();
      stopCountdown();

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }

      wsRef.current?.close();
    };
  }, [baseUrl, disciplineId, eventId, userId]);

  return {
    mobileWarningLevel,
    disconnectTimer,
    isTerminated,
    terminationReason,
    forceTerminate
  };
};
