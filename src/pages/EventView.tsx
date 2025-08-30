import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Users,
  Trophy,
  Calendar,
  MapPin,
  Play,
  ArrowLeft,
  Search,
  Shield,
  Lock,
  SearchX,
  Loader,
  ShieldOff,
  Clock,
  AlertTriangle,
  X,
  SendHorizontal,
} from "lucide-react";
import CountdownOverlay from "../practiceTests/CountdownOverlay";
import FacialRecognitionStep from "../myEvents/FacialRecognitionStep";
import InstructionPanel from "../practiceTests/instructionPanel/InstructionPanel";
import ProctoringInstructionsModal from "../myEvents/proctoring-instructions-modal";
import { getUserEventDetails, sendPhoneLinkedMail } from "../lib/api";
import {
  getCompletedDisciplines,
  isDisciplineAttempted,
} from "../lib/submitEventScore";
import type { DisciplineData, PhoneSendData } from "../types";
import trophyImg from "../../public/Landing/memoryChampion_2.png";
import { useRecoilValue } from "recoil";
import { eventStatusState } from "../atoms/eventAtom";
import { useEventWebSocket } from "../hooks/useEventStatusUpdate";
import { FaLongArrowAltRight } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SocketURL } from "../lib/client";
// import { useMonitoring } from "../hooks/useGiveTest";

// Types for API response
interface ApiEventDetails {
  event_id: number;
  event_name: string;
  event_start: string;
  event_end: string;
  estatus: number;
  etype: number;
  wstatus: number;
  monitoring?: number;
  disciplines: ApiDiscipline[];
  school_participants: ApiSchoolParticipant[];
  user_participants?: number;
  category_name?: string;
  category_rank?: number | null;
  overall_rank?: number | null;
  response?: {
    cand_id: number;
    fname: string;
    lname: string;
    overall_rank: number;
    school_name: string;
    total_score: number;
  }[];
  users_count?: number;
}

interface ApiDiscipline {
  disc_id: number;
  discipline_name: string;
  status: number | null; // Can be null
  wstatus: number; // 0 = not warned, 1 = warned (disabled by admin)
}

interface ApiSchoolParticipant {
  school_id: number;
  school_name: string;
  city: string;
  state: string;
  country: string;
}

interface ApiEventResponse {
  event: ApiEventDetails;
}

// Interface for completed disciplines from API
interface CompletedDiscipline {
  disc_id: number;
  discipline_name: string;
  iscomplete: number;
  status?: number;
  wstatus?: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  school: string;
  score: number;
  discipline?: string;
}

// Add interface for media permissions
interface MediaPermissions {
  audio: boolean;
  video: boolean;
}

const getDisciplineIcon = (disciplineName: string) => {
  const name = disciplineName.toLowerCase();
  if (name.includes("number")) return "🔢";
  if (name.includes("word")) return "📝";
  if (name.includes("binary")) return "💻";
  if (name.includes("image")) return "🖼️";
  if (name.includes("date")) return "📅";
  if (name.includes("face") || name.includes("name")) return "👥";
  return "🧠";
};

const extractTimeFromName = (name: string): number => {
  const match = name.match(/(\d+)\s*min/i);
  return match ? Number.parseInt(match[1]) : 5;
};

// const getEventStatus = (etype: number): string => {
//   switch (etype) {
//     case 0:
//       return "Expired"
//     case 1:
//       return "Live"
//     case 2:
//       return "Upcoming"
//     default:
//       return "Unknown"
//   }
// }

const getEventStatusColor = (etype: number): string => {
  switch (etype) {
    case 0:
      return "bg-gray-300 text-black border-gray-500";
    case 1:
      return "bg-red-600 text-white border-red-500";
    case 2:
      return "bg-blue-500 text-white border-blue-500";
    default:
      return "bg-gray-500 text-white border-gray-400";
  }
};

const getMonitoringStatusBadge = (monitoring?: number) => {
  if (monitoring === 1) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Monitoring ON
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
        <ShieldOff className="w-3 h-3" />
        Monitoring OFF
      </Badge>
    );
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500";
    case 2:
      return "bg-gradient-to-r from-gray-300 to-gray-500 text-white border-gray-400";
    case 3:
      return "bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500";
    case 4:
      return "bg-blue-500 text-white border-blue-600";
    case 5:
      return "bg-purple-500 text-white border-purple-600";
    default:
      return "bg-gray-500 text-white border-gray-600";
  }
};

