import { useEffect, useRef, useState } from "react";

type ClientType = "Phone" | "Desktop";

export const useStreamConnection = (
  clientId: string,
  discipline_id: string | number,
  clientType: ClientType = "Phone"
) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!clientId || !discipline_id) return;

    const socketUrl = `wss://aidev.gravitinfosystems.com:5000/ws/${clientId}/${discipline_id}/${clientType}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      console.log(`${clientId} connected`);
      setIsConnected(true);
    };

    ws.current.onclose = () => {
      console.log(`${clientId} disconnected`);
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, [clientId, discipline_id, clientType]);

  const sendMessage = (msg: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(msg);
    } else {
      console.warn("WebSocket is not open. Cannot send message.");
    }
  };

  return { sendMessage, isConnected };
};
