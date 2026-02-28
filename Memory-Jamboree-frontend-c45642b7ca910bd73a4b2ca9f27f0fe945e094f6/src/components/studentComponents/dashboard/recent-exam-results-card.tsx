import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"

export default function RecentExamResultsCard() {
  const examResults = [
    {
      title: "UX/UI Design Mid-term",
      date: "Nov 15, 2023",
      score: 92,
      status: "Passed",
    },
    {
      title: "Content Writing Quiz",
      date: "Nov 10, 2023",
      score: 78,
      status: "Passed",
    },
    {
      title: "JavaScript Fundamentals",
      date: "Nov 5, 2023",
      score: 65,
      status: "Passed",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Exam Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {examResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50">
              <div>
                <h4 className="font-medium">{result.title}</h4>
                <p className="text-xs text-gray-500">{result.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{result.score}%</span>
                <Badge
                  variant="outline"
                  className={
                    result.score >= 80
                      ? "bg-green-50 text-green-600"
                      : result.score >= 70
                        ? "bg-blue-50 text-blue-600"
                        : "bg-yellow-50 text-yellow-600"
                  }
                >
                  {result.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
