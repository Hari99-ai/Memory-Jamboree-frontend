import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WS_BASE_URL } from "../lib/client";

type Role = "desktop" | "phone";

type UseProctoringWebSocketParams = {
  role: Role;
  disciplineId: string;
  eventId: string;
  userId: string;
  enabled: boolean;
  onMessage?: (payload: Record<string, unknown>) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
};

const HEARTBEAT_INTERVAL_MS = 5000;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 10000;

export const useProctoringWebSocket = ({
  role,
  disciplineId,
  eventId,
  userId,
  enabled,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseProctoringWebSocketParams) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const messageQueueRef = useRef<string[]>([]);
  const connectIdRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  const [isConnected, setIsConnected] = useState(false);

  const wsUrl = useMemo(() => {
    return `${WS_BASE_URL}/ws/${role}/${disciplineId}/${eventId}/${userId}`;
  }, [disciplineId, eventId, role, userId]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const sendJson = useCallback((payload: Record<string, unknown>) => {
    const serialized = JSON.stringify(payload);
    const ws = socketRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(serialized);
      return true;
    }

    messageQueueRef.current.push(serialized);
    return false;
  }, []);

  const flushQueue = useCallback(() => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    while (messageQueueRef.current.length > 0) {
      const message = messageQueueRef.current.shift();
      if (message) ws.send(message);
    }
  }, []);

  const closeSocket = useCallback(
    (code = 1000, reason = "client_close") => {
      clearHeartbeat();
      const ws = socketRef.current;
      if (ws) {
        socketRef.current = null;
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close(code, reason);
        }
      }
      setIsConnected(false);
    },
    [clearHeartbeat]
  );

  const scheduleReconnect = useCallback(() => {
    if (!enabled || !shouldReconnectRef.current) return;

    clearReconnectTimer();
    const attempt = reconnectAttemptsRef.current + 1;
    reconnectAttemptsRef.current = attempt;
    const delay =
      attempt === 1
        ? 0
        : Math.min(
            RECONNECT_BASE_DELAY_MS * 2 ** (attempt - 2),
            RECONNECT_MAX_DELAY_MS
          );

    reconnectTimerRef.current = setTimeout(() => {
      connectIdRef.current += 1;
      const connectId = connectIdRef.current;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (connectId !== connectIdRef.current) return;
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        onOpenRef.current?.();
        flushQueue();

        clearHeartbeat();
        heartbeatRef.current = setInterval(() => {
          sendJson({ type: "heartbeat", timestamp: new Date().toISOString() });
        }, HEARTBEAT_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        if (connectId !== connectIdRef.current) return;
        try {
          const payload = JSON.parse(event.data) as Record<string, unknown>;

          if (payload?.type === "ping") {
            sendJson({ type: "pong", timestamp: new Date().toISOString() });
          } else if (payload?.type === "heartbeat_ack") {
            return;
          }

          onMessageRef.current?.(payload);
        } catch {
          // Ignore non-JSON payloads from the server.
        }
      };

      ws.onerror = (event) => {
        if (connectId !== connectIdRef.current) return;
        onErrorRef.current?.(event);
      };

      ws.onclose = (event) => {
        if (connectId !== connectIdRef.current) return;
        clearHeartbeat();
        setIsConnected(false);
        onCloseRef.current?.(event);
        scheduleReconnect();
      };
    }, delay);
  }, [
    clearHeartbeat,
    clearReconnectTimer,
    enabled,
    flushQueue,
    sendJson,
    wsUrl,
  ]);

  const connect = useCallback(() => {
    if (!enabled) return;
    shouldReconnectRef.current = true;
    scheduleReconnect();
  }, [enabled, scheduleReconnect]);

  const disconnect = useCallback(
    (code = 1000, reason = "component_unmount") => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      closeSocket(code, reason);
      messageQueueRef.current = [];
    },
    [clearReconnectTimer, closeSocket]
  );

  useEffect(() => {
    if (!enabled) {
      disconnect(1000, "disabled");
      return;
    }

    connect();
    return () => {
      disconnect(1000, "cleanup");
    };
  }, [connect, disconnect, enabled, wsUrl]);

  return {
    isConnected,
    sendJson,
    connect,
    disconnect,
    socketRef,
  };
};
