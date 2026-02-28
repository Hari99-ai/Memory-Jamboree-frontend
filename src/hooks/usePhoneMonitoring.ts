import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "../lib/client";

type CameraMode = "user" | "environment";

interface PhoneMonitoringProps {
  event_id: string;
  discipline_id: string;
  user_id: string;
  passcode: string;
}

type SocketMessage = {
  type: string;
  [key: string]: unknown;
};

const HEARTBEAT_INTERVAL_MS = 5000;
const PRECHECK_SECONDS = 30;
const FRAME_INTERVAL_MS = 1000;
const MAX_RECONNECT_MS = 10000;

export const usePhoneMonitoring = ({
  event_id,
  discipline_id,
  user_id,
  passcode,
}: PhoneMonitoringProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const precheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const manuallyClosedRef = useRef(false);
  const isMonitoringRef = useRef(false);
  const isPrecheckingRef = useRef(false);
  const lastServerMessageAtRef = useRef(Date.now());
  const queueRef = useRef<string[]>([]);
  const connectSocketRef = useRef<() => void>(() => {});

  const [verified, setVerified] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [precheckTimer, setPrecheckTimer] = useState(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>("environment");
  const [reconnectMessage, setReconnectMessage] = useState("");

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const clearReconnect = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const stopFrameLoop = useCallback(() => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
    isMonitoringRef.current = false;
    setIsMonitoring(false);
  }, []);

  const stopPrecheckLoop = useCallback(() => {
    if (precheckTimerRef.current) {
      clearInterval(precheckTimerRef.current);
      precheckTimerRef.current = null;
    }
    isPrecheckingRef.current = false;
    setPrecheckTimer(0);
  }, []);

  const closeCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const safeSend = useCallback((payload: SocketMessage) => {
    if (!payload?.type) return;
    const raw = JSON.stringify(payload);
    const ws = wsRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(raw);
      return;
    }

    queueRef.current.push(raw);
  }, []);

  const startCamera = useCallback(
    async (mode: CameraMode = cameraMode) => {
      try {
        closeCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 960 },
            height: { ideal: 540 },
            frameRate: { ideal: 15, max: 24 },
          },
          audio: false,
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraMode(mode);
      } catch (error) {
        console.error("Camera start failed:", error);
      }
    },
    [cameraMode, closeCamera]
  );

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.55);
  }, []);

  const startMonitoringLoop = useCallback(() => {
    if (frameTimerRef.current || isMonitoringRef.current) return;
    isMonitoringRef.current = true;
    setIsMonitoring(true);

    frameTimerRef.current = setInterval(() => {
      const image = captureFrame();
      if (!image) return;

      safeSend({
        type: "monitoring",
        imgData: image,
        voice_db: 0,
        timestamp: Date.now(),
      });
    }, FRAME_INTERVAL_MS);
  }, [captureFrame, safeSend]);

  const startPrecheckCountdown = useCallback(() => {
    if (isPrecheckingRef.current || isMonitoringRef.current) return;
    isPrecheckingRef.current = true;
    setPrecheckTimer(PRECHECK_SECONDS);

    precheckTimerRef.current = setInterval(() => {
      setPrecheckTimer((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          stopPrecheckLoop();
          return 0;
        }
        return next;
      });

      const image = captureFrame();
      if (!image) return;

      safeSend({
        type: "prechecking",
        image,
        voice_db: 0,
        timestamp: Date.now(),
      });
    }, 1000);
  }, [captureFrame, safeSend, stopPrecheckLoop]);

  const flushQueue = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    while (queueRef.current.length > 0 && ws.readyState === WebSocket.OPEN) {
      const message = queueRef.current.shift();
      if (message) ws.send(message);
    }
  };

  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatRef.current = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      safeSend({ type: "heartbeat", timestamp: Date.now() });

      if (Date.now() - lastServerMessageAtRef.current > HEARTBEAT_INTERVAL_MS * 3) {
        ws.close(4000, "heartbeat_timeout");
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, [safeSend]);

  const stopEverything = useCallback(() => {
    stopPrecheckLoop();
    stopFrameLoop();
    clearHeartbeat();
    clearReconnect();
  }, [stopFrameLoop, stopPrecheckLoop]);

  const scheduleReconnect = useCallback(() => {
    if (manuallyClosedRef.current) return;

    const attempt = reconnectAttemptRef.current + 1;
    reconnectAttemptRef.current = attempt;
    const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_RECONNECT_MS);
    setReconnectMessage(`Reconnecting in ${Math.ceil(delay / 1000)}s...`);

    clearReconnect();
    reconnectTimerRef.current = setTimeout(() => {
      connectSocketRef.current();
    }, delay);
  }, []);

  const handleServerMessage = useCallback(
    (message: SocketMessage) => {
      if (!message?.type) return;
      lastServerMessageAtRef.current = Date.now();

      if (message.type === "verified") {
        setVerified(true);
        safeSend({ type: "phone_ready", user_id });
        return;
      }

      if (message.type === "start_monitoring") {
        stopPrecheckLoop();
        startMonitoringLoop();
        return;
      }

      if (message.type === "stop_monitoring") {
        stopFrameLoop();
        return;
      }

      if (message.type === "ping") {
        safeSend({ type: "pong", timestamp: Date.now() });
        return;
      }

      if (message.type === "heartbeat") {
        safeSend({ type: "heartbeat_ack", timestamp: Date.now() });
      }
    },
    [safeSend, startMonitoringLoop, stopFrameLoop, stopPrecheckLoop, user_id]
  );

  const connectSocket = useCallback(() => {
    if (!discipline_id || !event_id || !user_id) return;

    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.CONNECTING || existing.readyState === WebSocket.OPEN)) {
      return;
    }

    const url = `${WS_BASE_URL}/ws/phone/${discipline_id}/${event_id}/${user_id}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      setReconnectMessage("");
      lastServerMessageAtRef.current = Date.now();
      safeSend({ type: "verify", passcode: String(passcode || "") });
      flushQueue();
      startHeartbeat();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SocketMessage;
        handleServerMessage(data);
      } catch (error) {
        console.warn("Invalid WS payload:", error);
      }
    };

    ws.onerror = () => {
      // quiet: reconnect handled in onclose
    };

    ws.onclose = () => {
      clearHeartbeat();
      if (!manuallyClosedRef.current) {
        scheduleReconnect();
      }
    };
  }, [
    discipline_id,
    event_id,
    handleServerMessage,
    passcode,
    safeSend,
    scheduleReconnect,
    startHeartbeat,
    user_id,
  ]);

  useEffect(() => {
    connectSocketRef.current = connectSocket;
  }, [connectSocket]);

  useEffect(() => {
    manuallyClosedRef.current = false;
    startCamera("environment");
    connectSocket();

    return () => {
      manuallyClosedRef.current = true;
      stopEverything();

      const ws = wsRef.current;
      wsRef.current = null;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close(1000, "unmount");
      }

      closeCamera();
    };
  }, [closeCamera, connectSocket, startCamera, stopEverything]);

  return {
    videoRef,
    verified,
    isMonitoring,
    precheckTimer,
    cameraMode,
    reconnectMessage,
    startCamera,
    startPrecheckCountdown,
    stopPhoneMonitoring: stopFrameLoop,
  };
};
