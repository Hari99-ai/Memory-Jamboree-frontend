


import { useState, useEffect } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Button } from "./button"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Badge } from "./badge"
import { useQuery } from "@tanstack/react-query"
import { getDisciplines, getcertificates } from "../../lib/api"
// import { useQuery } from "@tanstack/react-query"
// import { StudentEventsReport } from "../../lib/api"
// import { useParams } from "react-router-dom";




const ModernResultsTable = () => {
  // Pagination states
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState("All Events");
  const [searchTerm, setSearchTerm] = useState("");


  // const handleViewClick = () => {
  //   navigate("/certificate-viewer");
  // };

  const user_id = sessionStorage.getItem("userId");
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getcertificates(Number(user_id)); // or StudentEventsReport()
        setEvents(response); // Make sure response is an array
      } catch (err) {
        console.error(err);
        setError("Failed to fetch events.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const { data: disciplines, } = useQuery({
    queryKey: ['disciplines'],
    queryFn: getDisciplines,
    retry: 1,
  });
 

  const filteredEvents = events
    ?.filter((event) =>
      selectedEvent === "All Events" || event?.event_name === selectedEvent
    )
    ?.filter((event) =>
      event?.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event?.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );




  // Pagination calculations
  const totalRecords = events?.length
  const totalPages = Math.ceil(totalRecords / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  // const currentRecords = filteredEvents.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle records per page change
  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing records per page
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="min-h-screen p-4 bg-white md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Results & Certificates</h1>
          <p className="text-gray-600">View your performance summary and download certificates</p>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl ">
          {/* Table Header */}
          <div className="px-6 py-6 ">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="mb-1 text-xl font-bold text-gray-900">Performance Summary</h2>
                <p className="text-gray-600">Your competition results and rankings</p>
              </div>

              <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search competitions or categories..."
                    className="text-black transition-all duration-200 border-gray-200 pl-9 bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={selectedEvent}
                  onValueChange={(value) => setSelectedEvent(value)}
                >
                  <SelectTrigger className="w-auto min-w-[180px]">
                    <SelectValue placeholder="Filter Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Events">All Events</SelectItem>
                    {[...new Set(events.map((e) => e.event_name))].map((eventName) => (
                      <SelectItem key={eventName} value={eventName}>
                        {eventName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>
            </div>
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="text-lg font-medium text-slate-600">Loading your results...</div>
                </div>
              </div>
            ) : (
<Table>
  <TableHeader>
    {/* Main Header Row */}
    <TableRow className="border-b-2 border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
      <TableHead className="w-[100px] border-r border-gray-200 font-semibold text-gray-700">Event Rank</TableHead>
      <TableHead className="min-w-[220px] border-r border-gray-200 font-semibold text-gray-700">Event</TableHead>
      <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">Category</TableHead>
      <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">Category Rank</TableHead>
      <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">Overall Score</TableHead>
      {disciplines?.map((discipline) => (
        <TableHead
          key={discipline.disc_id}
          colSpan={2}
          className="text-center font-semibold text-gray-700 border-r border-gray-200"
        >
          {discipline.discipline_name}
        </TableHead>
      ))}
      <TableHead className="min-w-[100px] text-center font-semibold text-gray-700 border-l-2 border-blue-200">Certificate</TableHead>
    </TableRow>

    {/* Subheader Row for Score and Time */}
    <TableRow className="border-b-2 border-gray-200 bg-gray-50">
      <TableHead className="border-r border-gray-200" />
      <TableHead className="border-r border-gray-200" />
      <TableHead className="border-r border-gray-200" />
      <TableHead className="border-r border-gray-200" />
      <TableHead className="border-r border-gray-200" />
      {disciplines?.map(() => (
        <>
          <TableHead className="text-center text-xs font-medium text-gray-600 border-r border-gray-200">Score</TableHead>
          <TableHead className="text-center text-xs font-medium text-gray-600 border-r border-gray-200">Time</TableHead>
        </>
      ))}
      <TableHead className="border-l-2 border-blue-200" />
    </TableRow>
  </TableHeader>

  <TableBody>
    {filteredEvents.map((item, index) => (
      <TableRow
        key={index}
        className="transition-all duration-200 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30"
      >
        {/* Existing Cells */}
        <TableCell className="border-r border-gray-100">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${item.event_rank === 1
              ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border border-amber-300"
              : item.event_rank === 2
                ? "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-300"
                : item.event_rank === 3
                  ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border border-orange-300"
                  : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-300"}`}
            >
              <span className="text-sm font-bold">#{item.event_rank}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="border-r border-gray-100">
          <div className="font-semibold text-gray-900">{item.event_name}</div>
        </TableCell>
        <TableCell className="border-r border-gray-100">
          <Badge
            variant="outline"
            className="font-medium text-gray-800 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
          >
            {item.category_name}
          </Badge>
        </TableCell>
        <TableCell className="border-r border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 border border-green-300 shadow-sm bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
              <span className="text-sm font-bold text-green-700">#{item.cat_rank}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="border-r border-gray-100">
          <div className="px-3 py-2 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <span className="font-bold text-gray-900">
              {Number.parseFloat(String(item.overall_score)).toFixed(2)}
            </span>
          </div>
        </TableCell>

        {/* Discipline Score + Time */}
        {disciplines?.map((discipline) => {
          const matched = item.disciplines?.find((d: { disc_id: number; calc_score: string; time_taken: string }) => d.disc_id === discipline.disc_id);
          return (
            <>
              <TableCell className="text-center border-r border-gray-100">
                <div className="px-2 py-1 rounded bg-gray-50 text-sm font-medium text-gray-800">
                  {matched?.calc_score ? Number.parseFloat(matched.calc_score).toFixed(2) : "-"}
                </div>
              </TableCell>
              <TableCell className="text-center border-r border-gray-100">
                <div className="px-2 py-1 rounded bg-gray-50 text-sm font-medium text-gray-800">
                  {matched?.time_taken ?? "-"}
                </div>
              </TableCell>
            </>
          );
        })}

        {/* Certificate View Button */}
        <TableCell className="text-center border-l-2 border-blue-100">
          <Button
            onClick={() => {
              const url = `/certificate-viewer?user_id=${user_id}&event_id=${item.event_id}`;
              window.open(url, 'noopener,noreferrer');
            }}
          >
            View
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

            )}
          </div>



          {/* Pagination */}
          {totalRecords > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50/50 to-white sm:flex-row">
              {/* Records info */}
              <div className="text-sm font-medium text-gray-600">
                Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-gray-900">{Math.min(endIndex, totalRecords)}</span> of{" "}
                <span className="font-bold text-gray-900">{totalRecords}</span> results
              </div>

              <div className="flex items-center gap-4">
                {/* Records per page dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Show:</span>
                  <Select value={String(recordsPerPage)} onValueChange={handleRecordsPerPageChange}>
                    <SelectTrigger className="w-[200px] bg-white border-gray-300 hover:border-gray-400 transition-colors">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                    {/* Previous button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-white border-0 rounded-none hover:bg-gray-50 disabled:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center">
                      {getPageNumbers().map((page, index) => (
                        <Button
                          key={index}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => typeof page === "number" && handlePageChange(page)}
                          disabled={page === "..."}
                          className={`rounded-none border-0 min-w-[40px] ${typeof page === "number" && page === currentPage
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                            : "bg-white hover:bg-gray-50"
                            }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    {/* Next button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="bg-white border-0 rounded-none hover:bg-gray-50 disabled:bg-gray-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModernResultsTable