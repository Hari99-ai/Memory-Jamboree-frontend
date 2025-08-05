import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { CalendarDays, Clock } from "lucide-react"
export default function UpcomingExamsCard() {
  const upcomingExams = [
    {
      title: "UX/UI Design Final",
      date: "Dec 15, 2023",
      time: "10:00 AM",
      duration: "2 hours",
    },
    {
      title: "Content Writing",
      date: "Dec 20, 2023",
      time: "2:00 PM",
      duration: "1.5 hours",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Upcoming Exams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingExams.map((exam, index) => (
            <div key={index} className="rounded-lg border border-[#245cab]/20 bg-white p-3">
              <h4 className="font-medium">{exam.title}</h4>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  <span>{exam.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{exam.time}</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">Duration: {exam.duration}</div>
              <button className="mt-2 w-full rounded-md bg-[#e8c740] py-1.5 text-sm font-medium text-[#0f1114] hover:bg-[#e8c740]/90">
                Prepare
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
