import { useState } from "react";

interface Props {
  onStart: (config: Record<string, string>) => void;
}

export default function FifteenMinNamesFaces({ onStart }: Props) {
  const [formState, setFormState] = useState({
    highlightColor: "#00ffcc", // Default color
  });

  const colors = [
  "#FF9999", // Darker Red
  "#FF99B3", // Darker Pink
  "#B3B3FF", // Darker Lavender
  "#E5B3FF", // Darker Purple
  "#99D6FF", // Darker Sky Blue
  "#9999FF", // Darker Blue
  "#99FF99", // Darker Green
  "#FFB380"  // Darker Orange/Peach
];

  const handleChange = (color: string) => {
    setFormState({ highlightColor: color });
  };

  return (
    <div className="space-y-8 mb-10">
      {/* Instructions Box */}
      <div className="bg-white border rounded-lg p-6 shadow text-sm">
        <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
          📘 How to Play
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>You will be shown a grid of binary digits (0s and 1s) for 30 minutes.</li>
          <li>Try to memorize as many digits in order as possible.</li>
          <li>
            After memorization, you will be asked to recall and input the exact digits in the
            same sequence.
          </li>
          <li>
            You can choose your preferred <span className="text-blue-600 underline cursor-pointer">highlight color</span> to help you focus during memorization and recall.
          </li>
          <li>Your score will be based on the number of correct consecutive digits.</li>
        </ul>
      </div>

      {/* Highlight Color Picker */}
     <div className="flex space-x-4">
  {colors.map((color) => (
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


      {/* Start Test Button */}
      <div className="text-right">
        <button
          onClick={() => onStart(formState)}
          className="w-[100px] mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Start 
        </button>
      </div>
    </div>
  );
}
