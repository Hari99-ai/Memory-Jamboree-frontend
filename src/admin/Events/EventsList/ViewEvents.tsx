import { useQuery } from "@tanstack/react-query"
import { FetchEvents } from "../../../lib/api"
// import EventColumn from "./columns"
import { columns } from "./columns"
import { EventTable } from "./EventTable"
// import {  UpdateEventDialog } from "./UpdateEvent";
// import { useState } from "react";
// import { EventData } from "../../../types";
// import { toast } from "react-hot-toast";
// import { Outlet } from "react-router-dom";


export default function ViewEvents() {
  const {
    data: events,
    isLoading,
    isError,
    refetch
    } = useQuery({
    queryKey: ['event-list'],
    queryFn: FetchEvents,
  });
  // console.log(events)

  // const [dialogOpen, setDialogOpen] = useState(false);
  // const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);


  // const { mutate } = useMutation({
  //   mutationKey: ["update-event"],
  //   mutationFn: (eventData: { event_id: string, data: EventData }) => updateEvent(String(eventData.event_id), eventData.data),
  //   onSuccess: () => {
  //     toast.success("Event updated successfully");
  //     refetch();
  //     setDialogOpen(false); 
  //   },
  //   onError: () => {
  //     toast.error("Failed to update event");
  //   },
  // });

  // const handleEdit = (event: EventData) => {
  //   setSelectedEvent(event);
  //   // setDialogOpen(true);
  //   console.log(event.event_id)
  // };

  // const handlesave = () => {
  //   if(selectedEvent){
  //     mutate({
  //       event_id: String(selectedEvent.event_id), 
  //       data: {
  //         ename: selectedEvent.ename,
  //         category: selectedEvent.category,
  //         event_start: selectedEvent.event_start,
  //         event_end: selectedEvent.event_end,
  //         disciplines: selectedEvent.disciplines,
  //         estatus: selectedEvent.estatus,
  //         participants: []
  //       }
  //     });
  //   }
  //   setDialogOpen(false)
  // }

  // if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Something went wrong</div>;

  
  return (
    <div>
      <h2 className="text-3xl text-center text-[#245cab] mb-4">View Events</h2>
      <EventTable columns={columns(refetch)} data={events ?? []} isLoading={isLoading}/>
      {/* <UpdateEventDialog open={dialogOpen} setOpen={setDialogOpen} event={selectedEvent} handleSave={handlesave} /> */}
    </div>
  );
}