export default function EventView() {
  const { event_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const userId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  // State management
  const [eventData, setEventData] = useState<ApiEventResponse | null>(null);
  const [eventDisciplines, setEventDisciplines] = useState<DisciplineData[]>(
    []
  );
  const [completedDisciplines, setCompletedDisciplines] = useState<
    CompletedDiscipline[]
  >([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(true);
  const [, setEventTimeExpired] = useState(false);
  const [isInFullScreenFlow, setIsInFullScreenFlow] = useState(false);

  // Add countdown state
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // Add media permissions state
  const [mediaPermissions, setMediaPermissions] = useState<MediaPermissions>({
    audio: false,
    video: false,
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Countdown calculation function
  const calculateCountdown = useCallback(() => {
    if (!eventData?.event || eventData.event.etype !== 2) {
      setCountdown(null);
      setIsCountdownActive(false);
      return;
    }

    const now = new Date().getTime();
    const eventStart = new Date(eventData.event.event_start).getTime();
    const difference = eventStart - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
      setIsCountdownActive(true);
    } else {
      setCountdown(null);
      setIsCountdownActive(false);
      console.log("🔄 Event should be live now, refreshing page...");
      // window.location.reload() // FIXED: This was causing a refresh loop if the backend hadn't updated the event status yet.
    }
  }, [eventData]);

  // Countdown effect
  useEffect(() => {
    if (!eventData?.event) return;

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [eventData, calculateCountdown]);

  const [error, setError] = useState<string | null>(null);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [showProctoringModal, setShowProctoringModal] = useState(false);
  const [phoneStarted , setPhoneStarted] = useState(false)

  // Flow control states
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<DisciplineData | null>(null);
  const [gameConfig, setGameConfig] = useState<Record<string, any>>({});

  // Add state for violation popup
  const [showViolationPopup, setShowViolationPopup] = useState(false);
  const [gameViolations, setGameViolations] = useState<{
    eventId: string;
    violations: string[];
    terminatedAt: string;
  } | null>(null);

  // const { phoneStarted, setPhoneStarted } = useMonitoring({
  //   user_id: String(userId || ""),
  //   discipline_id: String(selectedDiscipline?.disc_id),
  //   event_id: String(event_id || ""),
  // });

  const { mutate: sendLink , isPending: SendLoading } = useMutation({
    mutationKey: ["send-phone-link"],
    mutationFn: (data: PhoneSendData ) => sendPhoneLinkedMail(data),
    onSuccess: () => {
      toast.success("📩 Check your email, phone link has been sent!");
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to send phone link");
    },
  });


  const handleSend = () => {
    const email = sessionStorage.getItem("email");

    if (!email || !eventData?.event.event_id || !selectedDiscipline?.disc_id) {
      toast.error("Missing required fields");
      return;
    }

    const payload: PhoneSendData = {
      email: email,
      event_id: String(eventData.event.event_id),
      disc_id: String(selectedDiscipline.disc_id),
    };

    // Call the mutation directly, no await needed
    sendLink(payload);
  };


  // Function to request media permissions
  const requestMediaPermissions = async (): Promise<MediaPermissions> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Check if we got both audio and video tracks
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();

      const permissions: MediaPermissions = {
        audio: audioTracks.length > 0,
        video: videoTracks.length > 0,
      };

      console.log("🎥 Media permissions granted:", permissions);

      // Clean up the stream
      stream.getTracks().forEach((track) => track.stop());

      return permissions;
    } catch (error) {
      console.error("❌ Media permissions denied:", error);
      return {
        audio: false,
        video: false,
      };
    }
  };

  // Fullscreen enforcement
  useEffect(() => {
    if (!isInFullScreenFlow) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isInFullScreenFlow) {
        console.log(
          "⚠️ User exited fullscreen during game flow, forcing back to fullscreen"
        );
        document.documentElement.requestFullscreen().catch((err) => {
          console.error("Failed to re-enter fullscreen:", err);
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInFullScreenFlow) {
        if (e.key === "F11" || e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        if (e.altKey && e.key === "Tab") {
          e.preventDefault();
          return false;
        }

        if (e.ctrlKey && e.altKey && e.key === "Delete") {
          e.preventDefault();
          return false;
        }

        if (e.key === "Meta" || e.key === "Super") {
          e.preventDefault();
          return false;
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isInFullScreenFlow) {
        console.log("⚠️ Page became hidden during game flow");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInFullScreenFlow]);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter((entry) =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLeaderboard(filtered);
    }
  }, [searchQuery, leaderboard]);

  // Load initial event data
  useEffect(() => {
    const loadEventData = async () => {
      if (!event_id || !userId) {
        setError(!event_id ? "No event ID provided" : "No user ID found");
        setLoading(false);
        return;
      }

      try {
        console.log(
          "🔄 Loading event data for ID:",
          event_id,
          "and user:",
          userId
        );
        setLoading(true);
        setError(null);

        const event_idNumber = Number.parseInt(event_id, 10);
        if (isNaN(event_idNumber)) {
          throw new Error("Invalid event ID format");
        }

        const [eventResponse, completedResponse] = await Promise.all([
          getUserEventDetails(event_idNumber),
          getCompletedDisciplines(event_idNumber, userId),
        ]);

        console.log("✅ Event data fetched:", eventResponse);
        console.log("✅ Completed disciplines fetched:", completedResponse);

        if (eventResponse && eventResponse.event) {
          setEventData(eventResponse);

          const monitoringEnabled = eventResponse.event.monitoring === 1;
          setIsMonitoringEnabled(monitoringEnabled);

          console.log(
            `🔍 Event monitoring status: ${
              monitoringEnabled ? "ENABLED" : "DISABLED"
            } (monitoring: ${eventResponse.event.monitoring})`
          );

          // MODIFICATION: Filter to only show active disciplines (status === 1)
          const disciplines: DisciplineData[] = eventResponse.event.disciplines
            .filter((d: ApiDiscipline) => d.status === 1)
            .map((d: ApiDiscipline) => ({
              disc_id: d.disc_id,
              discipline_name: d.discipline_name,
              discipline_description: `Memory challenge for ${d.discipline_name}. Test your cognitive abilities and achieve the highest score possible.`,
              status: d.status,
              wstatus: d.wstatus,
            }));

          setEventDisciplines(disciplines);
          setCompletedDisciplines(completedResponse || []);
          console.log(
            "✅ Event disciplines processed (active only):",
            disciplines
          );
          console.log("✅ Completed disciplines set:", completedResponse);

          if (eventResponse.event.response) {
            const apiLeaderboard: LeaderboardEntry[] =
              eventResponse.event.response.map(
                (entry: {
                  cand_id: number;
                  fname: string;
                  lname: string;
                  overall_rank: number;
                  school_name: string;
                  total_score: number;
                }) => ({
                  rank: entry.overall_rank,
                  name: `${entry.fname} ${entry.lname}`,
                  school: entry.school_name,
                  score: entry.total_score,
                  discipline: "",
                })
              );
            apiLeaderboard.sort((a, b) => a.rank - b.rank);

            setLeaderboard(apiLeaderboard);
            setFilteredLeaderboard(apiLeaderboard);
            console.log("✅ Leaderboard data processed:", apiLeaderboard);
          } else {
            setLeaderboard([]);
            setFilteredLeaderboard([]);
            console.log("No leaderboard data found in API response.");
          }

          setLoading(false);
        } else {
          console.error("❌ Invalid response structure:", eventResponse);
          throw new Error("Event data not found in response");
        }
      } catch (err) {
        console.error("❌ Error loading event data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load event data"
        );
        setLoading(false);
      }
    };

    loadEventData();
  }, [event_id, userId]);

  // Check event time every minute
  useEffect(() => {
    if (!eventData?.event) return;

    const checkEventTime = () => {
      const now = new Date();
      const eventEnd = new Date(eventData.event.event_end);

      if (now > eventEnd) {
        setEventTimeExpired(true);
        console.log("⏰ Event time has expired");
      }
    };

    checkEventTime();
    const interval = setInterval(checkEventTime, 60000);

    return () => clearInterval(interval);
  }, [eventData]);

  // Handle returning from game
  useEffect(() => {
    if (location.state?.justCompleted || location.state?.forceRefresh) {
      console.log(
        "🔄 Just completed a discipline or forced refresh, refreshing completion status immediately..."
      );
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  /*
  // Auto-refresh completed disciplines
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && eventData) {
        console.log("🔄 Page became visible, refreshing completed disciplines...")
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    const interval = setInterval(() => {
      if (eventData && !document.hidden) {
        console.log("🔄 Auto-refresh completed disciplines...")
      }
    }, 10000)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(interval)
    }
  }, [eventData])
  */

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isInFullScreenFlow) {
        event.preventDefault();
        window.history.pushState(null, "", window.location.href);
        return;
      }
    };

    if (isInFullScreenFlow) {
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isInFullScreenFlow]);

  // Check for game violations when component mounts
  useEffect(() => {
    const violationData = sessionStorage.getItem("gameViolations");
    if (violationData) {
      try {
        const violations = JSON.parse(violationData);
        if (violations.eventId === event_id) {
          setGameViolations(violations);
          setShowViolationPopup(true);
          sessionStorage.removeItem("gameViolations");
        }
      } catch (error) {
        console.error("Error parsing violation data:", error);
        sessionStorage.removeItem("gameViolations");
      }
    }
  }, [event_id]);

  useEventWebSocket(event_id!);
  const eventStatus = useRecoilValue(eventStatusState(event_id!));
  const [ws, setWs] = useState<WebSocket | null>(null);
const [connectionAttempts, setConnectionAttempts] = useState(0);
const MAX_CONNECTION_ATTEMPTS = 5;

const connectWebSocket = (discipline: DisciplineData) => {
  // Close previous connection if still open
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close(1000, "Reconnecting");
  }

  const wsUrl = `${SocketURL}/desktop/${discipline.disc_id}/${event.event_id}/${userId}`;
  const socket = new WebSocket(wsUrl);

  // Timeout if connection doesn't open
  const connectionTimeout = setTimeout(() => {
    if (socket.readyState !== WebSocket.OPEN) {
      console.warn("⌛ Connection timeout");
      socket.close();
      retryConnection(discipline);
    }
  }, 5000);

  socket.onopen = () => {
    clearTimeout(connectionTimeout);
    console.log("✅ Desktop WS connected");
    setConnectionAttempts(0);

    // Optionally send passcode
    socket.send(JSON.stringify({ type: "verify" }));

    // Start heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      } else {
        clearInterval(heartbeat);
      }
    }, 20000);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 Desktop WS message:", data);

      if (data.type === "phone_status") {
        setPhoneStarted(data.started);
        if (data.started) {
          toast.success("Phone Connected");

          // socket.send(JSON.stringify({ type: "start_monitoring" }));
        }
      } else if (data.type === "disconnect") {
        console.warn("🔌 Disconnected by server:", data.message);
        socket.close();
      }

    } catch (err) {
      console.error("⚠️ Failed to parse WS message:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ Desktop WS error:", err);
    clearTimeout(connectionTimeout);
    retryConnection(discipline);
  };

  socket.onclose = (event) => {
    clearTimeout(connectionTimeout);
    console.log(`🔌 Desktop WS closed (clean: ${event.wasClean})`);
    if (!event.wasClean && connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      retryConnection(discipline);
    }
  };

  

  setWs(socket);
};






const retryConnection = (discipline: DisciplineData) => {
  setConnectionAttempts((prev) => {
    if (prev < MAX_CONNECTION_ATTEMPTS) {
      setTimeout(() => connectWebSocket(discipline), 2000);
      return prev + 1;
    }
    return prev;
  });
};

  // const handleConnectionError = (discipline: DisciplineData) => {
  //   if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
  //     const delay = Math.min(1000 * 2 ** connectionAttempts, 10000); // Exponential backoff
  //     console.log(`Retrying in ${delay / 1000} seconds...`);

  //     setTimeout(() => {
  //       setConnectionAttempts((prev) => prev + 1);
  //       connectWebSocket(discipline);
  //     }, delay);
  //   } else {
  //     console.error("Max connection attempts reached");
  //     // Show error to user
  //     alert("Failed to connect to proctoring service. Please try again later.");
  //   }
  // };

  // GAME FLOW HANDLERS
  const handleStartDiscipline = async (discipline: DisciplineData) => {
    console.log("🎮 Starting discipline:", discipline.discipline_name);

    try {
      // localStorage.removeItem("passcode"); // Clear any old passcode
      // setPasscode(""); // Reset passcode state
      connectWebSocket(discipline);

      // 2. Continue with UI flow
      setSelectedDiscipline(discipline);
      setShowProctoringModal(true);
    } catch (error) {
      console.error("Discipline start failed:", error);
      alert("Failed to initialize proctoring session");
    }
  };

  const handleProctoringAccept = async () => {
    console.log("✅ Proctoring instructions accepted");
    setShowProctoringModal(false);

    try {
      await document.documentElement.requestFullscreen();
      setIsInFullScreenFlow(true);
      console.log("🔒 Entered fullscreen mode automatically");
    } catch (error) {
      console.error("❌ Failed to enter fullscreen:", error);
      alert("Please allow fullscreen mode to continue with the challenge.");
      return;
    }

    setShowFacialRecognition(true);
  };

  const handleFacialRecognitionSuccess = () => {
    console.log("✅ Facial recognition completed");
    setShowFacialRecognition(false);
    setShowInstructions(true);
  };

  const handleInstructionsComplete = async (config: Record<string, any>) => {
    console.log("📋 Instructions completed with config:", config);
    setGameConfig(config);
    setShowInstructions(false);

    // Show permission modal after instructions
    setShowPermissionModal(true);
  };

  const handlePermissionGranted = () => {
    console.log("🎥 Media permissions granted, starting countdown");
    setShowPermissionModal(false);
    setCountdownStarted(true);

    // enable monitoring only after permission
    setIsMonitoringEnabled(true);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "start_monitoring" }));
      console.log("▶️ Start monitoring sent");
    } else {
      console.warn("⚠️ WebSocket not ready");
    }

    setTimeout(() => {
      setCountdownStarted(false);
      // setPhoneStarted(true);
      if (!selectedDiscipline || !eventData) {
        console.error("❌ No selected discipline or event data");
        return;
      }

      console.log("🚀 Navigating to game with discipline:", selectedDiscipline);
      console.log("🔍 Passing monitoring status:", isMonitoringEnabled);

      navigate(
        `/events/${event_id}/game/${encodeURIComponent(
          selectedDiscipline.discipline_name
        )}`,
        {
          state: {
            event_id: event_id,
            selectedDiscipline,
            eventDetails: eventData.event,
            config: gameConfig,
            eventName: eventData.event.event_name,
            eventDisciplines: eventDisciplines,
            fromEvent: true,
            monitoringEnabled: true, // ✅ force pass true
          },
          replace: true,
        }
      );
    }, 5000);
  };



  const handleClose = async () => {
    console.log("❌ Closing game flow");
    setShowProctoringModal(false);
    setShowFacialRecognition(false);
    setShowInstructions(false);
    setShowPermissionModal(false);
    setSelectedDiscipline(null);
    setGameConfig({});
    setIsInFullScreenFlow(false);

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        console.log("🔓 Exited fullscreen mode");
      } catch (error) {
        console.error("❌ Failed to exit fullscreen:", error);
      }
    }
  };

  // Early return if no userId is found
  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Login Required</h1>
          <p className="text-slate-600">
            You need to be logged in to view the details of this event.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto"
          >
            Go to Login Page
          </Button>
        </div>
      </div>
    );
  }

  // --- State 2: Loading ---
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-3 bg-slate-50">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-lg font-medium text-slate-700">
          Fetching Event Details...
        </p>
        <p className="text-sm text-slate-500">Please wait a moment.</p>
      </div>
    );
  }

  // --- State 3: Error Occurred ---
  if (error) {
    // A function to handle refetching, if your data fetching library supports it.
    // const handleRetry = () => refetch();

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Oops! Something Went Wrong
          </h1>
          <p className="text-slate-600">
            We couldn't load the event details or this event doesn't exist.
            Please try again later.
          </p>
          {/* Only show technical error details in a subtle way, perhaps during development */}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {/* <Button onClick={handleRetry} variant="outline">Try Again</Button> */}
            <Button onClick={() => navigate("/dashboard/events")}>
              Back to All Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- State 4: Event Not Found (404) ---
  if (!eventData || !eventData.event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <SearchX className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Event Not Found</h1>
          <p className="text-slate-600">
            Sorry, the event you are looking for doesn't exist or may have been
            moved.
          </p>
          <Button
            onClick={() => navigate("/dashboard/events")}
            variant="outline"
          >
            Return to Events
          </Button>
        </div>
      </div>
    );
  }

  const { event } = eventData;
  // const eventStatus = getEventStatus(event.etype)
  const eventStatusColor = getEventStatusColor(event.etype);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const startDateTime = formatDateTime(event.event_start);
  const endDateTime = formatDateTime(event.event_end);

  const getTotalParticipants = () => {
    if (event.users_count !== undefined && event.users_count !== null) {
      return event.users_count;
    }
    if (
      event.user_participants !== undefined &&
      event.user_participants !== null
    ) {
      return event.user_participants;
    }
    if (event.school_participants && Array.isArray(event.school_participants)) {
      return event.school_participants.length * 15;
    }
    return 150;
  };

  const totalParticipants = getTotalParticipants();

  const currentUserResponse = event.response?.find(
    (res) => String(res.cand_id) === userId
  );
  const currentUserOverallRank =
    currentUserResponse?.overall_rank || event.overall_rank;
  const currentUserTotalScore = currentUserResponse?.total_score;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/events")}
            className="mb-1 mt-0 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          {/* Event Banner */}
          <Card className="mb-8 overflow-hidden">
            <div className=" bg-indigo-600 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={eventStatusColor}>{eventStatus}</Badge>
                      {getMonitoringStatusBadge(event.monitoring)}

                      {isCountdownActive && countdown && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1 px-3 py-1">
                          <Clock className="w-3 h-3" />
                          {countdown.days > 0 && `${countdown.days}d `}
                          {String(countdown.hours).padStart(2, "0")}:
                          {String(countdown.minutes).padStart(2, "0")}:
                          {String(countdown.seconds).padStart(2, "0")}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
                      {event.event_name}
                    </h1>
                    <p className="text-indigo-100 text-lg mb-6 max-w-2xl">
                      Join this prestigious memory competition! Test your
                      cognitive abilities across multiple disciplines and
                      compete with the best minds.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-indigo-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <div>
                          <p className="text-sm opacity-90">Event Start Date</p>
                          <p className="font-normal text-sm">
                            {startDateTime.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <div>
                          <p className="text-sm opacity-90">Event End Date</p>
                          <p className="font-normal text-sm">
                            {endDateTime.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-4">
                        <Clock className="w-5 h-5" />
                        <div>
                          <p className="text-sm opacity-90">Time</p>
                          <p className="font-normal  text-sm">
                            {startDateTime.time}- {endDateTime.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <div>
                          <p className="text-sm opacity-90">Participants</p>
                          <p className="font-normal  text-sm">
                            {totalParticipants} Students
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-34 h-36 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <img
                        src={trophyImg || "/placeholder.svg"}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Disciplines Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Play className="w-6 h-6 text-indigo-600" />
                        Memory Disciplines
                      </CardTitle>
                      <p className="text-gray-600 mt-2">
                        Choose a discipline to start your memory challenge. Each
                        discipline can only be attempted once per event.{" "}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {eventDisciplines.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No active disciplines available for this event at the
                        moment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {eventDisciplines.map((discipline) => {
                        const isComplete = isDisciplineAttempted(
                          completedDisciplines,
                          discipline.disc_id!
                        );
                        const isWarned = discipline.wstatus === 1;
                        const isEventUpcoming = event.etype === 2;
                        const isEventExpired = event.etype === 0;

                        let buttonDisabled = false;
                        let buttonLabel = "Start Challenge";

                        if (isComplete) {
                          buttonDisabled = true;
                          buttonLabel = "Attempted";
                        } else if (isWarned) {
                          buttonDisabled = true;
                          buttonLabel = "Disabled by Admin";
                        } else if (isEventUpcoming) {
                          buttonDisabled = true;
                          buttonLabel = "Coming Soon";
                        } else if (isEventExpired) {
                          buttonDisabled = true;
                          buttonLabel = "Event Ended";
                        }

                        return (
                          <Card
                            key={discipline.disc_id}
                            className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 overflow-hidden ${
                              buttonDisabled
                                ? "border-red-300 bg-red-50/50"
                                : "hover:border-indigo-300"
                            }`}
                          >
                            <div
                              className={`h-1 ${
                                buttonDisabled ? "bg-red-500" : " bg-indigo-600"
                              }`}
                            />
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">
                                    {getDisciplineIcon(
                                      discipline.discipline_name
                                    )}
                                  </div>
                                  <div>
                                    <h3
                                      className={`text-xl font-semibold transition-colors ${
                                        buttonDisabled
                                          ? "text-red-600"
                                          : "text-gray-800 group-hover:text-indigo-600"
                                      }`}
                                    >
                                      {discipline.discipline_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Duration:{" "}
                                      {extractTimeFromName(
                                        discipline.discipline_name
                                      )}{" "}
                                      minutes
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      {discipline.wstatus === 1 && (
                                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                          Admin Disabled
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Start Challenge Button */}
                              <Button
                                disabled={buttonDisabled}
                                onClick={() =>
                                  !buttonDisabled &&
                                  handleStartDiscipline(discipline)
                                }
                                className={`w-full h-11 text-base font-semibold transition-all duration-300 ${
                                  buttonDisabled
                                    ? "bg-red-100 text-red-700 border border-red-300 cursor-not-allowed hover:bg-red-100"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:scale-[1.02]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isComplete ? (
                                    <>
                                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </div>
                                      {buttonLabel}
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-5 h-5" />
                                      {buttonLabel}
                                    </>
                                  )}
                                </div>
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participating Schools */}
              <Card className="max-h-[500px] overflow-hidden border border-gray-200">
                <CardHeader className="sticky top-0 z-10 bg-white">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                    Participating Schools
                  </CardTitle>
                  <p className="text-gray-600">
                    {event.school_participants.length} schools are competing in
                    this event
                  </p>
                </CardHeader>

                <CardContent className="overflow-y-auto max-h-[400px] pr-2">
                  {event.school_participants.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No participating schools found.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {event.school_participants.map((school) => (
                        <li
                          key={school.school_id}
                          className="flex items-center gap-4 py-3 px-2 hover:bg-indigo-50 rounded transition-all"
                        >
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {school.school_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {school.school_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {school.city}, {school.state}, {school.country}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Scorecard */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Scorecard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Rank</span>
                    <span className="font-semibold">
                      #
                      {currentUserOverallRank !== null
                        ? currentUserOverallRank
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category Rank</span>
                    <span className="font-semibold">
                      {event.category_rank !== null
                        ? event.category_rank
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold text-sm">
                      {event.category_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Score</span>
                    <span className="font-semibold">
                      {currentUserTotalScore !== undefined
                        ? currentUserTotalScore.toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Live Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Live Leaderboard
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search by student name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 text-black border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-1">
                      {filteredLeaderboard.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No students found matching your search.
                        </div>
                      ) : (
                        filteredLeaderboard.map((entry) => (
                          <div
                            key={entry.rank}
                            className={`p-4 flex items-center gap-3 ${
                              entry.rank <= 3
                                ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${getRankStyle(
                                  entry.rank
                                )}`}
                              >
                                {entry.rank}
                              </div>
                              {entry.rank === 1 && (
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[20px] text-gray-800 truncate">
                                {entry.name}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                {entry.school}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-indigo-600">
                                {entry.score.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Event Name</span>
                    <span className="font-semibold text-right">
                      {event.event_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Schools</span>
                    <span className="font-semibold">
                      {event.school_participants.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Total Registered Users
                    </span>
                    <span className="font-semibold">{totalParticipants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Event Time</span>
                    <span className="font-semibold text-sm">
                      {startDateTime.time} – {endDateTime.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-semibold text-sm">
                      {new Date(event.event_start).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-semibold text-sm">
                      {new Date(event.event_end).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <Badge className={`${eventStatusColor} text-xs`}>
                      {eventStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monitoring Status</span>
                    {getMonitoringStatusBadge(event.monitoring)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Attempted Disciplines</span>
                    <span className="font-semibold">
                      {
                        completedDisciplines.filter((d) => d.iscomplete === 1)
                          .length
                      }{" "}
                      / {eventDisciplines.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Game Violation Popup */}
      {showViolationPopup && gameViolations && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-300">
            <button
              onClick={() => setShowViolationPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Game Terminated
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your previous game session was terminated due to monitoring
                  violations.
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Terminated at:{" "}
                    {new Date(gameViolations.terminatedAt).toLocaleString()}
                  </span>
                </div>

                <h4 className="font-semibold text-red-800 mb-2">
                  Violations Detected:
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  <ul className="space-y-1 text-sm text-red-700">
                    {gameViolations.violations.map((violation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{violation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Multiple violations may affect
                  your eligibility for future events. Please ensure you follow
                  all monitoring guidelines during your next attempt.
                </p>
              </div>

              <button
                onClick={() => setShowViolationPopup(false)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200">
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 mb-4">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Media Permissions Required
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To continue with the challenge, we need access to your camera
                  and microphone for monitoring purposes.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 mb-4  bg-white rounded-xl p-4 shadow-lg">
                {/* <QRGenerate/> */}
                {/* <p className="text-xl font-bold">
                  Your Phone linked passcode is:{" "}
                  <span className="text-green-600">{passcode}</span>
                </p> */}
                <div className="flex">
                  <FaLongArrowAltRight className="text-3xl text-red-500  w-28" />
                  <span className="text-xl  font-semibold text-red-500 px-2 blink">
                    {" "}
                   Open the link sent to your email on your Mobile Browser and start monitoring to enable dual camera mode.

                  </span>
                </div>

                <button
                  onClick={handleSend}
                  disabled={SendLoading}
                  className={`flex items-center px-3 py-2 border rounded-sm font-medium ${
                    SendLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:underline text-white'
                  }`}
                >
                  <SendHorizontal className="mr-2 w-4 h-4" /> 
                  {SendLoading ? 'Sending...' : 'Send Link'}
                </button>

              </div>
              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Required Permissions:
                </h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        mediaPermissions.video ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    Camera Access -{" "}
                    {mediaPermissions.video ? "Granted" : "Required"}
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        mediaPermissions.audio ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    Microphone Access -{" "}
                    {mediaPermissions.audio ? "Granted" : "Required"}
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>

                <button
                  disabled={!phoneStarted}
                  onClick={async () => {
                    const permissions = await requestMediaPermissions();
                    setMediaPermissions(permissions);

                    if (permissions.audio && permissions.video) {
                      handlePermissionGranted();
                    } else {
                      alert(
                        "Both camera and microphone access are required to continue with the challenge."
                      );
                    }
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${phoneStarted
      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg" // Active style
      : "bg-gray-300 text-gray-600 cursor-not-allowed"} // Disabled style`}>
                  {phoneStarted ? "Grant Permissions" : "Waiting for Phone... ⏳"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Instructions Modal */}
      {showProctoringModal && selectedDiscipline && eventData && (
        <ProctoringInstructionsModal
          isOpen={showProctoringModal}
          onClose={handleClose}
          onAccept={handleProctoringAccept}
          eventName={eventData.event.event_name}
        />
      )}

      {/* Facial Recognition Modal */}
      {showFacialRecognition && selectedDiscipline && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <FacialRecognitionStep
            onVerified={handleFacialRecognitionSuccess}
            onClose={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
              handleClose();
            }}
          />
        </div>
      )}

      {/* Instruction Panel Modal */}
      {showInstructions && selectedDiscipline && (
        <InstructionPanel
          gameName={selectedDiscipline.discipline_name}
          time={extractTimeFromName(selectedDiscipline.discipline_name)}
          onStart={handleInstructionsComplete}
          onClose={handleClose}
        />
      )}

      {countdownStarted && (
        <CountdownOverlay message="Memorization start's in..." />
      )}
    </>
  );
}
