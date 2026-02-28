import { Suspense } from "react";
import disciplineComponents from "./instructionConfig";

type Props = {
  gameName: string;
  time: number;
  onStart: (config: Record<string, any>) => void;
  onClose: () => void;
};

export default function InstructionPanel({ gameName, time, onStart, onClose }: Props) {
  const DisciplineComponent = disciplineComponents[gameName];

  if (!DisciplineComponent) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold">
          No instructions available for <strong>{gameName}</strong>.
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed overflow-hidden inset-0 z-50 flex w-full items-center justify-center bg-black bg-opacity-60 backdrop-blur-md p-6">
      <div className="relative w-[80vw] h-[99vh] bg-gradient-to-t from-indigo-100 via-purple-200 to-pink-100 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 text-gray-800 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-red-500 text-2xl font-bold transition focus:outline-none focus:ring focus:ring-red-300"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4 capitalize">
          {gameName} – {time}-Minute Session
        </h2>

        <p className="text-sm text-gray-600 text-center mb-10">
          Press{" "}
          <kbd className="px-1 py-0.5 bg-gray-200 rounded border border-gray-400">F11</kbd> (Windows) or{" "}
          <kbd className="px-1 py-0.5 bg-gray-200 rounded border border-gray-400">⌃ ⌘ F</kbd> (Mac) for fullscreen.
        </p>

        <div className="overflow-y-auto max-h-[70vh] scrollbar-custom">
          <Suspense fallback={<div className="text-center text-gray-600 py-6">Loading instructions...</div>}>
            <DisciplineComponent time={time} onStart={onStart} onClose={onClose} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
