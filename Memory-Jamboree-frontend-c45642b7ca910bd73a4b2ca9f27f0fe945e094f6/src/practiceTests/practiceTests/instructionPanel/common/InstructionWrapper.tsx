
// src/practiceTests/instructionPanel/common/InstructionWrapper.tsx
import type { ReactNode } from "react"

interface Props {
  title: string
  children: ReactNode
  onClose: () => void
}

export default function InstructionWrapper({ title, children, onClose }: Props) {
  return (
    <div className="relative w-full max-w-3xl bg-gradient-to-t from-indigo-100 via-purple-200 to-pink-100 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-xl p-8 sm:p-12 text-gray-800 animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-700 hover:text-red-500 text-2xl font-bold transition"
        aria-label="Close"
      >
        ×
      </button>

      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4 capitalize">{title}</h2>

      <p className="text-sm text-gray-600 text-center mb-10">
        Press <kbd className="px-1 py-0.5 bg-gray-200 rounded border border-gray-400">F11</kbd> (Windows) or{" "}
        <kbd className="px-1 py-0.5 bg-gray-200 rounded border border-gray-400">⌃ ⌘ F</kbd> (Mac) for fullscreen.
      </p>

      {children}
    </div>
  )
}

export { InstructionWrapper }
