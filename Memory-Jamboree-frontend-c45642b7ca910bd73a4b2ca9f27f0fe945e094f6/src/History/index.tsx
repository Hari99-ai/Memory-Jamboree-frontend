import PracticeTestHistory from "./PracticeTestHistory"
import EventHistory from "./EventHistory"

interface HistoryProps {
  activeSection: string
}

export default function History({ activeSection }: HistoryProps) {
  if (activeSection === "history-practice") {
    return <PracticeTestHistory />
  }

  if (activeSection === "history-events") {
    return <EventHistory />
  }

  // Default fallback
  return <PracticeTestHistory />
}
