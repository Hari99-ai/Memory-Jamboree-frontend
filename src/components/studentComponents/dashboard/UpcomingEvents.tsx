/* eslint-disable @typescript-eslint/no-explicit-any */


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar,  Users, Camera, BookOpen, Mail} from "lucide-react";
import { getUserEvents, register_event } from "../../../lib/api";
import type { EventData } from "../../../types";
import { eventImg, API_BASE_URL } from "../../../lib/client";
import "../../../App.css";
import toast from "react-hot-toast";
import { useRouter } from "../../../hooks/useRouter";
// import { useNavigate } from "react-router-dom";

interface UserProfile {
  fname: string | null;
  lname: string | null;
  image: string | null;
  school_class: string | null;
  email: string | null;
}

interface UserEvent {
  event_id: number;
  is_participating: number;
}

const statusStyles = {
  live: {
    background: "bg-red-500",
    text: "text-white",
    blink: "animate-pulse",
  },
  upcoming: {
    background: "bg-yellow-500",
    text: "text-black",
    blink: "",
  },
};


export default function UpcomingEvents() {
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRegLoading, setIsRegLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  // const sliderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const user_id = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("auth_token");

  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery<EventData[]>({
    queryKey: ["get-events"],
    queryFn: getUserEvents,
  });

  const fetchUserEvents = async (): Promise<UserEvent[]> => {
    if (!user_id || !token) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/get-user-events`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user events");
      return response.json() || [];
    } catch {
      return [];
    }
  };

  // const { data: userEventsData = [], isLoading: userEventsLoading, refetch: refetchUserEvents } = useQuery<UserEvent[]>({
  //   queryKey: ["get-user-events", user_id],
  //   queryFn: fetchUserEvents,
  //   enabled: !!user_id && !!token,
  // });

  useEffect(() => {
    setIsRegLoading(eventsLoading);
  }, [eventsLoading]);

  const goLeft = () => setCurrentIndex(prev => (prev === 0 ? events.length - 1 : prev - 1));
  const goRight = () => setCurrentIndex(prev => (prev === events.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(goRight, 5000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, currentIndex]);

  const formatDateRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const startDate = start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata"
    });
    
    const startTime = start.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata"
    });
    
    const endDate = end.toLocaleDateString("en-GB", {
      day: "numeric", 
      month: "short",
      timeZone: "Asia/Kolkata"
    });
    
    const endTime = end.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata"
    });
    
    if (startDate === endDate) {
      return `${startDate}, ${startTime} - ${endTime}`;
    } else {
      return `${startDate}, ${startTime} to ${endDate}, ${endTime}`;
    }
  };

  const getCardStyle = (idx: number) => {
    const cardWidth = 460;
    const cardOffset = 220;
    const activeScale = 1;
    const adjacentScale = 0.8;
    const hiddenScale = 0.6;

    const isActive = idx === currentIndex;
    const isLeft = idx === (currentIndex - 1 + events.length) % events.length;
    const isRight = idx === (currentIndex + 1) % events.length;

    let style = "transition-all duration-500 ease-out absolute cursor-pointer";
    let transform = "";
    let opacity = 0;
    let zIndex = 0;

    if (isActive) {
      transform = `translateX(-50%) scale(${activeScale})`;
      style += " z-30";
      opacity = 1;
      zIndex = 30;
    } else if (isLeft) {
      transform = `translateX(calc(-50% - ${cardOffset}px)) scale(${adjacentScale})`;
      style += " z-20 opacity-90";
      opacity = 0.9;
      zIndex = 20;
    } else if (isRight) {
      transform = `translateX(calc(-50% + ${cardOffset}px)) scale(${adjacentScale})`;
      style += " z-20 opacity-90";
      opacity = 0.9;
      zIndex = 20;
    } else {
      transform = `translateX(-50%) scale(${hiddenScale})`;
      style += " z-10 pointer-events-none";
      opacity = 0;
      zIndex = 10;
    }

    return {
      className: style,
      style: {
        left: "50%",
        top: 0,
        width: `${cardWidth}px`,
        height: "400px",
        transform: transform,
        opacity: opacity,
        zIndex: zIndex,
        boxShadow: "0 8px 40px 0 rgba(0,0,0,.18)",
        borderRadius: "22px",
        background: "white",
      },
    };
  };

  const checkUserProfile = async (): Promise<boolean> => {
    if (!user_id || !token) {
      toast.error("Please login to register for events");
      return false;
    }
    setIsCheckingProfile(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get-user/${user_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user profile");
      const userData: UserProfile = await response.json();
      const requiredFields = [
        userData.fname,
        userData.lname,
        userData.image,
        userData.school_class,
        userData.email,
      ];
      return requiredFields.every(
        (field) => field !== null && field !== undefined && field !== ""
      );
    } catch {
      toast.error("Failed to verify profile. Please try again.");
      return false;
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleRegistrationAction = async () => {
    if (!selectedEvent) return;
    const isProfileComplete = await checkUserProfile();
    if (!isProfileComplete) {
      closeModal();
      setShowProfileModal(true);
      return;
    }
    if (selectedEvent.estatus === 1) {
      toast.error("Sorry, payment isn't available for this event right now.");
    } else {
      registerEventMutation(Number(selectedEvent.event_id));
    }
    closeModal();
  };

  const { mutate: registerEventMutation } = useMutation({
    mutationKey: ["register_event"],
    mutationFn: async (eventIdToRegister: number) => {
      if (!user_id) throw new Error("User not logged in.");
      return register_event(user_id, eventIdToRegister);
    },
    onSuccess: async (_data, variables) => {
      toast.success("Successfully registered!");
      setRegisteredEvents((prev) => [...prev, variables]);
      await fetchUserEvents();
      queryClient.invalidateQueries({ queryKey: ["get-events"] });
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error || "Failed to register. Please try again.";
      if (errorMsg.includes("Your class is not eligible")) {
        toast.error("Your class/grade is not eligible for this event.");
      } else if (errorMsg.includes("already registered")) {
        toast.error("You are already registered.");
      } else {
        toast.error(errorMsg);
      }
    },
  });
  

  // const shouldShowContinueButton = (eventId: number): boolean => {
  //   if (!Array.isArray(userEventsData)) return false;
  //   return (
  //     userEventsData.some((e) => e.event_id === eventId && e.is_participating === 1) ||
  //     registeredEvents.includes(Number(eventId))
  //   );
  // };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  if (eventsLoading)
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-3 text-slate-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium">Loading events...</span>
        </div>
      </div>
    );

  if (eventsError)
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Error loading events
          </div>
          <p className="text-red-500">Please try again later.</p>
        </div>
      </div>
    );

  return (
    <div className="bg-[#f4f6f7] min-h-screen flex flex-col items-center justify-center py-0 -mt-24">
      <div className="w-full max-w-6xl mx-auto relative flex flex-col items-center">
        {events.length > 1 && (
          <>
            <button
              onClick={goLeft}
              className="absolute z-40 left-4 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-4 hover:scale-110 transition"
            >
              <ChevronLeft className="w-7 h-7 text-yellow-500" />
            </button>
            <button
              onClick={goRight}
              className="absolute z-40 right-4 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-4 hover:scale-110 transition"
            >
              <ChevronRight className="w-7 h-7 text-yellow-500" />
            </button>
          </>
        )}

        <div className="relative w-full h-[420px] flex items-center justify-center overflow-visible mx-auto" style={{ maxWidth: "1400px" }}>
          {events.map((event, idx) => {
            const { className, style } = getCardStyle(idx);
            const isLive = new Date(event.event_start) <= new Date() && new Date(event.event_end) >= new Date();
            // const category = event.category?.toLowerCase() || 'junior'; // Default to junior if not specified
            // const categoryStyle = categoryStyles[category as keyof typeof categoryStyles] || categoryStyles.junior;

            return (
              <div key={event.event_id} className={className} style={style} onClick={() => setCurrentIndex(idx)}>
                <div className="w-full h-full flex flex-col rounded-[22px] shadow-2xl overflow-hidden relative">
                  <div className="h-[220px] w-full relative overflow-hidden">
                    <img
                      src={event.eimage ? `${eventImg}/${event.eimage}` : "/placeholder.svg"}
                      alt={event.ename}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% via-transparent via-70% to-black/20"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white from-10% via-white/80 via-40% to-transparent"></div>
                    
                    <div className="absolute top-4 right-4">
                      {event.estatus === 1 ? (
                        <span className="bg-red-600 text-white py-1 px-2 rounded-full text-xs font-bold">
                          Paid
                        </span>
                      ) : (
                        <span className="bg-green-600 text-white py-1 px-2 rounded-full text-xs font-bold">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col p-5 bg-white">
                    <h3 className="text-lg font-bold text-black text-center">
                      {event.ename}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mt-1">
                      {formatDateRange(event.event_start, event.event_end)}
                    </p>

                    <div className="flex flex-col items-center my-2 gap-1">
                      <span className={`${isLive ? statusStyles.live.background : statusStyles.upcoming.background} ${isLive ? statusStyles.live.text : statusStyles.upcoming.text} ${isLive ? statusStyles.live.blink : statusStyles.upcoming.blink} text-xs font-bold py-1 px-3 rounded-full`}>
                        {isLive ? "LIVE NOW" : "UPCOMING"}
                      </span>
                      {/* <span className={`${categoryStyle.background} ${categoryStyle.text} text-xs font-bold py-1 px-3 rounded-full`}>
                        {event.category ? event.category : 'JUNIOR'}
                      </span> */}
                    </div>

                    <div className="mt-auto flex justify-center">
                      {isRegLoading ? (
                        <button className="bg-black/20 text-black px-6 py-1 rounded-full text-xs font-semibold border border-white/30 cursor-not-allowed flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                          Loading...
                        </button>
                      ) : registeredEvents && event.is_participating === 1 ? (
                          <button
                            onClick={() => router.push(`/events/${event.event_id}`)}
                            className="bg-black hover:bg-gray-800 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition"
                          >
                            Continue
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowModal(true);
                            }}
                            className="bg-black hover:bg-gray-800 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition"
                          >
                            Register Now
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showModal && selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative border border-slate-200 overflow-hidden">
              <div className="bg-yellow-400 p-6 text-black font-bold flex justify-between items-center">
                <h3 className="text-xl font-bold">Event Registration</h3>
                <button
                  onClick={closeModal}
                  className="text-xl rounded-full w-8 h-8 flex items-center justify-center hover:bg-yellow-200 transition"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="text-center space-y-3">
                  <h4 className="text-lg font-bold text-black">
                    {selectedEvent.ename}
                  </h4>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDateRange(selectedEvent.event_start, selectedEvent.event_end)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <button
                    onClick={handleRegistrationAction}
                    disabled={isCheckingProfile}
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingProfile ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Checking Profile...
                      </div>
                    ) : selectedEvent.estatus === 1 ? (
                      "Continue to Payment"
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-red-200 overflow-hidden">
              <div className="bg-yellow-400 p-6 text-black font-bold flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Complete Your Profile</h3>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-xl rounded-full w-8 h-8 flex items-center justify-center hover:bg-yellow-200 transition"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-black font-medium text-sm">
                    To register for events, please complete these required
                    profile fields:
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <ul className="space-y-4">
                      {[
                        {
                          label: "First Name",
                          icon: <Users className="w-4 h-4 text-red-500" />,
                          description: "Your legal first name",
                        },
                        {
                          label: "Last Name",
                          icon: <Users className="w-4 h-4 text-red-500" />,
                          description: "Your legal last name",
                        },
                        {
                          label: "Profile Image",
                          icon: <Camera className="w-4 h-4 text-red-500" />,
                          description: "A clear photo of yourself",
                        },
                        {
                          label: "School Class",
                          icon: <BookOpen className="w-4 h-4 text-red-500" />,
                          description: "Your current grade/class",
                        },
                        {
                          label: "Email Address",
                          icon: <Mail className="w-4 h-4 text-red-500" />,
                          description: "A valid email for communication",
                        },
                      ].map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-xs text-slate-700"
                        >
                          <div className="mt-1">{item.icon}</div>
                          <div>
                            <div className="font-semibold text-black">
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.description}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    router.push("/profile");
                  }}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-xl transition hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Users className="w-4 h-4" />
                  Go to Profile Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




// /* eslint-disable @typescript-eslint/no-explicit-any */


// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect, useState } from "react";
// import { ChevronLeft, ChevronRight, Calendar,  Users, Camera, BookOpen, Mail} from "lucide-react";
// import { getUserEvents, register_event } from "../../../lib/api";
// import type { EventData } from "../../../types";
// import { eventImg, API_BASE_URL } from "../../../lib/client";
// import "../../../App.css";
// import toast from "react-hot-toast";
// import { useRouter } from "../../../hooks/useRouter";
// // import { useNavigate } from "react-router-dom";

// interface UserProfile {
//   fname: string | null;
//   lname: string | null;
//   image: string | null;
//   school_class: string | null;
//   email: string | null;
// }

// interface UserEvent {
//   event_id: number;
//   is_participating: number;
// }

// const statusStyles = {
//   live: {
//     background: "bg-red-500",
//     text: "text-white",
//     blink: "animate-pulse",
//   },
//   upcoming: {
//     background: "bg-yellow-500",
//     text: "text-black",
//     blink: "",
//   },
// };

// // const categoryStyles = {
// //   junior: {
// //     background: "bg-blue-100",
// //     text: "text-blue-800",
// //   },
// //   senior: {
// //     background: "bg-green-100",
// //     text: "text-green-800",
// //   },
// //   adult: {
// //     background: "bg-purple-100",
// //     text: "text-purple-800",
// //   },
// // };

// export default function UpcomingEvents() {
//   const [showModal, setShowModal] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isRegLoading, setIsRegLoading] = useState(true);
//   const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
//   const [isCheckingProfile, setIsCheckingProfile] = useState(false);
//   // const sliderRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const user_id = sessionStorage.getItem("userId");
//   const token = sessionStorage.getItem("auth_token");

//   const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery<EventData[]>({
//     queryKey: ["get-events"],
//     queryFn: getUserEvents,
//   });

//   const fetchUserEvents = async (): Promise<UserEvent[]> => {
//     if (!user_id || !token) return [];
//     try {
//       const response = await fetch(`${API_BASE_URL}/get-user-events`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       if (!response.ok) throw new Error("Failed to fetch user events");
//       return response.json() || [];
//     } catch {
//       return [];
//     }
//   };

//   // const { data: userEventsData = [], isLoading: userEventsLoading, refetch: refetchUserEvents } = useQuery<UserEvent[]>({
//   //   queryKey: ["get-user-events", user_id],
//   //   queryFn: fetchUserEvents,
//   //   enabled: !!user_id && !!token,
//   // });

//   useEffect(() => {
//     setIsRegLoading(eventsLoading);
//   }, [eventsLoading]);

//   const goLeft = () => setCurrentIndex(prev => (prev === 0 ? events.length - 1 : prev - 1));
//   const goRight = () => setCurrentIndex(prev => (prev === events.length - 1 ? 0 : prev + 1));

//   useEffect(() => {
//     if (events.length <= 1) return;
//     const timer = setInterval(goRight, 5000);
//     return () => clearInterval(timer);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [events.length, currentIndex]);

//   const formatDateRange = (startStr: string, endStr: string) => {
//     const start = new Date(startStr);
//     const end = new Date(endStr);
    
//     const startDate = start.toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: "short",
//       timeZone: "Asia/Kolkata"
//     });
    
//     const startTime = start.toLocaleTimeString("en-GB", {
//       hour: "2-digit",
//       minute: "2-digit",
//       timeZone: "Asia/Kolkata"
//     });
    
//     const endDate = end.toLocaleDateString("en-GB", {
//       day: "numeric", 
//       month: "short",
//       timeZone: "Asia/Kolkata"
//     });
    
//     const endTime = end.toLocaleTimeString("en-GB", {
//       hour: "2-digit",
//       minute: "2-digit",
//       timeZone: "Asia/Kolkata"
//     });
    
//     if (startDate === endDate) {
//       return `${startDate}, ${startTime} - ${endTime}`;
//     } else {
//       return `${startDate}, ${startTime} to ${endDate}, ${endTime}`;
//     }
//   };

//   const getCardStyle = (idx: number) => {
//     const cardWidth = 460;
//     const cardOffset = 220;
//     const activeScale = 1;
//     const adjacentScale = 0.8;
//     const hiddenScale = 0.6;

//     const isActive = idx === currentIndex;
//     const isLeft = idx === (currentIndex - 1 + events.length) % events.length;
//     const isRight = idx === (currentIndex + 1) % events.length;

//     let style = "transition-all duration-500 ease-out absolute cursor-pointer";
//     let transform = "";
//     let opacity = 0;
//     let zIndex = 0;

//     if (isActive) {
//       transform = `translateX(-50%) scale(${activeScale})`;
//       style += " z-30";
//       opacity = 1;
//       zIndex = 30;
//     } else if (isLeft) {
//       transform = `translateX(calc(-50% - ${cardOffset}px)) scale(${adjacentScale})`;
//       style += " z-20 opacity-90";
//       opacity = 0.9;
//       zIndex = 20;
//     } else if (isRight) {
//       transform = `translateX(calc(-50% + ${cardOffset}px)) scale(${adjacentScale})`;
//       style += " z-20 opacity-90";
//       opacity = 0.9;
//       zIndex = 20;
//     } else {
//       transform = `translateX(-50%) scale(${hiddenScale})`;
//       style += " z-10 pointer-events-none";
//       opacity = 0;
//       zIndex = 10;
//     }

//     return {
//       className: style,
//       style: {
//         left: "50%",
//         top: 0,
//         width: `${cardWidth}px`,
//         height: "420px",
//         transform: transform,
//         opacity: opacity,
//         zIndex: zIndex,
//         boxShadow: "0 8px 40px 0 rgba(0,0,0,.18)",
//         borderRadius: "22px",
//         background: "white",
//       },
//     };
//   };

//   const checkUserProfile = async (): Promise<boolean> => {
//     if (!user_id || !token) {
//       toast.error("Please login to register for events");
//       return false;
//     }
//     setIsCheckingProfile(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/get-user/${user_id}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       if (!response.ok) throw new Error("Failed to fetch user profile");
//       const userData: UserProfile = await response.json();
//       const requiredFields = [
//         userData.fname,
//         userData.lname,
//         userData.image,
//         userData.school_class,
//         userData.email,
//       ];
//       return requiredFields.every(
//         (field) => field !== null && field !== undefined && field !== ""
//       );
//     } catch {
//       toast.error("Failed to verify profile. Please try again.");
//       return false;
//     } finally {
//       setIsCheckingProfile(false);
//     }
//   };

//   const handleRegistrationAction = async () => {
//     if (!selectedEvent) return;
//     const isProfileComplete = await checkUserProfile();
//     if (!isProfileComplete) {
//       closeModal();
//       setShowProfileModal(true);
//       return;
//     }
//     if (selectedEvent.estatus === 1) {
//       toast.error("Sorry, payment isn't available for this event right now.");
//     } else {
//       registerEventMutation(Number(selectedEvent.event_id));
//     }
//     closeModal();
//   };

//   const { mutate: registerEventMutation } = useMutation({
//     mutationKey: ["register_event"],
//     mutationFn: async (eventIdToRegister: number) => {
//       if (!user_id) throw new Error("User not logged in.");
//       return register_event(user_id, eventIdToRegister);
//     },
//     onSuccess: async (_data, variables) => {
//       toast.success("Successfully registered!");
//       setRegisteredEvents((prev) => [...prev, variables]);
//       await fetchUserEvents();
//       queryClient.invalidateQueries({ queryKey: ["get-events"] });
//     },
//     onError: (error: any) => {
//       const errorMsg =
//         error?.response?.data?.error || "Failed to register. Please try again.";
//       if (errorMsg.includes("Your class is not eligible")) {
//         toast.error("Your class/grade is not eligible for this event.");
//       } else if (errorMsg.includes("already registered")) {
//         toast.error("You are already registered.");
//       } else {
//         toast.error(errorMsg);
//       }
//     },
//   });
  

//   // const shouldShowContinueButton = (eventId: number): boolean => {
//   //   if (!Array.isArray(userEventsData)) return false;
//   //   return (
//   //     userEventsData.some((e) => e.event_id === eventId && e.is_participating === 1) ||
//   //     registeredEvents.includes(Number(eventId))
//   //   );
//   // };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedEvent(null);
//   };

//   if (eventsLoading)
//     return (
//       <div className="p-8 text-center">
//         <div className="inline-flex items-center gap-3 text-slate-600">
//           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//           <span className="text-lg font-medium">Loading events...</span>
//         </div>
//       </div>
//     );

//   if (eventsError)
//     return (
//       <div className="p-8 text-center">
//         <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
//           <div className="text-red-600 text-lg font-semibold mb-2">
//             Error loading events
//           </div>
//           <p className="text-red-500">Please try again later.</p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="bg-[#f4f6f7] min-h-screen flex flex-col items-center justify-center py-12">
//       <div className="w-full max-w-6xl mx-auto relative flex flex-col items-center">
//         {events.length > 1 && (
//           <>
//             <button
//               onClick={goLeft}
//               className="absolute z-40 left-4 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-4 hover:scale-110 transition"
//             >
//               <ChevronLeft className="w-7 h-7 text-yellow-500" />
//             </button>
//             <button
//               onClick={goRight}
//               className="absolute z-40 right-4 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-4 hover:scale-110 transition"
//             >
//               <ChevronRight className="w-7 h-7 text-yellow-500" />
//             </button>
//           </>
//         )}

//         <div className="relative w-full h-[420px] flex items-center justify-center overflow-visible mx-auto" style={{ maxWidth: "1400px" }}>
//           {events.map((event, idx) => {
//             const { className, style } = getCardStyle(idx);
//             const isLive = new Date(event.event_start) <= new Date() && new Date(event.event_end) >= new Date();
//             // const category = event.category?.toLowerCase() || 'junior'; // Default to junior if not specified
//             // const categoryStyle = categoryStyles[category as keyof typeof categoryStyles] || categoryStyles.junior;

//             return (
//               <div key={event.event_id} className={className} style={style} onClick={() => setCurrentIndex(idx)}>
//                 <div className="w-full h-full flex flex-col rounded-[22px] shadow-2xl overflow-hidden relative">
//                   <div className="h-[220px] w-full relative overflow-hidden">
//                     <img
//                       src={event.eimage ? `${eventImg}/${event.eimage}` : "/placeholder.svg"}
//                       alt={event.ename}
//                       className="w-full h-full object-cover object-center"
//                       onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = "/placeholder.svg";
//                         target.onerror = null;
//                       }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% via-transparent via-70% to-black/20"></div>
//                     <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white from-10% via-white/80 via-40% to-transparent"></div>
                    
//                     <div className="absolute top-4 right-4">
//                       {event.estatus === 1 ? (
//                         <span className="bg-red-600 text-white py-1 px-2 rounded-full text-xs font-bold">
//                           Paid
//                         </span>
//                       ) : (
//                         <span className="bg-green-600 text-white py-1 px-2 rounded-full text-xs font-bold">
//                           Free
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex-1 flex flex-col p-5 bg-white">
//                     <h3 className="text-lg font-bold text-black text-center">
//                       {event.ename}
//                     </h3>
//                     <p className="text-sm text-gray-600 text-center mt-1">
//                       {formatDateRange(event.event_start, event.event_end)}
//                     </p>

//                     <div className="flex flex-col items-center my-2 gap-1">
//                       <span className={`${isLive ? statusStyles.live.background : statusStyles.upcoming.background} ${isLive ? statusStyles.live.text : statusStyles.upcoming.text} ${isLive ? statusStyles.live.blink : statusStyles.upcoming.blink} text-xs font-bold py-1 px-3 rounded-full`}>
//                         {isLive ? "LIVE NOW" : "UPCOMING"}
//                       </span>
//                       {/* <span className={`${categoryStyle.background} ${categoryStyle.text} text-xs font-bold py-1 px-3 rounded-full`}>
//                         {event.category ? event.category : 'JUNIOR'}
//                       </span> */}
//                     </div>

//                     <div className="mt-auto flex justify-center">
//                       {isRegLoading ? (
//                         <button className="bg-black/20 text-black px-6 py-1 rounded-full text-xs font-semibold border border-white/30 cursor-not-allowed flex items-center gap-2">
//                           <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
//                           Loading...
//                         </button>
//                       ) : registeredEvents && event.is_participating === 1 ? (
//                           <button
//                             onClick={() => router.push(`/events/${event.event_id}`)}
//                             className="bg-black hover:bg-gray-800 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition"
//                           >
//                             Continue
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => {
//                               setSelectedEvent(event);
//                               setShowModal(true);
//                             }}
//                             className="bg-black hover:bg-gray-800 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition"
//                           >
//                             Register Now
//                           </button>
//                         )}
//                       </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {showModal && selectedEvent && (
//           <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative border border-slate-200 overflow-hidden">
//               <div className="bg-yellow-400 p-6 text-black font-bold flex justify-between items-center">
//                 <h3 className="text-xl font-bold">Event Registration</h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-xl rounded-full w-8 h-8 flex items-center justify-center hover:bg-yellow-200 transition"
//                 >
//                   ×
//                 </button>
//               </div>
//               <div className="p-6 space-y-6">
//                 <div className="text-center space-y-3">
//                   <h4 className="text-lg font-bold text-black">
//                     {selectedEvent.ename}
//                   </h4>
//                   <div className="space-y-2 text-gray-600 text-sm">
//                     <div className="flex items-center justify-center gap-2">
//                       <Calendar className="w-4 h-4" />
//                       <span>
//                         {formatDateRange(selectedEvent.event_start, selectedEvent.event_end)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="border-t border-gray-200 pt-6">
//                   <button
//                     onClick={handleRegistrationAction}
//                     disabled={isCheckingProfile}
//                     className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isCheckingProfile ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                         Checking Profile...
//                       </div>
//                     ) : selectedEvent.estatus === 1 ? (
//                       "Continue to Payment"
//                     ) : (
//                       "Complete Registration"
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {showProfileModal && (
//           <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-red-200 overflow-hidden">
//               <div className="bg-yellow-400 p-6 text-black font-bold flex justify-between items-center">
//                 <div className="flex items-center gap-3">
//                   <Users className="w-5 h-5" />
//                   <h3 className="text-lg font-bold">Complete Your Profile</h3>
//                 </div>
//                 <button
//                   onClick={() => setShowProfileModal(false)}
//                   className="text-xl rounded-full w-8 h-8 flex items-center justify-center hover:bg-yellow-200 transition"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="p-6 space-y-6">
//                 <div className="space-y-4">
//                   <p className="text-black font-medium text-sm">
//                     To register for events, please complete these required
//                     profile fields:
//                   </p>

//                   <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//                     <ul className="space-y-4">
//                       {[
//                         {
//                           label: "First Name",
//                           icon: <Users className="w-4 h-4 text-red-500" />,
//                           description: "Your legal first name",
//                         },
//                         {
//                           label: "Last Name",
//                           icon: <Users className="w-4 h-4 text-red-500" />,
//                           description: "Your legal last name",
//                         },
//                         {
//                           label: "Profile Image",
//                           icon: <Camera className="w-4 h-4 text-red-500" />,
//                           description: "A clear photo of yourself",
//                         },
//                         {
//                           label: "School Class",
//                           icon: <BookOpen className="w-4 h-4 text-red-500" />,
//                           description: "Your current grade/class",
//                         },
//                         {
//                           label: "Email Address",
//                           icon: <Mail className="w-4 h-4 text-red-500" />,
//                           description: "A valid email for communication",
//                         },
//                       ].map((item, index) => (
//                         <li
//                           key={index}
//                           className="flex items-start gap-3 text-xs text-slate-700"
//                         >
//                           <div className="mt-1">{item.icon}</div>
//                           <div>
//                             <div className="font-semibold text-black">
//                               {item.label}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {item.description}
//                             </div>
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => {
//                     setShowProfileModal(false);
//                     router.push("/profile");
//                   }}
//                   className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-xl transition hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm"
//                 >
//                   <Users className="w-4 h-4" />
//                   Go to Profile Settings
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }






// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// import { useEffect, useRef, useState } from "react"
// import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from "lucide-react"
// import { getUserEvents, register_event } from "../../../lib/api"
// import type { EventData } from "../../../types"
// import { eventImg, API_BASE_URL } from "../../../lib/client"
// import "../../../App.css" // Assuming this contains your scrollbar-hide
// import toast from "react-hot-toast"
// import { useRouter } from "../../../hooks/useRouter"

// interface UserProfile {
//   fname: string | null
//   lname: string | null
//   image: string | null
//   school_class: string | null
//   email: string | null
// }

// interface UserEvent {
//   event_id: number
//   is_participating: number
// }

// export default function UpcomingEvents() {
//   const [showModal, setShowModal] = useState(false)
//   const [showProfileModal, setShowProfileModal] = useState(false)
//   const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const sliderRef = useRef<HTMLDivElement>(null)
//   const [isRegLoading, setIsRegLoading] = useState(true)
//   const [registeredEvents, setRegisteredEvents] = useState<any[]>([])
//   const [isCheckingProfile, setIsCheckingProfile] = useState(false)
//   const [profileCheckForContinue, setProfileCheckForContinue] = useState(false)
//   const router = useRouter()
//   const queryClient = useQueryClient()

//   const user_id = sessionStorage.getItem("userId")
//   const token = sessionStorage.getItem("auth_token")

//   // Fetch all events
//   const {
//     data: events = [],
//     isLoading: eventsLoading,
//     isError: eventsError,
//   } = useQuery<EventData[]>({
//     queryKey: ["get-events"],
//     queryFn: getUserEvents,
//   })

//   // Fetch user events to check participation status
//   const fetchUserEvents = async (): Promise<UserEvent[]> => {
//     if (!user_id || !token) {
//       return []
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/get-user-events`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       if (!response.ok) {
//         throw new Error("Failed to fetch user events")
//       }

//       const data = await response.json()
//       return data.events || []
//     } catch (error) {
//       console.error("Error fetching user events:", error)
//       return []
//     }
//   }

//   const {
//     data: userEventsData = [],
//     isLoading: userEventsLoading,
//     refetch: refetchUserEvents,
//   } = useQuery<UserEvent[]>({
//     queryKey: ["get-user-events", user_id],
//     queryFn: fetchUserEvents,
//     enabled: !!user_id && !!token,
//   })

//   // Function to check user profile completeness
//   const checkUserProfile = async (): Promise<boolean> => {
//     if (!user_id || !token) {
//       toast.error("Please login to register for events")
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

//   // Update the handleRegistrationAction function to be more explicit
//   const handleRegistrationAction = async () => {
//     if (!selectedEvent) return

//     console.log("🔍 Checking profile for REGISTRATION...")

//     // Check user profile completeness first for registration
//     const isProfileComplete = await checkUserProfile()

//     if (!isProfileComplete) {
//       console.log("❌ Profile incomplete for registration")
//       closeModal()
//       setShowProfileModal(true)
//       return
//     }

//     console.log("✅ Profile complete, proceeding with registration")

//     // If profile is complete, proceed with registration
//     if (selectedEvent.estatus === 1) {
//       toast.error("Sorry, payment isn't available for this event right now.")
//     } else {
//       registerEventMutation(Number(selectedEvent.event_id))
//       console.log("Starting free event registration for:", selectedEvent.ename)
//     }
//     closeModal()
//   }

//   // Update the handleContinueClick function to be more explicit
//   const handleContinueClick = async (event: EventData) => {
//     console.log("🔍 Checking profile for CONTINUE access...")

//     setProfileCheckForContinue(true)
//     setSelectedEvent(event)

//     // Check profile completeness before allowing access to event
//     const isProfileComplete = await checkUserProfile()

//     if (!isProfileComplete) {
//       console.log("❌ Profile incomplete for continue access")
//       setShowProfileModal(true)
//       setProfileCheckForContinue(false)
//       return
//     }

//     console.log("✅ Profile complete, navigating to event page")

//     // Navigate to the specific event page
//     setProfileCheckForContinue(false)
//     router.push(`/events/${event.event_id}`)
//   }

//   // Mutation to register for an event
//   const { mutate: registerEventMutation } = useMutation({
//     mutationKey: ["register_event"],
//     mutationFn: async (eventIdToRegister: number) => {
//       if (!user_id) {
//         throw new Error("User not logged in.")
//       }
//       return register_event(user_id, eventIdToRegister)
//     },
//     onSuccess: async (_data, variables) => {
//       toast.success("Successfully registered!")
//       setRegisteredEvents((prev) => [...prev, variables])

//       // Immediately refetch user events to check participation status
//       await refetchUserEvents()

//       // Also refresh the main events query
//       queryClient.invalidateQueries({ queryKey: ["get-events"] })
//     },
//     onError: (error: any) => {
//       const errorMsg = error?.response?.data?.error || "Failed to register. Please try again."
//       if (errorMsg.includes("Your class is not eligible to register for this event")) {
//         toast.error("Your class/grade is not eligible to register for this event.")
//       } else if (errorMsg.includes("User already registered for this event")) {
//         toast.error("You are already registered.")
//       } else {
//         toast.error(errorMsg)
//       }
//     },
//   })

//   console.log("Upcoming Events Data:", userEventsData)

//   // Function to check if user is participating in an event
//   const isUserParticipating = (eventId: number): boolean => {
//     const userEvent = userEventsData.find((ue:any) => ue.event_id === eventId)
//     return userEvent?.is_participating === 1
//   }

//   // Function to check if user is registered (keep existing logic for session)
//   const isUserRegistered = (eventId: number): boolean => {
//     return registeredEvents.includes(Number(eventId))
//   }

//   // Combined function to determine button state
//   const shouldShowContinueButton = (eventId: number): boolean => {
//     // Show continue if user is registered in current session OR is participating from API
//     return isUserRegistered(eventId) || isUserParticipating(eventId)
//   }

//   const scroll = (direction: "left" | "right") => {
//     const { current } = sliderRef
//     if (current) {
//       const firstCard = current.querySelector(".event-card") as HTMLElement
//       const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 300

//       current.scrollBy({
//         left: direction === "left" ? -scrollAmount : scrollAmount,
//         behavior: "smooth",
//       })
//     }
//   }

//   const scrollToIndex = (index: number) => {
//     const { current } = sliderRef
//     if (current) {
//       const cards = current.querySelectorAll(".event-card")
//       const card = cards[index] as HTMLElement
//       if (card) {
//         current.scrollTo({
//           left: card.offsetLeft,
//           behavior: "smooth",
//         })
//         setCurrentIndex(index)
//       }
//     }
//   }

//   // Improve scroll synchronization
//   useEffect(() => {
//     const { current } = sliderRef
//     if (!current) return

//     const handleScroll = () => {
//       const scrollLeft = current.scrollLeft
//       const containerWidth = current.offsetWidth
//       const totalWidth = current.scrollWidth
//       const cardCount = events.length

//       // Calculate current index based on scroll position
//       const progress = scrollLeft / (totalWidth - containerWidth)
//       const newIndex = Math.round(progress * (cardCount - 1))
//       setCurrentIndex(Math.max(0, Math.min(newIndex, cardCount - 1)))
//     }

//     current.addEventListener("scroll", handleScroll)
//     return () => current.removeEventListener("scroll", handleScroll)
//   }, [events.length])

//   const openModal = (event: EventData) => {
//     setSelectedEvent(event)
//     setShowModal(true)
//   }

//   const closeModal = () => {
//     setShowModal(false)
//     setSelectedEvent(null)
//   }

//   const closeProfileModal = () => {
//     setShowProfileModal(false)
//     setSelectedEvent(null)
//     setProfileCheckForContinue(false)
//   }

//   const handleNavigateToProfile = () => {
//     closeProfileModal()
//     router.push("/profile")
//   }

//   // Set loading state based on user events loading
//   useEffect(() => {
//     setIsRegLoading(userEventsLoading)
//   }, [userEventsLoading])

//   const autoScrollRef = useRef<NodeJS.Timeout | null>(null)

//   // Auto-scroll function
//   useEffect(() => {
//     if (events.length <= 1) return

//     const interval = setInterval(() => {
//       scroll("right")
//     }, 5000)

//     autoScrollRef.current = interval

//     return () => {
//       if (autoScrollRef.current) clearInterval(autoScrollRef.current)
//     }
//   }, [events])

//   const eventCount = events.length

//   const eventCardWidthClass =
//     eventCount <= 1 ? "w-full max-w-4xl" : eventCount === 2 ? "w-[calc(50%-16px)] max-w-lg" : "w-[320px] md:w-[384px]"

//   const isSlider = eventCount > 2

//   const containerClass = isSlider
//     ? "overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
//     : "justify-center flex-wrap"

//   if (eventsLoading) {
//     return (
//       <div className="p-8 text-center">
//         <div className="inline-flex items-center gap-3 text-slate-600">
//           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//           <span className="text-lg font-medium">Loading events...</span>
//         </div>
//       </div>
//     )
//   }

//   if (eventsError) {
//     return (
//       <div className="p-8 text-center">
//         <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
//           <div className="text-red-600 text-lg font-semibold mb-2">Error loading events</div>
//           <p className="text-red-500">Please try again later.</p>
//         </div>
//       </div>
//     )
//   }

//   const formatTime = (dateStr: string) =>
//     new Date(dateStr).toLocaleString("en-GB", {
//       timeZone: "Asia/Kolkata",
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     })

//   return (
//     <div className="p-6 w-full relative">
//       <div className="max-w-7xl mx-auto">
//         {events.length > 1 && <h2 className="text-2xl font-bold text-gray-800 mb-10">Upcoming Events</h2>}

//         {/* Modern Slider Controls */}
//         {events.length > 1 && (
//           <>
//             <button
//               onClick={() => scroll("left")}
//               className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm shadow-xl rounded-full p-4 hover:bg-white hover:scale-110 transition-all duration-200 border border-white/20 group"
//               aria-label="Previous event"
//             >
//               <ChevronLeft className="w-6 h-6 text-slate-700 group-hover:text-blue-600 transition-colors duration-200" />
//             </button>
//             <button
//               onClick={() => scroll("right")}
//               className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm shadow-xl rounded-full p-4 hover:bg-white hover:scale-110 transition-all duration-200 border border-white/20 group"
//               aria-label="Next event"
//             >
//               <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-blue-600 transition-colors duration-200" />
//             </button>
//           </>
//         )}

//         <div
//           ref={sliderRef}
//           className={`flex gap-8 ${isSlider ? containerClass : "flex"} ${!isSlider ? "justify-center flex-wrap" : ""} pb-8`}
//         >
//           {events.length === 0 ? (
//             <div className="text-center w-full py-16">
//               <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
//                 <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
//                 <p className="text-slate-600 text-lg font-medium">No events available at the moment</p>
//                 <p className="text-slate-500 mt-2">Check back soon for exciting new events!</p>
//               </div>
//             </div>
//           ) : (
//             <>
//               {events.map((event, index) => (
//                 <div
//                   key={event.event_id || index}
//                   className={`event-card relative ${eventCardWidthClass} h-[400px] flex-shrink-0 snap-start rounded-2xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-200 hover:scale-[1.02]`}
//                 >
//                   {/* Background Image with Better Overlay for Text Visibility */}
//                   <div className="absolute inset-0">
//                     <img
//                       src={event.eimage ? `${eventImg}/${event.eimage}` : "/placeholder.svg?height=400&width=400"}
//                       alt={event.ename}
//                       className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                       onError={(e: any) => {
//                         e.target.src = "/placeholder.svg?height=400&width=400"
//                         e.target.onerror = null
//                       }}
//                     />
//                     {/* Enhanced overlay for better text visibility */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>
//                     <div className="absolute inset-0 bg-black/30"></div>
//                   </div>

//                   {/* Content */}
//                   <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
//                     {/* Top Section - Status Badge */}
//                     <div className="flex justify-between items-start">
//                       <div className="flex items-center gap-2 text-white/90">
//                         <Users className="w-4 h-4" />
//                         <span className="text-sm font-medium">Event</span>
//                       </div>
//                       <div className="flex flex-col items-end gap-2">
//                         <span
//                           className={`px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-sm border border-white/30 ${
//                             event.estatus ? "bg-red-500/90" : "bg-green-500/90"
//                           }`}
//                         >
//                           {event.estatus ? "Paid Event" : "Free Event"}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Middle Section - Event Details */}
//                     <div className="text-center space-y-4">
//                       <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-lg">
//                         {event.ename}
//                       </h3>

//                       <div className="space-y-3">
//                         <div className="flex items-center justify-center gap-2 text-white drop-shadow-md">
//                           <Calendar className="w-5 h-5" />
//                           <span className="font-medium">{formatTime(event.event_start)}</span>
//                         </div>
//                         <div className="flex items-center justify-center gap-2 text-white drop-shadow-md">
//                           <Clock className="w-5 h-5" />
//                           <span className="font-medium">{formatTime(event.event_end)}</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Bottom Section - Action Button */}
//                     <div className="flex justify-center">
//                       {isRegLoading ? (
//                         <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full text-sm font-semibold border border-white/30 cursor-not-allowed">
//                           <div className="flex items-center gap-2">
//                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                             Loading...
//                           </div>
//                         </button>
//                       ) : shouldShowContinueButton(Number(event.event_id)) ? (
//                         <button
//                           onClick={() => handleContinueClick(event)}
//                           disabled={profileCheckForContinue && selectedEvent?.event_id === event.event_id}
//                           className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                         >
//                           {profileCheckForContinue && selectedEvent?.event_id === event.event_id
//                             ? "Checking Profile..."
//                             : "Continue"}
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => openModal(event)}
//                           className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                         >
//                           Register Now
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </>
//           )}
//         </div>

