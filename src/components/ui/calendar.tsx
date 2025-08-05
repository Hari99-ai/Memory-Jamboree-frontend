
import {
  Calendar as ReactCalendar,
  CalendarProps as ReactCalendarProps,
} from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { cn } from "../../lib/utils"

export type CalendarProps = ReactCalendarProps

export function Calendar(props: CalendarProps) {
  return <ReactCalendar className={cn("rounded-lg border p-2")} {...props} />
}
