// pages/MyEvents.tsx
import { useQuery } from "@tanstack/react-query"
import { registered_events } from "../lib/api"
import EventCard from "../myEvents/EventCard"
import { EventData } from "../types"
import { SkeletonCard } from "../admin/components/SkeletonCard"
import { useState, useEffect } from "react"
import dayjs from "dayjs"

export default function MyEvents() {
  const { data: events = [], isLoading } = useQuery<EventData[]>({
    queryKey: ["get-registered-events"],
    queryFn: registered_events,
  })

  const [statusFilter, setStatusFilter] = useState("All")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Trigger fade-in animation on component mount
    setIsMounted(true)
  }, [])

  const today = dayjs()

  const filteredEvents = events
    .filter(event => typeof event.etype === "number") // safety filter
    .filter(event => {
      // Filter by status
      if (statusFilter !== "All") {
        if (
          (statusFilter === "Live" && event.etype !== 1) ||
          (statusFilter === "Upcoming" && event.etype !== 2) ||
          (statusFilter === "Expired" && event.etype !== 0)
        ) {
          return false
        }
      }

      // Filter by date range
      const eventStart = dayjs(event.event_start)
      if (startDate && eventStart.isBefore(dayjs(startDate))) return false
      if (endDate && eventStart.isAfter(dayjs(endDate))) return false

      // Hide expired events older than 1 month unless the "Expired" filter is selected
      const isExpired = event.etype === 0
      const isOlderThan1Month = dayjs(event.event_end).isBefore(today.subtract(1, "month"))
      if (isExpired && isOlderThan1Month && statusFilter !== "Expired") return false

      return true
    })
    .sort((a, b) => {
      // Primary sort by status when filter is "All"
      if (statusFilter === "All") {
        const order: Record<number, number> = { 1: 0, 2: 1, 0: 2 } // Live, Upcoming, Expired
        const aRank = order[a.etype ?? -1] ?? 3
        const bRank = order[b.etype ?? -1] ?? 3
        if (aRank !== bRank) {
          return aRank - bRank
        }
      }

      // Secondary sort by date
      const aDate = dayjs(a.event_start)
      const bDate = dayjs(b.event_start)

      // For Live events, show the latest first (descending)
      if (a.etype === 1) {
        return bDate.diff(aDate)
      }

      // For Upcoming events, show the soonest first (ascending)
      if (a.etype === 2) {
        return aDate.diff(bDate)
      }

      // For Expired events, show the most recently passed first (descending)
      return bDate.diff(aDate)
    })

  return (
    <div className="p-6">
      {/* Header and Filters Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Events</h1>

        {/* Filters */}
        <div
          className={`flex items-end gap-2 transition-all duration-500 ease-out ${
            isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              id="status"
              className="px-2.5 py-1 rounded-md border-gray-200 bg-white shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 text-xs"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Live">Live</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Expired">See Older Events</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="start-date" className="block text-xs font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={`px-2.5 py-1 rounded-md border-gray-200 bg-white shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 text-xs ${
                !startDate ? "text-gray-400" : "text-gray-900"
              }`}
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="end-date" className="block text-xs font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={`px-2.5 py-1 rounded-md border-gray-200 bg-white shadow-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 text-xs ${
                !endDate ? "text-gray-400" : "text-gray-900"
              }`}
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setStatusFilter("All")
              setStartDate("")
              setEndDate("")
            }}
            aria-label="Clear filters"
            className="p-1.5 rounded-md transition-colors border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map(event => <EventCard key={event.event_id} event={event} />)
        ) : (
          <p className="text-gray-400 text-xl col-span-full text-center mt-8">No events match your filters!</p>
        )}
      </div>
    </div>
  )
}