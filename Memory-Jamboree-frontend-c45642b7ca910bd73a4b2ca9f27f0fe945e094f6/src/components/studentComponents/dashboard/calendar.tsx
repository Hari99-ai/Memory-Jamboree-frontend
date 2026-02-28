import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useRouter } from "../../../hooks/useRouter";
import { EventData } from "../../../types";
import { API_BASE_URL } from "../../../lib/client";

export default function CalendarComponent() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) return;

    const fetchRegisteredEvents = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/get-user-registered-events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch registered events");
          return;
        }

        const data = await response.json();
        const eventsArray = Array.isArray(data) ? data : data.events || [];
        setEvents(eventsArray);
      } catch (error) {
        console.error("An error occurred during fetch:", error);
      }
    };

    fetchRegisteredEvents();
  }, []);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth });

  const formatDate = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg">{`${monthName} ${year}`}</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={nextMonth} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1 font-medium text-gray-500">
            {day}
          </div>
        ))}

        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const thisDate = formatDate(year, currentMonth.getMonth(), day);
          const event = events.find((e) => {
            const eventDate = new Date(e.event_start);
            const eventDay = formatDate(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            return eventDay === thisDate;
          });

          return (
            <div
              key={day}
              onClick={() => {
                if (event) router.push(`/events/${event.event_id}`);
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-200",
                event ? "cursor-pointer hover:ring-2 hover:ring-offset-2" : "cursor-default",
                event?.etype === 1 && "bg-red-500 text-white hover:ring-red-500",      // Live
                event?.etype === 2 && "bg-blue-500 text-white hover:ring-blue-500",    // Upcoming
                event?.etype === 0 && "bg-gray-300 text-gray-800 hover:ring-gray-400", // Expired
                !event && "hover:bg-gray-100"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}