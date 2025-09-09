"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import NumbersGame from "../Games/Numbers/NumbersGame"
import BinaryGame from "../Games/Binary/BinaryGame"
import ImagesGame from "../Games/Image/ImageGame"
import DatesGame from "../Games/Dates/DateGames"
//import FacesGame from "../Games/Faces/FacesGame"
import WordsGame from "../Games/Words/WordsGame"
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Trophy,
  X,
  Shield,
  ShieldOff,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { submitEventScore } from "../lib/submitEventScore"
import { 
  // fetchPhoneAlerts,
  //  PhoneAlert,
    useMonitoring,
  //  usePhoneAlerts 
  } from "../hooks/useGiveTest"
import type { DisciplineData } from "../types"
import { WarningDialog } from "../components/WarnDialog"
import { API_BASE_URL } from "../lib/client"
// import { API_BASE_URL } from "../lib/client"
// import { API_BASE_URL } from "../lib/client"

// Interface for game component methods
interface GameComponentRef {
  getCurrentScore?: () => number
}

// Types for event disciplines from API
interface EventDiscipline {
  disc_id: number
  discipline_name: string
  status: number
}

interface EventDetailsAPI {
  event_id: number
  event_name: string
  event_start: string
  event_end: string
  estatus: number
  monitoring: number // Added monitoring field
  disciplines: EventDiscipline[]
  school_participants: any[]
}

interface SubmitResult {
  score: number
  submissionSuccess: boolean
  submissionError?: string
  disciplineName: string
  disciplineId: number
  eventName: string
}

