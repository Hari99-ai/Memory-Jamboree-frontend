import { useLocation, useNavigate } from "react-router-dom";
import GameRunner from "../myEvents/GameRunner";
import { DisciplineData } from "../types";

export default function PracticeTestPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const {
    selectedDiscipline: discipline,
    config: gameConfig,
    allDisciplines = [],
  }: {
    selectedDiscipline: string;
    config: any;
    allDisciplines: DisciplineData[];
  } = state;

  const config = {
    grouping: gameConfig.grouping || 1,
    drawEvery: gameConfig.drawEvery || 0,
    highlightColor: gameConfig.highlightColor || "#facc15",
  };

  if (!discipline) {
    return (
      <div className="p-8 text-center text-white">
        <p>⚠️ No game selected. Please return to the practice test page.</p>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/practiceTest")}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <GameRunner
      discipline={discipline}
      onRestart={() => navigate("/dashboard")}
      config={config}
      allDisciplines={allDisciplines}
    />
  );
}
