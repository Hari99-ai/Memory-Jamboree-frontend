import { Trophy, Medal, Award, TrendingUp } from "lucide-react"
// import { useQuery } from "@tanstack/react-query"
// import { getAchievement } from "../../../lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card"
import { useDashboardData } from "../../../hooks/useStudentDashboardData"

export function MyAchievementsCard() {
  // const { data: achievement  } = useQuery({
  //   queryKey: ['achievements'],
  //   queryFn: getAchievement,
  // })

  const {data: achievement} = useDashboardData()

  


  const practiceScore = Math.round(achievement?.max_practice_test_score ?? 0)
  const eventScore = Math.round(achievement?.highest_event?.highest_event_score ?? 0)

  // ---------------- Practice Achievement ----------------
  let practiceTitle = "No Achievement Yet"
  let PracticeIcon = TrendingUp
  let practiceColor = "text-gray-400"

  if (practiceScore >= 90) {
    practiceTitle = "Top Performer"
    PracticeIcon = Trophy
    practiceColor = "text-[#e8c740]"
  } else if (practiceScore >= 75) {
    practiceTitle = "Excellent"
    PracticeIcon = Medal
    practiceColor = "text-[#245cab]"
  } else if (practiceScore >= 50) {
    practiceTitle = "Good Effort"
    PracticeIcon = Award
    practiceColor = "text-[#FF8B00]"
  } else if (practiceScore > 0) {
    practiceTitle = "Needs Improvement"
    PracticeIcon = TrendingUp
    practiceColor = "text-red-400"
  }

  // ---------------- Event Achievement ----------------
  let eventTitle = "No Event Achievement"
  let EventIcon = TrendingUp
  let eventColor = "text-gray-400"

  if (eventScore >= 90 ) {
    eventTitle = "Top Event Performer"
    EventIcon = Trophy
    eventColor = "text-[#e8c740]"
  } else if (eventScore >= 75) {
    eventTitle = "Event Excellence"
    EventIcon = Medal
    eventColor = "text-[#245cab]"
  } else if (eventScore >= 50) {
    eventTitle = "Good Effort in Event"
    EventIcon = Award
    eventColor = "text-[#FF8B00]"
  } else if (eventScore > 0) {
    eventTitle = "Needs Improvement in Event"
    EventIcon = TrendingUp
    eventColor = "text-red-400"
  }
  


  const eventRank = achievement?.best_event_rank ?? 0

  let rankTitle = "No Rank Achievement"
  let RankIcon = TrendingUp
  let rankColor = "text-gray-400"

  if (eventRank === 1) {
    rankTitle = "Champion"
    RankIcon = Trophy
    rankColor = "text-[#e8c740]"
  } else if (eventRank <= 3 && eventRank > 1) {
    rankTitle = "Top 3 Finisher"
    RankIcon = Medal
    rankColor = "text-[#245cab]"
  } else if (eventRank <= 10 && eventRank > 3) {
    rankTitle = "Top 10 Achiever"
    RankIcon = Award
    rankColor = "text-[#FF8B00]"
  } else if (eventRank > 10) {
    rankTitle = "Keep Improving"
    RankIcon = TrendingUp
    rankColor = "text-red-400"
  }





  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">My Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md p-2 hover:bg-gray-50">
            <div className={`rounded-full bg-gray-100 p-2 ${practiceColor}`}>
              <PracticeIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{practiceTitle}</h4>
              <p className="text-[16px] text-gray-600">Your Highest Practice Test score is: <span className="text-black font-bold">{practiceScore}</span></p>
             
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-md p-2 hover:bg-gray-50">
            <div className={`rounded-full bg-gray-100 p-2 ${rankColor}`}>
              <RankIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{rankTitle}</h4>
              <p className="text-[16px] text-gray-600">
                Your Highest Event Rank: <span className="text-black font-bold">{achievement?.best_event_rank ?? "N/A"}</span>
              </p>
            
              <p className="text-sm text-gray-500">{achievement?.highest_event?.event_name ?? "No Event Yet"}</p>
            </div>
          </div>


          <div className="flex items-start gap-3 rounded-md p-2 hover:bg-gray-50">
            <div className={`rounded-full bg-gray-100 p-2 ${eventColor}`}>
              <EventIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{eventTitle}</h4>
              <p className="text-[16px] text-gray-600">
                Your Highest Score: <span className="text-black font-bold">{eventScore}</span>
              </p>
              <p className="text-sm text-gray-500">{achievement?.highest_event?.event_name ?? "No Event Yet"}</p>
             
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