//         {/* Modern Dot Indicators */}
//         {isSlider && events.length > 1 && (
//           <div className="flex justify-center mt-8 gap-3">
//             {events.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => scrollToIndex(index)}
//                 className={`transition-all duration-200 rounded-full ${
//                   currentIndex === index ? "w-8 h-3 bg-indigo-600" : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
//                 }`}
//                 aria-label={`Go to slide ${index + 1}`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Modern Registration Modal */}
//         {showModal && selectedEvent && (
//           <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative border border-slate-200 overflow-hidden">
//               {/* Header */}
//               <div className="bg-indigo-600 p-6 text-white">
//                 <button
//                   onClick={closeModal}
//                   className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
//                   aria-label="Close modal"
//                 >
//                   ×
//                 </button>
//                 <h3 className="text-2xl font-bold mb-2">Event Registration</h3>
//                 <p className="text-blue-100">Complete your registration below</p>
//               </div>

//               {/* Content */}
//               <div className="p-6 space-y-6">
//                 <div className="text-center space-y-3">
//                   <h4 className="text-xl font-bold text-slate-800">{selectedEvent.ename}</h4>
//                   <div className="space-y-2 text-slate-600">
//                     <div className="flex items-center justify-center gap-2">
//                       <Calendar className="w-4 h-4" />
//                       <span>{formatTime(selectedEvent.event_start)}</span>
//                     </div>
//                     <div className="flex items-center justify-center gap-2">
//                       <Clock className="w-4 h-4" />
//                       <span>{formatTime(selectedEvent.event_end)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border-t border-slate-200 pt-6">
//                   <button
//                     onClick={handleRegistrationAction}
//                     disabled={isCheckingProfile}
//                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                   >
//                     {isCheckingProfile ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                         Checking Profile...
//                       </div>
//                     ) : selectedEvent.estatus === 1 ? (
//                       "Continue to Payment"
//                     ) : (
//                       "Complete Registration"
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Modern Profile Completion Modal */}
//         {showProfileModal && (
//           <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-red-200 overflow-hidden">
//               {/* Header */}
//               <div className="bg-indigo-600 p-6 text-white">
//                 <button
//                   onClick={closeProfileModal}
//                   className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
//                   aria-label="Close modal"
//                 >
//                   ×
//                 </button>
//                 <div className="flex items-center gap-3">
//                   <div className="bg-white/20 rounded-full p-2">
//                     <Users className="w-6 h-6" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold">Profile Incomplete</h3>
//                     <p className="text-blue-100 text-sm">Action required</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-6 space-y-6">
//                 <p className="text-slate-700 leading-relaxed">
//                   Please complete your profile with all required information to continue:
//                 </p>

//                 <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//                   <ul className="space-y-3">
//                     {["First Name", "Last Name", "Profile Image", "School Class", "Email Address"].map(
//                       (item, index) => (
//                         <li key={index} className="flex items-center gap-3 text-sm text-slate-700">
//                           <div className="w-2 h-2 bg-red-400 rounded-full"></div>
//                           <span>{item}</span>
//                         </li>
//                       ),
//                     )}
//                   </ul>
//                 </div>

//                 <button
//                   onClick={handleNavigateToProfile}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
//                 >
//                   Complete Your Profile
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


