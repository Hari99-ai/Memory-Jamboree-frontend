"use client"

import { useNavigate } from "react-router-dom"
import NumbersGame from "../Games/Numbers/NumbersGame"
import BinaryGame from "../Games/Binary/BinaryGame"
import ImagesGame from "../Games/Image/ImageGame"
import DatesGame from "../Games/Dates/DateGames"
import FacesGame from "../Games/Faces/FacesGame"
import WordsGame from "../Games/Words/WordsGame"
import type { DisciplineData } from "../types"
import { useEffect } from "react"

interface Props {
  discipline: string
  onRestart: () => void
  config?: {
    highlightColor?: string
    highlightGroupSize?: number
    showGroupedWords?: boolean
    hoverColor?: string
    grouping?: number
    drawEvery?: number
    category?: string
    images?: string[]
  }
  allDisciplines: DisciplineData[]
  onGameComplete?: (score: number) => void
}

export default function GameRunner({ discipline, onRestart, config = {}, allDisciplines, onGameComplete }: Props) {
  const navigate = useNavigate()
  const parsedTime = Number.parseInt(discipline?.split("-")[0] || "0")
  const formattedTime = isNaN(parsedTime) ? 0 : parsedTime
  const disciplineNormalized = discipline.toLowerCase()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  let gameComponent = <div className="text-white">Unknown Game</div>

  if (disciplineNormalized.includes("numbers")) {
    gameComponent = (
      <NumbersGame
        time={formattedTime}
        onRestart={onRestart}
        config={{
          grouping: config.grouping || 4,
          drawEvery: config.drawEvery || 4,
          highlightColor: config.highlightColor || "#00ffcc",
        }}
        disciplineName={discipline}
        allDisciplines={allDisciplines}
        onGameComplete={onGameComplete}
      />
    )
  } else if (disciplineNormalized.includes("binary")) {
    gameComponent = (
      <BinaryGame
        time={formattedTime}
        onRestart={onRestart}
        config={{
          grouping: config.grouping || 1,
          drawEvery: config.drawEvery || 0,
          highlightColor: config.highlightColor || "#facc15",
        }}
        disciplineName={discipline}
        allDisciplines={allDisciplines}
        onGameComplete={onGameComplete}
      />
    )
  } else if (disciplineNormalized.includes("images")) {
    gameComponent = (
      <ImagesGame
        time={formattedTime}
        onRestart={() => navigate(-1)}
        highlightColor={config.highlightColor || "#00ffcc"}
        images={config.images || []}
        disciplineName={discipline}
        allDisciplines={allDisciplines}
        onGameComplete={onGameComplete}
      />
    )
  } else if (disciplineNormalized.includes("dates")) {
    gameComponent = (
      <DatesGame
        onRestart={onRestart}
        hoverColor={config.hoverColor || "#00ffcc"}
        disciplineName={discipline}
        allDisciplines={allDisciplines}
        onGameComplete={onGameComplete}
      />
    )
  } else if (disciplineNormalized.includes("words")) {
    gameComponent = (
      <WordsGame
        time={formattedTime}
        onRestart={onRestart}
        highlightColor={config.highlightColor || "#00ffcc"}
        highlightGroupSize={config.highlightGroupSize || 4}
        showGroupedWords={config.showGroupedWords || false}
        category={(config.category as "easy" | "moderate" | "hard" | "master") || "easy"}
        disciplineName={discipline}
        allDisciplines={allDisciplines}
        onGameComplete={onGameComplete}
      />
    )
  } else if (disciplineNormalized.includes("faces") || disciplineNormalized.includes("names")) {
    gameComponent = (
      <FacesGame
        time={formattedTime}
        onRestart={onRestart}
        highlightColor={config.highlightColor || "#00ffcc"}
        disciplineName={discipline}
        allDisciplines={allDisciplines}
        onGameComplete={onGameComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 p-8 text-white">
      <div className="max-w-6xl mx-auto p-8">{gameComponent}</div>
    </div>
  )
}
