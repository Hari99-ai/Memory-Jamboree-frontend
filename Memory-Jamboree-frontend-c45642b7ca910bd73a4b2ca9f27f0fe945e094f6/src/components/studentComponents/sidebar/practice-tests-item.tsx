"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, GamepadIcon, Hash, ImageIcon, Text } from "lucide-react"
import { cn } from "../../../lib/utils"

interface PracticeTestsItemProps {
  active?: boolean
}

export default function PracticeTestsItem({ active = false }: PracticeTestsItemProps) {
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
        <GamepadIcon className="h-5 w-5" />
        <span>Practice Tests</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", expanded ? "rotate-180" : "")} />
      </button>
      {expanded && (
        <div className="ml-9 mt-1 space-y-1">
          <Link
            to="/practice-tests/image-game"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#0F1114DE] transition-colors hover:bg-[#245cab]/5 hover:text-[#245cab]"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Image Game</span>
          </Link>
          <Link
            to="/practice-tests/number-game"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#0F1114DE] transition-colors hover:bg-[#245cab]/5 hover:text-[#245cab]"
          >
            <Hash className="h-4 w-4" />
            <span>Number Game</span>
          </Link>
          <Link
            to="/practice-tests/words-game"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#0F1114DE] transition-colors hover:bg-[#245cab]/5 hover:text-[#245cab]"
          >
            <Text className="h-4 w-4" />
            <span>Words Game</span>
          </Link>
        </div>
      )}
    </div>
  )
}