function EventGamePage() {
  const user_id = localStorage.getItem("userId") || sessionStorage.getItem("userId")
  const { state } = useLocation() as any
  const { event_id, discipline } = useParams()
  const navigate = useNavigate()
  const [gameStarted, setGameStarted] = useState(false)
  const [showSubmitPopup, setShowSubmitPopup] = useState(false)
  const [showEventEndedPopup, setShowEventEndedPopup] = useState(false)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [monitoringEnabled, setMonitoringEnabled] = useState(true)
  const [currentScore, setCurrentScore] = useState(0)
  const [submitTime, setSubmitTime] = useState<string | null>(null)
  const [gameData, setGameData] = useState<{
    selectedDiscipline: EventDiscipline
    event_id: string
    eventDisciplines: EventDiscipline[]
    eventDetails: EventDetailsAPI
    config: Record<string, any>
    eventName: string
  } | null>(null)
  const [recallStartTime, setRecallStartTime] = useState<number | null>(null)

  const monitoringStartedRef = useRef(false)
  const gameComponentRef = useRef<GameComponentRef | null>(null)


  
  // Initialize monitoring with proper IDs and monitoring status
  const {
    startMonitoring,
    stopMonitoring,
    isFullScreen,
    isMonitoring,
    gamePaused,
    closeDialog,
    dialogOpen,
    warningCount,
    warningTitle,
    lastType,
    violationHistory,
    showTerminationPopup,
    handleTerminationClose,
    gameTerminated,
    liveFrame,
  } = useMonitoring(
    {
      user_id: String(user_id || ""),
      discipline_id: gameData?.selectedDiscipline?.disc_id ? String(gameData.selectedDiscipline.disc_id) : "",
      event_id: String(event_id || ""),
    },
    monitoringEnabled,
  ) // Pass monitoring enabled status


  

  // const lastAlertTimeRef = useRef<string | null>(null);




  // const { data} = fetchPhoneAlerts(
  //   event_id!,
  //   String(gameData?.selectedDiscipline?.disc_id),
  //   user_id!,
  //   monitoringEnabled,
  //   lastAlertTimeRef.current
  // );
  // useEffect(() => {
  //   if (!data?.phone?.length) return;

  //   const latestTime = data.phone[data.phone.length - 1].log_time;
  //   lastAlertTimeRef.current = latestTime;
  // }, [data]);


  

  // const discipline_id = gameData?.selectedDiscipline?.disc_id
  //     ? String(gameData.selectedDiscipline.disc_id)
  //     : "";

  // const wsRef = useRef<WebSocket | null>(null);

  // // const passcode = localStorage.getItem('passcode')

  // useEffect(() => {
  //   const ws = new WebSocket(`${SocketURL}/phone/${discipline_id}/${event_id}/${user_id}`);
  //   wsRef.current = ws;

  //   ws.onopen = () => {
  //     console.log("✅ WebSocket connected to phone monitoring");
  //   };

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);

  //     if (data.type === "monitoring") {
  //       // Update any proctoring data
  //       console.log("data response" , data)

  //       // Render the phone image
  //       // if (data.imgData && canvasRef.current) {
  //       //   const img = new Image();
  //       //   img.src = data.imgData; // imgData comes directly from phone
  //       //   img.onload = () => {
  //       //     const canvas = canvasRef.current!;
  //       //     const ctx = canvas.getContext("2d")!;
  //       //     canvas.width = img.width;
  //       //     canvas.height = img.height;
  //       //     ctx.drawImage(img, 0, 0);
  //       //   };
  //       // }
  //     }
  //   };

  //   ws.onerror = (err) => {
  //     console.error("WebSocket error:", err);
  //   };

  //   ws.onclose = () => {
  //     console.log("⚠️ WebSocket disconnected");
  //   };

  //   return () => ws.close();
  // }, [SocketURL, discipline_id, event_id, user_id]);



  // Auto-submit score when game is terminated
  useEffect(() => {
    if (gameTerminated && gameData) {
      console.log("🚨 Game terminated, auto-submitting score...")
      handleGameComplete(currentScore, true) // true indicates auto-submission due to termination
    }
  }, [gameTerminated, gameData, currentScore])

  // Check event time every minute
  useEffect(() => {
    if (!gameData?.eventDetails) return

    const checkEventTime = () => {
      const now = new Date()
      const eventEnd = new Date(gameData.eventDetails.event_end)

      if (now > eventEnd) {
        console.log("⏰ Event time has expired during game")
        setShowEventEndedPopup(true)
      }
    }

    // Check immediately
    checkEventTime()

    // Check every 30 seconds during game
    const interval = setInterval(checkEventTime, 30000)

    return () => clearInterval(interval)
  }, [gameData])

  useEffect(() => {
    if (!monitoringStartedRef.current && gameStarted && gameData && user_id) {
      if (!monitoringEnabled) return;

      if (isFullScreen) {
        console.log("🔍 Starting monitoring");
        startMonitoring();
        monitoringStartedRef.current = true;
      } else {
        console.log("⚠️ Fullscreen not active. Monitoring paused.");
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "pause_monitoring" }));
        }
      }
    }
  }, [gameStarted, gameData, user_id, isFullScreen, monitoringEnabled, startMonitoring]);


  useEffect(() => {
    // Block browser back button during game
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      window.history.pushState(null, "", window.location.href)
    }

    window.history.pushState(null, "", window.location.href)
    window.addEventListener("popstate", handlePopState)

    // Validate game access and extract data
    if (state && state.config && state.fromEvent && event_id && discipline) {
      console.log("🎮 Game starting with state:", state)

      if (!state.selectedDiscipline) {
        console.error("❌ No selected discipline in state")
        navigate(`/events/${event_id}`, { replace: true })
        return
      }

      if (!state.eventDisciplines || state.eventDisciplines.length === 0) {
        console.error("❌ No event disciplines data in state")
        navigate(`/events/${event_id}`, { replace: true })
        return
      }

      if (!state.eventDetails) {
        console.error("❌ No event details in state")
        navigate(`/events/${event_id}`, { replace: true })
        return
      }

      // Check if event has already ended
      const now = new Date()
      const eventEnd = new Date(state.eventDetails.event_end)
      if (now > eventEnd) {
        console.log("⏰ Event has already ended, redirecting to event page")
        navigate(`/events/${event_id}`, { replace: true })
        return
      }

      // Check monitoring status from event details
      const eventMonitoringEnabled = state.eventDetails.monitoring === 1
      setMonitoringEnabled(eventMonitoringEnabled)

      console.log(
        `🔍 Event monitoring status: ${eventMonitoringEnabled ? "ENABLED" : "DISABLED"} (monitoring: ${state.eventDetails.monitoring})`,
      )

      // Set up game data
      const gameInfo = {
        selectedDiscipline: state.selectedDiscipline,
        event_id: event_id,
        eventDisciplines: state.eventDisciplines,
        eventDetails: state.eventDetails,
        config: state.config,
        eventName: state.eventName || "Memory Championship",
      }

      console.log("✅ Game data prepared:", gameInfo)
      console.log("✅ Selected discipline disc_id:", state.selectedDiscipline.disc_id)
      console.log("✅ Selected discipline name:", state.selectedDiscipline.discipline_name)

      setGameData(gameInfo)
      setGameStarted(true)
    } else {
      console.log("❌ Invalid game access, redirecting to event view")
      console.log("Missing data:", {
        hasState: !!state,
        hasConfig: !!(state && state.config),
        fromEvent: !!(state && state.fromEvent),
        event_id,
        discipline,
      })
      navigate(`/events/${event_id}`, { replace: true })
      return
    }

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [state, event_id, discipline, navigate])

  // Function to format time as MM:SS
  const formatRecallTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}min:${seconds.toString().padStart(2, "0")}sec`
  }

  // Function to handle automatic score submission when event ends
  const handleEventEndedSubmission = async () => {
    // Capture submit time for event end
    const currentSubmitTime = new Date().toISOString()
    setSubmitTime(currentSubmitTime)
    console.log("⏰ Event ended - Game submitted at:", currentSubmitTime)

    // Calculate recall time if we have a start time
    let formattedRecallTime: string | undefined
    if (recallStartTime) {
      const recallTime = Date.now() - recallStartTime
      formattedRecallTime = formatRecallTime(recallTime)
      console.log("⏱️ Total recall phase time (event ended):", formattedRecallTime)
    } else {
      console.log("⚠️ Recall start time not recorded (event ended)")
    }

    console.log("⏰ Handling automatic score submission due to event end")

    // Get current score from game component if available
    let finalScore = currentScore
    if (gameComponentRef.current && typeof gameComponentRef.current.getCurrentScore === "function") {
      finalScore = gameComponentRef.current.getCurrentScore()
    }

    // Stop monitoring if it was enabled
    if (monitoringEnabled && isMonitoring) {
      console.log("Monitoring Stopped due to event end")
      stopMonitoring()
    }

    if (!gameData) {
      console.error("❌ No game data available for event end submission")
      navigate(`/events/${event_id}`, { replace: true })
      return
    }

    try {
      // Prepare submission data
      const { selectedDiscipline, event_id } = gameData
      const disc_id = selectedDiscipline?.disc_id
      const calc_score = finalScore

      if (!event_id || !disc_id) {
        console.error("❌ Missing required fields for event end submission", { event_id, disc_id })
        navigate(`/events/${event_id}`, { replace: true })
        return
      }

      const result = await submitEventScore(Number(event_id), calc_score, disc_id, {
        isTerminated: false,
        timeTaken: formattedRecallTime,
      })
      console.log("✅ Score auto-submitted due to event end:", result)

      // Exit fullscreen before navigating
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }

      // Navigate back to event page with success message
      navigate(`/events/${event_id}`, {
        replace: true,
        state: {
          eventEndedSubmission: true,
          submittedScore: finalScore,
          disciplineName: gameData.selectedDiscipline.discipline_name,
        },
      })
    } catch (error) {
      console.error("❌ Failed to auto-submit score due to event end:", error)

      // Exit fullscreen before navigating
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }

      // Navigate back anyway, but with error info
      navigate(`/events/${event_id}`, {
        replace: true,
        state: {
          eventEndedSubmissionError: true,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    }
  }
  // const wsRef = useRef<WebSocket | null>(null);
  // useEffect(() => {
  //   if (dialogOpen) {
  //     stopMonitoring()
  //     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  //       wsRef.current.send(JSON.stringify({ type: "stop_monitoring" }));
  //       console.log("📡 Sent resume_monitoring to phone");
  //     }
  //   }
  // }, [dialogOpen, stopMonitoring])

  const handleClose = async () => {
    console.log("🔄 Closing dialog")
    // await startMonitoring()
    closeDialog()
    // setShowSubmitPopup(false)
  }

  // Function to handle game completion and submit score
  const handleGameComplete = async (score: number, isAutoSubmission = false) => {
    // Capture submit time
    const currentSubmitTime = new Date().toISOString()
    setSubmitTime(currentSubmitTime)
    console.log("🕒 Game submitted at:", currentSubmitTime)
    console.log(submitTime)

    // Calculate and log recall time if we have a start time
    let formattedRecallTime: string | undefined
    if (recallStartTime) {
      const recallTime = Date.now() - recallStartTime
      formattedRecallTime = formatRecallTime(recallTime)
      console.log("⏱️ Total recall phase time:", formattedRecallTime)
    } else {
      console.log("⚠️ Recall start time not recorded")
    }

    console.log(`🏁 Game completed with score: ${score} (Auto: ${isAutoSubmission})`)
    setCurrentScore(score)

    // Stop monitoring if it was enabled (only if not already stopped by termination)
    if (monitoringEnabled && isMonitoring && !gameTerminated) {
      console.log("Monitoring Stopped")
      stopMonitoring()
    }

    if (!gameData) {
      console.error("❌ No game data available")
      setSubmitResult({
        score,
        submissionSuccess: false,
        submissionError: "Missing game data. Score cannot be submitted.",
        disciplineName: "Unknown",
        disciplineId: 0,
        eventName: "Unknown Event",
      })
      setShowSubmitPopup(true)
      return
    }

    try {
      // Prepare submission data using the selected discipline and event disciplines
      const { selectedDiscipline, event_id } = gameData
      const disc_id = selectedDiscipline?.disc_id
      const calc_score = score

      if (!event_id || !disc_id || calc_score == null) {
        console.error("❌ Missing required fields", { event_id, disc_id, calc_score })
        return
      }

      const result = await submitEventScore(Number(event_id), calc_score, disc_id, {
        isTerminated: isAutoSubmission,
        timeTaken: formattedRecallTime,
      })
      console.log("✅ Score submitted successfully:", result)

      // Set successful result
      setSubmitResult({
        score,
        submissionSuccess: true,
        disciplineName: gameData.selectedDiscipline.discipline_name,
        disciplineId: gameData.selectedDiscipline.disc_id,
        eventName: gameData.eventName,
      })
    } catch (error) {
      console.error("❌ Failed to submit event score:", error)

      // Set failed result
      setSubmitResult({
        score,
        submissionSuccess: false,
        submissionError: error instanceof Error ? error.message : "Unknown error",
        disciplineName: gameData.selectedDiscipline.discipline_name,
        disciplineId: gameData.selectedDiscipline.disc_id,
        eventName: gameData.eventName,
      })
    }

    // Only show popup if not auto-submission due to termination
    if (!isAutoSubmission) {
      setShowSubmitPopup(true)
    }
  }

  // Function to handle game restart/close
  const handleGameRestart = async () => {
    console.log("🔄 Game closed, returning to event view")
    if (monitoringEnabled && isMonitoring) {
      stopMonitoring()
    }

    // Exit fullscreen before navigating
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.error("Error exiting fullscreen:", error)
      }
    }

    navigate(`/events/${event_id}`, { replace: true })
  }

  // Function to close submit popup
  const handleCloseSubmitPopup = async () => {
    console.log("🔄 Submit popup closed")
    setShowSubmitPopup(false)
    setSubmitResult(null)

    // Exit fullscreen and navigate back
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.error("Error exiting fullscreen:", error)
      }
    }
  }

  // Function to update current score during game
  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score)
  }

  // Function to handle when recall phase starts
  const handleRecallPhaseStart = () => {
    const startTime = Date.now()
    setRecallStartTime(startTime)
    console.log("🕐 Recall phase started at:", new Date(startTime).toISOString())
  }

  // Validate access
  if (!state || !state.config || !state.fromEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 flex items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Game Access</h2>
          <p className="text-gray-300 mb-6">Please start the game properly through the event challenge flow.</p>
          <button
            onClick={() => navigate(`/events/${event_id}`, { replace: true })}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Event
          </button>
        </div>
      </div>
    )
  }

  const decodedDiscipline = decodeURIComponent(discipline || "")
  const parsedTime = Number.parseInt(decodedDiscipline?.split("-")[0] || "0")
  const formattedTime = isNaN(parsedTime) ? 0 : parsedTime

  // Don't render game until properly started
  if (!gameStarted || !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Initializing game...</div>
      </div>
    )
  }

  const gameComponent = (() => {
    const disciplineLower = decodedDiscipline.toLowerCase()
    console.log("🎮 Selecting game component for:", disciplineLower)

    // Create a properly typed allDisciplines array for game components
    const allDisciplines: DisciplineData[] = gameData.eventDisciplines.map((d) => ({
      disc_id: d.disc_id,
      discipline_name: d.discipline_name,
      discipline_description: `Memory challenge for ${d.discipline_name}.`, // Provide a default description
      status: d.status,
      formula: "score * 1.0", // Placeholder, as these might not be in EventDiscipline
      standard: 100, // Placeholder
    }))

    const commonProps = {
      ref: gameComponentRef,
      paused: gamePaused || gameTerminated, // Pause game if terminated
      onRestart: handleGameRestart,
      disciplineName: decodedDiscipline,
      allDisciplines: allDisciplines,
      onGameComplete: (score: number) => handleGameComplete(score, false),
      onScoreUpdate: handleScoreUpdate,
      onRecallPhaseStart: handleRecallPhaseStart,
    }

    if (disciplineLower.includes("numbers")) {
      console.log("🔢 Loading Numbers Game")
      return (
        <NumbersGame
          {...commonProps}
          time={formattedTime}
          config={{
            grouping: gameData.config.grouping || 4,
            drawEvery: gameData.config.drawEvery,
            highlightColor: gameData.config.highlightColor || "#00ffcc",
          }}
        />
      )
    } else if (disciplineLower.includes("binary")) {
      console.log("💻 Loading Binary Game")
      return (
        <BinaryGame
          {...commonProps}
          time={formattedTime}
          config={{
            grouping: gameData.config.grouping || 1,
            drawEvery: gameData.config.drawEvery || 0,
            highlightColor: gameData.config.highlightColor || "#facc15",
          }}
        />
      )
    } else if (disciplineLower.includes("images")) {
      console.log("🖼️ Loading Images Game")
      return (
        <ImagesGame
          {...commonProps}
          time={formattedTime}
          highlightColor={gameData.config.highlightColor || "#00ffcc"}
          images={gameData.config.images || []}
        />
      )
    } else if (disciplineLower.includes("dates")) {
      console.log("📅 Loading Dates Game")
      return <DatesGame {...commonProps} hoverColor={gameData.config.hoverColor || "#00ffcc"} />
    } else if (disciplineLower.includes("words")) {
      console.log("📝 Loading Words Game")
      return (
        <WordsGame
          {...commonProps}
          time={formattedTime}
          highlightColor={gameData.config.highlightColor || "#00ffcc"}
          highlightGroupSize={gameData.config.highlightGroupSize || 4}
          showGroupedWords={gameData.config.showGroupedWords || false}
          category={gameData.config.category || "easy"}
        />
      )
    } else if (disciplineLower.includes("faces") || disciplineLower.includes("names")) {
      console.log("👥 Faces Game - Coming Soon")
      return (
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Faces Game Coming Soon</h2>
          <p className="mb-6">This discipline is currently under development.</p>
          <button
            onClick={handleGameRestart}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Event
          </button>
        </div>
      )
    } else {
      console.log("❓ Unknown discipline type:", disciplineLower)
      return (
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Unknown Game: {decodedDiscipline}</h2>
          <p className="mb-6">This discipline type is not recognized.</p>
          <div className="mb-6 text-sm text-gray-300">
            <p>Discipline: {decodedDiscipline}</p>
            <p>Lowercase: {disciplineLower}</p>
            <p>Available games: Numbers, Binary, Images, Dates, Words, Faces</p>
          </div>
          <button
            onClick={handleGameRestart}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Event
          </button>
        </div>
      )
    }
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-950 text-white">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Event Context Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">{gameData.eventName}</h1>
            <h2 className="text-xl text-indigo-300">{gameData.selectedDiscipline.discipline_name}</h2>

            {/* Monitoring Status Badge */}
            <div className="flex justify-center mt-3">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  monitoringEnabled
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {monitoringEnabled ? (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Monitoring ON
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-4 h-4 mr-1" />
                    Monitoring OFF
                  </>
                )}
              </div>
            </div>

            {/* Warning Count Display */}
            {warningCount > 0 && (
              <div className="flex justify-center mt-2">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    warningCount >= 3
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : warningCount >= 2
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Warnings: {warningCount}/3
                </div>
              </div>
            )}
          </div>

          {gameComponent}
        </div>
      </div>

      {/* Event Ended Popup */}
      {showEventEndedPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full">
            {/* Icon */}
            <div className="text-center mb-4">
              <Clock className="w-16 h-16 text-orange-400 mx-auto mb-3" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">Event Time Ended</h2>

            {/* Message */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
              <p className="text-orange-400 text-center">
                ⏰ The event time has ended. Your current score will be automatically submitted and you'll be returned
                to the event page.
              </p>
            </div>

            {/* Current Score Display */}
            <div className="bg-white/5 rounded-xl p-4 mb-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-2xl font-bold text-white">{currentScore}</span>
              </div>
              <p className="text-gray-300 text-sm">Current Score</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleEventEndedSubmission}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Submit Score & Return to Event
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 w-64 rounded-lg overflow-hidden z-50 border-2 border-indigo-500 bg-white shadow-lg">
        {!monitoringEnabled ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-600">
            ⏳ Waiting 30s before monitoring starts...
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 p-2 bg-white">
            {liveFrame?.image_path ? (
              <li className="relative border rounded overflow-hidden bg-gray-100">
                <img
                  src={`${API_BASE_URL}/${liveFrame.image_path}`}
                  alt="Phone live"
                  className="w-full h-24 object-cover transition-opacity duration-300 ease-in-out"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </li>
            ) : (
              <div className="col-span-2 text-center text-sm text-gray-500">
                No images detected
              </div>
            )}
          </ul>
        )}
      </div>



      {/* Fullscreen Warning - Only show if monitoring is enabled */}
      {!isFullScreen && isMonitoring && monitoringEnabled && !gameTerminated && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">⚠ Game Paused - Fullscreen exited</h2>
            <p className="text-gray-800 mb-4">Please re-enter fullscreen mode to resume the game.</p>
            <button
              onClick={async () => {
                try {
                  await document.documentElement.requestFullscreen()
                } catch (error) {
                  console.error("Error entering fullscreen:", error)
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Re-enter Fullscreen
            </button>
          </div>
        </div>
      )}

      <WarningDialog
        open={dialogOpen && !gameTerminated}
        title={warningTitle}
        totalWarnings={warningCount}
        onClose={handleClose}
        lastWarningType={lastType}
      />

      {/* Game Termination Popup */}
      {showTerminationPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full">
            {/* Icon */}
            <div className="text-center mb-4">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-3" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">Game Terminated</h2>

            {/* Message */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-center mb-3">
                🚨 Your game has been terminated due to excessive monitoring violations (3 or more).
              </p>

              {/* Violation History */}
              <div className="bg-black/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                <h4 className="text-sm font-semibold text-red-300 mb-2">Violations Detected:</h4>
                <ul className="text-xs text-red-200 space-y-1">
                  {violationHistory.map((violation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>{violation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Return Button */}
            <button
              onClick={handleTerminationClose}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>Return to Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      

      {/* Submit Score Popup - Only show if not terminated */}
      {showSubmitPopup && submitResult && !gameTerminated && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full relative">
            {/* Close Button */}
            <button
              onClick={handleCloseSubmitPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Success/Error Icon */}
            <div className="text-center mb-4">
              {submitResult.submissionSuccess ? (
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
              ) : (
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {submitResult.submissionSuccess ? "Score Submitted!" : "Submission Failed"}
            </h2>

            {/* Score Display */}
            <div className="bg-white/5 rounded-xl p-4 mb-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-2xl font-bold text-white">{submitResult.score}</span>
              </div>
              <p className="text-gray-300 text-sm">Your Score</p>
            </div>

            {/* Event Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Event:</span>
                <span className="text-white">{submitResult.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Discipline:</span>
                <span className="text-white">{submitResult.disciplineName}</span>
              </div>
            </div>

            {/* Status Message */}
            <div
              className={`rounded-lg p-3 mb-4 text-center ${
                submitResult.submissionSuccess
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <p className={`text-sm ${submitResult.submissionSuccess ? "text-green-400" : "text-red-400"}`}>
                {submitResult.submissionSuccess
                  ? "✅ Your score has been successfully submitted!"
                  : `❌ ${submitResult.submissionError}`}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseSubmitPopup}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventGamePage
