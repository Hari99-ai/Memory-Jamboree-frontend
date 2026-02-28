/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FetchEvents, getEventDetails, publishResult } from "../lib/api";
import type { CategoryMasterData, RegisterUserInput } from "../types";
import { columns } from "./Events/EventsList/UserList/column";
import { DataTable } from "./Users/DataTable";
import CategoryStepper, { type Category } from "./components/CategoryStepper";
import DisciplinesStepper from "./components/DisciplinesStepper";
import { CategoryDialog } from "./components/CategoryDialog";
import { MdPublish } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

// Helper function to determine event status based on dates
const getEventStatus = (
  startDateStr: string,
  endDateStr: string
): { text: "Live" | "Upcoming" | "Expired"; priority: number } => {
  const now = new Date().getTime();
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();

  if (now >= start && now <= end) {
    return { text: "Live", priority: 1 };
  }
  if (now < start) {
    return { text: "Upcoming", priority: 2 };
  }
  return { text: "Expired", priority: 3 };
};

export default function Results() {
  const [activeTab, setActiveTab] = useState<string>("overall");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<any | null>(null);
  const [isCategoryDialog, setCategoryDialog] = useState(false);
  const [isExpired, setExpired] = useState(false);

  // MODIFICATION: Re-introduced pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 20;

  // Fetch events list
  const { data: events, isLoading } = useQuery({
    queryKey: ["event-list"],
    queryFn: FetchEvents,
  });

  // Fetch event details for selected event
  const { data: eventData, isLoading: isLoadingEventData } = useQuery({
    queryKey: ["event-details", selectedEventId],
    queryFn: () => getEventDetails(selectedEventId!),
    enabled: !!selectedEventId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const event_id = eventData?.event_id;

  useEffect(() => {
    if (eventData?.etype !== undefined) {
      setExpired(Number(eventData.etype) === 0);
    }
  }, [eventData]);

  // Reset to first page if search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { mutate: publish } = useMutation({
    mutationKey: ["publish-result", event_id],
    mutationFn: () => publishResult(String(event_id)),
    onSuccess: (data: any) => {
      if (data) {
        alert("Event published successfully!");
      }
    },
    onError: (error: any) => {
      alert("Error publishing event: " + error.message);
    },
  });

  const handlePublish = async () => {
    if (!isExpired) {
      alert("You can only publish after the event is expired!");
      return;
    }
    await publish();
  };

  const allEventUsers = useMemo(() => {
    return (
      eventData?.users_by_category?.flatMap(
        (category: any) => category.users || []
      ) || []
    );
  }, [eventData]);

  const users = useMemo(() => {
    if (activeCategoryId === null) {
      return allEventUsers;
    }
    const selectedCategory = eventData?.users_by_category.find(
      (item: any) => Number(item.category_id) === activeCategoryId
    );
    return selectedCategory?.users || [];
  }, [activeCategoryId, eventData, allEventUsers]);

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter((event: any) =>
        (event.event_name || event.ename || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a: any, b: any) => {
        const statusA = getEventStatus(a.event_start, a.event_end);
        const statusB = getEventStatus(b.event_start, b.event_end);
        if (statusA.priority !== statusB.priority) {
          return statusA.priority - statusB.priority;
        }
        return (
          new Date(b.event_start).getTime() - new Date(a.event_start).getTime()
        );
      });
  }, [events, search]);

  // MODIFICATION: Logic to slice events for the current page
  const eventsToShow = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const tabMode = activeTab === "overall" ? "overall" : "discipline";
  const activeDisciplineId = activeTab === "overall" ? null : Number(activeTab);

  const handleViewResults = (eventId: number) => {
    setSelectedEventId(eventId);
    setActiveCategoryId(null);
    setActiveTab("overall");
    setTimeout(() => {
      const resultsSection = document.getElementById("results-section");
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleCategorySubmit = () => {
    setCategoryDialog(false);
  };

  return (
    <div className="flex w-full p-4 md:p-6 bg-gray-50/50 min-h-screen">
      <div className="w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Event Results</CardTitle>
            <CardDescription>
              Select an event from the table below to view detailed results.
            </CardDescription>
            <div className="pt-2">
              <Input
                placeholder="Search by event name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[80px]">S.No.</TableHead>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Loading events...
                      </TableCell>
                    </TableRow>
                  ) : eventsToShow.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventsToShow.map((event: any, index: number) => {
                      const status = getEventStatus(
                        event.event_start,
                        event.event_end
                      );
                      return (
                        <TableRow key={event.event_id}>
                          <TableCell className="font-medium">
                            {(currentPage - 1) * eventsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-800">
                            {event.event_name || event.ename}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                status.text === "Live"
                                  ? "destructive"
                                  : status.text === "Upcoming"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                status.text === "Upcoming"
                                  ? "bg-blue-500 hover:bg-blue-600"
                                  : ""
                              }
                            >
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatTime(event.event_start)}</TableCell>
                          <TableCell>{formatTime(event.event_end)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleViewResults(event.event_id)}
                              size="sm"
                            >
                              View Results
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {/* MODIFICATION: Added CardFooter for pagination controls */}
          {totalPages > 1 && (
            <CardFooter className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        {selectedEventId && (
          <div
            className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80"
            id="results-section"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Results for {eventData?.event_name}
              </h2>
              <Button
                onClick={handlePublish}
                className="flex items-center gap-2"
                disabled={isLoading || !isExpired}
              >
                <MdPublish size={20} />
                Publish
              </Button>
            </div>

            {isLoadingEventData ? (
              <div className="text-center text-gray-500 py-10">
                Loading event data...
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-y-6 mb-6">
                  <CategoryStepper
                    categories={normalizeCategories(eventData?.category || [])}
                    activeTab={activeCategoryId ?? "overall"}
                    setActiveTab={(tabId) => {
                      if (tabId === "overall") {
                        setActiveCategoryId(null);
                      } else {
                        setActiveCategoryId(Number(tabId));
                      }
                    }}
                    overallUsers={allEventUsers}
                  />
                  <DisciplinesStepper
                    disciplines={eventData?.disciplines || []}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    // totalUsers={users.length}
                  />
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
                    disciplines={eventData?.disciplines}
                  />
                ) : (
                  <p className="text-center text-gray-500 py-10">
                    No participants found for this category.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeCategories(data: CategoryMasterData[]): Category[] {
  return data
    .filter((c) => typeof c.cat_id === "number")
    .map((c) => ({
      cat_id: c.cat_id!,
      category_name: c.category_name,
    }));
}