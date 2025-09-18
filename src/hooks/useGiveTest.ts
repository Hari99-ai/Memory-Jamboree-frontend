
"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { give_test, logKeyboardEvent, window_events } from "../lib/api"
import { useCallback, useEffect, useRef, useState } from "react"
import type { MonitoringData } from "../types"
import toast from "react-hot-toast"
import { api, API_BASE_URL } from "../lib/client"
import { useNavigate, useParams } from "react-router-dom"

const directionMap = {
  Straight: 0,
  Up: 1,
  Down: 2,
  Left: 3,
  Right: 4,
  Blink: 5,
}

const DISTURBANCE_THRESHOLD = 25
const DISTURBANCE_DURATION_LIMIT = 3
let disturbanceCount = 0

export function useMonitoring(config: MonitoringData, enabled = true) {
  const { event_id } = useParams()
  const navigate = useNavigate()
  const token = sessionStorage.getItem("auth_token")
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(true)
  const [gamePaused, setGamePaused] = useState(false)
  
  const isMonitoringRef = useRef(false)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const keyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null)
  const contextMenuRef = useRef<((e: MouseEvent) => void) | null>(null)
  const copyRef = useRef<() => void>(() => handleClipboard("copy"))
  const pasteRef = useRef<() => void>(() => handleClipboard("paste"))
  const cutRef = useRef<() => void>(() => handleClipboard("cut"))
  const handleWindowChangeRef = useRef<((e?: any) => void) | null>(null)

  const [warningCount, setWarningCount] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [warningTitle, setWarningTitle] = useState("")
  const [lastType, setLastType] = useState("")

  // Critical: Control monitoring API calls based on dialog state
  const [monitoringPaused, setMonitoringPaused] = useState(false)
  const monitoringPausedRef = useRef(false)

  const [violationHistory, setViolationHistory] = useState<string[]>([])
  const [showTerminationPopup, setShowTerminationPopup] = useState(false)
  const [gameTerminated, setGameTerminated] = useState(false)

  const alertQueueRef = useRef<string[]>([])
  const focus_loss_count = useRef<number>(0)
  // const isFocusCooldown = useRef(false);
  const foucus_warn_count = useRef<number>(0)



  const triggerAlert = (message: string) => {
    if (!enabled) return
    if (alertQueueRef.current.length >= 2) {
      const oldToastId = alertQueueRef.current.shift()
      if (oldToastId) toast.dismiss(oldToastId)
    }
    const id = toast.error(message, {
      duration: 3000,
    })
    alertQueueRef.current.push(id)

    setTimeout(() => {
      alertQueueRef.current = alertQueueRef.current.filter((toastId) => toastId !== id)
    }, 3000)
  }

  const logToWindow = (msg: string) => {
    console.log(msg)
    const el = document.getElementById("console-logs")
    if (el) {
      const p = document.createElement("p")
      p.textContent = msg
      el.appendChild(p)
      el.scrollTop = el.scrollHeight
    }
  }

  const alertTimeouts = {
    phone: null as NodeJS.Timeout | null,
    multiplePeople: null as NodeJS.Timeout | null,
    focus: null as NodeJS.Timeout | null,
    person_count: null as NodeJS.Timeout | null,
  }

  const clearExistingTimeout = (key: keyof typeof alertTimeouts) => {
    if (alertTimeouts[key]) {
      clearTimeout(alertTimeouts[key]!)
      alertTimeouts[key] = null
    }
  }

  // Function to pause monitoring API calls
  const pauseMonitoring = useCallback(() => {
    console.log("⏸️ Pausing monitoring API calls due to warning dialog...")
    setMonitoringPaused(true)
    monitoringPausedRef.current = true
    logToWindow("⏸️ Monitoring API calls paused - Dialog open")
  }, [])

  // Function to resume monitoring API calls
  const resumeMonitoring = useCallback(() => {
    console.log("▶️ Resuming monitoring API calls after user confirmation...")
    setMonitoringPaused(false)
    monitoringPausedRef.current = false
    logToWindow("▶️ Monitoring API calls resumed - User confirmed understanding")
  }, [])


  const raiseViolation = (violationType: string) => {
  setWarningCount((prev) => {
    const next = prev + 1;
    setLastType(violationType);
    setViolationHistory((prevHistory) => [
      ...prevHistory,
      `${new Date().toLocaleTimeString()}: ${violationType}`,
    ]);
    if (next === 1) {
      pauseMonitoring();
      triggerAlert(`⚠️ First Warning: ${violationType}`);
      setWarningTitle("⚠️ First Warning!");
      setDialogOpen(true);
    } else if (next === 2) {
      pauseMonitoring();
      triggerAlert(`⚠️ Second Warning: ${violationType}`);
      setWarningTitle("⚠️ Second Warning - Final Chance!");
      setDialogOpen(true);
    } else if (next >= 3) {
      console.log(`🚨 Third warning:${violationType}`);
      setWarningTitle("⚠️ Game Terminated!");
      setDialogOpen(true);
      pauseMonitoring();
      setTimeout(() => {
        handleGameTermination();
      }, 1000);
    }
    return next;
  });
};


  const processAlerts = (alertSource: "phone" | "desktop", data: any) => {
    console.log(`🚨 Processing alerts from: ${alertSource}`, data);

    if (data?.wstatus === 1) {
      handleGameTermination();
      return;
    }

    if (data.warning?.phone_detection == 1 || data.phone_detected) {
      raiseViolation("Phone detected");
    }

    if (data.warning?.multiple_person == 1 || data.person_count > 0 || data.person_status == 1) {
      raiseViolation("Multiple people detected");
    }

    if (alertSource === "desktop" || data.warning?.active_person < 1) {
      console.log("Active person 🤖🤖🤖🤖🤖🤖🤖" , data.active_person)
      raiseViolation("No person found");
    }
    
    if (
      data.final_focus &&
      (data.final_focus.includes("Incorrect Position (Distracted)") ||
        data.final_focus.includes("Warning: Partial Distraction"))
    ) {
      console.log("focus warn count 🚀🚀🚀🚀🚀🚀" , foucus_warn_count)
      foucus_warn_count.current += 1
      if (foucus_warn_count.current > 3){
        foucus_warn_count.current = 0
        triggerAlert("🚨 Your Focus is Losing. See the screen")
        console.log("focus loosoe count 🔥🔥🔥🔥🔥" , focus_loss_count)
        focus_loss_count.current += 1
      }
    }

    // Desktop-only: focus loss
    if (alertSource === "desktop" && (foucus_warn_count.current > 5)) {
      foucus_warn_count.current = 0; // reset after violation
      focus_loss_count.current = 0
      raiseViolation("Your focus continuously lost");
    }

    // Desktop-only: continuous disturbance
    if (alertSource === "desktop" && (disturbanceCount > 5 || data.disturbanceCount > 5)) {
      disturbanceCount = 0; // reset after violation
      raiseViolation("Continuously Voice Detected");
    }
  };




  const { data: phoneData } = useQuery({
    queryKey: ["phone-warnings", config.event_id, config.discipline_id, config.user_id],
    queryFn: async () => {
      const res = await api.get(
        `/phone-warnings?event_id=${config.event_id}&disc_id=${config.discipline_id}&user_id=${config.user_id}`
      );
      return res.data;
    },
    refetchInterval: 2000, // poll every 2s
  });

  useEffect(() => {
    // if (!phoneData) return;

    // console.log("📱🔥 Phone Data:", phoneData);

    // // 🚨 Stop game if monitoring stopped
    // if (phoneData.wstatus === 1) {
    //   handleGameTermination();
    // }

    // // 🚨 Show warnings only if latest log exists
    // if (phoneData.warning) {
    //   if (phoneData.warning.phone_detection == 1) {
    //     triggerAlert("🚨📱 Phone detected");
    //     setDialogOpen(true)
    //   }
    //   if (phoneData.warning.person_status == 1) {
    //     triggerAlert("🚨🕵️ Person Detected ");
    //     setDialogOpen(true)
    //   }
    // }

    if (!phoneData) return;
    processAlerts("phone", phoneData);

  }, [phoneData]);



  // const focus_loss_count  = useRef(Number(0))

  const { mutate: sendTestData } = useMutation({
    mutationFn: (formData: FormData) => give_test(formData),
    onSuccess: (data) => {
      if (!enabled || monitoringPausedRef.current) return;
      processAlerts("desktop", data);
      
      // logToWindow(`✅ Data sent: ${JSON.stringify(data)}`)
      // if (!enabled) return

      // if (monitoringPausedRef.current) {
      //   console.log("⏸️ Monitoring paused - Ignoring API response while dialog is open")
      //   return
      // }

      // if (
      //   data.final_focus &&
      //   (data.final_focus.includes("Incorrect Position (Distracted)") ||
      //     data.final_focus.includes("Warning: Partial Distraction"))
      // ) {
      //   console.log("focus warn count 🚀🚀🚀🚀🚀🚀" , foucus_warn_count)
      //   foucus_warn_count.current += 1
      //   if (foucus_warn_count.current > 3){
      //     foucus_warn_count.current = 0
      //     triggerAlert("🚨 Your Focus is Losing. See the screen")
      //     console.log("focus loosoe count 🔥🔥🔥🔥🔥" , focus_loss_count)
      //     focus_loss_count.current += 1
      //   }
      // }
      // // Check for violations
      // if (
      //   data.phone_detected || 
      //   data.person_status || 
      //   data.person_count < 1 || 
      //   focus_loss_count.current > 5 ||  
      //   disturbanceCount > 5
      // ) {
      //   let violationType = "";

      //   if (data.phone_detected) {
      //     violationType = "Phone detected";
      //   } else if (data.person_status > 0) {
      //     violationType = "Multiple people detected";
      //   } else if (data.person_count < 1) {
      //     violationType = "No person found";
      //   } else if (disturbanceCount > 5) {
      //     violationType = "Continuously Voice Detected";
      //   } else if (focus_loss_count.current > 5) {
      //     violationType = "Your focus continuously lost";
      //   }

      //   focus_loss_count.current = 0;
      //   disturbanceCount = 0;

      //   setWarningCount((prev) => {
      //     const next = prev + 1
      //     setLastType(violationType)

      //     setViolationHistory((prevHistory) => [...prevHistory, `${new Date().toLocaleTimeString()}: ${violationType}`])

      //     // console.log(`🚨 Warning ${next}/3: ${violationType}`)

      //     if (next === 1) {
      //       pauseMonitoring()
      //       triggerAlert(`⚠️ First Warning: ${violationType}`)
      //       setWarningTitle("⚠️ First Warning!")
      //       setDialogOpen(true)
      //     } else if (next === 2) {
      //       pauseMonitoring()
      //       triggerAlert(`⚠️ Second Warning: ${violationType}`)
      //       setWarningTitle("⚠️ Second Warning - Final Chance!")
      //       setDialogOpen(true)
      //     }
      //     else if (next >= 3) {
      //       console.log("🚨 Third warning detected - Terminating game immediately")
      //       setWarningTitle("⚠️ Game Terminated!")
      //       setDialogOpen(true)
      //       pauseMonitoring()
      //       setTimeout(() => {
      //         handleGameTermination()
      //       }, 100)
      //     }
      //     return next
      //   })
      // }
      
      // if (!monitoringPausedRef.current) {
      //   if (data.person_count < 1) {
      //     clearExistingTimeout("person_count")
      //     alertTimeouts.person_count = setTimeout(() => {
      //       triggerAlert("🚨 No Person Found")
      //     }, 5000)
      //   } else {
      //     clearExistingTimeout("person_count")
      //   }
      //   // if (data.focus_loss_count > 2) {
      //   //   clearExistingTimeout("focus")
      //   //   alertTimeouts.focus = setTimeout(() => {
      //   //     triggerAlert("🚨 Your Focus is Losing. See the screen")
      //   //   }, 3000)
      //   // } else {
      //   //   clearExistingTimeout("focus")
      //   // }
      // }
    },

    onError: (err: any) => {
      if (!enabled) return

      console.error("Monitoring API error:", err)

      if (err) {
        logToWindow(`❌ Error: ${err.message || err}`)
        alert("Monitoring is not working. Please contact your admin.")
        navigate(`/events/${event_id}`)
      }
    },
  })

  const { mutate: window_logs } = useMutation({
    mutationFn: window_events,
    onSuccess: (data) => {
      if (!enabled) return
      logToWindow(`✅ Window event logged: ${JSON.stringify(data)}`)
    },
    onError: () => {
      if (!enabled) return
      logToWindow("❌ Failed to log window event")
    },
  })

  const keyboardLogMutation = useMutation({
    mutationFn: (keyboard_event: string) => logKeyboardEvent(config.discipline_id, config.user_id, keyboard_event),
    onSuccess: () => {
      if (!enabled) return
      logToWindow("✅ Keyboard event logged")
    },
    onError: (err: any) => {
      if (!enabled) return
      logToWindow(`❌ Keyboard logging failed: ${err.message}`)
    },
  })

  const getMicDb = async (analyser: AnalyserNode, dataArray: Uint8Array) => {
    analyser.getByteFrequencyData(dataArray)
    const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
    return Math.round(20 * Math.log10(volume || 1))
  }

  const handleClipboard = (type: "copy" | "paste" | "cut") => {
    if (!enabled) return
    logToWindow(`🚫 Clipboard action: ${type}`)
    triggerAlert(`Unethical activity: ${type.toUpperCase()} is not allowed.`)
  }

  const handleFullScreenChange = () => {
    const fullscreen = !!document.fullscreenElement
    setIsFullScreen(fullscreen)
    setGamePaused(!fullscreen)
  }

  useEffect(() => {
    if (!enabled) return
    
    handleWindowChangeRef.current = () => {
      if (!isMonitoringRef.current) return
      logToWindow("🚨 Window/tab changed")
      window_logs({
        discipline_id: Number(config.discipline_id),
        window_event: 1,
        user_id: Number(config.user_id),
        transaction_log: Date(),
      })
      triggerAlert("Unethical activity: Tab/window switch detected.")
    }
  }, [])

  const startAudioRecording = () => {
    if (!enabled) return

    if (!mediaStreamRef.current) return
    try {
      const audioStream = new MediaStream(mediaStreamRef.current.getAudioTracks())
      const recorder = new MediaRecorder(audioStream)
      recorderRef.current = recorder
      recordedChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        console.log("🛑 Audio recording stopped")

        const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" })
        const file = new File([audioBlob], "disturbance.webm", { type: "audio/webm" })

        const formData = new FormData()
        formData.append("audio", file)
        formData.append("user_id", config.user_id)
        formData.append("event_id", config.event_id)
        formData.append("discipline_id", config.discipline_id)

        fetch(`${API_BASE_URL}/record_audio`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => console.log("✅ Upload success:", data))
          .catch((err) => console.error("❌ Upload error:", err))
      }
      recorder.start()
      recordingTimeoutRef.current = setTimeout(() => recorder.stop(), 5000)
    } catch (err) {
      console.error("🎙️ Recording failed:", err)
      toast.error("🎙️ Failed to record audio.")
    }
  }

  const startMonitoring = async () => {
    if (!enabled) {
      console.log("🚫 Monitoring is disabled for this event")
      logToWindow("🚫 Monitoring is disabled for this event")
      setIsMonitoring(false)
      setGamePaused(false)
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    mediaStreamRef.current = stream

    const hasMic = stream.getAudioTracks().length > 0
    console.log("🎙️ Microphone access granted:", hasMic)

    const video = document.createElement("video")
    videoRef.current = video
    video.srcObject = stream
    video.muted = true
    await video.play()

    console.log("📹 Video is playing:", !video.paused)

    const audioCtx = new (window.AudioContext || window.AudioContext)()
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    source.connect(analyser)

    intervalRef.current = setInterval(async () => {
      // Check if game is terminated
      if (gameTerminated) {
        console.log("🚨 Game terminated, stopping monitoring interval")
        return
      }

      if (!document.fullscreenElement) {
        setIsFullScreen(false)
        setGamePaused(true)
        return
      } else {
        setIsFullScreen(true)
        setGamePaused(false)
      }

      const voice_db = await getMicDb(analyser, dataArray)

      if (voice_db > DISTURBANCE_THRESHOLD) {
        disturbanceCount++
        logToWindow(`🔊 Loud voice detected (${voice_db} dB)`)
      } else {
        disturbanceCount = 0
      }

      if (disturbanceCount >= DISTURBANCE_DURATION_LIMIT && !monitoringPausedRef.current) {
        disturbanceCount = 0
        triggerAlert("🚨 Continuous voice disturbance detected!")
        logToWindow("🎙️ Starting audio recording...")
        startAudioRecording()
      }

      // CRITICAL: Only send monitoring data if not paused and not terminated
      if (!monitoringPausedRef.current && !gameTerminated) {
        const canvas = document.createElement("canvas")
        if (!videoRef.current) return
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const imgData = canvas.toDataURL("image/jpeg")

        const formData = new FormData()
        formData.append("user_id", config.user_id)
        formData.append("event_id", config.event_id)
        formData.append("imgData", imgData)
        formData.append("discipline_id", config.discipline_id)
        formData.append("voice_db", voice_db.toString())
        formData.append("user_movements_updown", directionMap["Straight"].toString())
        formData.append("user_movements_lr", directionMap["Left"].toString())
        formData.append("user_movements_eyes", directionMap["Blink"].toString())

        console.log("📡 Sending monitoring data...")
        sendTestData(formData)
      } else if (monitoringPausedRef.current) {
        console.log("⏸️ Monitoring paused - Skipping API call while dialog is open")
      }
    }, 2000)

    // Event listeners for keyboard and other activities
    keyDownRef.current = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const combo = (event.ctrlKey ? "ctrl+" : "") + (event.altKey ? "alt+" : "") + (event.metaKey ? "meta+" : "") + key

      const forbidden: Record<string, string> = {
        "ctrl+c": "Copy",
        "ctrl+v": "Paste",
        "ctrl+a": "Select All",
        "ctrl+x": "Cut",
        "ctrl+t": "New Tab",
        "ctrl+w": "Close Tab",
        "ctrl+z": "Undo",
        "ctrl+u": "View Source",
        "ctrl+s": "Save",
        "ctrl+p": "Print",
        "alt+tab": "Switch Window",
        "alt+shift+tab": "Switch Window",
        "meta+tab": "Task View",
        f1: "Help",
        f12: "Dev Tools",
        printscreen: "Print Screen",
        meta: "Windows Key",
      }

      if (forbidden[combo]) {
        event.preventDefault()
        logToWindow(`🚫 Key detected: ${combo}`)
        keyboardLogMutation.mutate(combo)
        triggerAlert(`Unethical activity: ${forbidden[combo]} is not allowed.`)
      }
    }

    contextMenuRef.current = (e: MouseEvent) => {
      e.preventDefault()
      logToWindow("🚫 Right-click detected")
      triggerAlert("Unethical activity: Right-click is not allowed.")
    }

    window.addEventListener("blur", handleWindowChangeRef.current!)
    window.addEventListener("keydown", keyDownRef.current!)
    document.addEventListener("copy", copyRef.current)
    document.addEventListener("paste", pasteRef.current)
    document.addEventListener("cut", cutRef.current)
    document.addEventListener("contextmenu", contextMenuRef.current!)
    document.addEventListener("fullscreenchange", handleFullScreenChange)

    isMonitoringRef.current = true
    setGamePaused(false)
    setIsMonitoring(true)
    logToWindow("🎥 Monitoring started.")
  }

  const stopMonitoring = useCallback(() => {
    if (!enabled) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current)
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    videoRef.current?.remove()

    window.removeEventListener("blur", handleWindowChangeRef.current!)
    window.removeEventListener("keydown", keyDownRef.current!)
    document.removeEventListener("copy", copyRef.current)
    document.removeEventListener("paste", pasteRef.current)
    document.removeEventListener("cut", cutRef.current)
    document.removeEventListener("contextmenu", contextMenuRef.current!)
    document.removeEventListener("fullscreenchange", handleFullScreenChange)

    isMonitoringRef.current = false
    setIsMonitoring(false)
    setGamePaused(false)
    setMonitoringPaused(false)
    monitoringPausedRef.current = false
    logToWindow("🛑 Monitoring stopped.")
  }, [enabled])

  // Function to handle automatic game termination
  const handleGameTermination = useCallback(async () => {
    if (gameTerminated) return

    console.log("🚨 Game terminated due to excessive violations")
    setGameTerminated(true)

    // Stop monitoring immediately
    stopMonitoring()

    // Show termination popup
    setShowTerminationPopup(true)

    // Store violation history in sessionStorage for the event view page
    sessionStorage.setItem(
      "gameViolations",
      JSON.stringify({
        eventId: event_id,
        violations: violationHistory,
        terminatedAt: new Date().toISOString(),
      }),
    )
  }, [violationHistory, event_id, stopMonitoring, gameTerminated])

  // Function to handle termination popup close
  const handleTerminationClose = useCallback(async () => {
    setShowTerminationPopup(false)

    // Exit fullscreen if we're in it
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.error("Error exiting fullscreen:", error)
      }
    }

    // Navigate back to event page
    navigate(`/events/${event_id}`)
  }, [navigate, event_id])

  useEffect(() => {
    if (!enabled) return
    const checkFullScreen = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullScreen(isNowFullscreen)
      setGamePaused(!isNowFullscreen)
    }
    
    document.addEventListener("fullscreenchange", checkFullScreen)
    return () => {
      document.removeEventListener("fullscreenchange", checkFullScreen)
    }
  }, [enabled])

  // CRITICAL: Handle dialog close and resume monitoring
  const closeDialog = useCallback(() => {
    console.log("✅ User confirmed understanding of warning")
    setDialogOpen(false)

    // For warnings 1 and 2: Resume monitoring after user confirmation
    if (warningCount < 3) {
      console.log(`▶️ Resuming monitoring after warning ${warningCount} confirmation...`)
      resumeMonitoring()
    }
  }, [warningCount, resumeMonitoring])

  return {
    gamePaused,
    isMonitoring,
    isFullScreen,
    startMonitoring,
    stopMonitoring,
    closeDialog,
    warningCount,
    dialogOpen,
    warningTitle,
    lastType,
    violationHistory,
    showTerminationPopup,
    handleTerminationClose,
    gameTerminated,
    monitoringPaused,
  }
}




