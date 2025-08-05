



// import { useState } from "react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
// import { Button } from "./button"
// import { ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal } from "lucide-react"
// import { Input } from "./input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"
// import { Badge } from "./badge"
// // import { useQuery } from "@tanstack/react-query"
// // import { StudentEventsReport } from "../../lib/api"

// // Demo data for the table
// const demoEvents = [
//   {
//     event_id: 1,
//     event_name: "World Memory Championship 2023",
//     event_rank: 3,
//     category_name: "Senior",
//     cat_rank: 2,
//     overall_score: 8432.15,
//     fname: "John",
//     lname: "Smith",
//     disciplines: [
//       { disc_id: 1, finalscore: "95.75" },
//       { disc_id: 2, finalscore: "87.30" },
//       { disc_id: 3, finalscore: "92.45" },
//       { disc_id: 4, finalscore: "88.60" },
//       { disc_id: 5, finalscore: "91.20" },
//       { disc_id: 6, finalscore: "89.75" },
//       { disc_id: 7, finalscore: "93.85" },
//     ],
//   },
//   {
//     event_id: 2,
//     event_name: "European Memory Open 2023",
//     event_rank: 1,
//     category_name: "Senior",
//     cat_rank: 1,
//     overall_score: 9021.5,
//     fname: "John",
//     lname: "Smith",
//     disciplines: [
//       { disc_id: 1, finalscore: "98.20" },
//       { disc_id: 2, finalscore: "94.75" },
//       { disc_id: 3, finalscore: "96.30" },
//       { disc_id: 4, finalscore: "93.85" },
//       { disc_id: 5, finalscore: "95.40" },
//       { disc_id: 6, finalscore: "92.65" },
//       { disc_id: 7, finalscore: "97.10" },
//     ],
//   },
//   {
//     event_id: 3,
//     event_name: "National Memory Championship 2023",
//     event_rank: 2,
//     category_name: "Senior",
//     cat_rank: 1,
//     overall_score: 8765.3,
//     fname: "John",
//     lname: "Smith",
//     disciplines: [
//       { disc_id: 1, finalscore: "96.50" },
//       { disc_id: 2, finalscore: "91.25" },
//       { disc_id: 3, finalscore: "94.80" },
//       { disc_id: 4, finalscore: "90.35" },
//       { disc_id: 5, finalscore: "93.70" },
//       { disc_id: 6, finalscore: "91.90" },
//       { disc_id: 7, finalscore: "95.25" },
//     ],
//   },
//   {
//     event_id: 4,
//     event_name: "Memory Masters Invitational 2023",
//     event_rank: 5,
//     category_name: "Elite",
//     cat_rank: 3,
//     overall_score: 8123.75,
//     fname: "John",
//     lname: "Smith",
//     disciplines: [
//       { disc_id: 1, finalscore: "93.40" },
//       { disc_id: 2, finalscore: "85.95" },
//       { disc_id: 3, finalscore: "90.60" },
//       { disc_id: 4, finalscore: "86.25" },
//       { disc_id: 5, finalscore: "89.15" },
//       { disc_id: 6, finalscore: "87.50" },
//       { disc_id: 7, finalscore: "91.70" },
//     ],
//   },
//   {
//     event_id: 5,
//     event_name: "International Memory Challenge 2022",
//     event_rank: 4,
//     category_name: "Senior",
//     cat_rank: 2,
//     overall_score: 8345.9,
//     fname: "John",
//     lname: "Smith",
//     disciplines: [
//       { disc_id: 1, finalscore: "94.60" },
//       { disc_id: 2, finalscore: "89.15" },
//       { disc_id: 3, finalscore: "93.25" },
//       { disc_id: 4, finalscore: "88.70" },
//       { disc_id: 5, finalscore: "92.30" },
//       { disc_id: 6, finalscore: "90.85" },
//       { disc_id: 7, finalscore: "94.95" },
//     ],
//   },
// ]

