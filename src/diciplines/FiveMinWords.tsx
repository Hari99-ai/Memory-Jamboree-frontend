import { useState } from "react"

interface Props {
  onStart: (config: {
    highlightColor: string
    highlightGroupSize: number
    showGroupedWords: boolean
    category: string
  }) => void
}

const COLORS = [
  "#FF9999", // Darker Red
  "#FF99B3", // Darker Pink
  "#B3B3FF", // Darker Lavender
  "#E5B3FF", // Darker Purple
  "#99D6FF", // Darker Sky Blue
  "#9999FF", // Darker Blue
  "#99FF99", // Darker Green
  "#FFB380", // Darker Orange/Peach
]

export default function FiveMinWords({ onStart }: Props) {
  const [highlightColor, setHighlightColor] = useState(() => {
    const saved = localStorage.getItem("fiveMinWordsPreferences")
    if (saved) {
      try {
        return JSON.parse(saved).highlightColor || COLORS[0]
      } catch { /* ignore */ }
    }
    return COLORS[0]
  })
  const [highlightGroupSize, setHighlightGroupSize] = useState(() => {
    const saved = localStorage.getItem("fiveMinWordsPreferences")
    if (saved) {
      try {
        return JSON.parse(saved).highlightGroupSize || 3
      } catch { /* ignore */ }
    }
    return 3
  })
  const [showGroupedWords, setShowGroupedWords] = useState(() => {
    const saved = localStorage.getItem("fiveMinWordsPreferences")
    if (saved) {
      try {
        return JSON.parse(saved).showGroupedWords ?? false
      } catch { /* ignore */ }
    }
    return false
  })
  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem("fiveMinWordsPreferences")
    if (saved) {
      try {
        return JSON.parse(saved).category || "easy"
      } catch { /* ignore */ }
    }
    return "easy"
  })
  const [formError, setFormError] = useState("")

  const savePreferences = () => {
    const prefs = { highlightColor, highlightGroupSize, showGroupedWords, category }
    localStorage.setItem("fiveMinWordsPreferences", JSON.stringify(prefs))
  }

  const handleStart = () => {
    if (!category) {
      setFormError("Please select a category before starting.")
      return
    }
    setFormError("")
    savePreferences()
    onStart({ highlightColor, highlightGroupSize, showGroupedWords, category })
  }

  return (
    <div className="space-y-6">
      {/* Instructions Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">📘 How to Play</h2>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Test Layout</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Test consists of 2 pages.</li>
              <li>Each page contains 5 columns with 20 words each.</li>
              <li>You can shift between the pages using the page number buttons (1, 2).</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Test Objective</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>You need to memorise as many words as possible in the given time.</li>
              <li>Memorize the words in their exact order with correct spellings.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⏱ Test Phases</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Memorization (5 minutes):</span> You will see a grid of words. During this time, you will memorise the words in order.
              </li>
              <li>
                <span className="font-medium">Recall (15 minutes):</span> You will see empty text boxes on the screen. During this time, you will recall the words and fill them in the empty text boxes.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">💯 Scoring System</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Every column will be scored separately.</li>
              <li>+1 point for Every correct word.</li>
              <li>+1 bonus point for every 10 consecutive correct words in a column.</li>
              <li>Scoring for a column stops at the first mistake found in the column.</li>
              <li>Each column must start correctly to score points.</li>
              <li>Final score will be the sum of all the scores in each column.</li>
              <li>No negative marking.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⚙️ Test Settings</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Grouping:</span> You may group the words during memorisation phase (1-5).
              </li>
              <li>
                <span className="font-medium">Highlight Colour:</span> Select your preferred colour for active word groups during memorisation and recall phase.
              </li>
              <li>
                <span className="font-medium">Default settings are saved for your next visit.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⌨️ Keyboard Controls</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <span className="font-medium">Arrow Keys:</span> Navigate between cells using up and down arrow keys.
              </li>
              <li>
                <span className="font-medium">Enter:</span> Move to next phase (memorization to recall / recall to submit).
              </li>
              <li>
                <span className="font-medium">Delete/Backspace:</span> Deletes the cell content.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Highlight Color</label>
          <div className="flex gap-2 pt-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setHighlightColor(color)}
                style={{
                  backgroundColor: color,
                  border: highlightColor === color ? "2px solid black" : "2px solid white",
                }}
                className="w-10 h-10 rounded-full shadow-md hover:scale-110 transition-transform"
                aria-label={color}
                title={color}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Grouping Size</label>
          <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden ml-3">
            <button
              onClick={() => setHighlightGroupSize((size: number) => (size > 1 ? size - 1 : 1))}
              className="px-3 py-1 text-gray-700 hover:bg-gray-100"
            >
              −
            </button>
            <input
              readOnly
              value={highlightGroupSize}
              className="w-10 text-center bg-white font-semibold text-gray-900 border-x border-gray-300"
            />
            <button
              onClick={() => setHighlightGroupSize((size: number) => (size < 5 ? size + 1 : 5))}
              className="px-3 py-1 text-gray-700 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700">Display groups visually?</label>
          <span
            onClick={() => setShowGroupedWords(!showGroupedWords)}
            className={`ml-3 w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              showGroupedWords ? "bg-blue-600" : "bg-gray-300"
            }`}
            role="switch"
            aria-checked={showGroupedWords}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setShowGroupedWords(!showGroupedWords)
              }
            }}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                showGroupedWords ? "translate-x-5" : ""
              }`}
            />
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
            Select Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-4 py-2"
            required
          >
            <option value="">--Choose--</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
            <option value="master">Master</option>
          </select>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-end pr-4">
        <button
          onClick={handleStart}
          className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          type="button"
        >
          Start
        </button>
        {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}
      </div>
    </div>
  )
}