/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { useState, useMemo, useCallback } from "react";
import "../../../App.css";
import { useDashboardData } from "../../../hooks/useStudentDashboardData";

// A modern, more vibrant color palette
const getColorForDiscipline = (name: string) => {
  const colorMap: Record<string, string> = {
    "5-Minute Dates": "#6366F1",   // Indigo
    "5-Minute Images": "#EC4899",  // Pink
    "5-Minute Numbers": "#F59E0B", // Amber
    "5-Minute Words": "#10B981",  // Emerald
    "Cards": "#3B82F6",            // Blue
    "Default": "#6B7280",          // Gray
  };
  return colorMap[name] || colorMap.Default;
};

// Custom active shape for the pie chart with a modern feel
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g style={{ filter: `drop-shadow(0 4px 6px ${fill}60)` }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Make the active sector pop more
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={5} // Add rounded corners to the sector
      />
    </g>
  );
};


export default function ScoreCard() {
  const { data: avg_score, isLoading, isError } = useDashboardData();
  const data = avg_score?.average_score;

  const chartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([discipline, score]) => ({
      name: discipline,
      value: Math.round(Number(score)),
      color: getColorForDiscipline(discipline),
    }));
  }, [data]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeItem =
    activeIndex !== null && activeIndex < chartData.length
      ? chartData[activeIndex]
      : null;

  const totalAverage = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((total, item) => total + item.value, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Modern Loading State
  if (isLoading) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Average Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-sm text-gray-500">Calculating your scores...</p>
        </CardContent>
      </Card>
    );
  }

  // Modern Error State
  if (isError || !chartData.length) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Average Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-gray-500">No Score Data Available</p>
            <p className="mt-2 text-sm text-gray-400">Complete a practice test to see your scores.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[450px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Average Score</CardTitle>
         <p className="text-sm text-gray-500">Your average performance per discipline.</p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <div className="relative h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart onMouseLeave={onPieLeave}>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70} // Thicker donut
                outerRadius={90} // Thicker donut
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={onPieEnter}
                animationDuration={300}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={ activeIndex === null || activeIndex === index ? 1 : 0.4 }
                    style={{ transition: "opacity 0.2s ease" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-gray-800 transition-all">
              {activeItem ? activeItem.value : totalAverage}
            </p>
            <p className="text-sm text-gray-500 transition-all">
              {activeItem ? activeItem.name : "Total Avg"}
            </p>
          </div>
        </div>

        {/* Modern Legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {chartData.map((entry, index) => (
            <div
              key={`legend-${index}`}
              className={`flex items-center cursor-pointer transition-opacity duration-200 ${
                activeIndex === null || activeIndex === index
                  ? "opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="h-3 w-3 mr-2 rounded-full transition-transform"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}