// "use client"

// import { useMutation } from "@tanstack/react-query"
// import { logKeyboardEvent, window_events } from "../lib/api"
// import { useCallback, useEffect, useRef, useState } from "react"
// import type { MonitoringData } from "../types"
// import toast from "react-hot-toast"
// import { API_BASE_URL, SocketURL } from "../lib/client"
// import { useNavigate, useParams } from "react-router-dom"
// // import { usePhoneMonitoring } from "./usePhoneMonitoring"
// // import { useQuery } from "@tanstack/react-query"

// // const directionMap = {
// //   Straight: 0,
// //   Up: 1,
// //   Down: 2,
// //   Left: 3,
// //   Right: 4,
// //   Blink: 5,
// // }

// export interface PhoneAlert {
//   phone_detection: number;
//   multiple_people: number;
//   person_status: number;
//   log_time: string;
//   external_img: string | File | undefined;
// }

// const DISTURBANCE_THRESHOLD = 30
// const DISTURBANCE_DURATION_LIMIT = 3
// let disturbanceCount = 0


// export function useMonitoring(config: MonitoringData, enabled = true) {
//   const { event_id } = useParams()
//   const navigate = useNavigate()
//   const token = sessionStorage.getItem("auth_token")
//   const [isMonitoring, setIsMonitoring] = useState(false)
//   const [isFullScreen, setIsFullScreen] = useState(true)
//   const [gamePaused, setGamePaused] = useState(false)
  
