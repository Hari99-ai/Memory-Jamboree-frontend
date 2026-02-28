import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Users, Camera, BookOpen, Mail, AlertTriangle } from "lucide-react";
import { getUserEvents, register_event } from "../../../lib/api";
import type { EventData } from "../../../types";
import { eventImg, API_BASE_URL } from "../../../lib/client";
import "../../../App.css";
import toast from "react-hot-toast";
import { useRouter } from "../../../hooks/useRouter";

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

// Coming Soon placeholder
const createComingSoonCard = (id: number): EventData => ({
  event_id: id,
  ename: "Coming Soon",
  event_start: "",
  event_end: "",
  eimage: "",
  estatus: 0,
  is_participating: 0,
  isPlaceholder: true,
  user_registered: undefined,
  category: [],
  participants: [],
  disciplines: []
});

export default function UpcomingEvents() {
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // State for the error modal
  const [errorMessage, setErrorMessage] = useState(""); // State for the error message
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRegLoading, setIsRegLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const user_id = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("auth_token");

  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery<EventData[]>({
    queryKey: ["get-events"],
    queryFn: getUserEvents,
  });


  

 

  // Create display cards - always 3 cards
  const displayCards = (() => {
    const cards = [...events];
    // Fill remaining slots with "Coming Soon" cards
    while (cards.length < 3) {
      cards.push(createComingSoonCard(1000 + cards.length));
    }
    return cards;
  })();

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

  useEffect(() => {
    setIsRegLoading(eventsLoading);
  }, [eventsLoading]);

  // Navigation logic with data availability check
  const canGoLeft = () => {
    const leftIndex = (currentIndex - 1 + displayCards.length) % displayCards.length;
    return !displayCards[leftIndex]?.isPlaceholder;
  };

  const canGoRight = () => {
    const rightIndex = (currentIndex + 1) % displayCards.length;
    return !displayCards[rightIndex]?.isPlaceholder;
  };

  const goLeft = () => {
    if (canGoLeft()) {
      setCurrentIndex(prev => (prev === 0 ? displayCards.length - 1 : prev - 1));
    }
  };

  const goRight = () => {
    if (canGoRight()) {
      setCurrentIndex(prev => (prev === displayCards.length - 1 ? 0 : prev + 1));
    }
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return "";

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
    const isLeft = idx === (currentIndex - 1 + displayCards.length) % displayCards.length;
    const isRight = idx === (currentIndex + 1) % displayCards.length;

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
        error?.response?.data?.msg || error?.response?.data?.error || "Failed to register. Please try again.";
      // MODIFICATION: Show a modal for specific, user-facing errors
      if (errorMsg.includes("You are not eligible to register based on your class.") || errorMsg.includes("User already registered for this event.")) {
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      } else {
        toast.error(errorMsg);
      }
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  if (eventsLoading)
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-3 text-slate-600">
          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Loading events...</span>
        </div>
      </div>
    );

  // 🚨 Hide section if no events exist
  if (!events || events.length === 0) {
    return null; // don't render anything
  }

  console.log(`${API_BASE_URL}/uploads/events/${events[0].eimage}`);

  return (
    <div className="bg-[#f4f6f7] min-h-screen flex flex-col items-center justify-center py-0 -mt-24">
      <div className="relative flex flex-col items-center w-full max-w-6xl mx-auto">
        <button
          onClick={goLeft}
          disabled={!canGoLeft()}
          className={`absolute z-40 p-4 transition -translate-y-1/2 rounded-full shadow-xl left-4 top-1/2 ${canGoLeft()
              ? 'bg-white hover:scale-110 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed opacity-50'
            }`}
        >
          <ChevronLeft className={`w-7 h-7 ${canGoLeft() ? 'text-yellow-500' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={goRight}
          disabled={!canGoRight()}
          className={`absolute z-40 p-4 transition -translate-y-1/2 rounded-full shadow-xl right-4 top-1/2 ${canGoRight()
              ? 'bg-white hover:scale-110 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed opacity-50'
            }`}
        >
          <ChevronRight className={`w-7 h-7 ${canGoRight() ? 'text-yellow-500' : 'text-gray-400'}`} />
        </button>

        <div className="relative w-full h-[420px] flex items-center justify-center overflow-visible mx-auto" style={{ maxWidth: "1400px" }}>
          {displayCards.map((event, idx) => {
            const { className, style } = getCardStyle(idx);
            const isLive = event.event_start && event.event_end &&
              new Date(event.event_start) <= new Date() && new Date(event.event_end) >= new Date();
            const isPlaceholder = event.isPlaceholder;

            return (
              <div
                key={event.event_id}
                className={className}
                style={style}
                onClick={() => !isPlaceholder && setCurrentIndex(idx)}
              >
                <div className="w-full h-full flex flex-col rounded-[22px] shadow-2xl overflow-hidden relative">
                  <div className="h-[220px] w-full relative overflow-hidden">
                    {isPlaceholder ? (
                      <div className="flex items-center justify-center w-full h-full bg-gray-400">
                        <div className="text-center">
                          <div className="mb-2 text-2xl font-bold text-white">Coming Soon</div>
                          <div className="text-sm text-white/80">New events will appear here</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={`${API_BASE_URL}/uploads/events/${event.eimage}`}
                          alt={event.ename}
                          className="object-cover object-center w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://plus.unsplash.com/premium_photo-1668612078695-48b09fd23398?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8";
                            target.onerror = null;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% via-transparent via-70% to-black/20"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white from-10% via-white/80 via-40% to-transparent"></div>

                        <div className="absolute top-4 right-4">
                          {event.estatus === 1 ? (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-green-600 rounded-full">
                              Free
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 p-5 bg-white">
                    <h3 className={`text-xl font-bold text-center ${isPlaceholder ? 'text-gray-500' : 'text-black'}`}>
                      {event.ename}
                    </h3>
                    {!isPlaceholder && (
                      <p className="mt-1 text-sm text-center text-gray-600">
                        {formatDateRange(event.event_start, event.event_end)}
                      </p>
                    )}

                    {!isPlaceholder && (
                      <div className="flex flex-col items-center gap-1 my-2">
                        <span className={`${isLive ? statusStyles.live.background : statusStyles.upcoming.background} ${isLive ? statusStyles.live.text : statusStyles.upcoming.text} ${isLive ? statusStyles.live.blink : statusStyles.upcoming.blink} text-xs font-bold py-1 px-3 rounded-full`}>
                          {isLive ? "LIVE NOW" : "UPCOMING"}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-center mt-auto">
                      {isPlaceholder ? (
                        <div className="px-6 py-1.5 rounded-full text-xs font-bold bg-gray-300 text-gray-500 cursor-not-allowed">
                          Stay Tuned
                        </div>
                      ) : isRegLoading ? (
                        <button className="flex items-center gap-2 px-6 py-1 text-xs font-semibold text-black border rounded-full cursor-not-allowed bg-black/20 border-white/30">
                          <div className="w-3 h-3 border-b-2 border-black rounded-full animate-spin"></div>
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

        {/* MODIFICATION: Updated Registration Modal */}
        {showModal && selectedEvent && !selectedEvent.isPlaceholder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden bg-white border shadow-2xl rounded-2xl border-slate-200">
              <div className="flex items-center justify-between p-6 font-bold text-black bg-yellow-400">
                <h3 className="text-xl font-bold">Event Registration</h3>
                <button
                  onClick={closeModal}
                  className="flex items-center justify-center w-8 h-8 text-xl transition rounded-full hover:bg-yellow-200"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-3 text-center">
                  <h4 className="text-lg font-bold text-black">
                    {selectedEvent.ename}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDateRange(selectedEvent.event_start, selectedEvent.event_end)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* NEW: Categories Section */}
                {selectedEvent.category && selectedEvent.category.length > 0 && (
                  <div className="pt-4 mt-2 border-t border-gray-200">
                    <h5 className="mb-3 font-semibold text-center text-gray-700">
                      Eligible Categories
                    </h5>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {selectedEvent.category.map((cat: any) => (
                        <span
                          key={cat.cat_id}
                          className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full"
                        >
                          {cat.category_name}: {cat.classes}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleRegistrationAction}
                    disabled={isCheckingProfile}
                    className="w-full px-6 py-3 font-bold text-white transition bg-black shadow-lg hover:bg-gray-800 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingProfile ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden bg-white border border-red-200 shadow-2xl rounded-2xl">
              <div className="flex items-center justify-between p-6 font-bold text-black bg-yellow-400">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Complete Your Profile</h3>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex items-center justify-center w-8 h-8 text-xl transition rounded-full hover:bg-yellow-200"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-black">
                    To register for events, please complete these required
                    profile fields:
                  </p>

                  <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                    <ul className="space-y-4">
                      {[
                        {
                          label: "First Name",
                          icon: <Users className="w-4 h-4 text-red-500" />,
                          description: "Your first name",
                        },
                        {
                          label: "Last Name",
                          icon: <Users className="w-4 h-4 text-red-500" />,
                          description: "Your last name",
                        },
                        {
                          label: "Profile Image",
                          icon: <Camera className="w-4 h-4 text-red-500" />,
                          description: "A clear portrait photo that shows your face clearly",
                        },
                        {
                          label: "Your Class/Grade",
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
                  className="flex items-center justify-center w-full gap-2 px-6 py-2 text-sm font-bold text-white transition bg-black shadow-lg hover:bg-gray-800 rounded-xl hover:scale-105"
                >
                  <Users className="w-4 h-4" />
                  Go to Profile Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden bg-white border shadow-2xl border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between p-6 font-bold text-white bg-red-500">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Registration Failed</h3>
                </div>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="flex items-center justify-center w-8 h-8 text-xl transition rounded-full hover:bg-red-400"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6 text-center">
                <p className="font-medium text-slate-700">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full px-6 py-2 mt-2 text-sm font-bold text-white transition bg-black shadow-lg hover:bg-gray-800 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}