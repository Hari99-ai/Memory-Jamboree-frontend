import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"
import { TrendingUp, Calendar, Target, Clock, Filter, Pencil, XCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import { API_BASE_URL } from "../lib/client"
import { useNavigate } from "react-router-dom"
import { PracticeTestRecord } from "../types"

interface ProcessedRecord extends PracticeTestRecord {
  serialNumber: number
  formattedDate: string
  formattedTime: string
  numericScore: number
}

const ITEMS_PER_PAGE = 20

export default function PracticeTestHistory() {
  const [records, setRecords] = useState<ProcessedRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ProcessedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const navigate = useNavigate()
  useEffect(() => {
    fetchPracticeTestHistory()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [startDate, endDate, records])

  const filterRecords = () => {
    if (!startDate && !endDate) {
      setFilteredRecords(records)
      setCurrentPage(1)
      return
    }
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    const filtered = records.filter((record) => {
      const recordDate = new Date(record.createdat)
      if (start && recordDate < start) return false
      if (end) {
        const endOfDay = new Date(end)
        endOfDay.setHours(23, 59, 59, 999)
        if (recordDate > endOfDay) return false
      }
      return true
    })
    setFilteredRecords(filtered)
    setCurrentPage(1)
  }

  const fetchPracticeTestHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token")
      if (!token) throw new Error("Authentication token not found. Please login again.")

      const response = await fetch(`${API_BASE_URL}/paractice_test`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Authentication failed. Please login again.")
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }

      const data: PracticeTestRecord[] = await response.json()

      const processedData = data
        .map((record) => {
          const originalDate = new Date(record.createdat)
          // Calculate the time offset for +5 hours and 30 minutes in milliseconds
          const timeOffset = (5 * 60 + 30) * 60 * 1000
          const adjustedDate = new Date(originalDate.getTime() + timeOffset)

          return {
            ...record,
            serialNumber: 0,
            // Use the adjusted date for formatting, so it reflects the +5.5 hour change
            formattedDate: adjustedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
            formattedTime: adjustedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
            numericScore: Number.parseFloat(record.score),
          }
        })
        .sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())
        .map((record, index) => ({ ...record, serialNumber: index + 1 }))

      setRecords(processedData)
      setFilteredRecords(processedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch practice test history")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const calculateStats = () => {
    if (filteredRecords.length === 0) return { totalTests: 0, averageScore: 0, highestScore: 0 }
    const scores = filteredRecords.map((r) => r.numericScore)
    return {
      totalTests: filteredRecords.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      highestScore: Math.max(...scores),
    }
  }

  const stats = calculateStats()

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const PaginationControls = () => (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      {[...Array(totalPages)].map((_, i) => (
        <Button
          key={i}
          variant={i + 1 === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <Clock className="h-8 w-8" />
          Practice Test History
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
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
                    {["S.No.", "Discipline Name", "Score", "Date", "Time"].map((i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
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
      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-lg text-center shadow-sm">
          <CardHeader>
            {/* 1. Icon updated for an "empty" or "start" state */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <Pencil className="h-9 w-9 text-indigo-500" />
            </div>

            {/* 2. Title changed to reflect an empty history */}
            <CardTitle className="mt-4 text-2xl font-semibold text-slate-800">
              No Practice History Found
            </CardTitle>

            <CardDescription className="mt-2 text-base text-slate-600">
              It looks like you haven't taken a test yet. Let's get started!
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* 3. A clear, encouraging message */}
            <p className="text-sm text-slate-500">
              Complete a practice test to track your progress and see your history here.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {/* 4. Primary action is now to take a test */}
            <Button onClick={() => navigate("/dashboard/practiceTests")}>Take a Practice Test</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <Clock className="h-8 w-8" />
          Practice Test History
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#245cab]">{stats.totalTests}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageScore.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Highest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.highestScore.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full flex justify-end">
        <div className="w-full md:w-2/3">
          <div className="py-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Filter className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                />
                <label className="text-sm text-gray-600">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <XCircle className="h-4 w-4 text-gray-500" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Test Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No practice tests found</p>
              <p className="text-sm">Start taking practice tests to see your history here.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-20 font-semibold text-gray-700">S.No.</TableHead>
                      <TableHead className="font-semibold text-gray-700">Discipline Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Score</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={`${record.createdat}-${record.serialNumber}`} className="hover:bg-blue-50/50">
                        <TableCell className="font-medium text-gray-600">{record.serialNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#245cab] rounded-full"></div>
                            <span className="font-medium">{record.discipline_name || "General Practice"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-semibold ${getScoreColor(record.numericScore)}`}>
                            {record.numericScore.toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 font-medium">{record.formattedDate}</TableCell>
                        <TableCell className="text-gray-600 font-medium">{record.formattedTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}