//   const isMonitoringRef = useRef(false)
//   const mediaStreamRef = useRef<MediaStream | null>(null)
//   const videoRef = useRef<HTMLVideoElement | null>(null)
//   const intervalRef = useRef<NodeJS.Timeout | null>(null)
//   const recorderRef = useRef<MediaRecorder | null>(null)
//   const recordedChunksRef = useRef<Blob[]>([])
//   const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
//   const [liveFrame, setLiveFrame] = useState<{
//     image_path?: string;
//     phone_detected?: boolean;
//     multiple_people?: boolean;
//     final_focus?: string;
//     [key: string]: any;
//   }>({});

//   const keyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null)
//   const contextMenuRef = useRef<((e: MouseEvent) => void) | null>(null)
//   const copyRef = useRef<() => void>(() => handleClipboard("copy"))
//   const pasteRef = useRef<() => void>(() => handleClipboard("paste"))
//   const cutRef = useRef<() => void>(() => handleClipboard("cut"))
//   const handleWindowChangeRef = useRef<((e?: any) => void) | null>(null)

//   const [warningCount, setWarningCount] = useState(0)
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const dialogRef = useRef(false);

//   const [warningTitle, setWarningTitle] = useState("")
//   const [lastType, setLastType] = useState("")

//   // Critical: Control monitoring API calls based on dialog state
//   const [monitoringPaused, setMonitoringPaused] = useState(false)
//   const monitoringPausedRef = useRef(false)

