

// export default PracticeReport
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { Users, AlertCircle, TrendingUp, Filter, Search, X } from "lucide-react"
import { API_BASE_URL } from "../../lib/client"

// Interface for the API response structure
interface PracticeReport {
  user_id: number
  first_name: string
  last_name: string
  email: string
  school_class: string
  practice_id: number
  score: string
  raw_score: string  // ✅ ADDED FROM BACKEND (e.g., "3/5")
  final_score: number
  test_date: string 
  discipline: string | null
  age_group?: string | null
  class?: string | null
  attempt_type?: 'First Attempt' | 'Repeat Attempt' | null
  dob?: string | null // ✅ ADDED DATE OF BIRTH
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

// Calculate age based on DOB and test date
const calculateAge = (dob: string | null | undefined, testDate: string): number | null => {
  if (!dob) return null;
  
  const dobDate = new Date(dob);
  const testDateTime = new Date(testDate);
  
  if (isNaN(dobDate.getTime()) || isNaN(testDateTime.getTime())) {
    return null;
  }
  
  let age = testDateTime.getFullYear() - dobDate.getFullYear();
  const monthDiff = testDateTime.getMonth() - dobDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && testDateTime.getDate() < dobDate.getDate())) {
    age--;
  }
  
  return age;
}

// Determine age group based on age
const getAgeGroup = (age: number | null): string => {
  if (age === null) return "Unknown";
  
  if (age >= 5 && age <= 7) return "5–7";
  if (age >= 8 && age <= 10) return "8–10";
  if (age >= 11 && age <= 13) return "11–13";
  if (age >= 14 && age <= 17) return "14–17";
  if (age >= 18 && age <= 59) return "Adults (18–59)";
  if (age >= 60) return "Seniors (60+)";
  
  return "Unknown";
}

// Age groups for filter dropdown
const AGE_GROUPS = [
  "5–7",
  "8–10", 
  "11–13",
  "14–17",
  "Adults (18–59)",
  "Seniors (60+)"
];

// Mapping from API discipline names to display names
// const DISCIPLINE_MAPPING: Record<string, string> = {
//     '5-Minute Binary': 'Binary',
//     '5-Minute Words': 'Words',
//     '5-Minute Numbers': 'Numbers',
//     '5-Minute Images': 'Images',
//     '5-Minute Dates': 'Dates',
//     '5-Minute Names & Faces': 'Names & Faces',
//     '5-Minute Cards': 'Cards',
//     // Add any other mappings if needed
// }

// // All available discipline types for multi-select
// const ALL_DISCIPLINE_TYPES = [

//     'Words',
    
//     'Numbers',
//     'Binary',
//     'Dates',
//     'Cards',
//     'Images',
//     'Names & Faces'
// ]


// Mapping from API discipline names to display names
const DISCIPLINE_MAPPING: Record<string, string> = {
    '5-Minute Binary': 'Binary',
    '5-Minute Words': 'Words',
    '5-Minute Numbers': 'Numbers',
    '5-Minute Images': 'Images',
    '5-Minute Dates': 'Dates',
    '5-Minute Names & Faces': 'Names & Faces',
    '5-Minute Cards': 'Cards',
    // Add any other mappings if needed
}

// All available discipline types for multi-select
const ALL_DISCIPLINE_TYPES = [

    'Words',
    
    'Numbers',
    'Binary',
    'Dates',
    'Cards',
    'Images',
    'Names & Faces'
]

// Function to get display name for discipline
const getDisplayDiscipline = (discipline: string | null): string => {
    if (!discipline) return "N/A"
    return DISCIPLINE_MAPPING[discipline] || discipline
}

