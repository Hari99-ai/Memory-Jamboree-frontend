// new
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
  // const tabSwitchCountRef = useRef(0)
  const tabSwitchCountRef = useRef(0)
  const lastTabSwitchTimeRef = useRef(0)
  const TAB_SWITCH_COOLDOWN = 1500
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
  const [warningMessage, setWarningMessage] = useState("")
  const [lastType, setLastType] = useState("")

  // Critical: Control monitoring API calls based on dialog state
  const [monitoringPaused, setMonitoringPaused] = useState(false)
  const monitoringPausedRef = useRef(false)

  const [violationHistory, setViolationHistory] = useState<string[]>([])
  const [showTerminationPopup, setShowTerminationPopup] = useState(false)
  const [gameTerminated, setGameTerminated] = useState(false)

  const alertQueueRef = useRef<string[]>([])
  // const focusWarningCountRef = useRef<number>(0)
  // const focusViolationCooldownRef = useRef<number>(0)
  // const lastViolationTimeRef = useRef<number>(0)
  // const lastWarningTimeRef = useRef<number>(0)

  const terminationRef = useRef(false)
  const phoneNoticeShownRef = useRef(false)



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

  const processAlerts = (data: any) => {
    console.log("📊 Processing proctoring data:", data)

    // Check if already terminated
    // if (data?.is_terminated || data?.wstatus === 1) {
    //   handleGameTermination()
    //   return
    // }
    if (data?.is_terminated &&
  lastType !== "Tab switch" &&
  lastType !== "Phone violation"
) {
  handleGameTermination()
  return
}

//     if (data?.is_terminated && lastType !== "Tab switch") {
//   handleGameTermination()
//   return
// }

    // if (
    //   (data?.is_terminated || data?.wstatus === 1) &&
    //   lastType !== "Tab switch"
    // ) {
    //   handleGameTermination()
    //   return
    // }


    // Show focus loss warnings (not violations yet)
    if (data?.show_focus_warning && data?.focus_warning_message) {
      console.log(`👁️ Focus Warning: ${data.focus_warning_message}`)
      triggerAlert(data.focus_warning_message)
    }

    // Show general warnings
    if (data?.show_warning && data?.warning_message) {
      console.log(`⚠️ Warning received: ${data.warning_message}`)
      
      // setWarningCount(data.warning_count || warningCount)
      setWarningMessage(data.warning_message)
      
      // Check if this is a termination warning
      if (data.is_terminated || data.warning_message.includes("EXAM TERMINATED")) {
        setWarningTitle("🚫 Exam Terminated!")
        setDialogOpen(true)
        pauseMonitoring()
      } else {
        // Regular warning (1st or 2nd)
        const warningNum = data.warning_count || warningCount + 1
        if (warningNum === 1) {
          setWarningTitle("⚠️ First Warning!")
        } else if (warningNum === 2) {
          setWarningTitle("⚠️ Second Warning - Final Chance!")
        }
        setDialogOpen(true)
        pauseMonitoring()
      }
      
      // Log violation type
      if (data.violation_type) {
        setLastType(data.violation_type)
        setViolationHistory((prevHistory) => [
          ...prevHistory,
          `${new Date().toLocaleTimeString()}: ${data.violation_type}`,
        ])
      }
    }

    // Log focus loss information
    if (data?.has_focus_loss) {
      console.log(`🎯 Focus Loss Detected: ${data.focus_loss_count}`)
      logToWindow(`Focus loss count: ${data.focus_loss_count}`)
    }
  }


//   const handleTabSwitch = () => {
const handleTabSwitch = () => {
  const now = Date.now()
  if (now - lastTabSwitchTimeRef.current < TAB_SWITCH_COOLDOWN) return
  lastTabSwitchTimeRef.current = now

  tabSwitchCountRef.current += 1
  setWarningCount(tabSwitchCountRef.current)

  if (tabSwitchCountRef.current <= 2) {
    setLastType("Tab switch")
    setWarningTitle(
      tabSwitchCountRef.current === 1
        ? "⚠️ Tab Switch Detected"
        : "⚠️ Second Tab Switch Warning"
    )
    setWarningMessage("Switching tabs or windows is not allowed.")
    setDialogOpen(true)
    pauseMonitoring()
    return
  }

  handleGameTermination()
}

  // const handleTabSwitch = () => {
  //   const now = Date.now()
  //   if (now - lastTabSwitchTimeRef.current < TAB_SWITCH_COOLDOWN) return
  //   lastTabSwitchTimeRef.current = now

  //   // tabSwitchCountRef.current += 1
  //   // setWarningCount(tabSwitchCountRef.current)

  //   if (tabSwitchCountRef.current <= 2) {
  //     setLastType("Tab switch")
  //     setWarningTitle(
  //       tabSwitchCountRef.current === 1
  //         ? "⚠️ Tab Switch Detected"
  //         : "⚠️ Second Tab Switch Warning"
  //     )
  //     setWarningMessage("Switching tabs or windows is not allowed.")
  //     setDialogOpen(true)
  //     pauseMonitoring()
  //     return
  //   }

  //   handleGameTermination()
  // }


