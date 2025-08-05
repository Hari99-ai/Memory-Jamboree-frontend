import { useState } from "react";

interface Props {
  onStart: (config: { hoverColor: string }) => void;
}

const COLORS = [
  "#FF9999", // Darker Red
  "#FF99B3", // Darker Pink
  "#B3B3FF", // Darker Lavender
  "#E5B3FF", // Darker Purple
  "#99D6FF", // Darker Sky Blue
  "#9999FF", // Darker Blue
  "#99FF99", // Darker Green
  "#FFB380"  // Darker Orange/Peach
];

export default function FiveMinDates({ onStart }: Props) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  return (
    <div className="space-y-6 mb-10">
      {/* Instructions Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">📘 How to Play</h2>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Game Objective</h3>
            <p className="text-gray-700">
              Memorize historical dates and events. Each date consists of a 4-digit year paired with a significant historical event.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⏱ Game Phases</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><span className="font-medium">Memorization (5 minutes):</span> Study the dates and events shown</li>
              <li><span className="font-medium">Recall (10 minutes):</span> Enter the years for randomly shuffled events</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⌨️ Navigation</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Use <span className="font-medium">↑/↓ Arrow keys</span> to move between rows</li>
              <li>Press <span className="font-medium">Enter</span> to complete current phase</li>
              <li>Click page numbers to navigate between pages</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">💯 Scoring</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>+1 point for each correct year</li>
              <li>-0.5 points for each incorrect year</li>
              <li>No points deducted for empty answers</li>
              <li>Final score is rounded up to the nearest whole number</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎨 Visual Aids</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Green highlight: Correct answer</li>
              <li>Red highlight: Wrong answer</li>
              <li>Yellow highlight: Empty answer</li>
              <li>Custom highlight color: Selected row focus</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Color Selection Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">
          Select Highlight Color
        </label>
        <div className="flex gap-3">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                backgroundColor: color,
                border: selectedColor === color ? "2px solid black" : "2px solid white",
              }}
              className="w-10 h-10 rounded-full shadow-md hover:scale-110 transition-transform"
            />
          ))}
        </div>
      </div>

      {/* Start Test Button */}
      <div className="text-right">
        <button
          onClick={() => onStart({ hoverColor: selectedColor })}
          className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Start 
        </button>
      </div>
    </div>
  );
}
