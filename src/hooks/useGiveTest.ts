
"use client"

import { useMutation } from "@tanstack/react-query"
import { logKeyboardEvent, window_events } from "../lib/api"
import { useCallback, useEffect, useRef, useState } from "react"
import type { MonitoringData } from "../types"
import toast from "react-hot-toast"
import { API_BASE_URL, SocketURL } from "../lib/client"
import { useNavigate, useParams } from "react-router-dom"
// import { usePhoneMonitoring } from "./usePhoneMonitoring"
// import { useQuery } from "@tanstack/react-query"

// const directionMap = {
//   Straight: 0,
//   Up: 1,
//   Down: 2,
//   Left: 3,
//   Right: 4,
//   Blink: 5,
// }

export interface PhoneAlert {
  phone_detection: number;
  multiple_people: number;
  person_status: number;
  log_time: string;
  external_img: string | File | undefined;
}

const DISTURBANCE_THRESHOLD = 30
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
  const [liveFrame, setLiveFrame] = useState<{
    image_path?: string;
    phone_detected?: boolean;
    multiple_people?: boolean;
    final_focus?: string;
    [key: string]: any;
  }>({});

  const keyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null)
  const contextMenuRef = useRef<((e: MouseEvent) => void) | null>(null)
  const copyRef = useRef<() => void>(() => handleClipboard("copy"))
  const pasteRef = useRef<() => void>(() => handleClipboard("paste"))
  const cutRef = useRef<() => void>(() => handleClipboard("cut"))
  const handleWindowChangeRef = useRef<((e?: any) => void) | null>(null)

  const [warningCount, setWarningCount] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const dialogRef = useRef(false);

  const [warningTitle, setWarningTitle] = useState("")
  const [lastType, setLastType] = useState("")

  // Critical: Control monitoring API calls based on dialog state
  const [monitoringPaused, setMonitoringPaused] = useState(false)
  const monitoringPausedRef = useRef(false)

  const [violationHistory, setViolationHistory] = useState<string[]>([])
  const [showTerminationPopup, setShowTerminationPopup] = useState(false)
  const [gameTerminated, setGameTerminated] = useState(false)

  const alertQueueRef = useRef<string[]>([])

  const [phoneStarted , setPhoneStarted] = useState(false)

  const triggerAlert = useCallback((message: string) => {
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
  })

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

    // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    //   wsRef.current.send(JSON.stringify({ type: "pause_monitoring" }));
    //   console.log("📡 Sent pause_monitoring to phone");
    // }
  }, [])

  // Function to resume monitoring API calls
  const resumeMonitoring = useCallback(() => {
    console.log("▶️ Resuming monitoring API calls...")
    setMonitoringPaused(false)
    monitoringPausedRef.current = false

    // const ws = wsRef.current
    // if (ws && ws.readyState === WebSocket.OPEN) {
    //   ws.send(JSON.stringify({ type: "resume_monitoring" }))
    //   console.log("📡 Sent resume_monitoring to phone")
    // } else {
    //   console.log("⚠️ Cannot resume monitoring - WS not open")
    // }
  }, [])



  const stopMonitoring = useCallback(() => {
    if (!enabled) return
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop_monitoring" }))
      console.log("📡 Sent stop_monitoring request to backend")
    }
      
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

    // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    //   wsRef.current.send(JSON.stringify({ type: "stop_monitoring" }));
    //   console.log("📡 Sent resume_monitoring to phone");
    // }

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

  const wsRef = useRef<WebSocket | null>(null);
  const focus_loss_count = useRef<number>(0)
    // const isFocusCooldown = useRef(false);
  const foucus_warn_count = useRef<number>(0)
  const startWebSocket = useCallback(async (passcode: string) => {
        
    if (!enabled) return;

    const ws = new WebSocket(
      `${SocketURL}/desktop/${config.discipline_id}/${config.event_id}/${config.user_id}`
    );
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log("✅ WebSocket connected, sending passcode...");
      ws.send(JSON.stringify({ type: "verify", passcode }));

      // if (monitoringPausedRef.current) {
      //   ws.send(JSON.stringify({ type: "pause_monitoring" }));
      //   console.log("🔄 Re-sent pause_monitoring on WS reconnect");
      // } else {
      //   ws.send(JSON.stringify({ type: "resume_monitoring" }));
      //   console.log("🔄 Re-sent resume_monitoring on WS reconnect");
      // }

    };

    ws.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      console.log("📡 WebSocket message received:", response);

      // Keep alive
      if (response.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

    

      // // Phone ready
      // if (response.type === "phone_ready") {
      //   toast.success("📱 Phone is connected");
      //   setPhoneStarted(true);
      //   ws.send(JSON.stringify({ type: "start_monitoring" }));
      //   return;
      // }

      if (response.type === "monitoring" && response.data?.source === "phone" && response.data?.image_path) {
        setLiveFrame(response.data);
        console.log("📷 Image path:", response.data.image_path);
        return;
      }

      if (response.type === "phone_started") {
        console.log("📱 Phone started monitoring");
        toast.success("Phone monitoring started!");
        setPhoneStarted(true); 
      }

      if (gameTerminated) return;

      // Phone-origin alerts → show warnings
      if (response.type === "phone_alert" || response.type === "alert" || response.data) {
          const alertData = response.alert || response.data || {};

          let violationType = "";
          if (alertData.phone_detected) violationType = "Phone detected";
          else if (alertData.person_count < 1) violationType = "No Person Found";
          else if (alertData.persons_status > 0) violationType = "Multiple people detected";
          else if (focus_loss_count.current > 5) violationType = "Your focus continuously lost";
          else if (alertData.voice_detected > 5) violationType = "Continuous voice detected";

          // Skip if dialog is open or no violation
          if (!violationType || dialogRef.current) {
            console.log(`[${getTimeStamp()}] Skipped violation: ${violationType || "none"}, dialog paused: ${dialogRef.current}`);
            return;
          }

          // Mark dialog as open immediately to prevent stacking
          dialogRef.current = true;

          setWarningCount(prev => {
            const next = prev + 1;
            setLastType(violationType);
            setViolationHistory(prevHistory => [
              ...prevHistory,
              `${getTimeStamp()}: ${violationType}`
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
              setWarningTitle("⚠️ Game Terminated!");
              setDialogOpen(true);
              setTimeout(() => handleGameTermination(), 100);
            }

            return next;
          });
        }

      if ((response.type === "alert" || response.type === "desktop_alert") && response.from === "desktop") {
        console.log("💻 Desktop info alert:", response.alert);
        return;
      }

      if (response.type === "disconnect") {
        alert(response.message);
        stopMonitoring();
        ws.close();
        return;
      }
    };

    ws.onclose = () => console.log("❌ WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);

  }, [enabled, config.discipline_id, config.event_id, config.user_id, gameTerminated, triggerAlert, pauseMonitoring, handleGameTermination, stopMonitoring])









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

    const passcode = localStorage.getItem("passcode"); // or dynamic
    await startWebSocket(passcode!);

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
        console.log("VOICE DETECTED 🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️" , disturbanceCount)
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

        // const formData = new FormData()
        // formData.append("user_id", config.user_id)
        // formData.append("event_id", config.event_id)
        // formData.append("imgData", imgData)
        // formData.append("discipline_id", config.discipline_id)
        // formData.append("voice_db", voice_db.toString())
        // formData.append("user_movements_updown", directionMap["Straight"].toString())
        // formData.append("user_movements_lr", directionMap["Left"].toString())
        // formData.append("user_movements_eyes", directionMap["Blink"].toString())

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "monitoring",
            imgData,
            voice_db,
            user_id: config.user_id,
            event_id: config.event_id,
            discipline_id: config.discipline_id,
          }));
          logToWindow("📡 Monitoring data sent to server");
        }
        console.log("📡 Sending monitoring data...")
        // sendTestData(formData)
      } else if (monitoringPausedRef.current) {
        console.log("⏸️ Monitoring paused - Skipping API call while dialog is open")
      }
    }, 1000)

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



  // useEffect(() => {
  //   if (!enabled) return
  //   refetchPhoneAlerts()
  // } , [enabled, refetchPhoneAlerts])

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


  const getTimeStamp = () => {
    const now = new Date()
    return now.toLocaleTimeString() + "." + now.getMilliseconds().toString().padStart(3, "0")
  }

  useEffect(() => {
  if (dialogOpen) {
    console.log(`${getTimeStamp()} ⏸️ Dialog opened - auto-pausing monitoring for 5 seconds`)
    pauseMonitoring()

    const timer = setTimeout(() => {
      // Only resume if game is not terminated
      if (!gameTerminated) {
        console.log("▶️ 5s passed - auto-resuming monitoring")
        resumeMonitoring()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }
}, [dialogOpen, pauseMonitoring, resumeMonitoring, gameTerminated])


const closeDialog = useCallback(() => {
  console.log(`[${getTimeStamp()}] Dialog closed by user`);
  setDialogOpen(false);
  dialogRef.current = false;

  // Only resume monitoring if game is not terminated
  if (!gameTerminated) {
    console.log(`[${getTimeStamp()}] Resuming monitoring after dialog close`);
    resumeMonitoring();
  }
}, [resumeMonitoring, gameTerminated]);




  // CRITICAL: Handle dialog close and resume monitoring
  // const closeDialog = useCallback(() => {
  //   console.log("✅ User confirmed understanding of warning")
  //   setDialogOpen(false)

    

  //   // For warnings 1 and 2: Resume monitoring after user confirmation
  //   if (warningCount < 3) {
  //     console.log(`▶️ Resuming monitoring after warning ${warningCount} confirmation...`)
  //     resumeMonitoring()
  //   }


  //   // showNextWarning()
  //   // For warning 3: Game will be terminated, no need to resume
  // }, [warningCount, resumeMonitoring ])

  return {
    liveFrame,
    phoneStarted,
    setPhoneStarted,
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







  // const focus_loss_count  = useRef(Number(0))

  // const { mutate: sendTestData } = useMutation({
  //   mutationFn: (formData: FormData) => give_test(formData),
  //   onSuccess: (data) => {
  //     logToWindow(`✅ Data sent: ${JSON.stringify(data)}`)
  //     if (!enabled) return

  //     if (monitoringPausedRef.current) {
  //       console.log("⏸️ Monitoring paused - Ignoring API response while dialog is open")
  //       return
  //     }

  //     if (
  //       data.final_focus &&
  //       (data.final_focus.includes("Incorrect Position (Distracted)") ||
  //         data.final_focus.includes("Warning: Partial Distraction"))
  //     ) {
  //       console.log("focus warn count 🚀🚀🚀🚀🚀🚀" , foucus_warn_count)
  //       foucus_warn_count.current += 1
  //       if (foucus_warn_count.current > 2){
  //         foucus_warn_count.current = 0
  //         triggerAlert("🚨 Your Focus is Losing. See the screen")
  //         console.log("focus loosoe count 🔥🔥🔥🔥🔥" , focus_loss_count)
  //         focus_loss_count.current += 1
  //       }
  //     }
  //     // Check for violations
  //     if (
  //       data.phone_detected || 
  //       data.multiple_people === true || 
  //       data.person_count < 1 || 
  //       focus_loss_count.current > 5 ||  
  //       disturbanceCount > 5
  //     ) {
  //       let violationType = "";

  //       if (data.phone_detected) {
  //         violationType = "Phone detected";
  //       } else if (data.multiple_people === true) {
  //         violationType = "Multiple people detected";
  //       } else if (data.person_count < 1) {
  //         violationType = "No person found";
  //       } else if (disturbanceCount > 5) {
  //         violationType = "Continuously Voice Detected";
  //       } else if (focus_loss_count.current > 5) {
  //         violationType = "Your focus continuously lost";
  //       }

  //       // now reset counts **after** checking
  //       focus_loss_count.current = 0;
  //       disturbanceCount = 0;

  //       setWarningCount((prev) => {
  //         const next = prev + 1
  //         setLastType(violationType)

  //         setViolationHistory((prevHistory) => [...prevHistory, `${new Date().toLocaleTimeString()}: ${violationType}`])

  //         // console.log(`🚨 Warning ${next}/3: ${violationType}`)

  //         if (next === 1) {
  //           pauseMonitoring()
  //           triggerAlert(`⚠️ First Warning: ${violationType}`)
  //           setWarningTitle("⚠️ First Warning!")
  //           setDialogOpen(true)
  //         } else if (next === 2) {
  //           pauseMonitoring()
  //           triggerAlert(`⚠️ Second Warning: ${violationType}`)
  //           setWarningTitle("⚠️ Second Warning - Final Chance!")
  //           setDialogOpen(true)
  //         }
  //         else if (next >= 3) {
  //           console.log("🚨 Third warning detected - Terminating game immediately")
  //           setWarningTitle("⚠️ Game Terminated!")
  //           setDialogOpen(true)
  //           pauseMonitoring()
  //           setTimeout(() => {
  //             handleGameTermination()
  //           }, 100)
  //         }
  //         return next
  //       })
  //     }
      
  //     if (!monitoringPausedRef.current) {
  //       if (data.person_count < 1) {
  //         clearExistingTimeout("person_count")
  //         alertTimeouts.person_count = setTimeout(() => {
  //           triggerAlert("🚨 No Person Found")
  //         }, 5000)
  //       } else {
  //         clearExistingTimeout("person_count")
  //       }
  //       // if (data.focus_loss_count > 2) {
  //       //   clearExistingTimeout("focus")
  //       //   alertTimeouts.focus = setTimeout(() => {
  //       //     triggerAlert("🚨 Your Focus is Losing. See the screen")
  //       //   }, 3000)
  //       // } else {
  //       //   clearExistingTimeout("focus")
  //       // }
  //     }
  //   },

  //   onError: (err: any) => {
  //     if (!enabled) return

  //     console.error("Monitoring API error:", err)

  //     if (err) {
  //       logToWindow(`❌ Error: ${err.message || err}`)
  //       alert("Monitoring is not working. Please contact your admin.")
  //       navigate(`/events/${event_id}`)
  //     }
  //   },
  // })





  // const [lastAlertTime, setLastAlertTime] = useState<string | null>(null);

  // const { data: phoneAlerts, refetch: refetchPhoneAlerts } = fetchPhoneAlerts(
  //   config.event_id,
  //   config.discipline_id,
  //   config.user_id,
  //   true,
  //   lastAlertTime

  // );

// useEffect(() => {
//   if (!phoneAlerts) return;

//   const phoneViolations = phoneAlerts.phone ?? [];
//   const now = Date.now();

//   phoneViolations.forEach((pAlert: PhoneAlert) => {
//     const violationTime = new Date(pAlert.log_time).getTime();

//     // Only process alerts newer than lastAlertTime
//     if (lastAlertTime && violationTime <= new Date(lastAlertTime).getTime()) return;

//     let violationType = "";
//     if (pAlert.phone_detection) violationType = "Phone detected";
//     else if (pAlert.multiple_people) violationType = "Multiple people detected";

//     if (!violationType) return;

//     const lastTime = lastPhoneAlertTimeRef.current[violationType] || 0;

//     if (now - lastTime > 2000) {
//       lastPhoneAlertTimeRef.current[violationType] = now;

//       setWarningCount((prev) => {
//         const next = prev + 1;
//         setLastType(violationType);
//         setViolationHistory((prevHistory) => [
//           ...prevHistory,
//           `${new Date().toLocaleTimeString()}: ${violationType}`,
//         ]);

//         if (next === 1) {
//           pauseMonitoring();
//           triggerAlert(`⚠️ First Warning: ${violationType}`);
//           setWarningTitle("⚠️ First Warning!");
//           setDialogOpen(true);
//         } else if (next === 2) {
//           pauseMonitoring();
//           triggerAlert(`⚠️ Second Warning: ${violationType}`);
//           setWarningTitle("⚠️ Second Warning - Final Chance!");
//           setDialogOpen(true);
//         } else if (next >= 3) {
//           setWarningTitle("⚠️ Game Terminated!");
//           setDialogOpen(true);
//           pauseMonitoring();
//           setTimeout(() => handleGameTermination(), 100);
//         }

//         return next;
//       });
//     }


//     setLastAlertTime(pAlert.log_time);
//   });
// }, [phoneAlerts]);



// export function useDesktopPhoneAlerts(
//   discipline_id: string,
//   event_id: string,
//   user_id: string,
//   triggerAlert: (msg: string) => void
// ) {
//   const wsRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     const ws = new WebSocket(
//       `wss://aidev.gravitinfosystems.com:5000/ws/desktop/${discipline_id}/${event_id}/${user_id}`
//     );
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("✅ Desktop WS connected");
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("📡 Desktop WS message received:", data);

//       if (data.type === "phone_ready") {
//         console.log("📱 Phone is ready");
//       }

//       if (data.type === "alert") {
//         console.log("⚠️ Instant phone alert received on desktop:", data.alert);
//         // Trigger the desktop alert popup
//         triggerAlert(`⚠️ ${data.alert_type} detected!`);
//       }
//     };

//     ws.onclose = () => {
//       console.log("📴 Desktop WS disconnected");
//     };

//     return () => ws.close();
//   }, [discipline_id, event_id, user_id, triggerAlert]);
// }

// export function fetchPhoneAlerts(eventId: string, disciplineId: string, userId: string, enabled: boolean ,   lastAlertTime: string | null) {
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   return useQuery({
//     queryKey: ["phone-alerts", eventId, disciplineId, userId, lastAlertTime],
//     queryFn: async () => {
//       const res = await api.get(`/alerts/${eventId}/${disciplineId}/${userId}`, {
//         params: { after: lastAlertTime },
//       });
//       return res.data?.alerts ?? { phone: [] };
//     },
//     enabled,               // fetch only if monitoring enabled
//     refetchInterval: 1000, // 1 second polling
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//   });
// }



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

//   const keyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null)
//   const contextMenuRef = useRef<((e: MouseEvent) => void) | null>(null)
//   const copyRef = useRef<() => void>(() => handleClipboard("copy"))
//   const pasteRef = useRef<() => void>(() => handleClipboard("paste"))
//   const cutRef = useRef<() => void>(() => handleClipboard("cut"))
//   const handleWindowChangeRef = useRef<((e?: any) => void) | null>(null)

//   const [warningCount, setWarningCount] = useState(0)
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [warningTitle, setWarningTitle] = useState("")
//   const [lastType, setLastType] = useState("")

//   // Critical: Control monitoring API calls based on dialog state
//   const [monitoringPaused, setMonitoringPaused] = useState(false)
//   const monitoringPausedRef = useRef(false)

//   const [violationHistory, setViolationHistory] = useState<string[]>([])
//   const [showTerminationPopup, setShowTerminationPopup] = useState(false)
//   const [gameTerminated, setGameTerminated] = useState(false)

//   const alertQueueRef = useRef<string[]>([])
//   const focus_loss_count = useRef<number>(0)
//   // const isFocusCooldown = useRef(false);
//   const foucus_warn_count = useRef<number>(0)



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


//   // const focus_loss_count  = useRef(Number(0))

//   const { mutate: sendTestData } = useMutation({
//     mutationFn: (formData: FormData) => give_test(formData),
//     onSuccess: (data) => {
//       logToWindow(`✅ Data sent: ${JSON.stringify(data)}`)
//       if (!enabled) return

//       if (monitoringPausedRef.current) {
//         console.log("⏸️ Monitoring paused - Ignoring API response while dialog is open")
//         return
//       }

//       if (
//         data.final_focus &&
//         (data.final_focus.includes("Incorrect Position (Distracted)") ||
//           data.final_focus.includes("Warning: Partial Distraction"))
//       ) {
//         console.log("focus warn count 🚀🚀🚀🚀🚀🚀" , foucus_warn_count)
//         foucus_warn_count.current += 1
//         if (foucus_warn_count.current > 2){
//           foucus_warn_count.current = 0
//           triggerAlert("🚨 Your Focus is Losing. See the screen")
//           console.log("focus loosoe count 🔥🔥🔥🔥🔥" , focus_loss_count)
//           focus_loss_count.current += 1
//         }
//       }
//       // Check for violations
//       if (
//         data.phone_detected || 
//         data.multiple_people === true || 
//         data.person_count < 1 || 
//         focus_loss_count.current > 5 ||  
//         disturbanceCount > 5
//       ) {
//         let violationType = "";

//         if (data.phone_detected) {
//           violationType = "Phone detected";
//         } else if (data.multiple_people === true) {
//           violationType = "Multiple people detected";
//         } else if (data.person_count < 1) {
//           violationType = "No person found";
//         } else if (disturbanceCount > 5) {
//           violationType = "Continuously Voice Detected";
//         } else if (focus_loss_count.current > 5) {
//           violationType = "Your focus continuously lost";
//         }

//         // now reset counts **after** checking
//         focus_loss_count.current = 0;
//         disturbanceCount = 0;

//         setWarningCount((prev) => {
//           const next = prev + 1
//           setLastType(violationType)

//           setViolationHistory((prevHistory) => [...prevHistory, `${new Date().toLocaleTimeString()}: ${violationType}`])

//           // console.log(`🚨 Warning ${next}/3: ${violationType}`)

//           if (next === 1) {
//             pauseMonitoring()
//             triggerAlert(`⚠️ First Warning: ${violationType}`)
//             setWarningTitle("⚠️ First Warning!")
//             setDialogOpen(true)
//           } else if (next === 2) {
//             pauseMonitoring()
//             triggerAlert(`⚠️ Second Warning: ${violationType}`)
//             setWarningTitle("⚠️ Second Warning - Final Chance!")
//             setDialogOpen(true)
//           }
//           else if (next >= 3) {
//             console.log("🚨 Third warning detected - Terminating game immediately")
//             setWarningTitle("⚠️ Game Terminated!")
//             setDialogOpen(true)
//             pauseMonitoring()
//             setTimeout(() => {
//               handleGameTermination()
//             }, 100)
//           }
//           return next
//         })
//       }
      
//       if (!monitoringPausedRef.current) {
//         if (data.person_count < 1) {
//           clearExistingTimeout("person_count")
//           alertTimeouts.person_count = setTimeout(() => {
//             triggerAlert("🚨 No Person Found")
//           }, 5000)
//         } else {
//           clearExistingTimeout("person_count")
//         }
//         // if (data.focus_loss_count > 2) {
//         //   clearExistingTimeout("focus")
//         //   alertTimeouts.focus = setTimeout(() => {
//         //     triggerAlert("🚨 Your Focus is Losing. See the screen")
//         //   }, 3000)
//         // } else {
//         //   clearExistingTimeout("focus")
//         // }
//       }
//     },

//     onError: (err: any) => {
//       if (!enabled) return

//       console.error("Monitoring API error:", err)

//       if (err) {
//         logToWindow(`❌ Error: ${err.message || err}`)
//         alert("Monitoring is not working. Please contact your admin.")
//         navigate(`/events/${event_id}`)
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
//       } else if (monitoringPausedRef.current) {
//         console.log("⏸️ Monitoring paused - Skipping API call while dialog is open")
//       }
//     }, 2000)

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

//   const stopMonitoring = useCallback(() => {
//     if (!enabled) return
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

//   // CRITICAL: Handle dialog close and resume monitoring
//   const closeDialog = useCallback(() => {
//     console.log("✅ User confirmed understanding of warning")
//     setDialogOpen(false)

//     // For warnings 1 and 2: Resume monitoring after user confirmation
//     if (warningCount < 3) {
//       console.log(`▶️ Resuming monitoring after warning ${warningCount} confirmation...`)
//       resumeMonitoring()
//     }
//     // For warning 3: Game will be terminated, no need to resume
//   }, [warningCount, resumeMonitoring])

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
//     lastType,
//     violationHistory,
//     showTerminationPopup,
//     handleTerminationClose,
//     gameTerminated,
//     monitoringPaused, // Expose monitoring paused state
//   }
// }