// handleWindowChangeRef.current = () => {
//   if (!isMonitoringRef.current || gameTerminated) return
//   handleTabSwitch()
// }
useEffect(() => {
  handleWindowChangeRef.current = () => {
  if (!isMonitoringRef.current || gameTerminated) return
  handleTabSwitch()

  tabSwitchCountRef.current += 1
  setWarningCount(tabSwitchCountRef.current)
}

  // handleWindowChangeRef.current = () => {
  //   if (!isMonitoringRef.current || gameTerminated) return
  //   handleTabSwitch()

  //   // tabSwitchCountRef.current += 1
  //   // setWarningCount(tabSwitchCountRef.current)

  // }
}, [gameTerminated])



  // Get current warning count from backend
  const { data: progressData } = useQuery({
    queryKey: ["event-progress", config.event_id, config.discipline_id, config.user_id],
    queryFn: async () => {
      const res = await api.get(
        `/event-progress?event_id=${config.event_id}&disc_id=${config.discipline_id}&user_id=${config.user_id}`
      )
      return res.data
    },
    refetchInterval: 5000, // Poll every 5 seconds
    enabled:

    enabled &&
    !gameTerminated &&
    !!config.event_id &&
    !!config.discipline_id &&
    !!config.user_id,

  })



    
  // 1. define phoneData FIRST
  const { data: phoneData } = useQuery({
    queryKey: ["phone-warnings", config.event_id, config.discipline_id, config.user_id],
    queryFn: async () => {
      const res = await api.get(
        `/phone-warnings?event_id=${config.event_id}&disc_id=${config.discipline_id}&user_id=${config.user_id}`
      )
      return res.data
    },
    refetchInterval: 2000,
    enabled: enabled && !gameTerminated && !monitoringPaused,
  })

  // 2. THEN use it
  useEffect(() => {
  if (!phoneData) return
  if (gameTerminated || dialogOpen) return

  if (phoneData?.door_popup) {
    toast.error(
      phoneData?.door_message || "Environment change detected.",
      { duration: 3000 }
    )
  }

  if (phoneData.wstatus === 1 && phoneData.warning_count >= 3) {
    setLastType("Phone violation")

    setWarningTitle("🚫 Exam Terminated")
    setWarningMessage(
      "An activity related to phone monitoring was detected.\n\n" +
      "Repeated phone-related monitoring issues were identified during the exam.\n" +
      "As a result, your exam has been terminated."
    )

    setDialogOpen(true)
    pauseMonitoring()
    return
  }


  // (Optional) early phone warning if backend sends it
//   if (phoneData.warning && phoneData.wstatus === 0) {
//   setLastType("Phone notice")
//   setWarningTitle("📱 Monitoring Notice")
//   setWarningMessage(
//     "An activity related to phone monitoring was detected.\n\n" +
//     "Please ensure you are following the exam monitoring guidelines."
//   )
//   setDialogOpen(true)
//   pauseMonitoring()
// }
if (
  phoneData.warning &&
  phoneData.wstatus === 0 &&
  !phoneNoticeShownRef.current
) {
  phoneNoticeShownRef.current = true

  setLastType("Phone notice")
  setWarningTitle("📱 Monitoring Notice")
  setWarningMessage(
    "An activity related to phone monitoring was detected.\n\n" +
    "Please ensure you are following the exam monitoring guidelines."
  )
  setDialogOpen(true)
  pauseMonitoring()
}


  // if (phoneData.warning?.phone_detection === 1) {
  //   setLastType("Phone detected")
  //   setWarningTitle("📱 Phone Detected")
  //   setWarningMessage("Phone usage detected. This is not allowed.")
  //   setDialogOpen(true)
  //   pauseMonitoring()
  // }

}, [phoneData, dialogOpen, gameTerminated])

  // useEffect(() => {
  //   if (!phoneData) return
  //   if (gameTerminated || dialogOpen) return
  //   if (lastType === "Phone violation") return


  //   // if (phoneData.wstatus === 1) {
  //   //   handleGameTermination()
  //   //   return
  //   // }

  //   if (phoneData.wstatus === 1 && phoneData.warning_count === 3) {
  //   // Show ONE confirmation warning first
  //     setLastType("Phone violation")
  //     setWarningTitle("🚫 Phone Violation Detected")
  //     setWarningMessage("Phone usage detected. Your exam will be terminated.")
  //     setDialogOpen(true)
  //     pauseMonitoring()
  //     return
  //   }


  //   if (phoneData.warning?.phone_detection === 1) {
  //     setLastType("Phone detected")
  //     setWarningTitle("📱 Phone Detected")
  //     setWarningMessage("Phone usage detected. This is not allowed.")
  //     setDialogOpen(true)
  //     pauseMonitoring()
  //     return
  //   }

  //   if (phoneData.warning?.multiple_person === 1) {
  //     setLastType("Multiple people detected")
  //     setWarningTitle("👥 Multiple People Detected")
  //     setWarningMessage("More than one person detected via phone camera.")
  //     setDialogOpen(true)
  //     pauseMonitoring()
  //     return
  //   }
  // }, [phoneData, dialogOpen, gameTerminated])









  useEffect(() => {
    if (!progressData) return
    
    // Update warning count from backend
    if (progressData.warning_count !== undefined) {
      setWarningCount(progressData.warning_count)
    }
    
    // Check if terminated
    // if (progressData.wstatus === 1 && !gameTerminated) {
    //   handleGameTermination()
    // }
    // if (progressData.wstatus === 1 &&
    //   !gameTerminated &&
    //   lastType !== "Phone violation"
    // ) {
    //   handleGameTermination()
    // }


  //   if (progressData.wstatus === 1 &&
  //   !gameTerminated &&
  //   lastType !== "Phone violation" &&
  //   lastType !== "Tab switch"
  // ) {
  //   handleGameTermination()
  // }
  if (
  progressData.wstatus === 1 &&
  !gameTerminated &&
  !monitoringPausedRef.current &&
  lastType !== "Tab switch" &&
  lastType !== "Phone violation" // 👈 ADD THIS
) {
  handleGameTermination()
}




  }, [progressData])

  const { mutate: sendTestData } = useMutation({
    mutationFn: (formData: FormData) => give_test(formData),
    onSuccess: (data) => {
      if (!enabled || monitoringPausedRef.current || gameTerminated) {
        console.log("⏸️ Skipping response - monitoring paused or terminated")
        return
      }
      
      processAlerts(data)
      
      // Update warning count from response
      if (data.warning_count !== undefined) {
        setWarningCount(data.warning_count)
      }
      
      // Log to window for debugging
      logToWindow(`✅ Monitoring response: ${JSON.stringify({
        has_violation: data.has_violation,
        warning_count: data.warning_count,
        show_warning: data.show_warning,
        is_terminated: data.is_terminated
      })}`)
    },
    onError: (err: any) => {
      if (!enabled) return
      console.error("Monitoring API error:", err)
      
      if (err) {
        logToWindow(`❌ Error: ${err.message || err}`)
        toast.error("Monitoring connection issue. Please ensure you're in fullscreen mode.")
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
    
    if (!fullscreen && enabled) {
      triggerAlert("🚨 Please return to fullscreen mode immediately!")
    }
  }

  // useEffect(() => {
  //   if (!enabled) return
    
  //   handleWindowChangeRef.current = () => {
  //     if (!isMonitoringRef.current || gameTerminated) return
  //     logToWindow("🚨 Window/tab changed")
  //     // window_logs({
  //     //   discipline_id: Number(config.discipline_id),
  //     //   window_event: 1,
  //     //   user_id: Number(config.user_id),
  //     //   transaction_log: Date(),
  //     // })
  //     triggerAlert("Unethical activity: Tab/window switch detected.")
  //   }
  // }, [])

  const startAudioRecording = () => {
    if (!enabled || !mediaStreamRef.current) return

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
    tabSwitchCountRef.current = 0
    lastTabSwitchTimeRef.current = 0

    if (!enabled) {
      console.log("🚫 Monitoring is disabled for this event")
      logToWindow("🚫 Monitoring is disabled for this event")
      setIsMonitoring(false)
      setGamePaused(false)
      return
    }

    if (gameTerminated) {
      console.log("🚫 Cannot start monitoring - game terminated")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }, 
        audio: true 
      })
      mediaStreamRef.current = stream

      const hasMic = stream.getAudioTracks().length > 0
      console.log("🎙️ Microphone access granted:", hasMic)

      const video = document.createElement("video")
      videoRef.current = video
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      await video.play()

      console.log("📹 Video is playing:", !video.paused)

      const audioCtx = new (window.AudioContext || window.AudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      source.connect(analyser)

      // Start monitoring interval
      intervalRef.current = setInterval(async () => {
        // Check if game is terminated
        if (gameTerminated) {
          console.log("🚨 Game terminated, stopping monitoring interval")
          if (intervalRef.current) clearInterval(intervalRef.current)
          return
        }

        // Check fullscreen status
        if (!document.fullscreenElement) {
          setIsFullScreen(false)
          setGamePaused(true)
          triggerAlert("🚨 Please return to fullscreen mode!")
          return
        } else {
          setIsFullScreen(true)
          setGamePaused(false)
        }

        // Check if monitoring is paused (warning dialog open)
        if (monitoringPausedRef.current) {
          console.log("⏸️ Monitoring paused - skipping API call")
          return
        }

        // Get voice level
        const voice_db = await getMicDb(analyser, dataArray)

        // Handle voice disturbances
        if (voice_db > DISTURBANCE_THRESHOLD) {
          disturbanceCount++
          logToWindow(`🔊 Loud voice detected (${voice_db} dB) - Count: ${disturbanceCount}`)
        } else {
          disturbanceCount = 0
        }

        if (disturbanceCount >= DISTURBANCE_DURATION_LIMIT) {
          disturbanceCount = 0
          triggerAlert("🚨 Continuous voice disturbance detected!")
          logToWindow("🎙️ Starting audio recording...")
          startAudioRecording()
        }

        // Capture and send frame
        const canvas = document.createElement("canvas")
        if (!videoRef.current) return
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const imgData = canvas.toDataURL("image/jpeg")

        // Prepare form data
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

      }, 2000) // Send every 2 seconds

      // Set up event listeners
      keyDownRef.current = (event: KeyboardEvent) => {
        if (gameTerminated) return
        
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
        if (gameTerminated) return
        
        e.preventDefault()
        logToWindow("🚫 Right-click detected")
        triggerAlert("Unethical activity: Right-click is not allowed.")
      }

      // Add event listeners
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
      toast.success("Monitoring started successfully")

    } catch (error) {
      console.error("❌ Failed to start monitoring:", error)
      toast.error("Failed to start monitoring. Please check camera/mic permissions.")
      logToWindow(`❌ Monitoring error: ${error}`)
    }
  }

  const stopMonitoring = useCallback(() => {
    if (!enabled) return
    
    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }
    
    // Stop media streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.remove()
      videoRef.current = null
    }
    
    // Remove event listeners
    if (handleWindowChangeRef.current) {
      window.removeEventListener("blur", handleWindowChangeRef.current)
    }
    if (keyDownRef.current) {
      window.removeEventListener("keydown", keyDownRef.current)
    }
    if (contextMenuRef.current) {
      document.removeEventListener("contextmenu", contextMenuRef.current)
    }
    
    document.removeEventListener("copy", copyRef.current)
    document.removeEventListener("paste", pasteRef.current)
    document.removeEventListener("cut", cutRef.current)
    document.removeEventListener("fullscreenchange", handleFullScreenChange)

    // Reset state
    isMonitoringRef.current = false
    setIsMonitoring(false)
    setGamePaused(false)
    setMonitoringPaused(false)
    monitoringPausedRef.current = false
    
    logToWindow("🛑 Monitoring stopped.")
    console.log("🛑 Monitoring stopped")
  }, [enabled])

  // Function to handle automatic game termination
  const handleGameTermination = useCallback(async () => {
    if (terminationRef.current) return
    terminationRef.current = true

    if (gameTerminated) return

    console.log("🚨 Game terminated due to excessive violations")
    setGameTerminated(true)

    stopMonitoring()

    sessionStorage.setItem(
      "gameViolations",
      JSON.stringify({
        eventId: event_id,
        violations: violationHistory,
        terminatedAt: new Date().toISOString(),
        warningCount: warningCount,
      }),
    )

    setShowTerminationPopup(true)
    setWarningTitle("🚫 Exam Terminated")
    setWarningMessage("You have been disqualified due to excessive violations.")

    toast.error("Exam terminated due to violations", { duration: 5000 })
  }, [violationHistory, event_id, stopMonitoring, gameTerminated, warningCount])


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

  // CRITICAL: Handle dialog close and resume monitoring
  // const closeDialog = useCallback(() => {
  //   console.log("✅ User confirmed understanding of warning")
  //   setDialogOpen(false)

  //   // For warnings 1 and 2: Resume monitoring after user confirmation
  //   if (warningCount < 3 && !gameTerminated) {
  //     console.log(`▶️ Resuming monitoring after warning ${warningCount} confirmation...`)
  //     resumeMonitoring()
  //   } 
  //   // else if (warningCount >= 3) {
  //   //   // Third warning = termination
  //   //   handleGameTermination()
  //   // }
  // }, [warningCount, resumeMonitoring, gameTerminated, handleGameTermination])
