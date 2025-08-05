import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import  CalendarComponent  from "./calendar"
export default function ExamScheduleCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Exam Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarComponent />
      </CardContent>
    </Card>
  )
}
