/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useParams, useNavigate } from "react-router-dom";
import NumbersGame from "../Games/Numbers/NumbersGame";
import BinaryGame from "../Games/Binary/BinaryGame";
import ImagesGame from "../Games/Image/ImageGame";
import DatesGame from "../Games/Dates/DateGames";
import FacesGame from "../Games/Faces/FacesGame";
import WordsGame from "../Games/Words/WordsGame";
function GamePage() {
  const { state } = useLocation() as any;
  const { discipline } = useParams();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="p-8 text-center">
        <p>No game config found. Please go back and start a game properly.</p>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/practiceTests")}
        >
          Go Back
        </button>
      </div>
    );
  }

  const { config } = state;
  const parsedTime = parseInt(discipline?.split("-")[0] || "0");
  const formattedTime = isNaN(parsedTime) ? 0 : parsedTime;

  const gameComponent = (() => {
    switch (discipline) {
      case "5-Minute Numbers":
      case "15-Minute Numbers":
        return (
 <NumbersGame
    time={formattedTime}
    onRestart={() => navigate("/dashboard/practiceTests")}
    config={config}
    disciplineName={discipline}
    allDisciplines={state.allDisciplines || []}
  />
        );
      case "5-Minute Binary":
  return (
    <BinaryGame
      time={formattedTime}
      onRestart={() => navigate("/dashboard/practiceTests")}
      config={config}
      disciplineName={discipline}
      allDisciplines={state.allDisciplines || []}
    />
  );
      case "5-Minute Images":
  return (
    <ImagesGame
      time={formattedTime}
      onRestart={() => navigate("/dashboard/practiceTests")}
      disciplineName={discipline}
      allDisciplines={state.allDisciplines || []}
      {...config}
    />
  );

      case "5-Minute Dates":
        return (
          <DatesGame
            onRestart={() => navigate("/dashboard/practiceTests")}
            hoverColor={config.hoverColor}
             disciplineName={discipline}
    allDisciplines={state.allDisciplines || []}
            
          />
        );
      case "5-Minute Words":
        return (
          <WordsGame
            time={formattedTime}
            onRestart={() => navigate("/dashboard/practiceTests")}
            highlightColor={config.highlightColor}
            highlightGroupSize={config.highlightGroupSize}
            showGroupedWords={config.showGroupedWords}
            category={config.category}
              disciplineName={discipline}
    allDisciplines={state.allDisciplines || []}
          />
        );
      case "5-Minute Names & Faces":
        return (
          <FacesGame
            time={formattedTime}
            onRestart={() => navigate("/dashboard/practiceTests")}
            highlightColor={config.highlightColor}
            disciplineName={discipline}
    allDisciplines={state.allDisciplines || []}
          />
        );
      default:
        return <div className="text-white">Unknown Game</div>;
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 p-8 text-white">
      <div className="max-w-6xl mx-auto p-8">
        {gameComponent}
      </div>
    </div>
  );
}
export default GamePage;