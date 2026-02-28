// pages/MyEvents.tsx
// import { useQuery } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getUserEvents } from "../lib/api";
import EventCard from "../myEvents/EventCard";
import { EventData } from "../types";
// import { getUserEvents } from "../lib/api";
// import { EventData } from "../types";

export default function MyEvents() {
  const { data: events = [], isLoading } = useQuery<EventData[]>({
    queryKey: ["get-events"],
    queryFn: getUserEvents,
  });
  if (isLoading) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.event_id} event={event} />
        ))}
      </div>
    </div>
  );
}