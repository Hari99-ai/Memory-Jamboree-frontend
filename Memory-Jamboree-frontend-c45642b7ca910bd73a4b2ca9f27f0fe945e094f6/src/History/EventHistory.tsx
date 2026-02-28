"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { AlertCircle, Calendar, Clock, MapPin, Users, Eye } from "lucide-react"
import { Alert, AlertDescription } from "../components/ui/alert"

interface EventRecord {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  status: "completed" | "upcoming" | "cancelled"
  participants: number
  category: string
}

const mockEventData: EventRecord[] = [
  {
    id: "1",
    title: "Mathematics Olympiad 2024",
    description: "Annual mathematics competition for students",
    date: "2024-03-15",
    time: "10:00 AM",
    location: "Main Auditorium",
    status: "completed",
    participants: 150,
    category: "Competition",
  },
  {
    id: "2",
    title: "Science Fair Exhibition",
    description: "Student science project presentations",
    date: "2024-02-28",
    time: "2:00 PM",
    location: "Science Building",
    status: "completed",
    participants: 89,
    category: "Exhibition",
  },
  {
    id: "3",
    title: "Career Guidance Workshop",
    description: "Professional development and career planning session",
    date: "2024-01-20",
    time: "11:00 AM",
    location: "Conference Hall",
    status: "completed",
    participants: 75,
    category: "Workshop",
  },
]

export default function EventHistory() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null)

  useEffect(() => {
    fetchEventHistory()
  }, [])

  const fetchEventHistory = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Sort events by date in ascending order
      const sortedEvents = mockEventData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setEvents(sortedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch event history")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "competition":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "exhibition":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "workshop":
        return "bg-teal-100 text-teal-800 border-teal-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading event history: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#245cab]">Event History</h1>
        <Badge variant="outline" className="text-sm">
          {events.length} Total Events
        </Badge>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">You haven't participated in any events yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2">{event.title}</CardTitle>
                  <Badge variant="outline" className={`ml-2 ${getStatusColor(event.status)} capitalize`}>
                    {event.status}
                  </Badge>
                </div>
                <Badge variant="outline" className={`w-fit ${getCategoryColor(event.category)}`}>
                  {event.category}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{event.participants} participants</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setSelectedEvent(event)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{selectedEvent?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getStatusColor(selectedEvent.status)}>
                            {selectedEvent.status}
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(selectedEvent.category)}>
                            {selectedEvent.category}
                          </Badge>
                        </div>

                        <p className="text-gray-600">{selectedEvent.description}</p>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(selectedEvent.date)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{selectedEvent.time}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{selectedEvent.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{selectedEvent.participants} participants</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
