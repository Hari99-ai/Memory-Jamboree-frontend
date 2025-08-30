import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "../../../components/ui/skeleton";
import { API_BASE_URL } from "../../../lib/client";

type TimePeriod = "daily" | "weekly" | "monthly";

export default function MyPerformance() {
  const [disciplines, setDisciplines] = useState<{ name: string; id: number }[]>([]);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<{ name: string; id: number } | null>(null);
  const [disciplineScores, setDisciplineScores] = useState<{ date: string; score: number }[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchPracticeTestHistory = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
      if (!token) throw new Error("Authentication token not found. Please login again.");

      const response = await fetch(`${API_BASE_URL}/paractice_test`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Authentication failed. Please login again.");
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAllScores(data);

      const uniqueDisciplines = Array.from(
        new Set(data.map((item: any) => item.discipline_name))
      )
        .filter((name): name is string => typeof name === "string")
        .map((name, index) => ({ name, id: index + 1 }));

      setDisciplines(uniqueDisciplines);
      setSelectedDiscipline((prev) => {
        const current = uniqueDisciplines.find((d) => d.name === prev?.name);
        return current ?? uniqueDisciplines[0] ?? null;
      });
    } catch (err) {
      console.error("Error fetching practice test history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeTestHistory();
  }, []);

  useEffect(() => {
    if (!selectedDiscipline) return;

    // Apply +5:30 offset
    const filteredScores = allScores
      .filter((item) => item.discipline_name === selectedDiscipline.name)
      .map((item) => {
        const originalDate = new Date(item.createdat);
        const offsetInMs = (5 * 60 + 30) * 60 * 1000; // +5:30 hours
        const adjustedDate = new Date(originalDate.getTime() + offsetInMs);
        return {
          date: adjustedDate,
          score: parseInt(item.score, 10),
        };
      });

    const processDailyScores = (scores: { date: Date; score: number }[]) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const todayScores = scores.filter((item) => {
        const d = item.date;
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      });

      return todayScores
        .map((item) => ({
          date: item.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          score: item.score,
          timestamp: item.date.getTime(),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    };

    const processWeeklyScores = (scores: { date: Date; score: number }[]) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const scoreMap = new Map<string, number>();

      scores.forEach(({ date, score }) => {
        if (date >= startOfWeek && date <= endOfWeek) {
          const key = formatDate(date);
          if (!scoreMap.has(key) || score > scoreMap.get(key)!) {
            scoreMap.set(key, score);
          }
        }
      });

      return Array.from(scoreMap.entries())
        .map(([dateStr, score]) => {
          const [day, month, year] = dateStr.split("/");
          return {
            date: `${day}/${month}`,
            score,
            fullDate: new Date(`${year}-${month}-${day}`),
          };
        })
        .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    };

    const processMonthlyScores = (scores: { date: Date; score: number }[]) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const scoreMap = new Map<string, number>();

      scores.forEach(({ date, score }) => {
        if (date >= startOfMonth && date <= endOfMonth) {
          const key = formatDate(date);
          if (!scoreMap.has(key) || score > scoreMap.get(key)!) {
            scoreMap.set(key, score);
          }
        }
      });

      return Array.from(scoreMap.entries())
        .map(([dateStr, score]) => {
          const [day, month, year] = dateStr.split("/");
          return {
            date: `${day}/${month}`,
            score,
            fullDate: new Date(`${year}-${month}-${day}`),
          };
        })
        .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    };

    let processedScores: { date: string; score: number }[] = [];

    switch (timePeriod) {
      case "daily":
        processedScores = processDailyScores(filteredScores);
        break;
      case "weekly":
        processedScores = processWeeklyScores(filteredScores);
        break;
      case "monthly":
        processedScores = processMonthlyScores(filteredScores);
        break;
    }

    setDisciplineScores(processedScores);
  }, [selectedDiscipline, allScores, timePeriod]);

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden flex items-center justify-center">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  return (
    <div className="z-0 relative">
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-[#245cab]">My Performance</h2>
          <div className="flex items-center space-x-2">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <select
              value={selectedDiscipline?.id ?? ""}
              onChange={(e) => {
                const selected = disciplines.find((d) => String(d.id) === e.target.value);
                setSelectedDiscipline(selected || null);
              }}
              className="border rounded px-3 py-1 text-sm"
            >
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <button
              onClick={fetchPracticeTestHistory}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:underline"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <h2 className="text-sm font-medium text-gray-600 mb-10">
          {selectedDiscipline ? `${selectedDiscipline.name} Scores Overview` : "Performance Overview"}
        </h2>

        {disciplineScores.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">No data available for selected range.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={disciplineScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  label={{
                    value: timePeriod === "daily" ? "Time" : "Date",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  label={{
                    value: timePeriod === "monthly" ? "Highest score of the day" : "Score",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: "#6b7280", fontSize: "14px" },
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#245cab"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
