import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
export function LiveExamsCard() {
  const liveExams = [
    {
      title: "UX/UI Design Final",
      time: "Live now",
      duration: "2 hours",
      participants: 45,
    },
    {
      title: "Web Development",
      time: "Starts in 30 min",
      duration: "1.5 hours",
      participants: 32,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Live Exams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {liveExams.map((exam, index) => (
            <div key={index} className="rounded-lg border border-[#245cab]/20 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">{exam.title}</h4>
                <Badge
                  variant="outline"
                  className={exam.time === "Live now" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}
                >
                  {exam.time}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Duration: {exam.duration}</span>
                <span>{exam.participants} participants</span>
              </div>
              <button className="mt-2 w-full rounded-md bg-[#245cab] py-1.5 text-sm font-medium text-white hover:bg-[#245cab]/90">
                {exam.time === "Live now" ? "Join Now" : "Get Ready"}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
