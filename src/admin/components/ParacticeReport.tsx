import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { Users, AlertCircle, TrendingUp, Filter } from "lucide-react"
import { API_BASE_URL } from "../../lib/client"

// Interface for the API response structure
interface PracticeReport {
  user_id: number
  first_name: string
  last_name: string
  email: string
  practice_id: number
  score: string
  test_date: string 
  discipline: string | null
}

// Helper to format date as YYYY-MM-DD for input type="date"
const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Helper to format date to dd/mm/yyyy
const formatDate_DDMMYYYY = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


const ParacticeReport = () => {
  const [allPerformances, setAllPerformances] = useState<PracticeReport[]>([]) 
  const [performances, setPerformances] = useState<PracticeReport[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  const [startDate, setStartDate] = useState<string>(getTodayDateString())
  const [endDate, setEndDate] = useState<string>(getTodayDateString())

  const ITEMS_PER_PAGE = 40

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
      data.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))

      setAllPerformances(data)
    } catch (err) {
      setAllPerformances([])
      setError(err instanceof Error ? err.message : "Failed to fetch student performances")
      console.error("[v0] API error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1); 
    
    const filterStartDate = new Date(startDate);
    const filterEndDate = new Date(endDate);
    filterEndDate.setHours(23, 59, 59, 999);

    const filteredData = allPerformances.filter(report => {
        const reportDate = new Date(report.test_date);
        return reportDate >= filterStartDate && reportDate <= filterEndDate;
    });

    setPerformances(filteredData);

  }, [allPerformances, startDate, endDate])


  const currentPerformances = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return performances.slice(firstItemIndex, firstItemIndex + ITEMS_PER_PAGE)
  }, [performances, currentPage])

  const totalPages = Math.ceil(performances.length / ITEMS_PER_PAGE)

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600 bg-green-50"
    if (score >= 8) return "text-blue-600 bg-blue-50"
    if (score >= 7) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="text-2xl md:text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
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
                      <TableHead key={header} className="whitespace-nowrap">
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 5 }).map((_, colIndex) => (
                        <TableCell key={colIndex} className="whitespace-nowrap">
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
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[calc(100vh-100px)]">
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Responsive Header: Stack on mobile, Row on desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
          Student Practice Performance
        </h1>
        <div className="text-sm text-gray-600">
          Total Records: <span className="font-semibold text-[#245cab]">{performances.length}</span>
        </div>
      </div>
      
      {/* Custom Date Range Filter Card */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#245cab]" />
                <span className="font-semibold text-gray-700">Filter by Date Range:</span>
            </div>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm text-gray-600 whitespace-nowrap">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-md p-1.5 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
                        max={getTodayDateString()} 
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm text-gray-600 whitespace-nowrap">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-md p-1.5 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
                        max={getTodayDateString()} 
                    />
                </div>
            </div>
        </div>
      </Card>
      
      {/* Performance Report Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
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
            // Added whitespace-nowrap to cells to support horizontal scrolling on mobile
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold whitespace-nowrap">Student Name</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Email</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Discipline</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Score</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPerformances.map((performance) => (
                    <TableRow key={performance.practice_id} className="hover:bg-blue-50/50">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#245cab] rounded-full shrink-0"></div>
                          <span className="font-medium">
                            {performance.first_name} {performance.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">{performance.email}</TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">{performance.discipline || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                            parseFloat(performance.score)
                          )}`}
                        >
                          {parseFloat(performance.score).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
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
          // Responsive Footer: Stack on mobile
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
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