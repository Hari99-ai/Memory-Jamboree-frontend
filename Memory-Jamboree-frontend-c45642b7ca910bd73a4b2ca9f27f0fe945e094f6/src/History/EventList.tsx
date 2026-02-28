import { useState } from "react"
import {
  Calendar,
  BarChart2,
  ListOrdered,
  BarChartBig,
  FileBarChart,
} from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog"
import { Progress } from "../components/ui/progress"

type Event = {
  id: string
  name: string
  date: string
  overallScore: number
  categoryScores: Record<string, number>
  disciplineScores: Record<string, number>
}

// Mock data
const mockEvents: Event[] = [
  {
    id: "1",
    name: "Cognitive Sprint 2025",
    date: "2025-03-12",
    overallScore: 87,
    categoryScores: {
      Memory: 90,
      Attention: 80,
      Speed: 85,
    },
    disciplineScores: {
      "5-Minute Word": 92,
      "5-Minute Images": 88,
      "Rapid Match": 81,
    },
  },
  {
    id: "2",
    name: "Focus Arena 2025",
    date: "2025-04-05",
    overallScore: 74,
    categoryScores: {
      Memory: 70,
      Attention: 75,
      Speed: 78,
    },
    disciplineScores: {
      "5-Minute Word": 69,
      "5-Minute Images": 74,
      "Rapid Match": 79,
    },
  },
]

export default function EventList() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-8 flex flex-col items-center">
      {/* Page Heading */}
      <h2 className="w-full max-w-6xl text-left text-4xl font-extrabold text-indigo-900 mb-10 select-none">
        🧠 Event History
      </h2>

      {/* Events Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockEvents.map((event) => (
          <Dialog key={event.id}>
            <DialogTrigger asChild>
              <div
                onClick={() => setSelectedEvent(event)}
                className="cursor-pointer rounded-3xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-indigo-900 hover:underline">
                    {event.name}
                  </h3>
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>

                <p className="text-sm text-gray-600 mb-3">📅 {event.date}</p>

                <div className="mb-4">
                  <p className="text-indigo-800 font-semibold mb-1">Overall Score</p>
                  <Progress value={event.overallScore} className="h-3 rounded-full" />
                  <p className="text-sm text-right text-gray-600 mt-1 font-medium">
                    {event.overallScore}%
                  </p>
                </div>

                <div className="text-sm space-y-1">
                  <p className="font-semibold text-indigo-700 flex items-center gap-2 mb-1">
                    <BarChart2 className="w-5 h-5 text-indigo-500" /> Category Scores
                  </p>
                  {Object.entries(event.categoryScores).map(([cat, score]) => (
                    <div key={cat} className="flex justify-between text-gray-700">
                      <span>{cat}</span>
                      <span className="font-medium">{score}</span>
                    </div>
                  ))}
                </div>

                <div className="text-sm mt-4 space-y-1">
                  <p className="font-semibold text-indigo-700 flex items-center gap-2 mb-1">
                    <ListOrdered className="w-5 h-5 text-purple-600" /> Discipline Scores
                  </p>
                  {Object.entries(event.disciplineScores).map(([type, score]) => (
                    <div key={type} className="flex justify-between text-gray-700">
                      <span>{type}</span>
                      <span className="font-medium">{score}</span>
                    </div>
                  ))}
                </div>

                <button className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 rounded-2xl transition">
                  <FileBarChart className="w-5 h-5" /> View Full Report
                </button>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-3xl bg-white rounded-3xl shadow-xl p-8">
              {selectedEvent && (
                <>
                  <div className="mb-6">
                    <h3 className="text-3xl font-extrabold text-indigo-900 mb-2">
                      📊 {selectedEvent.name}
                    </h3>
                    <p className="text-gray-600 text-base mb-4">Date: {selectedEvent.date}</p>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-indigo-700">
                      <BarChartBig className="w-6 h-6" />
                      Category Breakdown
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(selectedEvent.categoryScores).map(([cat, score]) => (
                        <div key={cat}>
                          <p className="text-base text-gray-700 mb-1">{cat}</p>
                          <Progress value={score} className="h-4 rounded-full" />
                          <p className="text-xs text-right text-gray-500">{score}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-purple-700">
                      <ListOrdered className="w-6 h-6" />
                      Discipline Performance
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(selectedEvent.disciplineScores).map(([type, score]) => (
                        <div key={type}>
                          <p className="text-base text-gray-700 mb-1">{type}</p>
                          <Progress value={score} className="h-4 rounded-full bg-purple-100" />
                          <p className="text-xs text-right text-gray-500">{score}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