//   const closeDialog = useCallback(() => {
//   console.log("✅ User confirmed understanding of warning")
//   setDialogOpen(false)

//   // Phone = confirm then terminate
//   // if (lastType === "Phone violation") {
//   //   handleGameTermination()
//   //   return
//   // }
//   if (lastType === "Phone violation" || lastType === "Tab switch") {
//     if (tabSwitchCountRef.current >= 3) {
//       handleGameTermination()
//       return
//     }
//   }


//   // Desktop warnings
//   if (warningCount < 3 && !gameTerminated) {
//     resumeMonitoring()
//   }
// }, [lastType, warningCount, resumeMonitoring, gameTerminated, handleGameTermination])
const closeDialog = useCallback(() => {
  setDialogOpen(false)

  // ✅ PHONE: show once → terminate immediately
  if (lastType === "Phone violation") {
    handleGameTermination()
    return
  }

  // Desktop warnings only
  if (warningCount < 3 && !gameTerminated) {
    resumeMonitoring()
  }

}, [lastType, warningCount, resumeMonitoring, gameTerminated, handleGameTermination])



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMonitoringRef.current) {
        stopMonitoring()
      }
    }
  }, [stopMonitoring])

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
    warningMessage,
    lastType,
    violationHistory,
    showTerminationPopup,
    handleTerminationClose,
    gameTerminated,
    monitoringPaused,
  }
} 



