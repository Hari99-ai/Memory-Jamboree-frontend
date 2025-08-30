import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useEventStatusSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = new WebSocket("wss://aidev.gravitinfosystems.com:5000/usestatus");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      console.log("🔄 Status update received:", event.data);
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🚫 WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [queryClient]);
};

