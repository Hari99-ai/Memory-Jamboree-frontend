
import React from "react"
import { useNavigate } from "react-router-dom"
import type { EventData } from "../types"
import { eventImg } from "../lib/client"
import { Calendar, ArrowRight } from "lucide-react"
// import { isMobileOnly } from "react-device-detect"

interface EventCardProps {
  event: EventData
  onClick?: () => void
}

export default function EventCard({ event, onClick }: EventCardProps) {
  // Destructure all required fields, including disciplines, directly from the pre-fetched event prop
  const { event_id, ename, event_start, event_end, eimage, etype } = event
  const navigate = useNavigate()


  // Handle view details click
  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    

    // if(isMobileOnly){
    //   navigate(`/mobile-event/${event_id}`)
    // }else {
      navigate(`/events/${event_id}`);
    // }
  }

  // Determine status configuration based on event type
  let statusConfig = {
    colorClass: "text-gray-400",
    bgClass: "bg-gray-100",
    title: "NA",
    badgeClass: "bg-gray-500",
  }

  if (etype === 1) {
    statusConfig = {
      colorClass: "text-white",
      bgClass: "bg-red-600",
      title: "Live",
      badgeClass: "bg-white",
    }
  } else if (etype === 2) {
    statusConfig = {
      colorClass: "text-white",
      bgClass: "bg-blue-500",
      title: "Upcoming",
      badgeClass: "bg-white",
    }
  } else if (etype === 0) {
    statusConfig = {
      colorClass: "text-black",
      bgClass: "bg-gray-300",
      title: "Expired",
      badgeClass: "bg-white",
    }
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

  const startDateTime = formatTime(event_start)
  const endDateTime = formatTime(event_end)

  return (
    <>
  <div
  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 border border-gray-100 flex flex-col" // <-- Add flex flex-col
  onClick={onClick}
>
  {/* Image Section with Overlay */}
  <div className="relative h-48 overflow-hidden bg-gray-200">
    <img
      src={eimage ? `${eventImg}/${eimage}` : "https://via.placeholder.com/800x600?text=Event+Image"}
      alt={ename}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "https://plus.unsplash.com/premium_photo-1681433426886-3d6d17f79d53?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHBsYWNlaG9sZGVyfGVufDB8fDB8fHww";
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </div>

  {/* Content Section */}
  {/* Change: Added flex, flex-col, and flex-grow to make this section fill available space */}
  <div className="p-6 flex flex-col flex-grow">
    {/* New: Wrapper for content that should grow */}
    <div className="flex-grow">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
          {ename}
        </h3>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.colorClass} ${statusConfig.bgClass}`}
        >
          <div className={`w-2 h-2 rounded-full ${statusConfig.badgeClass} mr-2 animate-pulse`} />
          {statusConfig.title}
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
          <span>Start Event : {startDateTime}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
          <span>End Event : {endDateTime}</span>
        </div>
      </div>
    </div> {/* End of the growing content wrapper */}

    {/* Action Button */}
    {/* Note: No changes needed here, its parent controls its position */}
    <div className="pt-4">
      <button
        onClick={handleViewDetailsClick}
        className="w-full bg-indigo-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group text-md"
      >
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </div>

  {/* Hover Effect Border */}
  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-indigo-200 transition-colors duration-300 pointer-events-none" />
</div>
    </>
  )
}

