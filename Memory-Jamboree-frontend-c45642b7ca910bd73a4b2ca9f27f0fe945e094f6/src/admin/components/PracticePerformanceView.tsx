import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { ListChecks, BarChart2, Star, BookOpenCheck } from "lucide-react";
import { API_BASE_URL } from "../../lib/client";

// Interface for a single practice record from the API
interface PracticeRecord {
  pid: number;
  user_id: number;
  disc_id: number;
  standard: string;
  score: string;
  createdat: string; // "YYYY-MM-DD"
  discipline_name: string;
}

// Props expected by this component
interface PracticePerformanceViewProps {
  userId: number;
  userName: string;
}

// Interface for discipline-wise summary
interface DisciplineSummary {
    [key: string]: {
        totalTests: number;
        avgScore: number;
        highestScore: number;
    }
}

const ROWS_PER_PAGE = 40;

const PracticePerformanceView = ({ userId }: PracticePerformanceViewProps) => {
  const [practiceData, setPracticeData] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // Fetches and sorts practice data for the selected user from the API
  const fetchPracticeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch(`${API_BASE_URL}/user-practice-details/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch performance data: ${response.statusText}`);
      }

      const result = await response.json();
      // Sort data by date in descending order (latest first) before setting state
      const sortedData = (result.data || []).sort((a: PracticeRecord, b: PracticeRecord) => 
        new Date(b.createdat).getTime() - new Date(a.createdat).getTime()
      );
      setPracticeData(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPracticeData();
    }
  }, [userId]);

  // Reset to the first page whenever the filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter]);

  // Memoized filtered data based on the selected time filter
  const filteredData = useMemo(() => {
    if (timeFilter === 'all') {
      return practiceData;
    }
    const now = new Date();
    // Set time to 00:00:00 to compare dates accurately
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return practiceData.filter(record => {
      const recordDate = new Date(record.createdat);
      switch (timeFilter) {
        case 'daily':
          return recordDate.getTime() >= today.getTime();
        case 'weekly':
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return recordDate >= lastWeek;
        case 'monthly':
          const lastMonth = new Date(today);
          lastMonth.setDate(today.getDate() - 30);
          return recordDate >= lastMonth;
        default:
          return true;
      }
    });
  }, [practiceData, timeFilter]);

  // Memoized summary statistics from the filtered practice data
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) {
      return { totalTests: 0, avgScore: 0, highestScore: 0 };
    }
    const totalTests = filteredData.length;
    const totalScore = filteredData.reduce((acc, record) => acc + parseFloat(record.score), 0);
    const avgScore = totalScore / totalTests;
    const highestScore = Math.max(...filteredData.map(record => parseFloat(record.score)));
    
    return {
      totalTests,
      avgScore: parseFloat(avgScore.toFixed(2)) || 0,
      highestScore: parseFloat(highestScore.toFixed(2)) || 0,
    };
  }, [filteredData]);

  // Memoized discipline-wise summary from the filtered data
  const disciplineSummary = useMemo<DisciplineSummary>(() => {
      const summary: { [key: string]: { scores: number[] } } = {};
      filteredData.forEach(record => {
          if (!summary[record.discipline_name]) {
              summary[record.discipline_name] = { scores: [] };
          }
          summary[record.discipline_name].scores.push(parseFloat(record.score));
      });

      const finalSummary: DisciplineSummary = {};
      for (const discName in summary) {
          const scores = summary[discName].scores;
          const totalTests = scores.length;
          const totalScore = scores.reduce((acc, score) => acc + score, 0);
          finalSummary[discName] = {
              totalTests,
              avgScore: parseFloat((totalScore / totalTests).toFixed(2)) || 0,
              highestScore: Math.max(...scores) || 0,
          };
      }
      return finalSummary;
  }, [filteredData]);

  // Memoized paginated data from the filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);

  // Function to render pagination buttons
  const renderPagination = () => {
    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(
            <Button
                key={i}
                variant={currentPage === i ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i)}
            >
                {i}
            </Button>
        );
    }
    return pageButtons;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Card className="text-center p-10 bg-gray-50 border-gray-200">
              <CardHeader className="flex flex-col items-center">
                  <BookOpenCheck className="h-16 w-16 text-gray-400" />
                  <CardTitle className="text-2xl mt-4 text-gray-700">Error Fetching Data</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-gray-500">{error}</p>
              </CardContent>
          </Card>
    );
  }

  if (practiceData.length === 0) {
      return (
          <Card className="text-center p-10 bg-gray-50 border-gray-200">
              <CardHeader className="flex flex-col items-center">
                  <BookOpenCheck className="h-16 w-16 text-gray-400" />
                  <CardTitle className="text-2xl mt-4 text-gray-700">No Practice Data Found</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-gray-500">This user has not completed any practice tests yet.</p>
              </CardContent>
          </Card>
      );
  }

  return (
    <div className="space-y-6">
        {/* Discipline-wise Score Summary */}
        <Card>
            <CardHeader><CardTitle>Discipline-wise Summary</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Discipline Name</TableHead>
                            <TableHead className="text-center">Tests Taken</TableHead>
                            <TableHead className="text-center">Average Score</TableHead>
                            <TableHead className="text-center">Highest Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(disciplineSummary).length > 0 ? (
                          Object.entries(disciplineSummary).map(([name, stats]) => (
                              <TableRow key={name}>
                                  <TableCell className="font-medium">{name}</TableCell>
                                  <TableCell className="text-center">{stats.totalTests}</TableCell>
                                  <TableCell className="text-center">{stats.avgScore}</TableCell>
                                  <TableCell className="text-center font-bold text-green-600">{stats.highestScore}</TableCell>
                              </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-gray-500 py-4">No data available for the selected period.</TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

      {/* Overall Performance Summary Section */}
      <Card>
        <CardHeader><CardTitle>Overall Performance Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-4"><ListChecks className="h-8 w-8 text-blue-500" /><div><p className="text-sm text-gray-600">Total Tests Taken</p><p className="text-2xl font-bold">{summaryStats.totalTests}</p></div></div>
          <div className="p-4 bg-green-50 rounded-lg flex items-center gap-4"><BarChart2 className="h-8 w-8 text-green-500" /><div><p className="text-sm text-gray-600">Average Score</p><p className="text-2xl font-bold">{summaryStats.avgScore}</p></div></div>
          <div className="p-4 bg-yellow-50 rounded-lg flex items-center gap-4"><Star className="h-8 w-8 text-yellow-500" /><div><p className="text-sm text-gray-600">Highest Score</p><p className="text-2xl font-bold">{summaryStats.highestScore}</p></div></div>
        </CardContent>
      </Card>

      {/* Practice History Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl">Practice History</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant={timeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('all')}>All Time</Button>
            <Button variant={timeFilter === 'daily' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('daily')}>Daily</Button>
            <Button variant={timeFilter === 'weekly' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('weekly')}>Weekly</Button>
            <Button variant={timeFilter === 'monthly' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('monthly')}>Monthly</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Discipline ID</TableHead><TableHead>Discipline Name</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((record) => (
                      <TableRow key={record.pid}>
                        <TableCell>#{record.disc_id}</TableCell>
                        <TableCell className="font-medium text-black">{record.discipline_name}</TableCell>
                        <TableCell>{new Date(record.createdat).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-bold text-blue-600">{record.score}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No practice records found for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex flex-wrap items-center justify-between pt-4 border-t gap-4">
            <div className="text-sm text-gray-600">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</Button>
              {renderPagination()}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PracticePerformanceView;