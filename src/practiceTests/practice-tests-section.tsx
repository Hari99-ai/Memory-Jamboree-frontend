/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react"
import InstructionPanel from "./instructionPanel/InstructionPanel"
import CountdownOverlay from "./CountdownOverlay"
import { useNavigate } from "react-router-dom";

import NumbersGame from "../Games/Numbers/NumbersGame"
import BinaryGame from "../Games/Binary/BinaryGame"
import ImagesGame from "../Games/Image/ImageGame"
import DatesGame from "../Games/Dates/DateGames"
import FacesGame from "../Games/Faces/FacesGame"
import WordsGame from "../Games/Words/WordsGame"
import { useQuery } from "@tanstack/react-query";
import { getDisciplines } from "../lib/api";
import { Skeleton } from "../components/ui/skeleton";


const allowedDisciplines = [
  "5-Minute Words",
  "5-Minute Binary",
  "5-Minute Images",
  "5-Minute Numbers",
  "5-Minute Dates",
  //"15-Minute Numbers",
  "5-Minute Names & Faces",
]

interface GameConfig {
  grouping?: number
  drawEvery?: number
  highlightColor?: string
  images?: string[]
  highlightGroupSize?: number
  showGroupedWords?: boolean
  hoverColor?: string
  category?: string
}

