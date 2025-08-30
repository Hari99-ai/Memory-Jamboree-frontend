import { useQuery } from "@tanstack/react-query";
import { FetchEvents } from "../../../lib/api";
import { columns } from "./columns";
import { EventTable } from "./EventTable";

export default function ViewEvents() {
  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['event-list'],
    queryFn: FetchEvents,
  });

  // Sort events from latest to oldest based on the start date
  const sortedEvents = (events ?? []).slice().sort((a: any, b: any) => {
    return new Date(b.event_start).getTime() - new Date(a.event_start).getTime();
  });

  if (isError) return <div>Something went wrong</div>;

  return (
    <div>
      <h2 className="text-3xl text-center text-[#245cab] mb-4">View Events</h2>
      <EventTable columns={columns(refetch)} data={sortedEvents ?? []} isLoading={isLoading}/>
    </div>
  );
}