// // new
// "use client"

// import { useMutation, useQuery } from "@tanstack/react-query"
// import { give_test, logKeyboardEvent, window_events } from "../lib/api"
// import { useCallback, useEffect, useRef, useState } from "react"
// import type { MonitoringData } from "../types"
// import toast from "react-hot-toast"
// import { api, API_BASE_URL } from "../lib/client"
// import { useNavigate, useParams } from "react-router-dom"





// const directionMap = {
//   Straight: 0,
//   Up: 1,
//   Down: 2,
//   Left: 3,
//   Right: 4,
//   Blink: 5,
// }

// const DISTURBANCE_THRESHOLD = 25
// const DISTURBANCE_DURATION_LIMIT = 3
// let disturbanceCount = 0

// export function useMonitoring(config: MonitoringData, enabled = true) {
//   // const tabSwitchCountRef = useRef(0)
//   const tabSwitchCountRef = useRef(0)
//   const lastTabSwitchTimeRef = useRef(0)
//   const TAB_SWITCH_COOLDOWN = 1500
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

//   const keyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null)
//   const contextMenuRef = useRef<((e: MouseEvent) => void) | null>(null)
//   const copyRef = useRef<() => void>(() => handleClipboard("copy"))
//   const pasteRef = useRef<() => void>(() => handleClipboard("paste"))
//   const cutRef = useRef<() => void>(() => handleClipboard("cut"))
//   const handleWindowChangeRef = useRef<((e?: any) => void) | null>(null)

//   const [warningCount, setWarningCount] = useState(0)
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [warningTitle, setWarningTitle] = useState("")
//   const [warningMessage, setWarningMessage] = useState("")
//   const [lastType, setLastType] = useState("")

//   // Critical: Control monitoring API calls based on dialog state
//   const [monitoringPaused, setMonitoringPaused] = useState(false)
//   const monitoringPausedRef = useRef(false)

//   const [violationHistory, setViolationHistory] = useState<string[]>([])
//   const [showTerminationPopup, setShowTerminationPopup] = useState(false)
//   const [gameTerminated, setGameTerminated] = useState(false)

//   const alertQueueRef = useRef<string[]>([])
//   // const focusWarningCountRef = useRef<number>(0)
//   // const focusViolationCooldownRef = useRef<number>(0)
//   // const lastViolationTimeRef = useRef<number>(0)
//   // const lastWarningTimeRef = useRef<number>(0)

//   const terminationRef = useRef(false)
//   const phoneNoticeShownRef = useRef(false)



//   const triggerAlert = (message: string) => {
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
//   }

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

//   const alertTimeouts = {
//     phone: null as NodeJS.Timeout | null,
//     multiplePeople: null as NodeJS.Timeout | null,
//     focus: null as NodeJS.Timeout | null,
//     person_count: null as NodeJS.Timeout | null,
//   }

//   const clearExistingTimeout = (key: keyof typeof alertTimeouts) => {
//     if (alertTimeouts[key]) {
//       clearTimeout(alertTimeouts[key]!)
//       alertTimeouts[key] = null
//     }
//   }

//   // Function to pause monitoring API calls
//   const pauseMonitoring = useCallback(() => {
//     console.log("⏸️ Pausing monitoring API calls due to warning dialog...")
//     setMonitoringPaused(true)
//     monitoringPausedRef.current = true
//     logToWindow("⏸️ Monitoring API calls paused - Dialog open")
//   }, [])

//   // Function to resume monitoring API calls
//   const resumeMonitoring = useCallback(() => {
//     console.log("▶️ Resuming monitoring API calls after user confirmation...")
//     setMonitoringPaused(false)
//     monitoringPausedRef.current = false
//     logToWindow("▶️ Monitoring API calls resumed - User confirmed understanding")
//   }, [])

