import { useState, useEffect } from "react";
// import axios from "axios";
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
// import { API_BASE_URL } from "../../../lib/client";
import { useDashboardData } from "../../../hooks/useStudentDashboardData";


// interface DiscData {
//   name: string;
//   id: number;
// }

// interface DisciplineScore {
//   createdat: string;
//   discipline_name: string;
//   score: string;
// }

export default function MyPerformance() {
  const { data, isLoading} = useDashboardData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const response = data?.score ?? [];

  const [disciplines, setDisciplines] = useState<{ name: string; id: number }[]>([]);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<{ name: string; id: number } | null>(null);
  const [disciplineScores, setDisciplineScores] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    if (!response || response.length === 0) return;

    const uniqueDisciplines = Array.from(
      new Set(response.map((item: any) => item.discipline_name))
    ).map((name, index) => ({ name: name as string, id: index + 1 }));

    setDisciplines(uniqueDisciplines);
    setAllScores(response);

    if (uniqueDisciplines.length > 0) {
      setSelectedDiscipline(uniqueDisciplines[0]);
    }
  }, [response]);

  useEffect(() => {
    if (!selectedDiscipline) return;

    const filteredScores = allScores
      .filter((item) => item.discipline_name === selectedDiscipline.name)
      .map((item) => ({
        date: new Date(item.createdat).toLocaleDateString(),
        score: parseInt(item.score, 10),
      }));
    setDisciplineScores(filteredScores);
  }, [selectedDiscipline, allScores]);

// if (isLoading) return <div>Loading...</div>;
// if (isError) return <div>Something went wrong...</div>;


  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden flex items-center justify-center">
        <div className="flex flex-col space-y-3">
          {/* Line chart skeleton */}
          <div className="relative h-[125px] w-[250px] flex items-center">
            {/* Simulated line */}
            <div
              className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 z-0"
              style={{ top: "60%" }}
            />
            {/* Points */}
            <div className="flex justify-between items-end w-full z-10">
              <Skeleton
                className="h-3 w-3 rounded-full bg-gray-300"
                style={{ marginBottom: "60px" }}
              />
              <Skeleton
                className="h-3 w-3 rounded-full bg-gray-300"
                style={{ marginBottom: "100px" }}
              />
              <Skeleton
                className="h-3 w-3 rounded-full bg-gray-300"
                style={{ marginBottom: "80px" }}
              />
              <Skeleton
                className="h-3 w-3 rounded-full bg-gray-300"
                style={{ marginBottom: "120px" }}
              />
              <Skeleton
                className="h-3 w-3 rounded-full bg-gray-300"
                style={{ marginBottom: "90px" }}
              />
              <Skeleton
                className="h-3 w-3 rounded-full bg-gray-300"
                style={{ marginBottom: "110px" }}
              />
            </div>
          </div>
          {/* Axis/labels skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="z-0 relative">
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden">
        {/* Header section */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-[#245cab]">
            My Performance
          </h2>
          <select
            value={selectedDiscipline ? selectedDiscipline.id : ""}
            className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700
             focus:outline-none focus:ring-2 focus:ring-[#245cab] focus:border-transparent
             w-40"
            onChange={(e) => {
              const selected = disciplines.find(
                (d) => String(d.id) === e.target.value
              );
              setSelectedDiscipline(selected || null);
            }}
          >
            {disciplines.map((discipline) => (
              <option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-sm font-medium text-gray-600 mb-10">
          {selectedDiscipline ? selectedDiscipline.name : ""} Scores Overview
        </h2>
        {disciplineScores.length === 0 ? (
          <div className="text-center text-gray-500 h-80 flex items-center justify-center">
            No scores available for {selectedDiscipline?.name || "Selected Discipline"}
            <br />
            Please play at least one game.
          </div>
        ) : (
          <div className="h-80 -mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={disciplineScores}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <YAxis
                  dataKey="score"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                  labelStyle={{ color: "#245cab", fontWeight: "bold" }}
                  itemStyle={{ color: "#374151" }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#245cab"
                  strokeWidth={3}
                  activeDot={{
                    r: 6,
                    stroke: "#245cab",
                    fill: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
