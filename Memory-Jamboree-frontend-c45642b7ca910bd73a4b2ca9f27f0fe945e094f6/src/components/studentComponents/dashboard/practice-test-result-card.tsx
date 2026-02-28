/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "../../../components/ui/skeleton";
import { API_BASE_URL } from "../../../lib/client";
// import { DisciplineData } from "../../../types";

interface DiscData {
  name: string;
  id: number;
}

export function PracticeTestResultCard() {
  const [disciplines, setDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<DiscData | null>(null);
  const [disciplineScores, setDisciplineScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = sessionStorage.getItem('userId')
  const token = sessionStorage.getItem("auth_token");
  // Fetch all disciplines
  const fetchDisciplines = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/discipline`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const dis = response.data.map((item:any) => ({
        name: item.discipline_name,
        id: item.disc_id,
      }));
      setDisciplines(dis);
      if (dis.length > 0) {
        setSelectedDiscipline(dis[0]);
      }
    } catch (error) {
      console.error("Error fetching disciplines:", error);
    }
  };

  // Fetch scores for a discipline
  const fetchDisciplineScores = async (disciplineId:any) => {
    const token = sessionStorage.getItem("auth_token");
    const data = {
      disc_id: disciplineId,
      user_id: userId,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/get_score`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const mapped = (response.data || []).map((item:any) => ({
        date: new Date(item.createdat).toLocaleDateString(),
        score: Number(item.score),
      }));
      setDisciplineScores(mapped);
      setLoading(false);
      console.log("Discipline Scores:", response.data);
    } catch (error) {
      console.error("Error fetching discipline scores:", error);
      setDisciplineScores([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  // When selectedDiscipline changes, fetch its scores
  useEffect(() => {
    if (selectedDiscipline && selectedDiscipline.id) {
      fetchDisciplineScores(selectedDiscipline.id);
    }
  }, [selectedDiscipline]);

  if (!disciplines.length) {
    return (
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden flex items-center justify-center">
        {/* <div>Loading... your Performance</div> */}
        <div className="flex flex-col space-y-6">
          {/* Bar chart skeleton */}
          <div className="flex items-end space-x-4 h-[220px] w-[500px]">
            <Skeleton className="h-[80px] w-10 rounded-t bg-gray-200" />
            <Skeleton className="h-[160px] w-10 rounded-t bg-gray-200" />
            <Skeleton className="h-[120px] w-10 rounded-t bg-gray-200" />
            <Skeleton className="h-[200px] w-10 rounded-t bg-gray-200" />
            <Skeleton className="h-[110px] w-10 rounded-t bg-gray-200" />
            <Skeleton className="h-[180px] w-10 rounded-t bg-gray-200" />
          </div>
          {/* Axis/labels skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-[500px]" />
            <Skeleton className="h-6 w-[350px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="z-0 relative">
      <div className="bg-white p-5 rounded-xl shadow h-full overflow-hidden">
        {/* Header section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#245cab]">
            Practice Test Results
          </h2>
          <select
            value={selectedDiscipline ? selectedDiscipline.id : ""}
            className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700
             focus:outline-none focus:ring-2 focus:ring-[#245cab] focus:border-transparent
             w-40"
            onChange={(e) => {
              const selected: any = disciplines.find(
                (d: DiscData) => String(d.id) === e.target.value
              );
              setSelectedDiscipline(selected);
              setLoading(true); // Reset loading state when changing discipline
            }}
          >
            {disciplines.map((discipline: DiscData) => (
              <option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-sm font-medium text-gray-600 mb-10">
          {selectedDiscipline ? selectedDiscipline.name : ""} Result
          Overview
        </h2>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="flex flex-col space-y-3">
              {/* Bar chart skeleton */}
              <div className="flex items-end space-x-2 h-[125px] w-[250px]">
                <Skeleton className="h-[40px] w-6 rounded-t bg-gray-200" />
                <Skeleton className="h-[80px] w-6 rounded-t bg-gray-200" />
                <Skeleton className="h-[60px] w-6 rounded-t bg-gray-200" />
                <Skeleton className="h-[100px] w-6 rounded-t bg-gray-200" />
                <Skeleton className="h-[55px] w-6 rounded-t bg-gray-200" />
                <Skeleton className="h-[90px] w-6 rounded-t bg-gray-200" />
              </div>
              {/* Axis/labels skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        ) : disciplineScores.length === 0 ? (
          <div className="text-center text-gray-500 h-80 flex items-center justify-center">
            No scores available for{" "}
            {selectedDiscipline
              ? selectedDiscipline.name
              : "Selected Discipline"}
            <br />
            Please play at least one game.
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center -mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={disciplineScores}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
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
                <Bar
                  dataKey="score"
                  fill="#245cab"
                  barSize={30}
                  radius={[8, 8, 0, 0]}
                  name="Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