//   const processAlerts = (data: any) => {
//     console.log("📊 Processing proctoring data:", data)

//     // Check if already terminated
//     // if (data?.is_terminated || data?.wstatus === 1) {
//     //   handleGameTermination()
//     //   return
//     // }
//     if (data?.is_terminated &&
//   lastType !== "Tab switch" &&
//   lastType !== "Phone violation"
// ) {
//   handleGameTermination()
//   return
// }

// //     if (data?.is_terminated && lastType !== "Tab switch") {
// //   handleGameTermination()
// //   return
// // }

//     // if (
//     //   (data?.is_terminated || data?.wstatus === 1) &&
//     //   lastType !== "Tab switch"
//     // ) {
//     //   handleGameTermination()
//     //   return
//     // }


//     // Show focus loss warnings (not violations yet)
//     if (data?.show_focus_warning && data?.focus_warning_message) {
//       console.log(`👁️ Focus Warning: ${data.focus_warning_message}`)
//       triggerAlert(data.focus_warning_message)
//     }

//     // Show general warnings
//     if (data?.show_warning && data?.warning_message) {
//       console.log(`⚠️ Warning received: ${data.warning_message}`)
      
//       // setWarningCount(data.warning_count || warningCount)
//       setWarningMessage(data.warning_message)
      
//       // Check if this is a termination warning
//       if (data.is_terminated || data.warning_message.includes("EXAM TERMINATED")) {
//         setWarningTitle("🚫 Exam Terminated!")
//         setDialogOpen(true)
//         pauseMonitoring()
//       } else {
//         // Regular warning (1st or 2nd)
//         const warningNum = data.warning_count || warningCount + 1
//         if (warningNum === 1) {
//           setWarningTitle("⚠️ First Warning!")
//         } else if (warningNum === 2) {
//           setWarningTitle("⚠️ Second Warning - Final Chance!")
//         }
//         setDialogOpen(true)
//         pauseMonitoring()
//       }
      
//       // Log violation type
//       if (data.violation_type) {
//         setLastType(data.violation_type)
//         setViolationHistory((prevHistory) => [
//           ...prevHistory,
//           `${new Date().toLocaleTimeString()}: ${data.violation_type}`,
//         ])
//       }
//     }

//     // Log focus loss information
//     if (data?.has_focus_loss) {
//       console.log(`🎯 Focus Loss Detected: ${data.focus_loss_count}`)
//       logToWindow(`Focus loss count: ${data.focus_loss_count}`)
//     }
//   }


// //   const handleTabSwitch = () => {
// const handleTabSwitch = () => {
//   const now = Date.now()
//   if (now - lastTabSwitchTimeRef.current < TAB_SWITCH_COOLDOWN) return
//   lastTabSwitchTimeRef.current = now

//   tabSwitchCountRef.current += 1
//   setWarningCount(tabSwitchCountRef.current)

//   if (tabSwitchCountRef.current <= 2) {
//     setLastType("Tab switch")
//     setWarningTitle(
//       tabSwitchCountRef.current === 1
//         ? "⚠️ Tab Switch Detected"
//         : "⚠️ Second Tab Switch Warning"
//     )
//     setWarningMessage("Switching tabs or windows is not allowed.")
//     setDialogOpen(true)
//     pauseMonitoring()
//     return
//   }

//   handleGameTermination()
// }

//   // const handleTabSwitch = () => {
//   //   const now = Date.now()
//   //   if (now - lastTabSwitchTimeRef.current < TAB_SWITCH_COOLDOWN) return
//   //   lastTabSwitchTimeRef.current = now

//   //   // tabSwitchCountRef.current += 1
//   //   // setWarningCount(tabSwitchCountRef.current)

//   //   if (tabSwitchCountRef.current <= 2) {
//   //     setLastType("Tab switch")
//   //     setWarningTitle(
//   //       tabSwitchCountRef.current === 1
//   //         ? "⚠️ Tab Switch Detected"
//   //         : "⚠️ Second Tab Switch Warning"
//   //     )
//   //     setWarningMessage("Switching tabs or windows is not allowed.")
//   //     setDialogOpen(true)
//   //     pauseMonitoring()
//   //     return
//   //   }

//   //   handleGameTermination()
//   // }


// // handleWindowChangeRef.current = () => {
// //   if (!isMonitoringRef.current || gameTerminated) return
// //   handleTabSwitch()
// // }
// useEffect(() => {
//   handleWindowChangeRef.current = () => {
//   if (!isMonitoringRef.current || gameTerminated) return
//   handleTabSwitch()

//   tabSwitchCountRef.current += 1
//   setWarningCount(tabSwitchCountRef.current)
// }

//   // handleWindowChangeRef.current = () => {
//   //   if (!isMonitoringRef.current || gameTerminated) return
//   //   handleTabSwitch()

//   //   // tabSwitchCountRef.current += 1
//   //   // setWarningCount(tabSwitchCountRef.current)

//   // }
// }, [gameTerminated])



//   // Get current warning count from backend
//   const { data: progressData } = useQuery({
//     queryKey: ["event-progress", config.event_id, config.discipline_id, config.user_id],
//     queryFn: async () => {
//       const res = await api.get(
//         `/event-progress?event_id=${config.event_id}&disc_id=${config.discipline_id}&user_id=${config.user_id}`
//       )
//       return res.data
//     },
//     refetchInterval: 5000, // Poll every 5 seconds
//     enabled:

//     enabled &&
//     !gameTerminated &&
//     !!config.event_id &&
//     !!config.discipline_id &&
//     !!config.user_id,

//   })



    
//   // 1. define phoneData FIRST
//   const { data: phoneData } = useQuery({
//     queryKey: ["phone-warnings", config.event_id, config.discipline_id, config.user_id],
//     queryFn: async () => {
//       const res = await api.get(
//         `/phone-warnings?event_id=${config.event_id}&disc_id=${config.discipline_id}&user_id=${config.user_id}`
//       )
//       return res.data
//     },
//     refetchInterval: 2000,
//     enabled: enabled && !gameTerminated && !monitoringPaused,
//   })

