import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { useDashboardData } from "../../../hooks/useStudentDashboardData";
import { useState, useEffect, ElementType } from "react";
import { API_BASE_URL } from "../../../lib/client";
import { cn } from "../../../lib/utils";

// Interface for AchievementItem props to fix type errors
interface AchievementItemProps {
  icon: ElementType;
  bgClass: string;
  title: string;
  description: string;
  value: string | number;
  eventName?: string;
}

export function MyAchievementsCard() {
  const { data: achievement } = useDashboardData();
  const [practiceScore, setPracticeScore] = useState(0);

  useEffect(() => {
    const fetchPracticeHistory = async () => {
      try {
        const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
        if (!token) return;
        const response = await fetch(`${API_BASE_URL}/practice_test`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setPracticeScore(Math.round(Math.max(...data.map(item => Number(item.score)))));
          }
        }
      } catch (error) { console.error("Failed to fetch practice history:", error); }
    };
    fetchPracticeHistory();
  }, []);

  const eventScore = Math.round(achievement?.highest_event?.highest_event_score ?? 0);

  // --- Practice Achievement ---
  let practiceTitle = "Practice Starter";
  let PracticeIcon: ElementType = TrendingUp;
  let practiceBg = "bg-gray-100 text-gray-500";
  if (practiceScore >= 90) {
    practiceTitle = "Top Scorer";
    PracticeIcon = Trophy;
    practiceBg = "bg-yellow-100 text-yellow-600";
  } else if (practiceScore >= 75) {
    practiceTitle = "Excellent Work";
    PracticeIcon = Medal;
    practiceBg = "bg-blue-100 text-blue-600";
  } else if (practiceScore >= 50) {
    practiceTitle = "Good Effort";
    PracticeIcon = Award;
    practiceBg = "bg-orange-100 text-orange-600";
  }

  // --- Event Rank Achievement ---
  const eventRank = achievement?.best_event_rank ?? 0;
  let rankTitle = "No Rank Yet";
  let RankIcon: ElementType = TrendingUp;
  let rankBg = "bg-gray-100 text-gray-500";
  if (eventRank === 1) {
    rankTitle = "First Place";
    RankIcon = Trophy;
    rankBg = "bg-yellow-100 text-yellow-600";
  } else if (eventRank <= 3 && eventRank > 1) {
    rankTitle = "Top 3";
    RankIcon = Medal;
    rankBg = "bg-blue-100 text-blue-600";
  } else if (eventRank <= 10 && eventRank > 3) {
    rankTitle = "Top 10";
    RankIcon = Award;
    rankBg = "bg-orange-100 text-orange-600";
  }

  // --- Event Score Achievement ---
  let eventTitle = "Event Participant";
  let EventIcon: ElementType = TrendingUp;
  let eventBg = "bg-gray-100 text-gray-500";
  if (eventScore >= 90) {
    eventTitle = "Event Champion";
    EventIcon = Trophy;
    eventBg = "bg-yellow-100 text-yellow-600";
  } else if (eventScore >= 75) {
    eventTitle = "Event Excellence";
    EventIcon = Medal;
    eventBg = "bg-blue-100 text-blue-600";
  } else if (eventScore >= 50) {
    eventTitle = "Solid Performance";
    EventIcon = Award;
    eventBg = "bg-orange-100 text-orange-600";
  }
  
  const AchievementItem = ({ icon: Icon, bgClass, title, description, value, eventName }: AchievementItemProps) => (
    <div className="flex items-center gap-4 rounded-xl p-4 bg-white border">
        <div className={cn("flex-shrink-0 rounded-full p-3", bgClass)}>
            <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{description}</p>
            <h4 className="text-lg font-bold text-gray-800">{title}</h4>
            {eventName ? (
                <p className="text-xs text-gray-500 mt-0.5">{eventName} - Score: <span className="font-bold text-black">{value}</span></p>
            ) : (
                <p className="text-xs text-gray-500 mt-0.5">Score: <span className="font-bold text-black">{value}</span></p>
            )}
        </div>
    </div>
  );

  return (
    <Card className="bg-gray-50/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AchievementItem
            icon={PracticeIcon}
            bgClass={practiceBg}
            title={practiceTitle}
            description="Practice Tests"
            value={practiceScore}
          />
          <AchievementItem
            icon={RankIcon}
            bgClass={rankBg}
            title={rankTitle}
            description="Best Event Rank"
            value={eventRank > 0 ? eventRank : "N/A"}
            eventName={achievement?.highest_event?.event_name}
          />
          <AchievementItem
            icon={EventIcon}
            bgClass={eventBg}
            title={eventTitle}
            description="Highest Event Score"
            value={eventScore}
            eventName={achievement?.highest_event?.event_name}
          />
        </div>
      </CardContent>
    </Card>
  );
}