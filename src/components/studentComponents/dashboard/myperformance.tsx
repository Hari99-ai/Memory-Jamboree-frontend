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

type TimePeriod = "daily" | "weekly" | "monthly" | "custom";

export default function MyPerformance() {
  const [disciplines, setDisciplines] = useState<{ name: string; id: number }[]>([]);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<{ name: string; id: number } | null>(null);
  const [disciplineScores, setDisciplineScores] = useState<{ date: string; score: number }[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [isLoading, setIsLoading] = useState(true);
  
  // State for custom date range
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
      setAllScores(data || []);

      if (data && data.length > 0) {
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
      } else {
        setDisciplines([]);
        setSelectedDiscipline(null);
      }
    } catch (err) {
      console.error("Error fetching practice test history:", err);
      setAllScores([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeTestHistory();
  }, []);

  useEffect(() => {
    if (!selectedDiscipline || allScores.length === 0) {
        setDisciplineScores([]);
        return;
    };

    const filteredScores = allScores
      .filter((item) => item.discipline_name === selectedDiscipline.name)
      .map((item) => {
        const originalDate = new Date(item.createdat);
        const offsetInMs = (5 * 60 + 30) * 60 * 1000;
        const adjustedDate = new Date(originalDate.getTime() + offsetInMs);
        return {
          date: adjustedDate,
          score: parseInt(item.score, 10),
        };
      });

    // Helper function to aggregate scores by day (highest score per day)
    const aggregateScoresByDay = (
        scores: { date: Date; score: number }[], 
        rangeStart: Date, 
        rangeEnd: Date
    ) => {
        const scoreMap = new Map<string, number>();

        scores.forEach(({ date, score }) => {
            if (date >= rangeStart && date <= rangeEnd) {
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
      
      return aggregateScoresByDay(scores, startOfWeek, endOfWeek);
    };

    const processMonthlyScores = (scores: { date: Date; score: number }[]) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      return aggregateScoresByDay(scores, startOfMonth, endOfMonth);
    };

    const processCustomScores = (scores: { date: Date; score: number }[], start: string, end: string) => {
        if (!start || !end) return [];

        const customStartDate = new Date(start);
        customStartDate.setHours(0, 0, 0, 0);
        const customEndDate = new Date(end);
        customEndDate.setHours(23, 59, 59, 999);

        if (customStartDate > customEndDate) return []; // Invalid range

        return aggregateScoresByDay(scores, customStartDate, customEndDate);
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
      case "custom":
        processedScores = processCustomScores(filteredScores, startDate, endDate);
        break;
    }

    setDisciplineScores(processedScores);
  }, [selectedDiscipline, allScores, timePeriod, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden flex items-center justify-center">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  const noDataAvailable = allScores.length === 0;

  return (
    <div className="z-0 relative">
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between mb-3 gap-4">
          <h2 className="text-xl font-semibold text-[#245cab]">My Performance</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="border rounded px-3 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={noDataAvailable}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            
            {timePeriod === "custom" && (
                <div className="flex items-center gap-2">
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={noDataAvailable}
                    />
                    <span className="text-gray-500 text-sm">to</span>
                     <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={noDataAvailable}
                        min={startDate} // Ensures end date is not before start date
                    />
                </div>
            )}

            <select
              value={selectedDiscipline?.id ?? ""}
              onChange={(e) => {
                const selected = disciplines.find((d) => String(d.id) === e.target.value);
                setSelectedDiscipline(selected || null);
              }}
              className="border rounded px-3 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={noDataAvailable}
            >
              {noDataAvailable ? (
                <option>No Disciplines</option>
              ) : (
                disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={fetchPracticeTestHistory}
              className="text-sm text-blue-600 hover:underline"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {noDataAvailable ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed max-w-md mx-auto">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">No Performance Data Yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Complete a practice test to see your performance analysis and track your progress.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-medium text-gray-600 mb-10">
              {selectedDiscipline ? `${selectedDiscipline.name} Scores Overview` : "Select a discipline"}
            </h2>

            {disciplineScores.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">
                No scores recorded for this discipline in the selected time period.
              </p>
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
                        value: "Score",
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
          </>
        )}
      </div>
    </div>
  );
}