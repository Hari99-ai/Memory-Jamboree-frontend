import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { CalendarDays, Clock } from "lucide-react"
export default function EventsCard() {
  const events = [
    {
      title: "Poster Challenge",
      date: "Nov 24 Wed",
      time: "3 PM",
    },
    {
      title: "Career Day",
      date: "Nov 25 Thu",
      time: "2 PM",
    },
    {
      title: "Typography Master Class",
      date: "Nov 26 Fri",
      time: "4 PM",
    },
    {
      title: "Learning Figma",
      date: "Nov 27 Sat",
      time: "1 PM",
    },
    {
      title: "Presentation for Branding",
      date: "Nov 28 Sun",
      time: "5 PM",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Events</CardTitle>
        <a href="/events" className="text-sm text-[#245cab]">
          View all →
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50">
              <div>
                <h4 className="font-medium">{event.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-[#245cab] px-2 py-1 text-xs text-white">Join</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
