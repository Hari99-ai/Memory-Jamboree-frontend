// pages/MyEvents.tsx
import { useQuery } from "@tanstack/react-query";
import { registered_events} from "../lib/api";
import EventCard from "../myEvents/EventCard";
import { EventData } from "../types";
import { SkeletonCard } from "../admin/components/SkeletonCard";
// import { useEffect } from "react";
// import axios from "axios";
// import { api } from "../lib/client";

// const mockEvents = [
//   {
//     id: "1",
//     title: "National Memory Championship",
//     date: "2025-05-15",
//     location: "Delhi Public School",
//     imageUrl: "/images/event-1.jpg",        
//   },
//   {
//     id: "2",
//     title: "Inter-School Brain Games",
//     date: "2025-06-01",
//     location: "Modern High School",
//     imageUrl: "/images/event-2.jpg",
//   },
// ];
export default function MyEvents() {
  // const token = sessionStorage.getItem("auth_token")
  // const user_id = sessionStorage.getItem("userId")

  const { data: events = [], isLoading } = useQuery<EventData[]>({
    queryKey: ["get-registered-events"],
    queryFn: registered_events
  });

  // const filteredEvents = events.filter((event) => event.etype === 1 || event.etype === 2 );

  // console.log(events)

  // const updateStatus = async () => {
  //   if (!token) return // ⛳ FIXED: only proceed if token is present
  //   try {
  //     const res = await api.patch("/update_event_status", null, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     console.log("Status update success:", res.data)
  //   } catch (err) {
  //     console.error("Status update failed:", err)
  //   }
  // }

  // useEffect(() => {
  //   if (!token) return

  //   updateStatus() // ✅ optional: call once immediately

  //   const timer = setInterval(() => {
  //     updateStatus()
  //   }, 6000) // ✅ call every 60 seconds

  //   return () => clearInterval(timer)
  // }, [token])
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length:3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {events.length > 0 ? (
              <>
                {events.map((event) => (
                  <EventCard key={event.event_id} event={event} />
              ))}
              </>
            ) : (
              <p className="text-gray-400 text-xl ">You have No Registerd Events!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
