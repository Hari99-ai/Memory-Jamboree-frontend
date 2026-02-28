import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useState, useMemo, useCallback } from "react";
import "../../../App.css";
import { useDashboardData } from "../../../hooks/useStudentDashboardData";

// Defining a more vibrant and modern color palette with gradients
const getColorsForDiscipline = (name: string): [string, string] => {
  const colorMap: Record<string, [string, string]> = {
    "5-Minute Dates": ["#818cf8", "#4f46e5"],   // Indigo
    "5-Minute Images": ["#f472b6", "#db2777"],  // Pink
    "5-Minute Numbers": ["#fb923c", "#f97316"], // Orange
    "5-Minute Words": ["#34d399", "#059669"],  // Emerald
    "Cards": ["#60a5fa", "#2563eb"],            // Blue
    "Default": ["#9ca3af", "#6b7280"],          // Gray
  };
  return colorMap[name] || colorMap.Default;
};

// Custom active shape with a more pronounced effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g style={{ filter: `drop-shadow(0 6px 12px ${fill[1]}80)` }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill[1]}
        cornerRadius={8}
      />
    </g>
  );
};

export default function ScoreCard() {
  const { data: avg_score, isLoading, isError } = useDashboardData();
  const data = avg_score?.average_score;

  const chartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([discipline, score], index) => ({
      name: discipline,
      value: Math.round(Number(score)),
      colors: getColorsForDiscipline(discipline),
      id: `gradient-${index}`
    }));
  }, [data]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  const totalAverage = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((total, item) => total + item.value, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const onPieEnter = useCallback((_: any, index: number) => setActiveIndex(index), []);
  const onPieLeave = useCallback(() => setActiveIndex(null), []);

  if (isLoading) {
    return (
      <Card className="h-[480px] flex items-center justify-center bg-gray-50/50">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div><p className="mt-4 text-sm font-medium text-gray-500">Calculating scores...</p></div>
      </Card>
    );
  }

  if (isError || !chartData.length) {
    return (
      <Card className="h-[480px] flex items-center justify-center bg-gray-50/50">
        <div className="text-center"><p className="text-lg font-semibold text-gray-700">No Score Data Available</p><p className="mt-2 text-sm text-gray-400">Complete a practice test to see your scores.</p></div>
      </Card>
    );
  }

  return (
    <Card className="h-[480px] flex flex-col p-2">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Discipline Scores</CardTitle>
        <p className="text-sm text-gray-500">Hover over a discipline to see details</p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <div className="relative h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart onMouseLeave={onPieLeave}>
              <defs>{chartData.map((entry) => (<linearGradient id={entry.id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={entry.colors[0]} stopOpacity={0.9}/><stop offset="100%" stopColor={entry.colors[1]} stopOpacity={1}/></linearGradient>))}</defs>
              <Pie activeIndex={activeIndex ?? undefined} activeShape={renderActiveShape} data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={115} paddingAngle={4} dataKey="value" onMouseEnter={onPieEnter}>
                {chartData.map((entry) => (<Cell key={`cell-${entry.id}`} fill={`url(#${entry.id})`} stroke="none"/>))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-6xl font-bold text-gray-800 transition-all duration-300 ease-in-out">
                {activeItem ? activeItem.value : totalAverage}
              </p>
              {!activeItem && <p className="text-base font-medium text-gray-500">Total Average</p>}
          </div>
        </div>
        <div className="h-10 flex items-center justify-center">
            {activeItem && (
                <p className="text-lg font-bold text-gray-800 transition-opacity duration-300">
                    {activeItem.name}
                </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}