// // Demo disciplines data
// const demoDisciplines = [
//   { disc_id: 1, discipline_name: "5-Minute Words score" },
//   { disc_id: 2, discipline_name: "5-Minute Binary score" },
//   { disc_id: 3, discipline_name: "5-Minute Images score" },
//   { disc_id: 4, discipline_name: "5-Minute Numbers score" },
//   { disc_id: 5, discipline_name: "5-Minute Dates score" },
//   { disc_id: 6, discipline_name: "15-Minute Numbers score" },
//   { disc_id: 7, discipline_name: "15-Minute Names & Faces score" },
// ]

// const ModernResultsTable = () => {
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1)
//   const [recordsPerPage, setRecordsPerPage] = useState(10)
//   const [searchTerm, setSearchTerm] = useState("")

//   // const {data} = useQuery({
//   //   queryKey: ['get-students-event-report'],
//   //   queryFn: StudentEventsReport
//   // })



//   // Helper function to get discipline score for a specific event and discipline
//   const getDisciplineScore = (eventItem: any, discId: number): string => {
//     const disciplineData = eventItem.disciplines?.find((d: any) => d.disc_id === discId)
//     return disciplineData ? Number.parseFloat(disciplineData.finalscore).toFixed(2) : "-"
//   }

//   // Filter events based on search term
//   const filteredEvents = demoEvents.filter(
//     (event) =>
//       event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       event.category_name.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   // Pagination calculations
//   const totalRecords = filteredEvents.length
//   const totalPages = Math.ceil(totalRecords / recordsPerPage)
//   const startIndex = (currentPage - 1) * recordsPerPage
//   const endIndex = startIndex + recordsPerPage
//   const currentRecords = filteredEvents.slice(startIndex, endIndex)

//   // Handle page change
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page)
//   }

