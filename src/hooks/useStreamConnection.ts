import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "../lib/client";

type Role = "phone" | "desktop";

type UseStreamConnectionProps = {
  role: Role;
  disciplineId: string | number;
  eventId: string | number;
  userId: string | number;
  passcode?: string;
  onMessage?: (data: Record<string, unknown>) => void;
};

type MessagePayload = {
  type: string;
  [key: string]: unknown;
};

const HEARTBEAT_MS = 5000;
const MAX_RECONNECT_MS = 10000;

export const useStreamConnection = ({
  role,
  disciplineId,
  eventId,
  userId,
  passcode,
  onMessage,
}: UseStreamConnectionProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queueRef = useRef<string[]>([]);
  const connectRef = useRef<() => void>(() => {});
  const reconnectAttemptRef = useRef(0);
  const lastMessageAtRef = useRef(Date.now());
  const manuallyClosedRef = useRef(false);
  const onMessageRef = useRef(onMessage);

  const [isConnected, setIsConnected] = useState(false);

  onMessageRef.current = onMessage;

  const clearReconnect = () => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
  };

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const flushQueue = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    while (queueRef.current.length > 0 && ws.readyState === WebSocket.OPEN) {
      const msg = queueRef.current.shift();
      if (msg) ws.send(msg);
    }
  };

  const sendMessage = useCallback((payload: MessagePayload) => {
    if (!payload?.type) return;
    const raw = JSON.stringify(payload);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(raw);
    else queueRef.current.push(raw);
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (manuallyClosedRef.current) return;
    clearReconnect();
    const attempt = reconnectAttemptRef.current + 1;
    reconnectAttemptRef.current = attempt;
    const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_RECONNECT_MS);
    reconnectRef.current = setTimeout(() => connectRef.current(), delay);
  }, []);

  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatRef.current = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      sendMessage({ type: "heartbeat", timestamp: Date.now() });
      if (Date.now() - lastMessageAtRef.current > HEARTBEAT_MS * 3) {
        ws.close(4000, "heartbeat_timeout");
      }
    }, HEARTBEAT_MS);
  }, [sendMessage]);

  const connect = useCallback(() => {
    if (!disciplineId || !eventId || !userId) return;

    const current = wsRef.current;
    if (current && (current.readyState === WebSocket.CONNECTING || current.readyState === WebSocket.OPEN)) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/${role}/${disciplineId}/${eventId}/${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
      lastMessageAtRef.current = Date.now();
      startHeartbeat();
      if (role === "phone") {
        sendMessage({ type: "verify", passcode: String(passcode || "") });
      } else {
        sendMessage({ type: "status_request", timestamp: Date.now() });
      }
      flushQueue();
    };

    ws.onmessage = (event) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(event.data) as Record<string, unknown>;
      } catch {
        return;
      }

      const msgType = typeof data.type === "string" ? data.type : "";
      if (!msgType) return;
      lastMessageAtRef.current = Date.now();

      if (msgType === "ping") sendMessage({ type: "pong", timestamp: Date.now() });
      if (msgType === "heartbeat") sendMessage({ type: "heartbeat_ack", timestamp: Date.now() });

      onMessageRef.current?.(data);
    };

    ws.onerror = () => {
      // keep logs quiet; reconnect handled in onclose
    };

    ws.onclose = () => {
      setIsConnected(false);
      clearHeartbeat();
      scheduleReconnect();
    };
  }, [disciplineId, eventId, passcode, role, scheduleReconnect, sendMessage, startHeartbeat, userId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    manuallyClosedRef.current = false;
    connect();
    return () => {
      manuallyClosedRef.current = true;
      clearReconnect();
      clearHeartbeat();
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close(1000, "unmount");
      }
    };
  }, [connect]);

  return { sendMessage, isConnected };
};
