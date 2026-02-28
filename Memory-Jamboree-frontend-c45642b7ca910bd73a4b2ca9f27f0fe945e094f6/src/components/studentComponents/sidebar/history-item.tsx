import{ Link, Outlet } from "react-router-dom"
import { Clock } from "lucide-react"
import { cn } from "../../../lib/utils"

interface HistoryItemProps {
  active?: boolean
}

export default function HistoryItem({ active = false }: HistoryItemProps) {
  return (
    <div>
      <Link
      to="/dashboard/history"
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-[#245cab]/10 text-[#245cab]" : "text-[#0F1114DE] hover:bg-[#245cab]/5 hover:text-[#245cab]",
      )}
    >
      <Clock className="h-5 w-5" />
      <span>History</span>
    </Link>
    <Outlet/>
    </div>
  )
}
