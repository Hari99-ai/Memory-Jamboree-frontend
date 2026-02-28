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
    <div className="space-y-6">
      {/* Instructions Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">📘 How to Play</h2>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Test Layout</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>The test consists of 4 pages.</li>
              <li>Each page shows 20 fictional events with a 4-digit year next to it.</li>
              <li>You can shift between pages using the page numbers or the 'Prev' and 'Next' buttons.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Test Objective</h3>
            <p className="text-gray-700">
              Your goal is to memorize as many event/year combinations as possible. You may memorize the events in any order.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⏱ Test Phases</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><span className="font-medium">Memorization (5 minutes):</span> Study the 20 fictional events and their 4-digit years on each page.</li>
              <li><span className="font-medium">Recall (15 minutes):</span> All events will be shuffled across the pages. Fill in the correct year for each event in the empty text boxes.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">💯 Scoring System</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>You get +1 point for every year recalled correctly.</li>
              <li>There is no negative marking for incorrect or empty answers.</li>
              <li>Your final score is the total of all correctly answered event-year combinations.</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⚙️ Test Settings</h3>
             <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><span className="font-medium">Highlight Colour:</span> Select your preferred colour for the active row. The first color is selected by default, and your selection will be remembered for subsequent games.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⌨️ Keyboard Controls</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><span className="font-medium">Arrow Keys (↑/↓):</span> Navigate between cells.</li>
              <li><span className="font-medium">Enter:</span> Move to the next phase (e.g., from memorization to recall).</li>
              <li><span className="font-medium">Delete/Backspace:</span> Delete the content of a cell.</li>
               <li><span className="font-medium">Input answers:</span> Use numbers 0-9.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎨 Visual Feedback</h3>
            <p className="text-gray-700">After submission, your answers will be highlighted:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li><span >Green:</span> Correct answer</li>
              <li><span  >Red:</span> Wrong answer</li>
              <li><span >Yellow:</span> Empty answer(Not attempted)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
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
      </div>

      {/* Start Test Button */}
      <div className="flex justify-end pr-4">
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