//   // Handle records per page change
//   const handleRecordsPerPageChange = (value: string) => {
//     setRecordsPerPage(Number(value))
//     setCurrentPage(1) // Reset to first page when changing records per page
//   }

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pages = []
//     const maxVisiblePages = 5

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i)
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) {
//           pages.push(i)
//         }
//         pages.push("...")
//         pages.push(totalPages)
//       } else if (currentPage >= totalPages - 2) {
//         pages.push(1)
//         pages.push("...")
//         for (let i = totalPages - 3; i <= totalPages; i++) {
//           pages.push(i)
//         }
//       } else {
//         pages.push(1)
//         pages.push("...")
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pages.push(i)
//         }
//         pages.push("...")
//         pages.push(totalPages)
//       }
//     }

//     return pages
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Results & Certificates</h1>
//           <p className="text-gray-600">View your performance summary and download certificates</p>
//         </div>

//         {/* Table Container */}
//         <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
//           {/* Table Header */}
//           <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900 mb-1">Performance Summary</h2>
//                 <p className="text-gray-600">Your competition results and rankings</p>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//                 <div className="relative w-full sm:w-72">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Search competitions or categories..."
//                     className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>

//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className="gap-2 bg-gray-50/50 hover:bg-white border-gray-200 hover:border-gray-300 transition-all duration-200"
//                     >
//                       <SlidersHorizontal className="h-4 w-4" />
//                       <span className="hidden sm:inline">Filter</span>
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="w-56">
//                     <DropdownMenuItem>All Events</DropdownMenuItem>
//                     <DropdownMenuItem>Senior Category</DropdownMenuItem>
//                     <DropdownMenuItem>Elite Category</DropdownMenuItem>
//                     <DropdownMenuItem>2023 Events</DropdownMenuItem>
//                     <DropdownMenuItem>2022 Events</DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-100">
//                   <TableHead className="w-[100px] border-r border-gray-200 font-semibold text-gray-700">
//                     Event Rank
//                   </TableHead>
//                   <TableHead className="min-w-[220px] border-r border-gray-200 font-semibold text-gray-700">
//                     Event
//                   </TableHead>
//                   <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">
//                     Category
//                   </TableHead>
//                   <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">
//                     Category Rank
//                   </TableHead>
//                   <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">
//                     Overall Score
//                   </TableHead>
//                   {demoDisciplines.map((discipline, index) => (
//                     <TableHead
//                       key={discipline.disc_id}
//                       className={`min-w-[140px] text-center font-semibold text-gray-700 ${
//                         index < demoDisciplines.length - 1 ? "border-r border-gray-200" : ""
//                       }`}
//                     >
//                       {discipline.discipline_name}
//                     </TableHead>
//                   ))}
//                   <TableHead className="min-w-[100px] text-center font-semibold text-gray-700 border-l-2 border-blue-200">
//                     Certificate
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {currentRecords.map((item, index) => (
//                   <TableRow
//                     key={index}
//                     className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200 border-b border-gray-100"
//                   >
//                     <TableCell className="border-r border-gray-100">
//                       <div className="flex items-center">
//                         <div
//                           className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm
//                           ${
//                             item.event_rank === 1
//                               ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border border-amber-300"
//                               : item.event_rank === 2
//                                 ? "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-300"
//                                 : item.event_rank === 3
//                                   ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border border-orange-300"
//                                   : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-300"
//                           }`}
//                         >
//                           <span className="text-sm font-bold">#{item.event_rank}</span>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell className="border-r border-gray-100">
//                       <div className="font-semibold text-gray-900">{item.event_name}</div>
//                     </TableCell>
//                     <TableCell className="border-r border-gray-100">
//                       <Badge
//                         variant="outline"
//                         className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 hover:from-gray-100 hover:to-gray-200 border-gray-300 font-medium"
//                       >
//                         {item.category_name}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="border-r border-gray-100">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm border border-green-300">
//                           <span className="text-sm font-bold text-green-700">#{item.cat_rank}</span>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell className="border-r border-gray-100">
//                       <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-200">
//                         <span className="font-bold text-gray-900">
//                           {Number.parseFloat(String(item.overall_score)).toFixed(2)}
//                         </span>
//                       </div>
//                     </TableCell>

//                     {demoDisciplines.map((discipline, disciplineIndex) => (
//                       <TableCell
//                         key={discipline.disc_id}
//                         className={`text-center ${
//                           disciplineIndex < demoDisciplines.length - 1 ? "border-r border-gray-100" : ""
//                         }`}
//                       >
//                         <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
//                           <span className="font-semibold text-gray-900">
//                             {getDisciplineScore(item, Number(discipline.disc_id))}
//                           </span>
//                         </div>
//                       </TableCell>
//                     ))}
//                     <TableCell className="text-center border-l-2 border-blue-100">
//                       <Button
//                         size="sm"
//                         className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
//                       >
//                         <Download className="h-4 w-4" />
//                         View
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {!currentRecords.length && (
//                   <TableRow>
//                     <TableCell colSpan={7 + demoDisciplines.length} className="h-64 text-center">
//                       <div className="flex flex-col items-center justify-center">
//                         <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
//                           <Search className="w-8 h-8 text-gray-400" />
//                         </div>
//                         <div className="text-gray-900 font-semibold mb-2 text-lg">No results found</div>
//                         <div className="text-gray-500">Try adjusting your search or filters</div>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Pagination */}
//           {totalRecords > 0 && (
//             <div className="px-6 py-5 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50/50 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
//               {/* Records info */}
//               <div className="text-sm text-gray-600 font-medium">
//                 Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{" "}
//                 <span className="font-bold text-gray-900">{Math.min(endIndex, totalRecords)}</span> of{" "}
//                 <span className="font-bold text-gray-900">{totalRecords}</span> results
//               </div>

//               <div className="flex items-center gap-4">
//                 {/* Records per page dropdown */}
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-600 font-medium">Show:</span>
//                   <Select value={String(recordsPerPage)} onValueChange={handleRecordsPerPageChange}>
//                     <SelectTrigger className="w-[70px] bg-white border-gray-300 hover:border-gray-400 transition-colors">
//                       <SelectValue placeholder="10" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="5">5</SelectItem>
//                       <SelectItem value="10">10</SelectItem>
//                       <SelectItem value="20">20</SelectItem>
//                       <SelectItem value="50">50</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Pagination controls */}
//                 {totalPages > 1 && (
//                   <div className="flex items-center shadow-sm rounded-lg overflow-hidden border border-gray-200">
//                     {/* Previous button */}
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={() => handlePageChange(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className="rounded-none border-0 bg-white hover:bg-gray-50 disabled:bg-gray-100"
//                     >
//                       <ChevronLeft className="h-4 w-4" />
//                       <span className="sr-only">Previous page</span>
//                     </Button>

//                     {/* Page numbers */}
//                     <div className="flex items-center">
//                       {getPageNumbers().map((page, index) => (
//                         <Button
//                           key={index}
//                           variant={page === currentPage ? "default" : "outline"}
//                           size="sm"
//                           onClick={() => typeof page === "number" && handlePageChange(page)}
//                           disabled={page === "..."}
//                           className={`rounded-none border-0 min-w-[40px] ${
//                             typeof page === "number" && page === currentPage
//                               ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
//                               : "bg-white hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </Button>
//                       ))}
//                     </div>

//                     {/* Next button */}
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       onClick={() => handlePageChange(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className="rounded-none border-0 bg-white hover:bg-gray-50 disabled:bg-gray-100"
//                     >
//                       <ChevronRight className="h-4 w-4" />
//                       <span className="sr-only">Next page</span>
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ModernResultsTable





import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate();
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
  // Helper function to get discipline score for a specific event and discipline
  const getDisciplineScore = (eventItem: any, discId: number): string => {
    const disciplineData = eventItem.disciplines?.find((d: any) => d.disc_id === discId)
    return disciplineData ? Number.parseFloat(disciplineData.finalscore).toFixed(2) : "-"
  }

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
                  <SelectTrigger className="w-[200px]">
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
                  <TableRow className="border-b-2 border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                    <TableHead className="w-[100px] border-r border-gray-200 font-semibold text-gray-700">Event Rank</TableHead>
                    <TableHead className="min-w-[220px] border-r border-gray-200 font-semibold text-gray-700">Event</TableHead>
                    <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">Category Rank</TableHead>
                    <TableHead className="min-w-[120px] border-r border-gray-200 font-semibold text-gray-700">Overall Score</TableHead>
                    {disciplines?.map((discipline, index) => (
                      <TableHead
                        key={discipline.disc_id}
                        className={`min-w-[140px] text-center font-semibold text-gray-700 ${index < disciplines.length - 1 ? "border-r border-gray-200" : ""
                          }`}
                      >
                        {discipline.discipline_name}
                      </TableHead>
                    ))}
                    <TableHead className="min-w-[100px] text-center font-semibold text-gray-700 border-l-2 border-blue-200">Certificate</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredEvents.map((item, index) => (
                    <TableRow
                      key={index}
                      className="transition-all duration-200 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30"
                    >
                      <TableCell className="border-r border-gray-100">
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${item.event_rank === 1
                              ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border border-amber-300"
                              : item.event_rank === 2
                                ? "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-300"
                                : item.event_rank === 3
                                  ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border border-orange-300"
                                  : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-300"
                              }`}
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
                      {disciplines?.map((discipline, index) => (
                        <TableCell
                          key={discipline.disc_id}
                          className={`text-center ${index < disciplines.length - 1 ? "border-r border-gray-100" : ""
                            }`}
                        >
                          <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                            <span className="font-semibold text-gray-900">
                              {getDisciplineScore(item, Number(discipline.disc_id))}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-center border-l-2 border-blue-100">
                        <Button
                          onClick={() =>
                            navigate(`/certificate-viewer?user_id=${user_id}&event_id=${item.event_id}`)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!filteredEvents.length && (
                    <TableRow>
                      <TableCell colSpan={100} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="flex items-center justify-center w-16 h-16 mb-4 shadow-sm bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="mb-2 text-lg font-semibold text-gray-900">No results found</div>
                          <div className="text-gray-500">Try adjusting your search or filters</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
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
                    <SelectTrigger className="w-[70px] bg-white border-gray-300 hover:border-gray-400 transition-colors">
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
