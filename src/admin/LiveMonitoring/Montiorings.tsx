import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MdDeleteForever } from "react-icons/md";
import toast from "react-hot-toast";
import {
  monioring_logs,
  deleteMonitorings,
  window_event_logs,
} from "../../lib/api";
import {
  CardWithLogs,
  PhoneDetectionLogs,
  PersonDetectionLogs,
  ExternalLogs,
  WarningCountLogs,
} from "./LogCard";
import {convertToIST} from '../../lib/index'
import { KeyboardEventData, WindowData } from "../../types";
import { SkeletonCard } from "../components/SkeletonCard";
import { AUDIO_BASE_URL } from "../../lib/client";
import {
  Mic,
  ArrowLeft,
  Eye,
  EyeOff,
  Monitor,
  Keyboard,
  Volume2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {
  ColumnDef,
  getFilteredRowModel,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as ReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";


// Helper to convert time within a multi-line transaction log string
const convertTransactionLogTime = (logString: string): string => {
    if (!logString) return "";
    // Regex to find a timestamp in YYYY-MM-DD HH:MM:SS format
    const timeRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;
    const match = logString.match(timeRegex);

    if (match && match[1]) {
        const originalTime = match[1];
        // Use the imported utility to convert the found time to IST
        const convertedTime = convertToIST(originalTime);
        return logString.replace(originalTime, convertedTime);
    }
    return logString; // Return original string if no timestamp is found
};

// NEW: Helper to format ISO date-time strings for display
const formatDateTime = (isoString: string | undefined): string => {
    if (!isoString) return "N/A";
    try {
        const date = new Date(isoString);
        // Format to a readable string like "Aug 30, 2025, 12:50 PM"
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch (error) {
        return "Invalid Date";
    }
};


// Reusable Data Table Component for pagination and rendering
function MonitoringDataTable<TData>({
  table,
  columns,
}: {
  table: ReactTable<TData>;
  columns: ColumnDef<TData>[];
}) {
  const getSimplifiedPagination = () => {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const startPages = [1, 2, 3];
    const endPages = [totalPages - 2, totalPages - 1, totalPages];
    const middlePages: (number | "...")[] = [];
    if (currentPage > 4) middlePages.push("...");
    if (currentPage > 3 && currentPage < totalPages - 2) middlePages.push(currentPage);
    if (currentPage < totalPages - 3) middlePages.push("...");
    return [...startPages, ...middlePages, ...endPages].filter((v, i, a) => a.indexOf(v) === i);
  };
  const simplifiedPageNumbers = getSimplifiedPagination();

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-center space-x-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <div className="flex items-center space-x-1">
            {simplifiedPageNumbers.map((page, i) =>
              page === "..." ? (
                <Button key={`ellipsis-${i}`} variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={table.getState().pagination.pageIndex === Number(page) - 1 ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(Number(page) - 1)}
                >
                  <span>{page}</span>
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
}

export default function Monitorings() {
  const [selectedEventId, setSelectedEventId] = useState<any | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null
  );
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<
    string | null
  >(null);
  const [eventFilter, setEventFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("All Grades");


  const {
    data: folders,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["proctor_logs"],
    queryFn: monioring_logs,
  });

  const { data } = useQuery({
    queryKey: ["windowLogs", selectedUserEmail, selectedDisciplineId],
    queryFn: () => window_event_logs(selectedDisciplineId!, selectedUserEmail!),
    enabled: !!selectedUserEmail && !!selectedDisciplineId,
  });

  const logs = data?.logs ?? [];
  const keys_log = data?.key_logs ?? [];

  const mutation = useMutation({
    mutationFn: ({
      email,
      discipline_id,
    }: {
      email: string;
      discipline_id: string;
    }) => deleteMonitorings(email, discipline_id),
    onSuccess: () => {
      toast.success("Logs deleted successfully");
      refetch();
      setSelectedUserEmail(null);
      setSelectedDisciplineId(null); // Go back to user list after deletion
    },
    onError: () => {
      toast.error("Failed to delete logs");
    },
  });

  const handleDelete = (email: string, discipline_id: string) => {
    if (confirm("Are you sure you want to delete all logs for this user in this discipline?")) {
        mutation.mutate({ email, discipline_id });
    }
  };

  // --- Event Table ---
  const eventDataForTable = useMemo(() => {
    if (!folders) return [];
    // Convert folder object to an array, sort it, then map to table data
    return Object.entries(folders)
      .sort(([, a]: [string, any], [, b]: [string, any]) => {
        // Create Date objects for comparison to ensure correct sorting
        const dateA = new Date(a.event_end);
        const dateB = new Date(b.event_end);
        // Subtract dateA from dateB for descending order (latest first)
        return dateB.getTime() - dateA.getTime();
      })
      .map(
        ([eventId, eventData]: [string, any], index) => {
          const disciplines = eventData.disciplines || {};
          const uniqueUsers = new Set(
            Object.values(disciplines).flatMap((d: any) => Object.keys(d.users))
          );
          return {
            srNo: index + 1,
            eventName: eventData.event_name,
            totalParticipants: uniqueUsers.size,
            totalDisciplines: Object.keys(disciplines).length,
            eventStart: formatDateTime(eventData.event_start),
            eventEnd: formatDateTime(eventData.event_end),
            eventId: eventId,
          };
        }
      );
  }, [folders]);

  const eventColumns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "srNo", header: "S. No." },
      { accessorKey: "eventName", header: "Event Name" },
      { accessorKey: "totalParticipants", header: "Total Participants" },
      { accessorKey: "totalDisciplines", header: "Total Disciplines" },
      { accessorKey: "eventStart", header: "Event Start" },
      { accessorKey: "eventEnd", header: "Event End" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={() => setSelectedEventId(row.original.eventId)}
          >
            View Logs
          </Button>
        ),
      },
    ],
    []
  );

  const eventTable = useReactTable({
    data: eventDataForTable,
    columns: eventColumns,
    state: {
      globalFilter: eventFilter,
    },
    onGlobalFilterChange: setEventFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- User Table ---
  const uniqueGrades = useMemo(() => {
    if (!selectedEventId || !folders?.[selectedEventId]) return [];
    const gradeSet = new Set<string>();
    const disciplines = folders[selectedEventId].disciplines || {};
    for (const discId in disciplines) {
      const users = disciplines[discId].users || {};
      for (const email in users) {
        const userClass = users[email].school_class;
        if (userClass && userClass !== "N/A") {
          gradeSet.add(userClass);
        }
      }
    }
    return ["All Grades", ...Array.from(gradeSet).sort()];
  }, [selectedEventId, folders]);
  
  const userDataForTable = useMemo(() => {
    if (!selectedEventId || !folders?.[selectedEventId]) return [];
    
    const userMap = new Map();
    const disciplines = folders[selectedEventId].disciplines || {};

    for (const discId in disciplines) {
      const users = disciplines[discId].users || {};
      for (const email in users) {
        if (!userMap.has(email)) {
          userMap.set(email, {
            name: users[email].name || "N/A",
            email: email,
            class: users[email].school_class || "N/A",
            school: users[email].school_name || "N/A",
          });
        }
      }
    }
    
    let users = Array.from(userMap.values());
    if (gradeFilter && gradeFilter !== "All Grades") {
      users = users.filter(user => user.class === gradeFilter);
    }
    return users;

  }, [selectedEventId, folders, gradeFilter]);

  const userColumns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "class", header: "Class" },
      { accessorKey: "school", header: "School" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={() => setSelectedUserEmail(row.original.email)}
          >
            View Logs
          </Button>
        ),
      },
    ],
    []
  );

  const userTable = useReactTable({
    data: userDataForTable,
    columns: userColumns,
    state: {
      globalFilter: userFilter,
    },
    onGlobalFilterChange: setUserFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <SkeletonCard />;

  if (!folders || Object.keys(folders).length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100">
            <Monitor className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-slate-700">
            No Data Available
          </h3>
          <p className="text-slate-500">
            No monitoring logs found in the system
          </p>
        </div>
      </div>
    );

    // --- Data for Logs View ---
    const currentDisciplineData = selectedEventId && selectedDisciplineId ? folders[selectedEventId]?.disciplines?.[selectedDisciplineId] : null;
    const currentUserData = currentDisciplineData && selectedUserEmail ? currentDisciplineData.users[selectedUserEmail] : null;
    const userLogs = currentUserData?.logs || [];
    
    const getBackAction = () => {
        if (selectedDisciplineId) return () => setSelectedDisciplineId(null);
        if (selectedUserEmail) return () => { setSelectedUserEmail(null); setSelectedDisciplineId(null); };
        if (selectedEventId) return () => setSelectedEventId(null);
        return () => {};
    };

    const getBackButtonLabel = () => {
        if (selectedDisciplineId) return "Back to Disciplines";
        if (selectedUserEmail) return "Back to Users";
        if (selectedEventId) return "Back to Events";
        return "Back";
    };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex items-center justify-center pt-12 mb-8 text-center md:pt-0">
          {selectedEventId && (
            <div className="absolute top-0 left-0 md:top-1/2 md:-translate-y-1/2">
                <button
                    onClick={getBackAction()}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {getBackButtonLabel()}
                </button>
            </div>
          )}
          
          <div>
            <h1 className="text-3xl text-center text-[#245cab] mb-2">
                Proctoring Dashboard
            </h1>
            <p className="text-slate-600">
                Monitor and manage exam surveillance logs
            </p>
          </div>
        </div>

        {!selectedEventId ? (
          // ------------------- Events View (Table) ---------------------
          <div className="p-6 bg-white shadow-xl rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Events</h2>
                <Input
                    placeholder="Search by event name..."
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="max-w-sm text-black"
                />
            </div>
            <MonitoringDataTable table={eventTable} columns={eventColumns} />
          </div>
        ) : selectedEventId && !selectedUserEmail ? (
          // ------------------- Users View (Table) ---------------------
          <div className="p-6 bg-white shadow-xl rounded-2xl">
            <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
              <h2 className="text-2xl font-bold text-slate-800">
                Users in {folders[selectedEventId]?.event_name}
              </h2>
              <div className="flex flex-col items-center w-full gap-2 sm:flex-row sm:w-auto">
                <Input
                  placeholder="Search by name or email..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full sm:max-w-xs"
                />
                {uniqueGrades.length > 1 && (
                    <select
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                        className="flex w-full h-10 px-3 py-2 text-sm border rounded-md sm:w-auto border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {uniqueGrades.map((grade) => (
                            <option key={grade} value={grade}>{grade}</option>
                        ))}
                    </select>
                )}
              </div>
            </div>
            <MonitoringDataTable table={userTable} columns={userColumns} />
          </div>
        ) : selectedEventId && selectedUserEmail && !selectedDisciplineId ? (
          // ------------------- Disciplines View (Cards) ---------------------
          <div className="p-6 bg-white shadow-xl rounded-2xl">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Disciplines for {selectedUserEmail}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(folders[selectedEventId]?.disciplines || {})
                .filter(([_, d]: any) => selectedUserEmail in d.users)
                .map(([discId, discData]: any) => {
                  return (
                    <DisciplineCard
                      key={discId}
                      discData={discData}
                      wstatus={discData.wstatus}
                      onClick={() => setSelectedDisciplineId(discId)}
                    />
                  );
                })}
            </div>
          </div>
        ) : (
          // ------------------- Logs View ---------------------
          <div className="space-y-6">
            <div className="p-6 bg-white shadow-xl rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                 <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Monitoring Logs
                    </h2>
                    <p className="text-sm text-slate-600">
                      {selectedUserEmail}
                    </p>
                  </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-500 rounded-lg shadow-lg hover:bg-red-600 hover:shadow-xl"
                  onClick={() =>
                    handleDelete(selectedUserEmail!, selectedDisciplineId!)
                  }
                >
                  <MdDeleteForever className="w-4 h-4" />
                  Delete All Logs
                </button>
              </div>

            {/* --- NEW: Details Header Card --- */}
            <div className="p-6 mb-6 bg-white border shadow-lg rounded-2xl border-slate-200">
                <h3 className="mb-4 text-xl font-bold text-slate-800">Details</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Event Name</p>
                        <p className="font-semibold text-slate-800">{folders[selectedEventId!]?.event_name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">User Name</p>
                        <p className="font-semibold text-slate-800">{currentUserData?.name}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">User Email</p>
                        <p className="font-semibold text-slate-800">{selectedUserEmail}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Discipline</p>
                        <p className="font-semibold text-slate-800">{currentDisciplineData?.discipline_name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Status</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentDisciplineData?.wstatus === 1 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                           {currentDisciplineData?.wstatus === 1 ? "Terminated" : "Attempted"}
                        </span>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">Score</p>
                        {/* MODIFIED: Display totalscore from the discipline data */}
                        <p className="font-semibold text-slate-800">{currentDisciplineData?.totalscore ?? "N/A"}</p>
                    </div>
                </div>
            </div>


              {/* --- Log Cards --- */}
              <div className="space-y-4">
                 <WarningCountLogs
                  title="Total Warning Logs"
                  logs={userLogs}
                />
                 <PersonDetectionLogs
                  title="Multiple Person Detection Logs"
                  logs={userLogs}
                />
                <PhoneDetectionLogs
                  title="Phone Detection Logs"
                  logs={userLogs}
                />
                
                <VoiceLogs
                  title="Voice Detection Logs"
                  logs={userLogs.filter(
                      (log: any) => log?.voice_db && log.voice_db > 20
                    )}
                />
                <WindowLogsTable
                  title="Window Detection Logs"
                  data={logs || []}
                />
                <KeyboardLogsTable
                  title="Keyboard Detection Logs"
                  kdata={keys_log || []}
                />

                <ExternalLogs
                  title="External Camera Image Logs"
                  logs={userLogs}
                />
                
                {/* MODIFIED: Total Logs card is now at the bottom */}
                <CardWithLogs
                  title="Desktop Logs"
                  logs={userLogs}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Voice Logs Component
function VoiceLogs({ title, logs }: { title: string; logs: any[] }) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Volume2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">
              {logs.length} records found
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-purple-500 rounded-lg shadow-lg hover:bg-purple-600 hover:shadow-xl"
        >
          {showTable ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showTable ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showTable && (
        <div className="p-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {logs.map((log, i) => {
              console.log("log" , log)
              return (
                <div
                key={i}
                className="p-4 border rounded-lg bg-slate-50 border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">
                      {convertToIST(log.log_time)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Mic className="w-4 h-4 text-purple-600" />
                  </div>
                  {log.audio_file && (
                    <div className="flex-1">
                      <audio controls className="w-full">
                        <source
                          src={`${AUDIO_BASE_URL}/${log.audio_file}`}
                          type="audio/webm"
                        />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type WindowLogsTableProps = {
  data: WindowData[];
  title: string;
};

const WindowLogsTable = ({ data, title }: WindowLogsTableProps) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">
              {data.length} records found
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl"
        >
          {showTable ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showTable ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showTable && (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 border-slate-200">
                  <th className="p-4 font-semibold text-left text-slate-700">
                    WID
                  </th>
                  <th className="p-4 font-semibold text-left text-slate-700">
                    Window Event
                  </th>
                  <th className="p-4 font-semibold text-left text-slate-700">
                    Transaction Log
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((log, index) => (
                  <tr
                    key={index}
                    className="transition-colors border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 text-slate-700">{log.wid}</td>
                    <td className="p-4">
                      {log.window_event === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-orange-700 bg-orange-100 rounded-full">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Window Event Occurred
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-pre-wrap text-slate-700">
                      {convertTransactionLogTime(log.transaction_log)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

type KeyboardTableProps = {
  kdata: KeyboardEventData[];
  title: string;
};

const KeyboardLogsTable = ({ kdata, title }: KeyboardTableProps) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="overflow-hidden bg-white border shadow-lg rounded-2xl border-slate-200">
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Keyboard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-600">
              {kdata.length} records found
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-500 rounded-lg shadow-lg hover:bg-green-600 hover:shadow-xl"
        >
          {showTable ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showTable ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showTable && (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 border-slate-200">
                  <th className="p-4 font-semibold text-left text-slate-700">
                    KID
                  </th>
                  <th className="p-4 font-semibold text-left text-slate-700">
                    Keyboard Event
                  </th>
                  <th className="p-4 font-semibold text-left text-slate-700">
                    Transaction Log
                  </th>
                </tr>
              </thead>
              <tbody>
                {kdata.map((log, index) => (
                  <tr
                    key={index}
                    className="transition-colors border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 text-slate-700">{log.kid}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-red-700 bg-red-100 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {log.keyboard_event} Shortcut Detected
                      </span>
                    </td>
                    <td className="p-4 whitespace-pre-wrap text-slate-700">
                      {convertTransactionLogTime(log.transaction_log)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Component to render each discipline card
function DisciplineCard({ discData, wstatus, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="relative p-6 transition-all duration-300 border cursor-pointer group bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:from-green-100 hover:to-blue-100 border-slate-200 hover:border-green-300 hover:shadow-lg"
    >
      {wstatus === 1 && (
        <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-full shadow-lg">
          Terminated
        </span>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="p-3 transition-shadow bg-white shadow-sm rounded-xl group-hover:shadow-md">
          <Monitor className="w-6 h-6 text-green-600" />
        </div>

        {wstatus !== 1 && (
          <div className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
            Attempted
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold transition-colors text-slate-800 group-hover:text-green-700">
        {discData.discipline_name}
      </h3>
    </div>
  );
}