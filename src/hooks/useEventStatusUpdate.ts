import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { eventStatusState } from "../atoms/eventAtom";
import { api } from "../lib/client";

type StatusMsg = {
  event_id?: string;
  etype?: number;
};

const STATUS_WS_URL = "wss://aidev.gravitinfosystems.com:5000/ws/status";
const RECONNECT_DELAY_MS = 2000;
const DEV_CLOSE_GRACE_MS = 1500;

let sharedWs: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let shouldKeepAlive = false;
const listeners = new Set<(data: StatusMsg) => void>();

const getEventStatus = (etype: number): string => {
  switch (etype) {
    case 0:
      return "Expired";
    case 1:
      return "Live";
    case 2:
      return "Upcoming";
    default:
      return "Unknown";
  }
};

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const clearCloseTimer = () => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const scheduleReconnect = () => {
  if (!shouldKeepAlive || reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    ensureSocket();
  }, RECONNECT_DELAY_MS);
};

const ensureSocket = () => {
  clearCloseTimer();
  if (!shouldKeepAlive) return;
  if (sharedWs && (sharedWs.readyState === WebSocket.OPEN || sharedWs.readyState === WebSocket.CONNECTING)) return;

  const ws = new WebSocket(STATUS_WS_URL);
  sharedWs = ws;

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as StatusMsg;
      listeners.forEach((cb) => cb(data));
    } catch (error) {
      console.error("WebSocket parse error:", error);
    }
  };

  ws.onerror = () => {
    // avoid noisy transient error logs
  };

  ws.onclose = () => {
    if (sharedWs === ws) sharedWs = null;
    scheduleReconnect();
  };
};

const releaseSocket = () => {
  shouldKeepAlive = listeners.size > 0;
  if (shouldKeepAlive) return;

  clearReconnectTimer();
  clearCloseTimer();

  closeTimer = setTimeout(() => {
    if (listeners.size > 0) return;
    shouldKeepAlive = false;
    if (sharedWs && (sharedWs.readyState === WebSocket.OPEN || sharedWs.readyState === WebSocket.CONNECTING)) {
      sharedWs.close(1000, "no_subscribers");
    }
    sharedWs = null;
  }, DEV_CLOSE_GRACE_MS);
};

export const useEventWebSocket = (event_id?: string) => {
  const setEventStatus = useSetRecoilState(eventStatusState(event_id ?? ""));

  useEffect(() => {
    if (!event_id) return;
    const token = sessionStorage.getItem("auth_token");

    const fetchAndUpdateStatus = async () => {
      try {
        const response = await api.post(
          `/update-event-status/${event_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { etype } = response.data;
        setEventStatus(getEventStatus(etype));
      } catch (error) {
        console.error("Failed to fetch event status:", error);
      }
    };

    const onStatus = (data: StatusMsg) => {
      if (data.event_id === event_id && typeof data.etype === "number") {
        setEventStatus(getEventStatus(data.etype));
      }
    };

    fetchAndUpdateStatus();
    listeners.add(onStatus);
    shouldKeepAlive = true;
    ensureSocket();

    return () => {
      listeners.delete(onStatus);
      releaseSocket();
    };
  }, [event_id, setEventStatus]);
};






// /* eslint-disable react-hooks/rules-of-hooks */
// import { useEffect } from 'react';
// import { useSetRecoilState } from 'recoil';
// import { eventStatusState } from '../atoms/eventAtom';
// import { api } from '../lib/client';


// const getEventStatus = (etype: number): string => {
//   switch (etype) {
//     case 0:
//       return "Expired"
//     case 1:
//       return "Live"
//     case 2:
//       return "Upcoming"
//     default:
//       return "Unknown"
//   }
// }

// export const useEventWebSocket = (event_id?: string) => {
//   const setEventStatus = useSetRecoilState(eventStatusState(event_id ?? ""));

//   // const response =  await api.post(`/update-event-status/${event_id}`)
//   // return response.data

//   useEffect(() => {
//     if (!event_id) return;
//     const token = sessionStorage.getItem("auth_token")

//     const fetchAndUpdateStatus = async () => {
//       try {
//         const response = await api.post(
//         `/update-event-status/${event_id}`,
//         {}, // request body (empty in this case)
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//         const { etype } = response.data;
//         setEventStatus(getEventStatus(etype));
//       } catch (err) {
//         console.error("❌ Failed to fetch event status:", err);
//       }
//     };
//     fetchAndUpdateStatus();


//     const ws = new WebSocket('wss://aidev.gravitinfosystems.com:5000/ws/status');
//     ws.onopen = () => {
//       console.log('✅ Event Status WebSocket connected');
//     };
//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data); // expected: { eventId: "event_123", etype: 1 }
//         console.log("📨 WebSocket message received:", data);
//         if (data.event_id === event_id && typeof data.etype === "number") {
//            const statusText = getEventStatus(data.etype);
//             console.log("✔ Updating status to:", statusText);
//             setEventStatus(statusText);
//         }
//       } catch (err) {
//         console.error("WebSocket parse error", err);
//       }
//     };

//     ws.onerror = (err) => {
//       console.error('❌ WebSocket error', err);
//     };

//     ws.onclose = () => {
//       console.log('🔌 WebSocket disconnected');
//     };

//     return () => {
//       ws.close();
//     };
//   }, [event_id]);
// };

