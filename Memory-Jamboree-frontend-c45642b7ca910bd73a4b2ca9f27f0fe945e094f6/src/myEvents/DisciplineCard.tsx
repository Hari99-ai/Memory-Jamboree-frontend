import { Discipline } from "./types"
import { isEventActive } from "./utils"
import { Button } from "../components/ui/button"

type Props = {
  discipline: Discipline
  onStart: () => void
}

export default function DisciplineCard({ discipline, onStart }: Props) {
  const active = isEventActive(discipline.startTime)

  return (
    <div className="border p-3 rounded-lg bg-gray-50 space-y-2">
      <h3 className="text-md font-bold">{discipline.name}</h3>
      <p className="text-sm text-gray-600">{discipline.description}</p>
      <Button disabled={!active} onClick={onStart} className="mt-2">
        {active ? "Start Exam" : "Not Active Yet"}
      </Button>
    </div>
  )
}