//   const [violationHistory, setViolationHistory] = useState<string[]>([])
//   const [showTerminationPopup, setShowTerminationPopup] = useState(false)
//   const [gameTerminated, setGameTerminated] = useState(false)

//   const alertQueueRef = useRef<string[]>([])

//   const [phoneStarted , setPhoneStarted] = useState(false)

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const triggerAlert = useCallback((message: string) => {
//     if (!enabled) return
//     if (alertQueueRef.current.length >= 2) {
//       const oldToastId = alertQueueRef.current.shift()
//       if (oldToastId) toast.dismiss(oldToastId)
//     }
//     const id = toast.error(message, {
//       duration: 3000,
//     })
//     alertQueueRef.current.push(id)

//     setTimeout(() => {
//       alertQueueRef.current = alertQueueRef.current.filter((toastId) => toastId !== id)
//     }, 3000)
//   })

//   const logToWindow = (msg: string) => {
//     console.log(msg)
//     const el = document.getElementById("console-logs")
//     if (el) {
//       const p = document.createElement("p")
//       p.textContent = msg
//       el.appendChild(p)
//       el.scrollTop = el.scrollHeight
//     }
//   }

//   // const alertTimeouts = {
//   //   phone: null as NodeJS.Timeout | null,
//   //   multiplePeople: null as NodeJS.Timeout | null,
//   //   focus: null as NodeJS.Timeout | null,
//   //   person_count: null as NodeJS.Timeout | null,
//   // }

//   // const clearExistingTimeout = (key: keyof typeof alertTimeouts) => {
//   //   if (alertTimeouts[key]) {
//   //     clearTimeout(alertTimeouts[key]!)
//   //     alertTimeouts[key] = null
//   //   }
//   // }

//   // Function to pause monitoring API calls
//   // const autoResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// // Updated pauseMonitoring
//   // --- Command Queue System ---

//   const pauseMonitoring = useCallback(() => {
//     console.log("⏸️ Pausing monitoring API calls due to warning dialog...")
//     setMonitoringPaused(true)
//     monitoringPausedRef.current = true
//     logToWindow("⏸️ Monitoring API calls paused - Dialog open")

//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN  && monitoringPausedRef.current) {
//       wsRef.current.send(JSON.stringify({ type: "pause_monitoring" }));
//       console.log("📡 Sent pause_monitoring to phone");
//     }
//   }, [])

//   // Function to resume monitoring API calls
//   const resumeMonitoring = useCallback(() => {
//     console.log("▶️ Resuming monitoring API calls...")
//     setMonitoringPaused(false)
//     monitoringPausedRef.current = false

//     // const ws = wsRef.current
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN  && monitoringPausedRef.current) {
//       wsRef.current.send(JSON.stringify({ type: "resume_monitoring" }))
//       console.log("📡 Sent resume_monitoring to phone")
//     } else {
//       console.log("⚠️ Cannot resume monitoring - WS not open")
//     }
//   }, [])

// // --- Stop Monitoring ---
//   const stopMonitoring = useCallback(() => {
//     if (!enabled) return
    
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify({ type: "stop_monitoring" }))
//       console.log("📡 Sent stop_monitoring request to backend")
//     }
      
//     if (intervalRef.current) clearInterval(intervalRef.current)
//     if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current)
//     mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
//     videoRef.current?.remove()

//     window.removeEventListener("blur", handleWindowChangeRef.current!)
//     window.removeEventListener("keydown", keyDownRef.current!)
//     document.removeEventListener("copy", copyRef.current)
//     document.removeEventListener("paste", pasteRef.current)
//     document.removeEventListener("cut", cutRef.current)
//     document.removeEventListener("contextmenu", contextMenuRef.current!)
//     document.removeEventListener("fullscreenchange", handleFullScreenChange)

//     isMonitoringRef.current = false
//     setIsMonitoring(false)
//     setGamePaused(false)
//     setMonitoringPaused(false)
//     monitoringPausedRef.current = false
//     logToWindow("🛑 Monitoring stopped.")
//   }, [enabled])

//   // Function to handle automatic game termination
//   const handleGameTermination = useCallback(async () => {
//     if (gameTerminated) return

//     console.log("🚨 Game terminated due to excessive violations")
//     setGameTerminated(true)

//     // Stop monitoring immediately
//     stopMonitoring()

//     // Show termination popup
//     setShowTerminationPopup(true)

//     // Store violation history in sessionStorage for the event view page
//     sessionStorage.setItem(
//       "gameViolations",
//       JSON.stringify({
//         eventId: event_id,
//         violations: violationHistory,
//         terminatedAt: new Date().toISOString(),
//       }),
//     )

//   }, [violationHistory, event_id, stopMonitoring, gameTerminated])


//   // Function to handle termination popup close
//   const handleTerminationClose = useCallback(async () => {
//     setShowTerminationPopup(false)

//     // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//     //   wsRef.current.send(JSON.stringify({ type: "stop_monitoring" }));
//     //   console.log("📡 Sent resume_monitoring to phone");
//     // }

//     // Exit fullscreen if we're in it
//     if (document.fullscreenElement) {
//       try {
//         await document.exitFullscreen()
//       } catch (error) {
//         console.error("Error exiting fullscreen:", error)
//       }
//     }
//     // Navigate back to event page
//     navigate(`/events/${event_id}`)
//   }, [navigate, event_id])


//   // const alertQueueRef = useRef<string[]>([]);
//   const isProcessingAlertRef = useRef(false);
//   const monitoringStoppedRef = useRef(false); 
//   // const [, setCurrentViolation] = useState<string | null>();
  
//   const lastAlertTimeRef = useRef<number>(0);

//   const processQueue = useCallback(() => {
//     if (isProcessingAlertRef.current || monitoringStoppedRef.current) return;
//     if (alertQueueRef.current.length === 0) return;

//     const now = Date.now();
//     if (now - lastAlertTimeRef.current < 2000) {
//       // Too soon, schedule next attempt after 2s
//       setTimeout(processQueue, 2000 - (now - lastAlertTimeRef.current));
//       return;
//     }
//     lastAlertTimeRef.current = now;

//     isProcessingAlertRef.current = true;
//     const nextViolation = alertQueueRef.current.shift()!;
    
//     setWarningCount((prev) => {
//       const nextCount = prev + 1;

//       // Don't show warnings after 3
//       if (nextCount > 3) {
//         isProcessingAlertRef.current = false;
//         processQueue(); // process next in queue
//         return prev;
//       }

//       if (nextCount === 1) setWarningTitle("⚠️ First Warning!");
//       else if (nextCount === 2) setWarningTitle("⚠️ Second Warning - Final Chance!");
//       else if (nextCount === 3) setWarningTitle("⚠️ Game Terminated!");

//       setLastType(nextViolation);
//       setViolationHistory((prev) => [...prev, `${getTimeStamp()}: ${nextViolation}`]);

//       setDialogOpen(true);
//       console.log(`⚠️ Warning ${nextCount}: ${nextViolation}`);

//       setTimeout(() => {
//         setDialogOpen(false);
//         if (nextCount >= 3) {
//           handleGameTermination();
//           stopMonitoring();
//           monitoringStoppedRef.current = true;
//           if (wsRef.current) {
//             wsRef.current.close();
//             wsRef.current = null;
//           }

//           navigate(`/events/${event_id}`);
//         } else {
//           resumeMonitoring();
//           isProcessingAlertRef.current = false;
//           processQueue(); // continue with next alert
//         }
//       }, 5000);

//       return nextCount;
//     });
//   }, [pauseMonitoring, resumeMonitoring, handleGameTermination, navigate, event_id, stopMonitoring]);


//   const wsRef = useRef<WebSocket | null>(null);
//   const focus_loss_count = useRef<number>(0)
//     // const isFocusCooldown = useRef(false);
//   const foucus_warn_count = useRef<number>(0)
//   const startWebSocket = useCallback(async (passcode: string) => {
        
//     if (!enabled) return;

//     const ws = new WebSocket(
//       `${SocketURL}/desktop/${config.discipline_id}/${config.event_id}/${config.user_id}`
//     );
//     wsRef.current = ws;
    
//     ws.onopen = () => {
//       console.log("✅ WebSocket connected, sending passcode...");
//       ws.send(JSON.stringify({ type: "verify", passcode }));

//       // if (monitoringPausedRef.current) {
//       //   ws.send(JSON.stringify({ type: "pause_monitoring" }));
//       //   console.log("🔄 Re-sent pause_monitoring on WS reconnect");
//       // } else {
//       //   ws.send(JSON.stringify({ type: "resume_monitoring" }));
//       //   console.log("🔄 Re-sent resume_monitoring on WS reconnect");
//       // }

//     };

//     ws.onmessage = async (event) => {
//       const response = JSON.parse(event.data);
//       console.log("🚨🚨🚨🚨🚨 WebSocket message received:", response);


//       console.log("Hi webscoekt recieved 🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️ ")

//       // Keep alive
//       if (response.type === "ping") {
//         ws.send(JSON.stringify({ type: "pong" }));
//         return;
//       }

//       if (response.type === "monitoring" && response.data?.source === "phone" && response.data?.image_path) {
//         setLiveFrame(response.data);
//         console.log("📷 Image path:", response.data.image_path);
//         return;
//       }

//       if (response.type === "phone_started") {
//         console.log("📱 Phone started monitoring");
//         toast.success("Phone monitoring started!");
//         setPhoneStarted(true); 
//       }

      
//     if (response.type === "phone_stopped") {
//       console.log("🛑 Phone monitoring stopped");
//       toast.success("Phone monitoring stopped!");
//       setPhoneStarted(false);
//       stopMonitoring();
//     }

//     if (response.type === "monitoring_stopped") {
//       console.log("🛑 Desktop notified: monitoring stopped");
//       stopMonitoring();
//     }

      
//     if (response.type === "phone_alert" || response.type === "desktop_alert" || response.data) {
//       const alertData = response.alert || response.data || {};
//       let violationType = "";


//       if (alertData.final_focus) {
//         focus_loss_count.current++;

//         // When focus_loss_count reaches 3, increment foucus_warn_count and reset focus_loss_count
//         if (focus_loss_count.current > 3) {
//           foucus_warn_count.current++;
//           focus_loss_count.current = 0; // reset for next batch
//           console.log(`⚠️ Focus warning count increased: ${foucus_warn_count.current}`);
//         }
//       }

//       console.log("violation 🚨🚨🚨🚨🚨🚨")
//       console.log("phone alert 📱📱📱📱📱" , alertData.phone_detected)

//       console.log("person_count 🕵️🕵️🕵️🕵️" , alertData.persons_status > 0)
//       console.log("NO person ❌❌❌❌❌" , alertData.person_count < 1)
//       if (alertData.phone_detected) violationType = "Phone detected";
//       else if (alertData.person_count < 1) violationType = "No Person Found";
//       else if (alertData.persons_status > 0 && alertData.multiple_people) violationType = "Multiple people detected";
//       else if (foucus_warn_count.current > 5) violationType = "Focus continuously lost";
//       else if (alertData.voice_detected > 5) violationType = "Continuous voice detected";

//       focus_loss_count.current = 0
//       foucus_warn_count.current = 0

//       if (violationType) {
//         alertQueueRef.current.push(violationType);
//         processQueue();
//       }
//       return;
//     }
      
  
//       // if ((response.type === "alert" || response.type === "desktop_alert") && response.from === "desktop") {
//       //   console.log("💻 Desktop info alert:", response.alert);
//       //   return;
//       // }

//       if (response.type === "disconnect") {
//         alert(response.message);
//         stopMonitoring();
//         ws.close();
//         return;
//       }

//       if (response.type === "phone_disconnected"){
//         alert("phone disconnected")
//         stopMonitoring()
//         navigate(`/events/${event_id}`)
//         if (wsRef.current) {
//           wsRef.current.close();
//           wsRef.current = null;
//         }
//       }

//       if (response.type === "desktop_disconnected") {
//         console.log("⚠️ Desktop disconnected, stopping phone side");
//         stopMonitoring();

//         if (wsRef.current) {
//           wsRef.current.close();
//           wsRef.current = null;
//         }
//       }
//     };

//     ws.onclose = () => console.log("❌ WebSocket disconnected");
//     ws.onerror = (err) => console.error("WebSocket error:", err);

//   }, [enabled, config.discipline_id, config.event_id, config.user_id, gameTerminated, triggerAlert, pauseMonitoring, handleGameTermination])

//   const { mutate: window_logs } = useMutation({
//     mutationFn: window_events,
//     onSuccess: (data) => {
//       if (!enabled) return
//       logToWindow(`✅ Window event logged: ${JSON.stringify(data)}`)
//     },
//     onError: () => {
//       if (!enabled) return
//       logToWindow("❌ Failed to log window event")
//     },
//   })

//   const keyboardLogMutation = useMutation({
//     mutationFn: (keyboard_event: string) => logKeyboardEvent(config.discipline_id, config.user_id, keyboard_event),
//     onSuccess: () => {
//       if (!enabled) return
//       logToWindow("✅ Keyboard event logged")
//     },
//     onError: (err: any) => {
//       if (!enabled) return
//       logToWindow(`❌ Keyboard logging failed: ${err.message}`)
//     },
//   })

//   const getMicDb = async (analyser: AnalyserNode, dataArray: Uint8Array) => {
//     analyser.getByteFrequencyData(dataArray)
//     const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
//     return Math.round(20 * Math.log10(volume || 1))
//   }

//   const handleClipboard = (type: "copy" | "paste" | "cut") => {
//     if (!enabled) return
//     logToWindow(`🚫 Clipboard action: ${type}`)
//     triggerAlert(`Unethical activity: ${type.toUpperCase()} is not allowed.`)
//   }

//   const handleFullScreenChange = () => {
//     const fullscreen = !!document.fullscreenElement
//     setIsFullScreen(fullscreen)
//     setGamePaused(!fullscreen)
//   }

//   useEffect(() => {
//     if (!enabled) return
    
//     handleWindowChangeRef.current = () => {
//       if (!isMonitoringRef.current) return
//       logToWindow("🚨 Window/tab changed")
//       window_logs({
//         discipline_id: Number(config.discipline_id),
//         window_event: 1,
//         user_id: Number(config.user_id),
//         transaction_log: Date(),
//       })
//       triggerAlert("Unethical activity: Tab/window switch detected.")
//     }
//   }, [])

//   const startAudioRecording = () => {
//     if (!enabled) return

//     if (!mediaStreamRef.current) return
//     try {
//       const audioStream = new MediaStream(mediaStreamRef.current.getAudioTracks())
//       const recorder = new MediaRecorder(audioStream)
//       recorderRef.current = recorder
//       recordedChunksRef.current = []

//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           recordedChunksRef.current.push(e.data)
//         }
//       }

//       recorder.onstop = () => {
//         console.log("🛑 Audio recording stopped")

//         const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" })
//         const file = new File([audioBlob], "disturbance.webm", { type: "audio/webm" })

//         const formData = new FormData()
//         formData.append("audio", file)
//         formData.append("user_id", config.user_id)
//         formData.append("event_id", config.event_id)
//         formData.append("discipline_id", config.discipline_id)

//         fetch(`${API_BASE_URL}/record_audio`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         })
//           .then((res) => res.json())
//           .then((data) => console.log("✅ Upload success:", data))
//           .catch((err) => console.error("❌ Upload error:", err))
//       }
//       recorder.start()
//       recordingTimeoutRef.current = setTimeout(() => recorder.stop(), 5000)
//     } catch (err) {
//       console.error("🎙️ Recording failed:", err)
//       toast.error("🎙️ Failed to record audio.")
//     }
//   }

//   const startMonitoring = async () => {
//     if (!enabled) {
//       console.log("🚫 Monitoring is disabled for this event")
//       logToWindow("🚫 Monitoring is disabled for this event")
//       setIsMonitoring(false)
//       setGamePaused(false)
//       return
//     }

//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//     mediaStreamRef.current = stream

//     const hasMic = stream.getAudioTracks().length > 0
//     console.log("🎙️ Microphone access granted:", hasMic)

//     const video = document.createElement("video")
//     videoRef.current = video
//     video.srcObject = stream
//     video.muted = true
//     await video.play()

//     console.log("📹 Video is playing:", !video.paused)

//     const passcode = localStorage.getItem("passcode");
//     await startWebSocket(passcode!);

//     const audioCtx = new (window.AudioContext || window.AudioContext)()
//     const source = audioCtx.createMediaStreamSource(stream)
//     const analyser = audioCtx.createAnalyser()
//     const dataArray = new Uint8Array(analyser.frequencyBinCount)
//     source.connect(analyser)

//     intervalRef.current = setInterval(async () => {
//       // Check if game is terminated
//       if (gameTerminated) {
//         console.log("🚨 Game terminated, stopping monitoring interval")
//         return
//       }

//       if (!document.fullscreenElement) {
//         setIsFullScreen(false)
//         setGamePaused(true)
//         return
//       } else {
//         setIsFullScreen(true)
//         setGamePaused(false)
//       }

//       const voice_db = await getMicDb(analyser, dataArray)

//       if (voice_db > DISTURBANCE_THRESHOLD) {
//         disturbanceCount++
//         logToWindow(`🔊 Loud voice detected (${voice_db} dB)`)
//         console.log("VOICE DETECTED 🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️" , disturbanceCount)
//       } else {
//         disturbanceCount = 0
//       }

//       if (disturbanceCount >= DISTURBANCE_DURATION_LIMIT && !monitoringPausedRef.current) {
//         disturbanceCount = 0
//         triggerAlert("🚨 Continuous voice disturbance detected!")
//         logToWindow("🎙️ Starting audio recording...")
//         startAudioRecording()
//       }

//       // CRITICAL: Only send monitoring data if not paused and not terminated
//       if (!monitoringPausedRef.current && !gameTerminated) {
//         const canvas = document.createElement("canvas")
//         if (!videoRef.current) return
//         canvas.width = videoRef.current.videoWidth
//         canvas.height = videoRef.current.videoHeight
//         const ctx = canvas.getContext("2d")
//         if (!ctx) return
//         ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
//         const imgData = canvas.toDataURL("image/jpeg")

//         // const formData = new FormData()
//         // formData.append("user_id", config.user_id)
//         // formData.append("event_id", config.event_id)
//         // formData.append("imgData", imgData)
//         // formData.append("discipline_id", config.discipline_id)
//         // formData.append("voice_db", voice_db.toString())
//         // formData.append("user_movements_updown", directionMap["Straight"].toString())
//         // formData.append("user_movements_lr", directionMap["Left"].toString())
//         // formData.append("user_movements_eyes", directionMap["Blink"].toString())

//         if (wsRef.current?.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({
//             type: "monitoring",
//             imgData,
//             voice_db,
//             user_id: config.user_id,
//             event_id: config.event_id,
//             discipline_id: config.discipline_id,
//           }));
//           logToWindow("📡 Monitoring data sent to server");
//         }
//         console.log("📡 Sending monitoring data...")
//         // sendTestData(formData)
//       } else if (monitoringPausedRef.current) {
//         console.log("⏸️ Monitoring paused - Skipping API call while dialog is open")
//       }
//     }, 1000)

//     // Event listeners for keyboard and other activities
//     keyDownRef.current = (event: KeyboardEvent) => {
//       const key = event.key.toLowerCase()
//       const combo = (event.ctrlKey ? "ctrl+" : "") + (event.altKey ? "alt+" : "") + (event.metaKey ? "meta+" : "") + key

//       const forbidden: Record<string, string> = {
//         "ctrl+c": "Copy",
//         "ctrl+v": "Paste",
//         "ctrl+a": "Select All",
//         "ctrl+x": "Cut",
//         "ctrl+t": "New Tab",
//         "ctrl+w": "Close Tab",
//         "ctrl+z": "Undo",
//         "ctrl+u": "View Source",
//         "ctrl+s": "Save",
//         "ctrl+p": "Print",
//         "alt+tab": "Switch Window",
//         "alt+shift+tab": "Switch Window",
//         "meta+tab": "Task View",
//         f1: "Help",
//         f12: "Dev Tools",
//         printscreen: "Print Screen",
//         meta: "Windows Key",
//       }

//       if (forbidden[combo]) {
//         event.preventDefault()
//         logToWindow(`🚫 Key detected: ${combo}`)
//         keyboardLogMutation.mutate(combo)
//         triggerAlert(`Unethical activity: ${forbidden[combo]} is not allowed.`)
//       }
//     }

//     contextMenuRef.current = (e: MouseEvent) => {
//       e.preventDefault()
//       logToWindow("🚫 Right-click detected")
//       triggerAlert("Unethical activity: Right-click is not allowed.")
//     }

//     window.addEventListener("blur", handleWindowChangeRef.current!)
//     window.addEventListener("keydown", keyDownRef.current!)
//     document.addEventListener("copy", copyRef.current)
//     document.addEventListener("paste", pasteRef.current)
//     document.addEventListener("cut", cutRef.current)
//     document.addEventListener("contextmenu", contextMenuRef.current!)
//     document.addEventListener("fullscreenchange", handleFullScreenChange)

//     isMonitoringRef.current = true
//     setGamePaused(false)
//     setIsMonitoring(true)
//     logToWindow("🎥 Monitoring started.")
//   }



//   // useEffect(() => {
//   //   if (!enabled) return
//   //   refetchPhoneAlerts()
//   // } , [enabled, refetchPhoneAlerts])

//   useEffect(() => {
//     if (!enabled) return
//     const checkFullScreen = () => {
//       const isNowFullscreen = !!(
//         document.fullscreenElement ||
//         (document as any).webkitFullscreenElement ||
//         (document as any).mozFullScreenElement ||
//         (document as any).msFullscreenElement
//       )
//       setIsFullScreen(isNowFullscreen)
//       setGamePaused(!isNowFullscreen)
//     }

//     document.addEventListener("fullscreenchange", checkFullScreen)
//     return () => {
//       document.removeEventListener("fullscreenchange", checkFullScreen)
//     }
//   }, [enabled])


//   const getTimeStamp = () => {
//     const now = new Date()
//     return now.toLocaleTimeString() + "." + now.getMilliseconds().toString().padStart(3, "0")
//   }

// //   useEffect(() => {
// //   if (dialogOpen) {
// //     console.log(`${getTimeStamp()} ⏸️ Dialog opened - auto-pausing monitoring for 5 seconds`)
// //     pauseMonitoring()

// //     const timer = setTimeout(() => {
// //       if (!gameTerminated) {
// //         console.log("▶️ 5s passed - auto-resuming monitoring")
// //         resumeMonitoring()
// //       }
// //     }, 5000)

// //     return () => clearTimeout(timer)
// //   }
// // }, [dialogOpen, pauseMonitoring, resumeMonitoring, gameTerminated])


//    const closeDialog = useCallback(() => {
//     console.log("✅ Dialog closed by user")
//     setDialogOpen(false)
//     dialogRef.current = false
//     // Resume immediately if paused and game not terminated
//     if (monitoringPausedRef.current && !gameTerminated) {
//       console.log("▶️ Resuming monitoring after dialog close")
//       resumeMonitoring()
//     }
//   }, [resumeMonitoring, gameTerminated])




//   // CRITICAL: Handle dialog close and resume monitoring
//   // const closeDialog = useCallback(() => {
//   //   console.log("✅ User confirmed understanding of warning")
//   //   setDialogOpen(false)

    

//   //   // For warnings 1 and 2: Resume monitoring after user confirmation
//   //   if (warningCount < 3) {
//   //     console.log(`▶️ Resuming monitoring after warning ${warningCount} confirmation...`)
//   //     resumeMonitoring()
//   //   }


//   //   // showNextWarning()
//   //   // For warning 3: Game will be terminated, no need to resume
//   // }, [warningCount, resumeMonitoring ])

//   return {
//     liveFrame,
//     phoneStarted,
//     setPhoneStarted,
//     gamePaused,
//     isMonitoring,
//     isFullScreen,
//     resumeMonitoring,
//     startMonitoring,
//     stopMonitoring,
//     closeDialog,
//     warningCount,
//     dialogOpen,
//     warningTitle,
//     lastType,
//     violationHistory,
//     showTerminationPopup,
//     handleTerminationClose,
//     gameTerminated,
//     monitoringPaused,
//   }
// }