// Function to sort classes in the desired order
const sortClasses = (classes: string[]): string[] => {
  // First, separate special cases
  const notAssigned = classes.filter(cls => cls === 'Not Assigned');
  const others = classes.filter(cls => cls === 'Others (Adult / Senior Citizen)');
  const numericGrades = classes.filter(cls => /^\d+(?:st|nd|rd|th)?\s+Grade$/i.test(cls));
  const otherClasses = classes.filter(cls => 
    cls !== 'Not Assigned' && 
    cls !== 'Others (Adult / Senior Citizen)' && 
    !/^\d+(?:st|nd|rd|th)?\s+Grade$/i.test(cls)
  );

  // Sort numeric grades by extracting the number
  numericGrades.sort((a, b) => {
    const getNumber = (str: string) => {
      const match = str.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    return getNumber(a) - getNumber(b);
  });

  // Combine in the desired order
  return [
    ...notAssigned,
    ...numericGrades,
    ...otherClasses,
    ...others
  ];
}

const PracticeReport = () => {
  const [allPerformances, setAllPerformances] = useState<PracticeReport[]>([]) 
  const [performances, setPerformances] = useState<PracticeReport[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(getTodayDateString())
  const [endDate, setEndDate] = useState<string>(getTodayDateString())
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([])
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedAttemptType, setSelectedAttemptType] = useState<string>('all')

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
      // Sort by final_score descending
      data.sort((a, b) => b.final_score - a.final_score)

      setAllPerformances(data)
    } catch (err) {
      setAllPerformances([])
      setError(err instanceof Error ? err.message : "Failed to fetch student performances")
      console.error("[v0] API error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Extract unique values for dropdowns from the data
  const uniqueValues = useMemo(() => {
    // Get unique classes and sort them
    const classes = Array.from(
      new Set(
        allPerformances
          .map(p => p.school_class)
          .filter(Boolean)
      )
    ) as string[];
    
    // Sort classes in the desired order
    const sortedClasses = sortClasses(classes);

    return { classes: sortedClasses }
  }, [allPerformances])

  // Apply filters whenever any filter criteria changes
  useEffect(() => {
    setCurrentPage(1)
    
    const filterStartDate = new Date(startDate)
    const filterEndDate = new Date(endDate)
    filterEndDate.setHours(23, 59, 59, 999)

    const filteredData = allPerformances.filter(report => {
      // Date range filter
      const reportDate = new Date(report.test_date)
      const isDateInRange = reportDate >= filterStartDate && reportDate <= filterEndDate
      if (!isDateInRange) return false

      // Search filter (Student Name/ID/Email)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim()
        const fullName = `${report.first_name} ${report.last_name}`.toLowerCase()
        const userIdStr = report.user_id.toString()
        const email = report.email.toLowerCase()
        const schoolClass = (report.school_class || '').toLowerCase()
        
        if (!fullName.includes(query) && 
            !userIdStr.includes(query) && 
            !email.includes(query) &&
            !schoolClass.includes(query)) {
          return false
        }
      }

      // Discipline filter - multi-select
      if (selectedDisciplines.length > 0) {
        const reportDisplayDiscipline = getDisplayDiscipline(report.discipline)
        if (!selectedDisciplines.includes(reportDisplayDiscipline)) {
          return false
        }
      }

      // Age Group filter - calculate age from DOB and test_date
      if (selectedAgeGroup !== 'all') {
        const age = calculateAge(report.dob, report.test_date)
        const ageGroup = getAgeGroup(age)
        if (ageGroup !== selectedAgeGroup) {
          return false
        }
      }

      // Class filter (using school_class as primary)
      if (selectedClass !== 'all' && report.school_class !== selectedClass) {
        return false
      }

      // Attempt Type filter
      if (selectedAttemptType !== 'all' && report.attempt_type !== selectedAttemptType) {
        return false
      }

      return true
    })

    setPerformances(filteredData)
  }, [
    allPerformances, 
    searchQuery, 
    startDate, 
    endDate, 
    selectedDisciplines, 
    selectedAgeGroup, 
    selectedClass, 
    selectedAttemptType
  ])

  const currentPerformances = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return performances.slice(firstItemIndex, firstItemIndex + ITEMS_PER_PAGE)
  }, [performances, currentPage])

  const totalPages = Math.ceil(performances.length / ITEMS_PER_PAGE)

  const getScoreColor = (score: number) => {
    if (score >= 900) return "text-green-600 bg-green-50"
    if (score >= 800) return "text-blue-600 bg-blue-50"
    if (score >= 700) return "text-yellow-600 bg-yellow-50"
    if (score >= 600) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  // Toggle discipline selection
  const toggleDiscipline = (discipline: string) => {
    setSelectedDisciplines(prev => {
      if (prev.includes(discipline)) {
        return prev.filter(d => d !== discipline)
      } else {
        return [...prev, discipline]
      }
    })
  }

  // Select all disciplines
  const selectAllDisciplines = () => {
    setSelectedDisciplines([...ALL_DISCIPLINE_TYPES])
  }

  // Clear all disciplines
  const clearAllDisciplines = () => {
    setSelectedDisciplines([])
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setStartDate(getTodayDateString())
    setEndDate(getTodayDateString())
    setSelectedDisciplines([])
    setSelectedAgeGroup('all')
    setSelectedClass('all')
    setSelectedAttemptType('all')
  }

  // Function to display age for each performance (kept for internal calculations)
  const getDisplayAge = (report: PracticeReport): string => {
    const age = calculateAge(report.dob, report.test_date)
    if (age === null) return "N/A"
    return `${age} years`
  }

  // Function to display age group for each performance (kept for internal calculations)
  const getDisplayAgeGroup = (report: PracticeReport): string => {
    const age = calculateAge(report.dob, report.test_date)
    return getAgeGroup(age)
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
                    {["Student Name", "Email", "Discipline", "Raw Score", "Final Score", "Date"].map((header) => (
                      <TableHead key={header} className="whitespace-nowrap">
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 6 }).map((_, colIndex) => (
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
          Student Practice Performance
        </h1>
        <div className="text-sm text-gray-600">
          Total Records: <span className="font-semibold text-[#245cab]">{performances.length}</span>
        </div>
      </div>
      
      {/* Filters Card */}
      <Card className="p-4">
        <div className="space-y-6">
          {/* Header with reset button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#245cab]" />
              <span className="font-semibold text-gray-700">Filters</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="text-gray-600"
            >
              Reset All Filters
            </Button>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student (Name, ID, Email, or Class)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, student ID, email, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
              />
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
                    max={getTodayDateString()}
                  />
                </div>
                <span className="hidden sm:block self-center text-gray-400">to</span>
                <div className="flex-1">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
                    max={getTodayDateString()}
                  />
                </div>
              </div>
            </div>

            {/* Multi-select Discipline Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Discipline Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllDisciplines}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllDisciplines}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_DISCIPLINE_TYPES.map(discipline => {
                  const isSelected = selectedDisciplines.includes(discipline)
                  return (
                    <button
                      key={discipline}
                      type="button"
                      onClick={() => toggleDiscipline(discipline)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#245cab] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {discipline}
                      {isSelected && <X className="h-3 w-3" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
              >
                <option value="all">All Classes</option>
                {uniqueValues.classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Attempt Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Attempt Type</label>
              <select
                value={selectedAttemptType}
                onChange={(e) => setSelectedAttemptType(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
              >
                <option value="all">All Attempts</option>
                <option value="First Attempt">First Attempt</option>
                <option value="Repeat Attempt">Repeat Attempt</option>
              </select>
            </div>

            {/* Age Group Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Age Group (at test time)</label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-[#245cab] focus:ring-1 focus:ring-[#245cab]"
              >
                <option value="all">All Age Groups</option>
                {AGE_GROUPS.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(
            searchQuery || 
            selectedDisciplines.length > 0 || 
            selectedAgeGroup !== 'all' || 
            selectedClass !== 'all' || 
            selectedAttemptType !== 'all'
          ) && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Search: "{searchQuery}"
                  </span>
                )}
                {selectedDisciplines.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Discipline: {selectedDisciplines.join(', ')}
                  </span>
                )}
                {selectedClass !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Class: {selectedClass}
                  </span>
                )}
                {selectedAgeGroup !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Age Group: {selectedAgeGroup}
                  </span>
                )}
                {selectedAttemptType !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                    Attempt: {selectedAttemptType}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Performance Report Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance Report
            {performances.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({performances.length} records found)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performances.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No Data Found</p>
              <p className="text-sm mb-4">No practice records were found for the selected filters.</p>
              <Button variant="outline" onClick={resetFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold whitespace-nowrap">Student Name</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Email</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Discipline</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Raw Score</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Final Score</TableHead>
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
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {performance.email}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {getDisplayDiscipline(performance.discipline)}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {performance.raw_score || parseFloat(performance.score).toFixed(2)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                            performance.final_score
                          )}`}
                        >
                          {performance.final_score.toFixed(2)}
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
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              <span className="ml-2">({performances.length} total records)</span>
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

export default PracticeReport