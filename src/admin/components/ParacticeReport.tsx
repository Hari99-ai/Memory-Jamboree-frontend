import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { Users, AlertCircle, TrendingUp, Filter } from "lucide-react" // Added Filter icon
import { API_BASE_URL } from "../../lib/client"

// Interface for the API response structure
interface PracticeReport {
  user_id: number
  first_name: string
  last_name: string
  email: string
  practice_id: number
  score: string
  test_date: string // ISO date string (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ")
  discipline: string | null
}

// Helper to format date as YYYY-MM-DD for input type="date"
const getTodayDateString = () => {
    const today = new Date();
    // Use toISOString and slice to get "YYYY-MM-DD"
    return today.toISOString().split('T')[0];
}

// Helper to format date to dd/mm/yyyy
const formatDate_DDMMYYYY = (dateString: string) => {
    // Attempt to parse any valid date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


const ParacticeReport = () => {
  const [allPerformances, setAllPerformances] = useState<PracticeReport[]>([]) // Hold all fetched data
  const [performances, setPerformances] = useState<PracticeReport[]>([]) // Hold filtered data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  // State for date range filtering, default to current date
  const [startDate, setStartDate] = useState<string>(getTodayDateString())
  const [endDate, setEndDate] = useState<string>(getTodayDateString())

  const ITEMS_PER_PAGE = 40

  // Fetch data on component mount
  useEffect(() => {
    fetchPracticeReport()
  }, [])

  const fetchPracticeReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = sessionStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication token not found. Please login again.")
      }

      // Fetch data from the endpoint without any parameters
      const response = await fetch(`${API_BASE_URL}/get-practice-report`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status} ${response.statusText}`)
      }

      const data: PracticeReport[] = await response.json()

      // Sort data by score (highest first) - done on all data
      data.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))

      setAllPerformances(data) // Store all fetched data
      // Note: setPerformances is now handled by the filter effect
    } catch (err) {
      setAllPerformances([])
      setError(err instanceof Error ? err.message : "Failed to fetch student performances")
      console.error("[v0] API error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Effect to handle filtering when allPerformances, startDate, or endDate changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
    
    // Convert string dates to Date objects for comparison
    const filterStartDate = new Date(startDate);
    // For the end date, set the time to the end of the day (23:59:59.999)
    const filterEndDate = new Date(endDate);
    filterEndDate.setHours(23, 59, 59, 999);

    const filteredData = allPerformances.filter(report => {
        const reportDate = new Date(report.test_date);

        // Compare the date part only (or check if it falls within the range)
        return reportDate >= filterStartDate && reportDate <= filterEndDate;
    });

    setPerformances(filteredData);

  }, [allPerformances, startDate, endDate])


  const currentPerformances = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return performances.slice(firstItemIndex, firstItemIndex + ITEMS_PER_PAGE)
  }, [performances, currentPage])

  const totalPages = Math.ceil(performances.length / ITEMS_PER_PAGE)

  // Color logic for scores (assuming a 0-10 scale)
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600 bg-green-50"
    if (score >= 8) return "text-blue-600 bg-blue-50"
    if (score >= 7) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  // --- OMITTING LOADING AND ERROR STATES FOR BREVITY (NO CHANGE) ---

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <TrendingUp className="h-8 w-8" />
          Student Practice Performance
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Student Name", "Email", "Discipline", "Score", "Date"].map((header) => (
                      <TableHead key={header}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 5 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <CardTitle className="text-2xl font-bold text-red-700">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchPracticeReport} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // --- END OMITTING LOADING AND ERROR STATES ---

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <TrendingUp className="h-8 w-8" />
          Student Practice Performance
        </h1>
        <div className="text-sm text-gray-600">
          Total Records: <span className="font-semibold text-[#245cab]">{performances.length}</span>
        </div>
      </div>
      
      {/* Custom Date Range Filter Card */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-5 w-5 text-[#245cab]" />
            <span className="font-semibold text-gray-700">Filter by Date Range:</span>

            <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="text-sm text-gray-600">From:</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-1.5 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
                    max={getTodayDateString()} // Optional: Prevent selection of future dates
                />
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="text-sm text-gray-600">To:</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-1.5 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
                    max={getTodayDateString()} // Optional: Prevent selection of future dates
                />
            </div>
            
            {/* Note: The actual filtering happens in the useEffect hook when dates change */}
            {/* If you wanted a manual 'Apply Filter' button, you'd use temporary state for dates */}
        </div>
      </Card>
      
      {/* Performance Report Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performances.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No Data Found</p>
              <p className="text-sm">No practice records were found for the selected date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">Student Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Discipline</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPerformances.map((performance) => (
                    <TableRow key={performance.practice_id} className="hover:bg-blue-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#245cab] rounded-full"></div>
                          <span className="font-medium">
                            {performance.first_name} {performance.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{performance.email}</TableCell>
                      <TableCell className="text-gray-600">{performance.discipline || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                            parseFloat(performance.score)
                          )}`}
                        >
                          {parseFloat(performance.score).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {/* Modified to use the new DD/MM/YYYY format helper */}
                        {formatDate_DDMMYYYY(performance.test_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default ParacticeReport