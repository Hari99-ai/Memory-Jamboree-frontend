import { useState } from "react"

interface Props {
  onStart: (config: Record<string, string>) => void
}

export default function FifteenMinNamesFaces({ onStart }: Props) {
  const [formState, setFormState] = useState({
    highlightColor: "#FF99B3", // Default color
  })

  const [gameStarted, setGameStarted] = useState(false)

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

  const handleChange = (color: string) => {
    setFormState({ highlightColor: color })
  }

  const startGame = () => {
    setGameStarted(true)
    onStart(formState)
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
                    Game consists of <span className="font-medium">5 pages</span>
                  </li>
                  <li>
                    Each page shows <span className="font-medium">12 faces</span> (3 rows × 4 columns)
                  </li>
                  <li>
                    Total of <span className="font-medium">60 faces and names</span> to memorize
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-blue-700 mb-2">⏱ Game Phases</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>
                    <span className="font-medium">Memorization (15 minutes):</span> Study the faces and their names
                  </li>
                  <li>
                    <span className="font-medium">Recall (15 minutes):</span> Enter the names of faces shown in random order
                  </li>
                  <li>
                    <span className="font-medium">5-second countdown</span> between memorization and recall phases
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-blue-700 mb-2">💯 Scoring System</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>+2 points for each completely correct full name</li>
                  <li>+1 point for correct first name only</li>
                  <li>No points for incorrect or empty answers</li>
                  <li>Names are not case-sensitive for scoring</li>
                </ul>
              </div>

              {/* Game Settings */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-blue-700 mb-2">⚙️ Highlight Settings</h3>
                <p className="text-gray-700 mb-3">Choose a highlight color to help you focus during memorization and recall:</p>
                <div className="flex space-x-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleChange(color)}
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
                    <span className="font-medium">Arrow Keys:</span> Navigate between faces/input fields
                  </li>
                  <li>
                    <span className="font-medium">Enter:</span> Move to recall phase during memorization
                  </li>
                  <li>
                    <span className="font-medium">Tab:</span> Move to next input field during recall
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-end mt-8 pr-4">
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
