import { useQuery } from "@tanstack/react-query";
import { registered_events } from "../lib/api";
import { EventData } from "../types";
import { SkeletonCard } from "../admin/components/SkeletonCard";
import EventCard from "../myEvents/EventCard";

export default function EventRegisterd() {
  const { data: events = [], isLoading } = useQuery<EventData[]>({
    queryKey: ["get-registered-events"],
    queryFn: registered_events
  });
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Registered Event</h1>
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
  )
}