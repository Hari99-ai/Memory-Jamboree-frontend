

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { FetchEvents, getEventDetails, publishResult } from "../lib/api"
import { eventImg } from "../lib/client"
import { defaultImg } from "../lib/select"
import type { CategoryMasterData, RegisterUserInput } from "../types"
import { columns } from "./Events/EventsList/UserList/column"
import { DataTable } from "./Users/DataTable"
import CategoryStepper, { type Category } from "./components/CategoryStepper"
import DisciplinesStepper from "./components/DisciplinesStepper"
import { CategoryDialog } from "./components/CategoryDialog"
import { MdPublish } from "react-icons/md"

export default function Results() {
  const [activeTab, setActiveTab] = useState<string>("overall")
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [selectedEventId, setSelectedEventId] = useState<any | null>(null)
  const [isCategoryDialog, setCategoryDialog] = useState(false)

  const [isExpired, setExpired] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 9

  // Fetch events list
  const { data: events, isLoading } = useQuery({
    queryKey: ["event-list"],
    queryFn: FetchEvents,
  })

  // Fetch event details for selected event
  const { data: eventData, isLoading: isLoadingEventData } = useQuery({
    queryKey: ["event-details", selectedEventId],
    queryFn: () => getEventDetails(selectedEventId!),
    enabled: !!selectedEventId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const event_id = eventData?.event_id

  useEffect(() => {
    if (eventData?.etype !== undefined) {
      setExpired(Number(eventData.etype) === 0) // true if expired
    }
  }, [eventData])

  const { mutate: publish } = useMutation({
    mutationKey: ["publish-result", event_id],
    mutationFn: () => publishResult(String(event_id)), // ✅ wrap in a function
    onSuccess: (data: any) => {
      if (data) {
        alert("Event published successfully!")
      }
    },
    onError: (error: any) => {
      alert("Error publishing event: " + error.message)
    },
  })

  const handlePublish = async () => {
    if (!isExpired) {
      alert("You can only publish after the event is expired!")
      return
    }
    await publish()
  }

  // Get selected category data
  const selectedCategory = useMemo(() => {
    if (!eventData?.users_by_category || !activeCategoryId) return null

    return eventData.users_by_category.find((item: any) => Number(item.category_id) === activeCategoryId)
  }, [eventData, activeCategoryId])

  // Set default active category when event data loads
  useEffect(() => {
    if (eventData?.users_by_category && eventData.users_by_category.length > 0 && !activeCategoryId) {
      setActiveCategoryId(Number(eventData.users_by_category[0].category_id))
    }
  }, [eventData, activeCategoryId])

  // Auto-scroll to results section when event data loads
  useEffect(() => {
    if (selectedEventId && eventData && !isLoadingEventData) {
      const resultsSection = document.getElementById("results-section")
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  }, [selectedEventId, eventData, isLoadingEventData])

  // Reset pagination to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const users = selectedCategory?.users || []

  // Format time as in your original code
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    if (!events) return []
    return events
      .filter((event: any) => (event.event_name || event.ename || "").toLowerCase().includes(search.toLowerCase()))
      .sort((a: any, b: any) => new Date(b.event_start).getTime() - new Date(a.event_start).getTime())
  }, [events, search])

  // Get paginated events
  const eventsToShow = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage
    const endIndex = startIndex + eventsPerPage
    return filteredEvents.slice(startIndex, endIndex)
  }, [filteredEvents, currentPage])

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)

  const tabMode = activeTab === "overall" ? "overall" : "discipline"
  const activeDisciplineId = activeTab === "overall" ? null : Number(activeTab)

  const handleViewResults = (eventId: number) => {
    setSelectedEventId(eventId)
    setActiveCategoryId(null) // Reset category selection

    // Small delay to ensure the component renders before scrolling
    setTimeout(() => {
      const resultsSection = document.getElementById("results-section")
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }, 100)
  }

  const handleCategorySubmit = () => {
    setCategoryDialog(false)
    // Add your category update logic here if needed
  }

  const cumulativeEventsShown = Math.min(currentPage * eventsPerPage, filteredEvents.length)

  return (
    <div className="flex h-full w-full p-6 bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen">
      <div className="w-full">
        <div className="flex flex-col items-center mb-8">
         
            <h2 className="text-4xl text-center text-primary font-bold mb-2">Event Results</h2>
          

          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur-xl"></div>
            <input
              type="text"
              placeholder="Search by event name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full px-6 py-3 bg-card/90 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground shadow-lg"
            />
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-500">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No events found.</div>
          ) : (
            eventsToShow.map((event: any) => (
              <div
                key={event.event_id}
                className="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-100 group hover:shadow-xl transition duration-300 min-h-[320px]"
              >
                {/* Image & gradient overlay */}
                <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                  <img
                    src={event.eimage ? `${eventImg}/${event?.eimage}` : defaultImg}
                    alt={event.event_name || event.ename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>

                {/* Card Content */}
                <div className="px-5 py-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">
                    {event.event_name || event.ename}
                  </h3>

                  {/* Event date/time info */}
                  <div className="text-gray-600 text-sm mb-4 space-y-1">
                    <p>
                      <span className="font-medium">Start:</span> {formatTime(event.event_start)}
                    </p>
                    <p>
                      <span className="font-medium">End:</span> {formatTime(event.event_end)}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {event.estatus === 1 ? (
                        <span className="text-green-600 font-semibold">Paid</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Unpaid</span>
                      )}
                    </p>
                  </div>

                  {/* Join button aligned bottom */}
                  <div className="mt-auto flex justify-end">
                    <button
                      onClick={() => handleViewResults(event.event_id)}
                      className="bg-[#245cab] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mb-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Prev
            </button>

            <span className="font-semibold text-gray-700">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Next
            </button>
          </div>
        )}

        {/* Events Count Info */}
        {filteredEvents.length > 0 && (
          <div className="text-center mb-8 text-gray-600">
            Showing {cumulativeEventsShown} of {filteredEvents.length} events
          </div>
        )}

        {/* Results Section for selected event */}
        {selectedEventId && (
          <div
            className="max-w-7xl mx-auto bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-border/50"
            id="results-section"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold">Results for {eventData?.event_name}</h2>
              <div className="flex gap-x-4">{/* Add controls if needed */}</div>

              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !isExpired} // optional if using React Query loading state
              >
                <MdPublish size={20} />
                Publish
              </button>
            </div>

            {isLoadingEventData ? (
              <div className="text-center text-gray-500">Loading event data...</div>
            ) : (
              <>
                <div className="flex flex-col gap-y-4 mb-6">
                  <div className="flex-1">
                    <CategoryStepper
                      categories={normalizeCategories(eventData?.category || [])}
                      activeTab={Number(activeCategoryId)}
                      setActiveTab={(tabId: string | number) => {
                        // If tabId is a number, set it; otherwise, set null
                        if (typeof tabId === "number") {
                          setActiveCategoryId(tabId)
                        } else {
                          setActiveCategoryId(null)
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <DisciplinesStepper
                        disciplines={eventData?.disciplines || []}
                        activeTab={String(activeDisciplineId)}
                        setActiveTab={setActiveTab} totalUsers={users.length}                    />
                  </div>
                </div>

                <CategoryDialog
                  open={isCategoryDialog}
                  onOpenChange={setCategoryDialog}
                  onSubmit={handleCategorySubmit}
                  previous={eventData?.category || []}
                />

                {users.length > 0 ? (
                  <DataTable
                    columns={columns(tabMode, activeDisciplineId)}
                    data={users as RegisterUserInput[]}
                    hideExcelButton={true}
                    showDownloadResultButton={true}
                    resultData={users}
                    eventName={eventData?.event_name}
                  />
                ) : (
                  <p className="text-gray-500">No participants found for this category.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function normalizeCategories(data: CategoryMasterData[]): Category[] {
  return data
    .filter((c) => typeof c.cat_id === "number")
    .map((c) => ({
      cat_id: c.cat_id!, // safe now
      category_name: c.category_name,
    }))
}