export default function PracticeTestSection() {
  // const disciplines = useRecoilValue(disciplineListAtom)
  const desiredOrder = [9,25, 11, 14 , 15 , 12];
  
  const {data: disciplines , isLoading } = useQuery({
    queryKey: ['disciplines' , ],
    queryFn: getDisciplines,
  })

  const activeDisciplines = disciplines?.filter(d => d.status === 1 && desiredOrder.includes(Number(d.disc_id)))
  .sort((a, b) => desiredOrder.indexOf(Number(a.disc_id)) - desiredOrder.indexOf(Number(b.disc_id)));

  const [selectedDiscipline, setSelectedDiscipline] = useState("")
  const [showInstructions, setShowInstructions] = useState(false)
  const [countdownStarted, setCountdownStarted] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  
  const navigate = useNavigate();

const handleContinue = (discipline: string) => {
  setSelectedDiscipline(discipline);
  setShowInstructions(true);
};

const handleStartFromInstructions = (config: GameConfig) => {
  setGameConfig(config)
  setShowInstructions(false)
  setCountdownStarted(true)
  const encodedDiscipline = encodeURIComponent(selectedDiscipline);
  setTimeout(()=>{
    navigate(`/game/${encodedDiscipline}`, {
      state: {
        config,
        eventId: null,
        allDisciplines: disciplines,
      },
    });
  },5000)
 
};



  const parsedTime = Number.parseInt(selectedDiscipline.split("-")[0].trim())
  const formattedTime = isNaN(parsedTime) ? 0 : parsedTime

  const resetTest = () => {
    setSelectedDiscipline("")
    setTestStarted(false)
    setGameConfig(null)
    localStorage.removeItem("gameState")
  }

  function isValidCategory(value: any): value is "easy" | "moderate" | "hard" | "master" {
    return value === "easy" || value === "moderate" || value === "hard" || value === "master"
  }

  useEffect(() => {
    if (testStarted && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [testStarted])

  return (
    <div
      className={
        testStarted
          ? "fixed inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 text-white overflow-y-auto z-10 p-6"
          : "min-h-screen bg-gray-50 py-12 px-4"
      }
    >
      {!testStarted && (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Practice Tests</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose a discipline to test and improve your memory skills
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length:3 }).map((_, i) => <Skeleton className="h-[250px] w-[250px] rounded-xl bg-gray-300" key={i} />)
            ) : (
              <>
                {activeDisciplines?.map((discipline) => (
              <div
                key={discipline.disc_id}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                {/* Status indicator */}
               

                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative p-6 flex flex-col items-center h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">
                      {discipline.discipline_name.includes("Numbers")
                        ? "🔢"
                        : discipline.discipline_name.includes("Binary")
                          ? "💻"
                          : discipline.discipline_name.includes("Words")
                            ? "📝"
                            : discipline.discipline_name.includes("Images")
                              ? "🖼️"
                              : discipline.discipline_name.includes("Dates")
                                ? "📅"
                                : discipline.discipline_name.includes("Faces")
                                  ? "👥"
                                  : "🧠"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    {discipline.discipline_name}
                  </h3>

                  {/* Status */}
                  <div className="mb-6 flex-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${allowedDisciplines.includes(discipline.discipline_name)
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${allowedDisciplines.includes(discipline.discipline_name) ? "bg-green-500" : "bg-gray-400"
                          }`}
                      />
                      {allowedDisciplines.includes(discipline.discipline_name) ? "Active" : "InActive"}
                    </span>
                  </div>

                  {/* Start button */}
                  <button
                    onClick={() => handleContinue(discipline.discipline_name)}
                    disabled={!allowedDisciplines.includes(discipline.discipline_name)}
                    className={`w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${allowedDisciplines.includes(discipline.discipline_name)
                        ? "bg-indigo-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {allowedDisciplines.includes(discipline.discipline_name) ? "Start " : "Coming Soon"}
                  </button>
                </div>
              </div>
            ))}
              </>
            )} 
            
          </div>
        </div>
      )}

      {showInstructions && (
        <InstructionPanel
          gameName={selectedDiscipline}
          time={formattedTime}
          onStart={handleStartFromInstructions}
          onClose={() => setShowInstructions(false)}
        />
      )}

      {countdownStarted && <CountdownOverlay message="Memorization Starts in..."/>}

      {testStarted && gameConfig && (
        <div className="max-w-6xl mx-auto transition-opacity duration-500 ease-in-out">
          {selectedDiscipline.includes("Numbers") && (
            <NumbersGame
              time={formattedTime}
              onRestart={resetTest}
              config={{
                grouping: gameConfig.grouping || 4,
                drawEvery: gameConfig.drawEvery || 4,
                highlightColor: gameConfig.highlightColor || "#00ffcc",
              }}
              disciplineName={selectedDiscipline}
              allDisciplines={disciplines ?? []}
            />
          )}

          {selectedDiscipline === "5-Minute Binary" && (
            <BinaryGame
              time={formattedTime}
              onRestart={resetTest}
              config={{
                grouping: gameConfig.grouping || 1,
                drawEvery: gameConfig.drawEvery || 0,
                highlightColor: gameConfig.highlightColor || "#facc15",
              }}
              disciplineName={selectedDiscipline}
              allDisciplines={disciplines ?? []}
            />
          )}

          {selectedDiscipline === "5-Minute Images" && gameConfig.images && (
            <ImagesGame
              onRestart={resetTest}
              time={formattedTime}
              highlightColor={gameConfig.highlightColor || "#00ffcc"}
              images={gameConfig.images}
              disciplineName={selectedDiscipline}
              allDisciplines={disciplines ?? []}
            />
          )}

          {selectedDiscipline === "5-Minute Words" && (
            <WordsGame
              time={formattedTime}
              onRestart={resetTest}
              highlightColor={gameConfig.highlightColor || "#00ffcc"}
              highlightGroupSize={gameConfig.highlightGroupSize || 3}
              showGroupedWords={gameConfig.showGroupedWords ?? true}
              category={isValidCategory(gameConfig.category) ? gameConfig.category : "easy"}
              disciplineName={selectedDiscipline}
              allDisciplines={disciplines ?? []}
            />
          )}

          {selectedDiscipline === "5-Minute Dates" && (
            <DatesGame
              onRestart={resetTest}
              hoverColor={gameConfig.hoverColor || "#00ffcc"}
              disciplineName={selectedDiscipline}
              allDisciplines={disciplines ?? []}
            />
          )}

          {selectedDiscipline === "5-Minute Names & Faces" && (
            <FacesGame
              time={formattedTime}
              onRestart={resetTest}
              highlightColor={gameConfig.highlightColor || "#00ffcc"}
              disciplineName={selectedDiscipline}
              allDisciplines={disciplines ?? []}
              onGameComplete={undefined} // optional, for event games
              onRecallPhaseStart={undefined} // optional
            />
          )}
        </div>
      )}
    </div>
  )
}