//   // 2. THEN use it
//   useEffect(() => {
//   if (!phoneData) return
//   if (gameTerminated || dialogOpen) return

//   if (phoneData.wstatus === 1 && phoneData.warning_count >= 3) {
//     setLastType("Phone violation")

//     setWarningTitle("🚫 Exam Terminated")
//     setWarningMessage(
//       "An activity related to phone monitoring was detected.\n\n" +
//       "Repeated phone-related monitoring issues were identified during the exam.\n" +
//       "As a result, your exam has been terminated."
//     )

//     setDialogOpen(true)
//     pauseMonitoring()
//     return
//   }


//   // (Optional) early phone warning if backend sends it
// //   if (phoneData.warning && phoneData.wstatus === 0) {
// //   setLastType("Phone notice")
// //   setWarningTitle("📱 Monitoring Notice")
// //   setWarningMessage(
// //     "An activity related to phone monitoring was detected.\n\n" +
// //     "Please ensure you are following the exam monitoring guidelines."
// //   )
// //   setDialogOpen(true)
// //   pauseMonitoring()
// // }
// if (
//   phoneData.warning &&
//   phoneData.wstatus === 0 &&
//   !phoneNoticeShownRef.current
// ) {
//   phoneNoticeShownRef.current = true

//   setLastType("Phone notice")
//   setWarningTitle("📱 Monitoring Notice")
//   setWarningMessage(
//     "An activity related to phone monitoring was detected.\n\n" +
//     "Please ensure you are following the exam monitoring guidelines."
//   )
//   setDialogOpen(true)
//   pauseMonitoring()
// }


//   // if (phoneData.warning?.phone_detection === 1) {
//   //   setLastType("Phone detected")
//   //   setWarningTitle("📱 Phone Detected")
//   //   setWarningMessage("Phone usage detected. This is not allowed.")
//   //   setDialogOpen(true)
//   //   pauseMonitoring()
//   // }

// }, [phoneData, dialogOpen, gameTerminated])

//   // useEffect(() => {
//   //   if (!phoneData) return
//   //   if (gameTerminated || dialogOpen) return
//   //   if (lastType === "Phone violation") return


//   //   // if (phoneData.wstatus === 1) {
//   //   //   handleGameTermination()
//   //   //   return
//   //   // }

//   //   if (phoneData.wstatus === 1 && phoneData.warning_count === 3) {
//   //   // Show ONE confirmation warning first
//   //     setLastType("Phone violation")
//   //     setWarningTitle("🚫 Phone Violation Detected")
//   //     setWarningMessage("Phone usage detected. Your exam will be terminated.")
//   //     setDialogOpen(true)
//   //     pauseMonitoring()
//   //     return
//   //   }


//   //   if (phoneData.warning?.phone_detection === 1) {
//   //     setLastType("Phone detected")
//   //     setWarningTitle("📱 Phone Detected")
//   //     setWarningMessage("Phone usage detected. This is not allowed.")
//   //     setDialogOpen(true)
//   //     pauseMonitoring()
//   //     return
//   //   }

//   //   if (phoneData.warning?.multiple_person === 1) {
//   //     setLastType("Multiple people detected")
//   //     setWarningTitle("👥 Multiple People Detected")
//   //     setWarningMessage("More than one person detected via phone camera.")
//   //     setDialogOpen(true)
//   //     pauseMonitoring()
//   //     return
//   //   }
//   // }, [phoneData, dialogOpen, gameTerminated])









//   useEffect(() => {
//     if (!progressData) return
    
//     // Update warning count from backend
//     if (progressData.warning_count !== undefined) {
//       setWarningCount(progressData.warning_count)
//     }
    
//     // Check if terminated
//     // if (progressData.wstatus === 1 && !gameTerminated) {
//     //   handleGameTermination()
//     // }
//     // if (progressData.wstatus === 1 &&
//     //   !gameTerminated &&
//     //   lastType !== "Phone violation"
//     // ) {
//     //   handleGameTermination()
//     // }


//   //   if (progressData.wstatus === 1 &&
//   //   !gameTerminated &&
//   //   lastType !== "Phone violation" &&
//   //   lastType !== "Tab switch"
//   // ) {
//   //   handleGameTermination()
//   // }
//   if (
//   progressData.wstatus === 1 &&
//   !gameTerminated &&
//   !monitoringPausedRef.current &&
//   lastType !== "Tab switch" &&
//   lastType !== "Phone violation" // 👈 ADD THIS
// ) {
//   handleGameTermination()
// }




//   }, [progressData])

//   const { mutate: sendTestData } = useMutation({
//     mutationFn: (formData: FormData) => give_test(formData),
//     onSuccess: (data) => {
//       if (!enabled || monitoringPausedRef.current || gameTerminated) {
//         console.log("⏸️ Skipping response - monitoring paused or terminated")
//         return
//       }
      
//       processAlerts(data)
      
//       // Update warning count from response
//       if (data.warning_count !== undefined) {
//         setWarningCount(data.warning_count)
//       }
      
//       // Log to window for debugging
//       logToWindow(`✅ Monitoring response: ${JSON.stringify({
//         has_violation: data.has_violation,
//         warning_count: data.warning_count,
//         show_warning: data.show_warning,
//         is_terminated: data.is_terminated
//       })}`)
//     },
//     onError: (err: any) => {
//       if (!enabled) return
//       console.error("Monitoring API error:", err)
      
//       if (err) {
//         logToWindow(`❌ Error: ${err.message || err}`)
//         toast.error("Monitoring connection issue. Please ensure you're in fullscreen mode.")
//       }
//     },
//   })

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
    
//     if (!fullscreen && enabled) {
//       triggerAlert("🚨 Please return to fullscreen mode immediately!")
//     }
//   }

//   // useEffect(() => {
//   //   if (!enabled) return
    
