import { useQuery } from "@tanstack/react-query";
import { FetchEvents } from "../../../lib/api";
import { columns } from "./columns";
import { EventTable } from "./EventTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function ViewEvents() {
  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["event-list"],
    queryFn: FetchEvents,
  });

  // Sort events from latest to oldest based on the start date
  const sortedEvents = (events ?? []).slice().sort((a: any, b: any) => {
    return (
      new Date(b.event_start).getTime() - new Date(a.event_start).getTime()
    );
  });

  if (isError) return <div>Something went wrong</div>;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="shadow-lg border rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-[#245cab]">
            View Events
          </CardTitle>
        </CardHeader>

        <CardContent>
          <EventTable
            columns={columns(refetch)}
            data={sortedEvents ?? []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
