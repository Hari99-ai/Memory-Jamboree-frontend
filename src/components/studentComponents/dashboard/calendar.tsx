import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "../../../lib/utils"
import { getUserEvents } from "../../../lib/api"
import { useRouter } from "../../../hooks/useRouter"

export default function CalendarComponent() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const router = useRouter()

  const { data: events } = useQuery({
    queryKey: ['events_data'],
    queryFn: getUserEvents,
  })

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth })

  const formatDate = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">{monthName}</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-full p-1 hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">{year}</span>
          <button onClick={nextMonth} className="rounded-full p-1 hover:bg-gray-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fr", "Sa"].map((day) => (
          <div key={day} className="py-1 font-medium">{day}</div>
        ))}

        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-7"></div>
        ))}

        {days.map((day) => {
          const thisDate = formatDate(year, currentMonth.getMonth(), day)

          const event = events?.find((e) => {
            const eventDate = new Date(e.event_start)
            const eventDay = formatDate(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
            return eventDay === thisDate
          })

          return (
            <div
              key={day}
              onClick={() => {
                if (event) router.push(`/events/${event.event_id}`) // ✅ Navigate on click
              }}
              className={cn(
                "flex h-7 items-center justify-center rounded-full text-sm cursor-pointer",
                event?.etype === 1  && "bg-[#245cab] text-white",
                event?.etype === 2 && "bg-[#e8c740] text-[#0f1114]",
                // event?.estatus === "event" && "bg-[#FF8B00] text-white"
              )}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
