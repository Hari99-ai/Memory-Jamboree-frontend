// pages/MyEvents.tsx
// import { useQuery } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { getUserEvents } from "../lib/api";
import EventCard from "../myEvents/EventCard";
import { EventData } from "../types";
// import { getUserEvents } from "../lib/api";
// import { EventData } from "../types";

// const imageUrls = [
//   "/images/event-1.jpg",
//   "/images/event-2.jpg",
//   "/images/event-3.jpg",
//   "/images/event-4.jpg",
//   "/images/event-5.jpg",
// ];

// const descriptions = [
//   "Join us for an exciting challenge!",
//   "Test your knowledge and skills.",
//   "Compete with the best minds.",
//   "Enhance your abilities in a fun way.",
//   "A thrilling event awaits you.",
// ];

// const mockEvents = [
//   {
//     id: "1",
//     title: "National Memory Championship",
//     date: "2025-05-15",
//     location: "Delhi Public School",
//   },
//   {
//     id: "2",
//     title: "Inter-School Brain Games",
//     date: "2025-06-01",
//     location: "Modern High School",
//   },
//   {
//     id: "3",
//     title: "Logic Puzzle Marathon",
//     date: "2025-06-10",
//     location: "City Central Library",
//   },
//   {
//     id: "4",
//     title: "Visual Recall Sprint",
//     date: "2025-06-20",
//     location: "Community Hall",
//   },
//   {
//     id: "5",
//     title: "Word Association Blitz",
//     date: "2025-07-05",
//     location: "Town Auditorium",
//   },
// ];

// const eventsWithImages = mockEvents.map((event) => ({
//   ...event,
//   imageUrl: imageUrls[Math.floor(Math.random() * imageUrls.length)],
//   description: descriptions[Math.floor(Math.random() * descriptions.length)],
// }));



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
// MyEventsSection.tsx

// import { useQuery } from "@tanstack/react-query";
// import { getUserEvents } from "../lib/api";
// import EventCard from "../myEvents/EventCard";
// const mockEvents = [
//   {
//     event_id: "1",
//     ename: "National Memory Championship",
//     event_start: "2025-05-15",
//     event_end: "2025-05-16",
//     estatus: "Upcoming",
//     disciplines: [],
//   },
//   {
//     event_id: "2",
//     ename: "Inter-School Brain Games",
//     event_start: "2025-06-01",
//     event_end: "2025-06-02",
//     estatus: "Ongoing",
//     disciplines: [],
//   },
//   {
//     event_id: "3",
//     ename: "Logic Puzzle Marathon",
//     event_start: "2025-06-10",
//     event_end: "2025-06-10",
//     estatus: "Completed",
//     disciplines: [],
//   },
//   {
//     event_id: "4",
//     ename: "Visual Recall Sprint",
//     event_start: "2025-06-20",
//     event_end: "2025-06-21",
//     estatus: "Upcoming",
//     disciplines: [],
//   },
//   {
//     event_id: "5",
//     ename: "Word Association Blitz",
//     event_start: "2025-07-05",
//     event_end: "2025-07-06",
//     estatus: "Upcoming",
//     disciplines: [],
//   },
// ];

// export default function MyEvents() {
//   // const { data: events = [], isLoading } = useQuery<EventData[]>({
//   //   queryKey: ["get-events"],
//   //   queryFn: getUserEvents,
//   // });

//   // if (isLoading) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-6 text-gray-900">My Events</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {mockEvents.map((event) => (
//           <EventCard key={event.event_id} event={event} />
//         ))}
//       </div>
//     </div>
//   );
// }