//   //   handleWindowChangeRef.current = () => {
//   //     if (!isMonitoringRef.current || gameTerminated) return
//   //     logToWindow("🚨 Window/tab changed")
//   //     // window_logs({
//   //     //   discipline_id: Number(config.discipline_id),
//   //     //   window_event: 1,
//   //     //   user_id: Number(config.user_id),
//   //     //   transaction_log: Date(),
//   //     // })
//   //     triggerAlert("Unethical activity: Tab/window switch detected.")
//   //   }
//   // }, [])

//   const startAudioRecording = () => {
//     if (!enabled || !mediaStreamRef.current) return

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
//     tabSwitchCountRef.current = 0
//     lastTabSwitchTimeRef.current = 0

//     if (!enabled) {
//       console.log("🚫 Monitoring is disabled for this event")
//       logToWindow("🚫 Monitoring is disabled for this event")
//       setIsMonitoring(false)
//       setGamePaused(false)
//       return
//     }

//     if (gameTerminated) {
//       console.log("🚫 Cannot start monitoring - game terminated")
//       return
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           frameRate: { ideal: 30 }
//         }, 
//         audio: true 
//       })
//       mediaStreamRef.current = stream

//       const hasMic = stream.getAudioTracks().length > 0
//       console.log("🎙️ Microphone access granted:", hasMic)

//       const video = document.createElement("video")
//       videoRef.current = video
//       video.srcObject = stream
//       video.muted = true
//       video.playsInline = true
//       await video.play()

//       console.log("📹 Video is playing:", !video.paused)

//       const audioCtx = new (window.AudioContext || window.AudioContext)()
//       const source = audioCtx.createMediaStreamSource(stream)
//       const analyser = audioCtx.createAnalyser()
//       analyser.fftSize = 2048
//       const dataArray = new Uint8Array(analyser.frequencyBinCount)
//       source.connect(analyser)

//       // Start monitoring interval
//       intervalRef.current = setInterval(async () => {
//         // Check if game is terminated
//         if (gameTerminated) {
//           console.log("🚨 Game terminated, stopping monitoring interval")
//           if (intervalRef.current) clearInterval(intervalRef.current)
//           return
//         }

//         // Check fullscreen status
//         if (!document.fullscreenElement) {
//           setIsFullScreen(false)
//           setGamePaused(true)
//           triggerAlert("🚨 Please return to fullscreen mode!")
//           return
//         } else {
//           setIsFullScreen(true)
//           setGamePaused(false)
//         }

//         // Check if monitoring is paused (warning dialog open)
//         if (monitoringPausedRef.current) {
//           console.log("⏸️ Monitoring paused - skipping API call")
//           return
//         }

//         // Get voice level
//         const voice_db = await getMicDb(analyser, dataArray)

//         // Handle voice disturbances
//         if (voice_db > DISTURBANCE_THRESHOLD) {
//           disturbanceCount++
//           logToWindow(`🔊 Loud voice detected (${voice_db} dB) - Count: ${disturbanceCount}`)
//         } else {
//           disturbanceCount = 0
//         }

//         if (disturbanceCount >= DISTURBANCE_DURATION_LIMIT) {
//           disturbanceCount = 0
//           triggerAlert("🚨 Continuous voice disturbance detected!")
//           logToWindow("🎙️ Starting audio recording...")
//           startAudioRecording()
//         }

//         // Capture and send frame
//         const canvas = document.createElement("canvas")
//         if (!videoRef.current) return
//         canvas.width = videoRef.current.videoWidth
//         canvas.height = videoRef.current.videoHeight
//         const ctx = canvas.getContext("2d")
//         if (!ctx) return
//         ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
//         const imgData = canvas.toDataURL("image/jpeg")

//         // Prepare form data
//         const formData = new FormData()
//         formData.append("user_id", config.user_id)
//         formData.append("event_id", config.event_id)
//         formData.append("imgData", imgData)
//         formData.append("discipline_id", config.discipline_id)
//         formData.append("voice_db", voice_db.toString())
//         formData.append("user_movements_updown", directionMap["Straight"].toString())
//         formData.append("user_movements_lr", directionMap["Left"].toString())
//         formData.append("user_movements_eyes", directionMap["Blink"].toString())

//         console.log("📡 Sending monitoring data...")
//         sendTestData(formData)

//       }, 2000) // Send every 2 seconds

//       // Set up event listeners
//       keyDownRef.current = (event: KeyboardEvent) => {
//         if (gameTerminated) return
        
//         const key = event.key.toLowerCase()
//         const combo = (event.ctrlKey ? "ctrl+" : "") + (event.altKey ? "alt+" : "") + (event.metaKey ? "meta+" : "") + key

//         const forbidden: Record<string, string> = {
//           "ctrl+c": "Copy",
//           "ctrl+v": "Paste",
//           "ctrl+a": "Select All",
//           "ctrl+x": "Cut",
//           "ctrl+t": "New Tab",
//           "ctrl+w": "Close Tab",
//           "ctrl+z": "Undo",
//           "ctrl+u": "View Source",
//           "ctrl+s": "Save",
//           "ctrl+p": "Print",
//           "alt+tab": "Switch Window",
//           "alt+shift+tab": "Switch Window",
//           "meta+tab": "Task View",
//           f1: "Help",
//           f12: "Dev Tools",
//           printscreen: "Print Screen",
//           meta: "Windows Key",
//         }

//         if (forbidden[combo]) {
//           event.preventDefault()
//           logToWindow(`🚫 Key detected: ${combo}`)
//           keyboardLogMutation.mutate(combo)
//           triggerAlert(`Unethical activity: ${forbidden[combo]} is not allowed.`)
//         }
//       }

//       contextMenuRef.current = (e: MouseEvent) => {
//         if (gameTerminated) return
        
//         e.preventDefault()
//         logToWindow("🚫 Right-click detected")
//         triggerAlert("Unethical activity: Right-click is not allowed.")
//       }

