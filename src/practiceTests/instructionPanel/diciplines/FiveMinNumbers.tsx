"use client"

import React, { useState } from "react"

type Config = {
  grouping: number
  drawEvery: number
  highlightColor: string
}

type Props = {
  time: number
  onStart: (config: Config) => void
  onClose: () => void
}

const FiveMinNumbers: React.FC<Props> = ({ onStart }) => {
  const [formState, setFormState] = React.useState(() => {
    // Load saved preferences from localStorage if available
    const saved = localStorage.getItem("fiveMinNumbersPreferences")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore parse errors
      }
    }
    // Set default values
    return {
      grouping: "3", // Default grouping of 3
      highlightColor: "#facc15", // Default yellow color
      drawLines: true, // Default to drawing lines
    }
  })
  const [gameStarted, setGameStarted] = useState(false)

  const handleChange = (key: string, value: string | boolean) => {
    setFormState((prev: any) => ({ ...prev, [key]: value }))
  }

  const startGame = () => {
    const grouping = Number.parseInt(formState.grouping)

    if (isNaN(grouping) || grouping < 1 || grouping > 9) {
      alert("Grouping must be a number between 1 and 9.")
      return
    }

    const config: Config = {
      grouping,
      drawEvery: formState.drawLines ? grouping : 0,
      highlightColor: formState.highlightColor,
    }

    // Save preferences to localStorage
    localStorage.setItem("fiveMinNumbersPreferences", JSON.stringify(formState))

    setGameStarted(true)
    onStart(config)
  }

  const presetColors = [
    "#FF9999", // Darker Red
    "#FF99B3", // Darker Pink
    "#B3B3FF", // Darker Lavender
    "#E5B3FF", // Darker Purple
    "#99D6FF", // Darker Sky Blue
    "#9999FF", // Darker Blue
    "#99FF99", // Darker Green
    "#FFB380", // Darker Orange/Peach
  ]

  const generatePreview = () => {
    const grouping = Number.parseInt(formState.grouping)
    const drawEvery = formState.drawLines ? grouping : 0
    const sample = Array.from({ length: 12 }, (_, i) => (i % 3) + 1)

    const elements = []
    for (let i = 0; i < sample.length; i++) {
      const shouldDrawLine = drawEvery && i > 0 && i % drawEvery === 0
      const isHighlighted = grouping && Math.floor(i / grouping) % 2 === 0

      if (shouldDrawLine)
        elements.push(
          <span key={`sep-${i}`} className="mx-1">
            |
          </span>,
        )

      elements.push(
        <span
          key={i}
          className="px-1"
          style={{
            backgroundColor: isHighlighted ? formState.highlightColor : "transparent",
          }}
        >
          {sample[i]}
        </span>,
      )
    }

    return elements
  }

  return (
    <div className="space-y-6">
      {!gameStarted ? (
        <>
          {/* Instructions Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">📘 How to Play</h2>

            <div className="space-y-3">
              {/* Game Structure */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-blue-700 mb-2">🎯 Game Layout</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>
                    Game consists of <span className="font-medium">2 pages</span>
                  </li>
                  <li>
                    Each page shows <span className="font-medium">10 rows</span> with{" "}
                    <span className="font-medium">30 numbers</span> per row
                  </li>
                  <li>
                    Memorize numbers in the <span className="font-medium">exact same order</span> as shown
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-blue-700 mb-2">⏱ Game Phases</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>
                    <span className="font-medium">Memorization (5 minutes):</span>
                    Study the numbers shown
                  </li>
                  <li>
                    <span className="font-medium">Recall (10 minutes):</span> Enter the numbers you remember
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-blue-700 mb-2">💯 Scoring System</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>+1 point for each consecutive correct number</li>
                  <li>+1 bonus point for every 10 consecutive correct numbers</li>
                  <li>Score stops counting at first mistake in each row</li>
                  <li>Each row must start correctly to score points</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-blue-700 mb-2">⚙️ Game Settings</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>
                    <span className="font-medium">Grouping Size:</span> Choose how many numbers to group together (1-9)
                  </li>
                  <li>
                    <span className="font-medium">Visual Lines:</span> Option to add separator lines between groups
                  </li>
                  <li>
                    <span className="font-medium">Highlight Color:</span> Select your preferred color for active groups
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-8">
              <label className="flex items-center space-x-2">
                <span className="font-medium">Grouping (1–9):</span>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={formState.grouping}
                  onChange={(e) => handleChange("grouping", e.target.value)}
                  className="w-16 px-2 py-1 border rounded-md"
                />
              </label>

              <span className="font-medium">Draw lines every grouping?</span>
              <button
                onClick={() => handleChange("drawLines", !formState.drawLines)}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  formState.drawLines ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    formState.drawLines ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Preview</div>
              <div className="flex space-x-1 text-lg">{generatePreview()}</div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Highlight Color</label>
              <div className="flex space-x-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleChange("highlightColor", color)}
                    style={{
                      backgroundColor: color,
                      border: formState.highlightColor === color ? "2px solid black" : "2px solid white",
                    }}
                    className="w-10 h-10 rounded-full shadow-md hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>

            {/* Keyboard Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-700 mb-2">⌨️ Keyboard Controls</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>
                  <span className="font-medium">Arrow Keys:</span> Navigate between cells
                </li>
                <li>
                  <span className="font-medium">Enter:</span> Move to next phase(eg. memorization to recall)
                </li>
                <li>
                  <span className="font-medium">Backspace:</span> Clear and move back
                </li>
                <li>
                  <span className="font-medium">Numbers 0-9:</span> Input answers
                </li>
              </ul>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={startGame}
              className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Start
            </button>
          </div>
        </>
      ) : (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center">Game in Progress...</h2>
        </div>
      )}
    </div>
  )
}

export default FiveMinNumbers
