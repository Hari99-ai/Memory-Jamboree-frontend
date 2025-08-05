"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, ChevronDown } from "lucide-react"
import { cn } from "../../../lib/utils"

interface EventsItemProps {
  active?: boolean
}

export default function EventsItem({ active = false }: EventsItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-[#245cab]/10 text-[#245cab]" : "text-[#0F1114DE] hover:bg-[#245cab]/5 hover:text-[#245cab]",
        )}
      >
        <Calendar className="h-5 w-5" />
        <span>Events</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", expanded ? "rotate-180" : "")} />
      </button>
      {expanded && (
        <div className="ml-9 mt-1 space-y-1">
          <Link
            to="/events/all"
            className="block rounded-md px-3 py-2 text-sm font-medium text-[#0F1114DE] transition-colors hover:bg-[#245cab]/5 hover:text-[#245cab]"
          >
            All Events
          </Link>
          <Link
            to="/events/my-events"
            className="block rounded-md px-3 py-2 text-sm font-medium text-[#0F1114DE] transition-colors hover:bg-[#245cab]/5 hover:text-[#245cab]"
          >
            My Events
          </Link>
        </div>
      )}
    </div>
  )
}
