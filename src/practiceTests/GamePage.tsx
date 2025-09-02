"use client"

import type React from "react"
import { useEffect } from "react"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import NumbersGame from "../Games/Numbers/NumbersGame"
import BinaryGame from "../Games/Binary/BinaryGame"
import ImagesGame from "../Games/Image/ImageGame"
import DatesGame from "../Games/Dates/DateGames"
import FacesGame from "../Games/Faces/FacesGame"
import WordsGame from "../Games/Words/WordsGame"
import { useBlockBackNavigation } from "../hooks/use-block-back"

function GamePage() {
  const { state: navState } = useLocation() as any

  // React Router stores state in history.state.usr; fall back to it if navState is missing
  const histUsr =
    typeof window !== "undefined"
      ? ((window.history?.state && (window.history.state.usr ?? window.history.state)) ?? null)
      : null

  // Fallback to localStorage if both location.state and history.state are missing (e.g., after rapid back presses)
  let stored: any = null
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("gameNavState")
      stored = raw ? JSON.parse(raw) : null
    } catch {
      stored = null
    }
  }

  const state = navState ?? histUsr ?? stored

  const { discipline } = useParams()
  const navigate = useNavigate()

  const { backAlertOpen, closeBackAlert } = useBlockBackNavigation(true)

  // Persist the navigation state as soon as we have it so unexpected history.state changes won't break the page
  useEffect(() => {
    if (state && typeof window !== "undefined") {
      try {
        window.localStorage.setItem("gameNavState", JSON.stringify(state))
      } catch {
        // ignore storage errors
      }
    }
  }, [state])

  const goToPracticeTests = () => {
    try {
      // clear persisted state before leaving
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("gameNavState")
      }
      navigate("/dashboard/practiceTests", { replace: true })
    } catch {
      // ignore navigate errors
    }
  }

  if (!state) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-medium">No game config found. Please go back and start a game properly.</p>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={goToPracticeTests}>
          Go Back
        </button>
      </div>
    )
  }

  const { config } = state
  let formattedTime = 0
  try {
    const parsedTime = Number.parseInt(discipline?.split("-")[0] || "0")
    formattedTime = isNaN(parsedTime) ? 0 : parsedTime
  } catch {
    formattedTime = 0
  }

  let gameComponent: React.ReactNode = <div className="text-white">Unknown Game</div>
  try {
    gameComponent = (() => {
      switch (discipline) {
        case "5-Minute Numbers":
        case "15-Minute Numbers":
          return (
            <NumbersGame
              time={formattedTime}
              onRestart={goToPracticeTests}
              config={config}
              disciplineName={discipline}
              allDisciplines={state.allDisciplines || []}
            />
          )
        case "5-Minute Binary":
          return (
            <BinaryGame
              time={formattedTime}
              onRestart={goToPracticeTests}
              config={config}
              disciplineName={discipline}
              allDisciplines={state.allDisciplines || []}
            />
          )
        case "5-Minute Images":
          return (
            <ImagesGame
              time={formattedTime}
              onRestart={goToPracticeTests}
              disciplineName={discipline}
              allDisciplines={state.allDisciplines || []}
              {...config}
            />
          )
        case "5-Minute Dates":
          return (
            <DatesGame
              onRestart={goToPracticeTests}
              hoverColor={config.hoverColor}
              disciplineName={discipline}
              allDisciplines={state.allDisciplines || []}
            />
          )
        case "5-Minute Words":
          return (
            <WordsGame
              time={formattedTime}
              onRestart={goToPracticeTests}
              highlightColor={config.highlightColor}
              highlightGroupSize={config.highlightGroupSize}
              showGroupedWords={config.showGroupedWords}
              category={config.category}
              disciplineName={discipline}
              allDisciplines={state.allDisciplines || []}
            />
          )
        case "5-Minute Names & Faces":
          return (
            <FacesGame
              time={formattedTime}
              onRestart={goToPracticeTests}
              highlightColor={config.highlightColor}
              disciplineName={discipline}
              allDisciplines={state.allDisciplines || []}
            />
          )
        default:
          return <div className="text-white">Unknown Game</div>
      }
    })()
  } catch {
    gameComponent = (
      <div className="p-8 text-center">
        <p className="text-red-600 font-medium">Something went wrong loading the game.</p>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={goToPracticeTests}>
          Back to Practice Tests
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 p-8 text-white">
      <div className="max-w-6xl mx-auto p-8">{gameComponent}</div>
      {backAlertOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60" onClick={closeBackAlert} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white text-gray-900 p-6 shadow-xl">
            <h2 id="leave-title" className="text-lg font-semibold mb-2">
              Leave game?
            </h2>
            <p className="text-sm text-gray-700">Please complete the discipline or you have to start over.</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={closeBackAlert}
              >
                Stay
              </button>
              <button
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  closeBackAlert()
                  goToPracticeTests()
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default GamePage