//       // Add event listeners
//       window.addEventListener("blur", handleWindowChangeRef.current!)
//       window.addEventListener("keydown", keyDownRef.current!)
//       document.addEventListener("copy", copyRef.current)
//       document.addEventListener("paste", pasteRef.current)
//       document.addEventListener("cut", cutRef.current)
//       document.addEventListener("contextmenu", contextMenuRef.current!)
//       document.addEventListener("fullscreenchange", handleFullScreenChange)

//       isMonitoringRef.current = true
//       setGamePaused(false)
//       setIsMonitoring(true)
//       logToWindow("🎥 Monitoring started.")
//       toast.success("Monitoring started successfully")

//     } catch (error) {
//       console.error("❌ Failed to start monitoring:", error)
//       toast.error("Failed to start monitoring. Please check camera/mic permissions.")
//       logToWindow(`❌ Monitoring error: ${error}`)
//     }
//   }

//   const stopMonitoring = useCallback(() => {
//     if (!enabled) return
    
//     // Clear intervals
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current)
//       intervalRef.current = null
//     }
    
//     if (recordingTimeoutRef.current) {
//       clearTimeout(recordingTimeoutRef.current)
//       recordingTimeoutRef.current = null
//     }
    
//     // Stop media streams
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach((track) => track.stop())
//       mediaStreamRef.current = null
//     }
    
//     if (videoRef.current) {
//       videoRef.current.srcObject = null
//       videoRef.current.remove()
//       videoRef.current = null
//     }
    
//     // Remove event listeners
//     if (handleWindowChangeRef.current) {
//       window.removeEventListener("blur", handleWindowChangeRef.current)
//     }
//     if (keyDownRef.current) {
//       window.removeEventListener("keydown", keyDownRef.current)
//     }
//     if (contextMenuRef.current) {
//       document.removeEventListener("contextmenu", contextMenuRef.current)
//     }
    
//     document.removeEventListener("copy", copyRef.current)
//     document.removeEventListener("paste", pasteRef.current)
//     document.removeEventListener("cut", cutRef.current)
//     document.removeEventListener("fullscreenchange", handleFullScreenChange)

//     // Reset state
//     isMonitoringRef.current = false
//     setIsMonitoring(false)
//     setGamePaused(false)
//     setMonitoringPaused(false)
//     monitoringPausedRef.current = false
    
//     logToWindow("🛑 Monitoring stopped.")
//     console.log("🛑 Monitoring stopped")
//   }, [enabled])

//   // Function to handle automatic game termination
//   const handleGameTermination = useCallback(async () => {
//     if (terminationRef.current) return
//     terminationRef.current = true

//     if (gameTerminated) return

//     console.log("🚨 Game terminated due to excessive violations")
//     setGameTerminated(true)

//     stopMonitoring()

//     sessionStorage.setItem(
//       "gameViolations",
//       JSON.stringify({
//         eventId: event_id,
//         violations: violationHistory,
//         terminatedAt: new Date().toISOString(),
//         warningCount: warningCount,
//       }),
//     )

//     setShowTerminationPopup(true)
//     setWarningTitle("🚫 Exam Terminated")
//     setWarningMessage("You have been disqualified due to excessive violations.")

//     toast.error("Exam terminated due to violations", { duration: 5000 })
//   }, [violationHistory, event_id, stopMonitoring, gameTerminated, warningCount])


//   // Function to handle termination popup close
//   const handleTerminationClose = useCallback(async () => {
//     setShowTerminationPopup(false)

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

//   // CRITICAL: Handle dialog close and resume monitoring
//   // const closeDialog = useCallback(() => {
//   //   console.log("✅ User confirmed understanding of warning")
//   //   setDialogOpen(false)

//   //   // For warnings 1 and 2: Resume monitoring after user confirmation
//   //   if (warningCount < 3 && !gameTerminated) {
//   //     console.log(`▶️ Resuming monitoring after warning ${warningCount} confirmation...`)
//   //     resumeMonitoring()
//   //   } 
//   //   // else if (warningCount >= 3) {
//   //   //   // Third warning = termination
//   //   //   handleGameTermination()
//   //   // }
//   // }, [warningCount, resumeMonitoring, gameTerminated, handleGameTermination])
// //   const closeDialog = useCallback(() => {
// //   console.log("✅ User confirmed understanding of warning")
// //   setDialogOpen(false)

// //   // Phone = confirm then terminate
// //   // if (lastType === "Phone violation") {
// //   //   handleGameTermination()
// //   //   return
// //   // }
// //   if (lastType === "Phone violation" || lastType === "Tab switch") {
// //     if (tabSwitchCountRef.current >= 3) {
// //       handleGameTermination()
// //       return
// //     }
// //   }


// //   // Desktop warnings
// //   if (warningCount < 3 && !gameTerminated) {
// //     resumeMonitoring()
// //   }
// // }, [lastType, warningCount, resumeMonitoring, gameTerminated, handleGameTermination])
// const closeDialog = useCallback(() => {
//   setDialogOpen(false)

//   // ✅ PHONE: show once → terminate immediately
//   if (lastType === "Phone violation") {
//     handleGameTermination()
//     return
//   }

//   // Desktop warnings only
//   if (warningCount < 3 && !gameTerminated) {
//     resumeMonitoring()
//   }

// }, [lastType, warningCount, resumeMonitoring, gameTerminated, handleGameTermination])



//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (isMonitoringRef.current) {
//         stopMonitoring()
//       }
//     }
//   }, [stopMonitoring])

//   return {
//     gamePaused,
//     isMonitoring,
//     isFullScreen,
//     startMonitoring,
//     stopMonitoring,
//     closeDialog,
//     warningCount,
//     dialogOpen,
//     warningTitle,
//     warningMessage,
//     lastType,
//     violationHistory,
//     showTerminationPopup,
//     handleTerminationClose,
//     gameTerminated,
//     monitoringPaused,
//   }
// } 
