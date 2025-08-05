
import React from "react"
import { useNavigate} from "react-router-dom"
import type { EventData } from "../types"
import { eventImg } from "../lib/client"
import { Calendar, ArrowRight } from "lucide-react"
import { isMobileOnly } from "react-device-detect"
// import {isMobile} from "react-device-detect"

interface EventCardProps {
  event: EventData
  onClick?: () => void
}

export default function EventCard({ event, onClick }: EventCardProps) {
  // Destructure all required fields, including disciplines, directly from the pre-fetched event prop
  const { event_id, ename, event_start, event_end, eimage, etype } = event
  const navigate = useNavigate()

  // const [searchParams] = useSearchParams();
  // const sessionId = searchParams.get("session");

  // Handle view details click
  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // console.log("Device check:", isMobile, "Session ID:", sessionId);

    if(isMobileOnly){
      navigate("/stream")
    }else{
      navigate(`/events/${event_id}`);
    }
    
  };


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
      colorClass: "text-white",
      bgClass: "bg-gray-400",
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
        className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 border border-gray-100"
        onClick={onClick}
      >
        {/* Image Section with Overlay */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={`${eventImg}/${eimage}`}
            alt={ename}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-2">
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

          {/* Action Button */}
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


// import type React from "react"

// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import type { EventData } from "../types"
// import { eventImg, API_BASE_URL } from "../lib/client"
// import { Calendar, Trophy, Users, ArrowRight, X } from "lucide-react"
// import toast from "react-hot-toast"

// interface EventCardProps {
//   event: EventData
//   onClick?: () => void
// }

// interface UserProfile {
//   fname: string | null
//   lname: string | null
//   image: string | null
//   school_class: string | null
//   email: string | null
// }

// export default function EventCard({ event, onClick }: EventCardProps) {
//   const { event_id, ename, event_start, event_end, disciplines, eimage, etype } = event
//   const [showProfileModal, setShowProfileModal] = useState(false)
//   const [isCheckingProfile, setIsCheckingProfile] = useState(false)
//   const navigate = useNavigate()

//   const user_id = sessionStorage.getItem("userId")
//   const token = sessionStorage.getItem("auth_token")

//   // Function to check user profile completeness
//   const checkUserProfile = async (): Promise<boolean> => {
//     if (!user_id || !token) {
//       toast.error("Please login to view event details")
//       return false
//     }

//     setIsCheckingProfile(true)
//     try {
//       const response = await fetch(`${API_BASE_URL}/get-user/${user_id}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       if (!response.ok) {
//         throw new Error("Failed to fetch user profile")
//       }

//       const userData: UserProfile = await response.json()
      
//       // Check if required fields are not null
//       const requiredFields = [userData.fname, userData.lname, userData.image, userData.school_class, userData.email]

//       const hasAllRequiredFields = requiredFields.every(
//         (field) => field !== null && field !== undefined && field !== "",
//       )

//       return hasAllRequiredFields
//     } catch (error) {
//       console.error("Error checking user profile:", error)
//       toast.error("Failed to verify profile. Please try again.")
//       return false
//     } finally {
//       setIsCheckingProfile(false)
//     }
//   }

//   // Handle view details click with profile check
//   const handleViewDetailsClick = async (e: React.MouseEvent) => {
//     e.preventDefault()
//     e.stopPropagation()

//     console.log("🔍 Checking profile for VIEW DETAILS...")

//     // Check profile completeness before allowing access to event details
//     const isProfileComplete = await checkUserProfile()

//     if (!isProfileComplete) {
//       console.log("❌ Profile incomplete for view details")
//       setShowProfileModal(true)
//       return
//     }

//     console.log("✅ Profile complete, allowing event details access")
//     navigate(`/events/${event_id}`)
//   }

//   const closeProfileModal = () => {
//     setShowProfileModal(false)
//   }

//   const handleNavigateToProfile = () => {
//     closeProfileModal()
//     navigate("/profile")
//   }

//   let statusConfig = {
//     colorClass: "text-gray-400",
//     bgClass: "bg-gray-100",
//     title: "NA",
//     badgeClass: "bg-gray-500",
//   }

//   if (etype === 1) {
//     statusConfig = {
//       colorClass: "text-green-600",
//       bgClass: "bg-green-50",
//       title: "Live",
//       badgeClass: "bg-green-500",
//     }
//   } else if (etype === 2) {
//     statusConfig = {
//       colorClass: "text-blue-600",
//       bgClass: "bg-blue-50",
//       title: "Upcoming",
//       badgeClass: "bg-blue-500",
//     }
//   } else if (etype === 0) {
//     statusConfig = {
//       colorClass: "text-red-600",
//       bgClass: "bg-red-50",
//       title: "Expired",
//       badgeClass: "bg-red-500",
//     }
//   }

 
//   const formatTime = (dateStr: string) =>
//     new Date(dateStr).toLocaleString("en-GB", {
//         timeZone: "Asia/Kolkata",
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//     });


//   const startDateTime = formatTime(event_start)
//   const endDateTime = formatTime(event_end)

//   return (
//     <>
//       <div
//         className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 border border-gray-100"
//         onClick={onClick}
//       >
//         {/* Image Section with Overlay */}
//         <div className="relative h-48 overflow-hidden">
//           <img
//             src={`${eventImg}/${eimage}`}
//             alt={ename}
//             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//           />

//           {/* Status Badge */}
//           <div className="absolute top-4 right-4">
//             <span
//               className={`px-3 py-1 rounded-full text-xs font-bold text-white ${statusConfig.badgeClass} shadow-lg`}
//             >
//               {statusConfig.title}
//             </span>
//           </div>

//           {/* Gradient Overlay */}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//         </div>

//         {/* Content Section */}
//         <div className="p-6 space-y-2">
//           {/* Header */}
//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
//               {ename}
//             </h3>

//             {/* Status Indicator */}
//             <div
//               className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.colorClass} ${statusConfig.bgClass}`}
//             >
//               <div className={`w-2 h-2 rounded-full ${statusConfig.badgeClass} mr-2 animate-pulse`} />
//               {statusConfig.title}
//             </div>
//           </div>

//           {/* Event Details */}
//           <div className="space-y-3">
//             {/* Date Range */}
//             <div className="flex items-center text-gray-600 text-sm">
//               <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
//               <span>
//                 {startDateTime}
//               </span>
//             </div>

//             {/* Time */}
//             <div className="flex items-center text-gray-600 text-sm">
//               <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
//               <span>
//                 {endDateTime}
//               </span>
//             </div>

//             {/* Disciplines Count */}
//             <div className="flex items-center text-gray-600 text-sm">
//               <Trophy className="w-4 h-4 mr-2 text-indigo-500" />
//               <span>{disciplines.length} Disciplines</span>
//             </div>

//             {/* Participants (Mock data for now) */}
//             <div className="flex items-center text-gray-600 text-sm">
//               <Users className="w-4 h-4 mr-2 text-indigo-500" />
//               <span>150+ Participants</span>
//             </div>
//           </div>

//           {/* Action Button */}
//           <div className="pt-4">
//             <button
//               onClick={handleViewDetailsClick}
//               disabled={isCheckingProfile}
//               className="w-full bg-indigo-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group text-md"
//             >
//               {isCheckingProfile ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Checking Profile...
//                 </div>
//               ) : (
//                 <>
//                   <span>View Details</span>
//                   <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Hover Effect Border */}
//         <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-indigo-200 transition-colors duration-300 pointer-events-none" />
//       </div>

//       {/* Profile Completion Modal */}
//       {showProfileModal && (
//         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-300">
//             <button
//               onClick={closeProfileModal}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//               aria-label="Close modal"
//             >
//               <X className="w-6 h-6" />
//             </button>

//             <div className="p-8 text-center">
//               <div className="mb-6">
//                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
//                   <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Incomplete</h3>
//                 <p className="text-gray-600 leading-relaxed">
//                   Before viewing event details, please complete your profile with all required information:
//                 </p>
//               </div>

//               <div className="bg-gray-50 rounded-xl p-4 mb-6">
//                 <ul className="space-y-3 text-sm text-gray-700">
//                   <li className="flex items-center">
//                     <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
//                     First Name
//                   </li>
//                   <li className="flex items-center">
//                     <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
//                     Last Name
//                   </li>
//                   <li className="flex items-center">
//                     <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
//                     Profile Image
//                   </li>
//                   <li className="flex items-center">
//                     <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
//                     School Class
//                   </li>
//                   <li className="flex items-center">
//                     <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
//                     Email Address
//                   </li>
//                 </ul>
//               </div>

//               <button
//                 onClick={handleNavigateToProfile}
//                 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
//               >
//                 Complete Profile to View Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }