import { useState } from "react";

interface Props {
  onStart: (config: {
    highlightColor: string;
    highlightGroupSize: number;
    showGroupedWords: boolean;
    category: string;
  }) => void;
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

export default function FifteenMinWords({ onStart }: Props) {
  const [highlightColor, setHighlightColor] = useState(() => {
    const saved = localStorage.getItem("fifteenMinWordsPreferences");
    if (saved) {
      try {
        return JSON.parse(saved).highlightColor || COLORS[0];
      } catch {
        // ignore
      }
    }
    return COLORS[0];
  });
  const [highlightGroupSize, setHighlightGroupSize] = useState(() => {
    const saved = localStorage.getItem("fifteenMinWordsPreferences");
    if (saved) {
      try {
        return JSON.parse(saved).highlightGroupSize || 3;
      } catch {
        // ignore
      }
    }
    return 3;
  });
  const [showGroupedWords, setShowGroupedWords] = useState(() => {
    const saved = localStorage.getItem("fifteenMinWordsPreferences");
    if (saved) {
      try {
        return JSON.parse(saved).showGroupedWords ?? true;
      } catch {
        // ignore
      }
    }
    return true;
  });
  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem("fifteenMinWordsPreferences");
    if (saved) {
      try {
        return JSON.parse(saved).category || "";
      } catch {
        // ignore
      }
    }
    return "";
  });
  const [formError, setFormError] = useState("");

  const savePreferences = () => {
    const prefs = {
      highlightColor,
      highlightGroupSize,
      showGroupedWords,
      category,
    };
    localStorage.setItem("fifteenMinWordsPreferences", JSON.stringify(prefs));
  };

const handleStart = () => {
  if (!category) {
    setFormError("Please select a category before starting.");
    return;
  }

  setFormError(""); // clear any previous errors
  savePreferences();
  onStart({ highlightColor, highlightGroupSize, showGroupedWords, category });
};

  

  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      {/* Game Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">📘 How to Play</h2>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">🎯 Game Structure</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Each page contains <span className="font-medium">5 columns with 20 words</span> each</li>
              <li>Total of <span className="font-medium">2 pages</span> to memorize</li>
              <li>Memorize words in their exact order with correct spellings</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">⏱ Time Limits</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><span className="font-medium">Memorization Phase:</span> 5 minutes</li>
              <li><span className="font-medium">Recall Phase:</span> 10 minutes</li>
              <li>You can finish memorization early by clicking the submit button</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-blue-700 mb-2">💯 Scoring System</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Points awarded for consecutive correct words in each column</li>
              <li>Bonus: +1 point for 10 consecutive correct words(eg. 11 points for 10 consecutive correct words)</li>
              <li>Spelling must be exact for points to count</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Existing keyboard shortcuts section */}
      <div className="text-left p-4 text-sm bg-blue-50 border rounded-md mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">⌨️ Keyboard Shortcuts</h3>
        <ul className="list-disc ml-5 text-blue-700 space-y-1">
          <li><strong>Arrow Keys:</strong> Navigate between input fields (↑ ↓)</li>
          <li><strong>Enter:</strong> Move to next phase(eg. memorization to recall)</li>
          <li><strong>Highlighted Words:</strong> Groups and colors words based on the size you choose</li>
        </ul>
      </div>

      {/* Add new Configuration Instructions section */}
      <div className="text-left p-4 bg-blue-50 border rounded-md mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">⚙️ Game Configuration</h3>
        <ul className="list-disc ml-5 text-blue-700 space-y-2">
          <li>
            <strong>Color Selection:</strong> Choose a highlight color that's comfortable for your eyes. 
            This color will help you track word groups during memorization.
          </li>
          <li>
            <strong>Group Size:</strong> Select how many words you want grouped together (1-5).
            Larger groups can help with pattern recognition.
          </li>
          <li>
            <strong>Visual Groups Toggle:</strong> Turn on/off the visual separation between word groups.
            This can help with chunking information.
          </li>
          <li>
            <strong>Difficulty Levels:</strong>
            <ul className="ml-4 mt-1 space-y-1 text-blue-600">
              <li>• Easy: Common everyday words</li>
              <li>• Moderate: Mix of common and challenging words</li>
              <li>• Hard: Complex and uncommon words</li>
            </ul>
          </li>
        </ul>
      </div>

      <section className="text-gray-800 text-base space-y-4 leading-relaxed">
        <p>
          Your input highlights will use the color you choose here:{" "}
          <span className="flex gap-2 pt-4">
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
          </span>
        </p>

        <p>
          Each highlight will group{" "}
          <span className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden mx-1">
            <button
              onClick={() =>
                setHighlightGroupSize((size: number) => (size > 1 ? size - 1 : 1))
              }
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
              onClick={() =>
                setHighlightGroupSize((size: number) => (size < 5 ? size + 1 : 5))
              }
              className="px-3 py-1 text-gray-700 hover:bg-gray-100"
            >
              +
            </button>
          </span>{" "}
          words together.
        </p>

        <p className="flex items-center">
          Want to display the groups visually?{" "}
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
                e.preventDefault();
                setShowGroupedWords(!showGroupedWords);
              }
            }}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                showGroupedWords ? "translate-x-5" : ""
              }`}
            />
          </span>
        </p>

        <p>
          <label className="block font-semibold mb-2" htmlFor="category">
            Select Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border rounded-lg px-4 py-2"
            required
          >
            <option value="">--Choose--</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
            <option value="master">Master</option>
          </select>
        </p>
      </section>

      <div className="text-right">
      <button
  onClick={handleStart}
  className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
  type="button"
>
  Start
</button>


        {formError && (
          <p className="text-red-600 text-sm mt-2">{formError}</p>
        )}
      </div>
    </div>
  );
}
