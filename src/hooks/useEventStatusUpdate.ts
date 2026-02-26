/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { eventStatusState } from '../atoms/eventAtom';
import { api } from '../lib/client';


const getEventStatus = (etype: number): string => {
  switch (etype) {
    case 0:
      return "Expired"
    case 1:
      return "Live"
    case 2:
      return "Upcoming"
    default:
      return "Unknown"
  }
}

export const useEventWebSocket = (event_id?: string) => {
  const setEventStatus = useSetRecoilState(eventStatusState(event_id ?? ""));

  // const response =  await api.post(`/update-event-status/${event_id}`)
  // return response.data

  useEffect(() => {
    if (!event_id) return;
    const token = sessionStorage.getItem("auth_token")

    const fetchAndUpdateStatus = async () => {
      try {
        const response = await api.post(
        `/update-event-status/${event_id}`,
        {}, // request body (empty in this case)
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

        const { etype } = response.data;
        setEventStatus(getEventStatus(etype));
      } catch (err) {
        console.error("❌ Failed to fetch event status:", err);
      }
    };
    fetchAndUpdateStatus();


    const ws = new WebSocket('wss://aidev.gravitinfosystems.com:5000/ws/status');
    ws.onopen = () => {
      console.log('✅ Event Status WebSocket connected');
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // expected: { eventId: "event_123", etype: 1 }
        console.log("📨 WebSocket message received:", data);
        if (data.event_id === event_id && typeof data.etype === "number") {
           const statusText = getEventStatus(data.etype);
            console.log("✔ Updating status to:", statusText);
            setEventStatus(statusText);
        }
      } catch (err) {
        console.error("WebSocket parse error", err);
      }
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket error', err);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [event_id]);
};

