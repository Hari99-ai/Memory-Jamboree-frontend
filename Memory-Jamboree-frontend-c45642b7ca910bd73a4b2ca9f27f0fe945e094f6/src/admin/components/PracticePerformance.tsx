import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Users, Eye, AlertCircle, ArrowLeft, Search } from "lucide-react";
import { API_BASE_URL } from "../../lib/client";
import PracticePerformanceView from "./PracticePerformanceView";

interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  school_name: string;
  school_class: string;
}

const PracticePerformance = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const USERS_PER_PAGE = 30;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/get-users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerformance = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  const handleBackToUsers = () => {
    setSelectedUserId(null);
    setSelectedUserName("");
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          `${user.fname} ${user.lname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const nameA = `${a.fname} ${a.lname}`.toLowerCase();
        const nameB = `${b.fname} ${b.lname}`.toLowerCase();
        return nameA.localeCompare(nameB); // Sort alphabetically
      });
  }, [users, searchQuery]);

  const currentUsers = useMemo(() => {
    const firstUserIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(firstUserIndex, firstUserIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  // If a user is selected, show their practice test history
  if (selectedUserId) {
    return (
      // Changed padding for mobile
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackToUsers} className="mb-4 flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
          <h2 className="text-xl md:text-2xl font-bold text-[#245cab] flex items-center gap-3">
            Practice Test History - {selectedUserName}
          </h2>
        </div>
        <PracticePerformanceView userId={selectedUserId} userName={selectedUserName} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="text-2xl md:text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <Users className="h-6 w-6 md:h-8 md:w-8" />
          Practice Performance
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["User ID", "Name", "Email", "Class", "Action"].map((header) => (
                      <TableHead key={header} className="whitespace-nowrap"><Skeleton className="h-4 w-24" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 6 }).map((_, colIndex) => (
                        <TableCell key={colIndex} className="whitespace-nowrap"><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <CardTitle className="text-2xl font-bold text-red-700">Error Loading Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchUsers} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Responsive Header: Stack on mobile, Row on desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#245cab] flex items-center gap-3">
          <Users className="h-6 w-6 md:h-8 md:w-8" />
          Practice Performance
        </h1>
        <div className="text-sm text-gray-600">
          Total Users: <span className="font-semibold text-[#245cab]">{users.length}</span>
        </div>
      </div>

      <Card>
        {/* Responsive Card Header: Stack on mobile, Row on desktop */}
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <div className="relative w-full md:w-auto md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full text-black"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No Users Found</p>
              <p className="text-sm">
                {searchQuery
                  ? "Your search did not match any users."
                  : "There are no users to display."}
              </p>
            </div>
          ) : (
            // Added whitespace-nowrap to cells to prevent awkward wrapping on small screens
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold whitespace-nowrap">User ID</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Name</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Email</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Class</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-blue-50/50">
                      <TableCell className="font-medium whitespace-nowrap">#{user.id}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#245cab] rounded-full shrink-0"></div>
                          <span className="font-medium">{user.fname} {user.lname}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                      <TableCell className="whitespace-nowrap">{user.school_class || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          size="sm"
                          onClick={() => handleViewPerformance(user.id, `${user.fname} ${user.lname}`)}
                          className="flex items-center gap-2 bg-[#245cab] hover:bg-[#1e4a9a]"
                        >
                          <Eye className="h-4 w-4" />
                          View Performance
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          // Responsive Footer: Stack controls on mobile
          <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t">
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
                Prev
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
  );
};

export default PracticePerformance;