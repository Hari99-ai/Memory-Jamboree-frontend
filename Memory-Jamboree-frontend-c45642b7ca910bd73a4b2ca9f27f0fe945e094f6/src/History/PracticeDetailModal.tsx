import { X } from "lucide-react"

interface EventDetailModalProps {
  event: {
    name: string
    date: string
    overallScore: number
    categoryScores: string[]
    disciplineScores: string[]
  }
  onClose: () => void
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-xl relative animate-fadeIn">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500" onClick={onClose}>
          <X />
        </button>
        <h2 className="text-xl font-bold text-[#245cab] mb-4">{event.name}</h2>
        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Overall Score:</strong> {event.overallScore}</p>
        <p><strong>Category-wise:</strong> {event.categoryScores.join(", ")}</p>
        <p><strong>Discipline-wise:</strong> {event.disciplineScores.join(", ")}</p>
      </div>
    </div>
  )
}
