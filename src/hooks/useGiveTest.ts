/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useMutation } from "@tanstack/react-query";
// import { give_test, logKeyboardEvent, window_events } from "../lib/api";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { MonitoringData } from "../types";
// import toast from "react-hot-toast";
// import { API_BASE_URL } from "../lib/client";
// import { useNavigate, useParams } from "react-router-dom";
// // import { api } from "../lib/client";

// const directionMap = {
//   Straight: 0,
//   Up: 1,
//   Down: 2,
//   Left: 3,
//   Right: 4,
//   Blink: 5,
// };

// const DISTURBANCE_THRESHOLD = 18;
// const DISTURBANCE_DURATION_LIMIT = 3;
// let disturbanceCount = 0;

// export function useMonitoring(config: MonitoringData  , enabled = true) {
//   const { event_id } = useParams()
//   const navigate = useNavigate()
//   const token = sessionStorage.getItem("auth_token");
//   const [isMonitoring, setIsMonitoring] = useState(false);
//   const [isFullScreen, setIsFullScreen] = useState(true);
//   const [gamePaused, setGamePaused] = useState(false);
//   // const [isMonitoringRequestRunning, setIsMonitoringRequestRunning] = useState(false);

//   const isMonitoringRef = useRef(false);
//   const mediaStreamRef = useRef<MediaStream | null>(null);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const recorderRef = useRef<MediaRecorder | null>(null);
//   const recordedChunksRef = useRef<Blob[]>([]);
//   const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
//   // const alertCooldownRef = useRef(false);


//   const keyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null);
//   const contextMenuRef = useRef<((e: MouseEvent) => void) | null>(null);
//   const copyRef = useRef<() => void>(() => handleClipboard("copy"));
//   const pasteRef = useRef<() => void>(() => handleClipboard("paste"));
//   const cutRef = useRef<() => void>(() => handleClipboard("cut"));
//   const handleWindowChangeRef = useRef<((e?: any) => void) | null>(null);

//   // const [phoneCount, setPhoneCount] = useState(0);
//   // const [peopleCount, setPeopleCount] = useState(0);
//   const [warningCount , setWarningCount] = useState(0)
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [warningTitle, setWarningTitle] = useState("");
//   const [lastType , setLastType] = useState("")


//   const [violationHistory, setViolationHistory] = useState<string[]>([])
//   const [showTerminationPopup, setShowTerminationPopup] = useState(false)
//   const [gameTerminated, setGameTerminated] = useState(false)


//   const alertQueueRef = useRef<string[]>([]); // store toast IDs

//   const prevFocusLossCount = useRef(0);

//   const triggerAlert = (message: string) => {
//     if (!enabled) return;

//     // If 2 or more toasts already showing, remove the oldest
//     if (alertQueueRef.current.length >= 2) {
//       const oldToastId = alertQueueRef.current.shift();
//       if (oldToastId) toast.dismiss(oldToastId);
//     }

//     // Show new toast and store ID
//     const id = toast.error(message, {
//       duration: 3000,
//     });
//     alertQueueRef.current.push(id);

//     setTimeout(() => {
//       alertQueueRef.current = alertQueueRef.current.filter((toastId) => toastId !== id);
//     }, 3000);
//   };


//   const logToWindow = (msg: string) => {
//     console.log(msg);
//     const el = document.getElementById("console-logs");
//     if (el) {
//       const p = document.createElement("p");
//       p.textContent = msg;
//       el.appendChild(p);
//       el.scrollTop = el.scrollHeight;
//     }
//   };

//   const alertTimeouts = {
//     phone: null as NodeJS.Timeout | null,
//     multiplePeople: null as NodeJS.Timeout | null,
//     focus: null as NodeJS.Timeout | null,
//     person_count: null as NodeJS.Timeout | null,
//   };

//   const clearExistingTimeout = (key: keyof typeof alertTimeouts) => {
//     if (alertTimeouts[key]) {
//       clearTimeout(alertTimeouts[key]!);
//       alertTimeouts[key] = null;
//     }
//   };

//   const { mutateAsync: sendTestData , isPending: monitoring_pending  } = useMutation({
//     mutationFn: (formData: FormData) => give_test(formData),
//     onSuccess: (data) => {
//       logToWindow(`✅ Data sent: ${JSON.stringify(data)}`);
//       if (!enabled) return;

//       if (
//         data.phone_detected ||
//         data.multiple_people === true ||
//         data.person_count < 1
//       ) {
//         let violationType = "";
//         if (data.phone_detected) violationType = "Phone";
//         else if (data.multiple_people) violationType = "People";
//         else if (data.person_count < 1) violationType = "NoPerson";

//         setWarningCount((prev) => {
//           const next = prev + 1;
//           setLastType(violationType);
//           setViolationHistory((prevHistory) => [
//             ...prevHistory,
//             `${new Date().toLocaleTimeString()}: ${violationType}`,
//           ]);
//           if (next === 1) {
//             const msg =
//               violationType === "Phone"
//                 ? "Phone detected"
//                 : violationType === "People"
//                 ? "Multiple People detected"
//                 : "No Person Found";
//               triggerAlert(`⚠️ Warning: ${msg}`);
//               setDialogOpen(true);
//               setWarningTitle("");
//             } else if (next > 1 && next < 3) {
//               setWarningTitle("⚠️ Repeated Violations Detected!");
//               setDialogOpen(true);
//             } else if (next >= 3) {
//               setWarningTitle("⚠️ Your Warning Exceeds the 3 limit! Your Exam will terminate");
//               setDialogOpen(true);
//             }
//           return next;
//         });
//       }

//       if(data.person_count < 1) {
//         clearExistingTimeout("person_count")
//         alertTimeouts.focus = setTimeout(() => {
//           triggerAlert("🚨 No Person Found");
//           toast.error("🚨 No Person Found");
//         },5000)
//       }else {
//         clearExistingTimeout("person_count")
//       }


//       // if (data.phone_detected) {
//       //   setPhoneCount(prev => {
//       //     const updated = prev + 1;
//       //     if (updated === 1) {
//       //       triggerAlert("📱 Phone detected! Please remove it.");
//       //     } else if (updated > 1) {
//       //       setWarningTitle("📱 Repeated Phone Detection");
//       //       setDialogOpen(true);
//       //     }
//       //     return updated;
//       //   });
//       // }

//       // if (data.multiple_people === true) {
//       //   setPeopleCount(prev => {
//       //     const updated = prev + 1;
//       //     if (updated === 1) {
//       //       triggerAlert("👥 Multiple people detected. Only one candidate allowed.");
//       //     } else if (updated > 1) {
//       //       setWarningTitle("👥 Repeated Multiple People Detected");
//       //       setDialogOpen(true);
//       //     }
//       //     return updated;
//       //   });
//       // }


//       // 👥 Multiple people detection logic with delay
//       // if (data.multiple_people === true) {
//       //   clearExistingTimeout("multiplePeople");
//       //   alertTimeouts.multiplePeople = setTimeout(() => {
//       //     triggerAlert("🚨 Multiple people detected. Only one candidate allowed.");
//       //     // toast.error("🚨 Multiple people detected. Only one candidate allowed.");
//       //   }, 3000);
//       // } else {
//       //   clearExistingTimeout("multiplePeople");
//       // }

//       // 👀 Focus detection logic with delay



//       console.log("Focus count 🚀🚀🚀🚀🚀" , data.focus_loss_count)


// // if (data.focus_loss_count > 2 ) {
// //     prevFocusLossCount.current = data.focus_loss_count;
// //     triggerAlert("🚨 Your Focus is Losing. See the screen");
// //     setWarningTitle("🚨 Your Focus is Losing. See the screen");
// // }



//       if (data.focus_loss_count > 2 && data.focus_loss_count !== prevFocusLossCount.current) {
//         prevFocusLossCount.current = data.focus_loss_count;
//         triggerAlert("🚨 Your Focus is Losing. See the screen");
//         setWarningTitle("🚨 Your Focus is Losing. See the screen");
//     } else {
//         clearExistingTimeout("focus");
//     }


//       //  if (
//       //   data.final_focus &&
//       //   (data.final_focus.includes("Incorrect Position (Distracted)") ||
//       //     data.final_focus.includes("Warning: Partial Distraction"))
//       // ) {
//       //   // setWarningTitle("🚨 Your Focus is Losing. See the screen");
//       //   setDialogOpen(true);
//       // }

//       // if(data.person_count < 1) {
//       //   alertTimeouts.focus = setTimeout(() => {
//       //     triggerAlert("🚨 No Person Found");
//       //     toast.error("🚨 No Person Found");
//       //   }, 000);
//       // }

      
//     },
//     onError: (err: any) => {
//       if (!enabled) return;

//       // Avoid repeated navigation
//       console.error("Monitoring API error:", err);

//       // Navigate user only if error exists
//       if (err) {
//         logToWindow(`❌ Error: ${err.message || err}`);
//         alert("Monitoring is not working. Please contact your admin.");
//         navigate(`/events/${event_id}`);
//       }
//     }
//   });


//   const { mutate: window_logs } = useMutation({
//     mutationFn: window_events,
//     onSuccess: (data) => {
//     if (!enabled) return
//     logToWindow(`✅ Data sent: ${JSON.stringify(data)}`)},
//     onError: () => {
//       if (!enabled) return
//       logToWindow("❌ Failed to log window event")},
//   });

//   const keyboardLogMutation = useMutation({
//     mutationFn: (keyboard_event: string) =>
//     logKeyboardEvent(config.discipline_id, config.user_id, keyboard_event),
//     onSuccess: () => {
//       if (!enabled) return
//       logToWindow("✅ Keyboard event logged")
//     },
//     onError: (err: any) => {
//       if (!enabled) return
//       logToWindow(`❌ Keyboard logging failed: ${err.message}`)
//     },
//   });

//   const getMicDb = async (analyser: AnalyserNode, dataArray: Uint8Array) => {
//     analyser.getByteFrequencyData(dataArray);
//     const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
//     return Math.round(20 * Math.log10(volume || 1));
//   };



//   const handleClipboard = (type: "copy" | "paste" | "cut") => {
//     if (!enabled) return
//     logToWindow(`🚫 Clipboard action: ${type}`);
//     triggerAlert(`Unethical activity: ${type.toUpperCase()} is not allowed.`);
//   };

//   const handleFullScreenChange = () => {
//     const fullscreen = !!document.fullscreenElement;
//     setIsFullScreen(fullscreen);
//     setGamePaused(!fullscreen); // Pause game if not fullscreen
//   };

//   useEffect(() => {
//     if (!enabled) return

//     handleWindowChangeRef.current = () => {
//       if (!isMonitoringRef.current) return;
//       logToWindow("🚨 Window/tab changed");
//       window_logs({
//         discipline_id: Number(config.discipline_id),
//         window_event: 1,
//         user_id: Number(config.user_id),
//         transaction_log: Date(),
//       });
//       triggerAlert("Unethical activity: Tab/window switch detected.");
//     };
//   }, []);

//   const startAudioRecording = () => {
//      if(!enabled) return;

//     if (!mediaStreamRef.current) return;
//     try {
//       const audioStream = new MediaStream(mediaStreamRef.current.getAudioTracks());
//       const recorder = new MediaRecorder(audioStream);
//       recorderRef.current = recorder;
//       recordedChunksRef.current = [];

//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           recordedChunksRef.current.push(e.data);
//         }
//       };

//       recorder.onstop = () => {
//         console.log("🛑 Audio recording stopped");

//         const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
//         const file = new File([audioBlob], "disturbance.webm", { type: "audio/webm" });

//         console.log("📦 Blob size:", audioBlob.size);
//         console.log("📄 File name:", file.name);

//        const formData = new FormData();
//         formData.append("audio", file); // This must be a real File object
//         formData.append("user_id", config.user_id);
//         formData.append("event_id", config.event_id);
//         formData.append("discipline_id", config.discipline_id);

//         console.log("📄 File name:", file.name);
//         console.log("Is File instance:", file instanceof File); // MUST be true

//         fetch(`${API_BASE_URL}/record_audio`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             // ❌ Do NOT set 'Content-Type' — let browser set it automatically with boundary
//           },
//           body: formData,
//         })
//           .then((res) => res.json())
//           .then((data) => console.log("✅ Upload success:", data))
//           .catch((err) => console.error("❌ Upload error:", err));
//       }
//       recorder.start();
//       recordingTimeoutRef.current = setTimeout(() => recorder.stop(), 5000);
//     } catch (err) {
//       console.error("🎙️ Recording failed:", err);
//       toast.error("🎙️ Failed to record audio.");
//     }

//   };

//   const startMonitoring = async () => {

//     if (!enabled) {
//       console.log("🚫 Monitoring is disabled for this event")
//       logToWindow("🚫 Monitoring is disabled for this event")
//       setIsMonitoring(false)
//       setGamePaused(false)
//       return
//     }

//     if (monitoring_pending) return;
    

//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     mediaStreamRef.current = stream;


//     const hasMic = stream.getAudioTracks().length > 0;
//     console.log("🎙️ Microphone access granted:", hasMic);  


//     stream.getAudioTracks().forEach(track => {
//       console.log("🎤 Mic track:", track.label, "enabled:", track.enabled);
//     });

//     const video = document.createElement("video");
//     videoRef.current = video;
//     video.srcObject = stream;
//     video.muted = true;
//     await video.play();

//     console.log("📹 Video is playing:", !video.paused);

//     const audioCtx = new (window.AudioContext || window.AudioContext)();
//     const source = audioCtx.createMediaStreamSource(stream);
//     const analyser = audioCtx.createAnalyser();
//     const dataArray = new Uint8Array(analyser.frequencyBinCount);
//     source.connect(analyser);

//     intervalRef.current = setInterval(async () => {
//       if (!document.fullscreenElement) {
//         setIsFullScreen(false);
//         setGamePaused(true);
//         return;
//       } else {
//         setIsFullScreen(true);
//         setGamePaused(false);
//       }

//       const voice_db = await getMicDb(analyser, dataArray);

//       console.log("voice_db" , voice_db)

      
//       if (voice_db > DISTURBANCE_THRESHOLD) {
//         disturbanceCount++;
//         logToWindow(`🔊 Loud voice detected (${voice_db} dB)`);
//         console.log("🎯 disturbanceCount", disturbanceCount);

//       } else {
//         disturbanceCount = 0;
//       }

//       if (disturbanceCount >= DISTURBANCE_DURATION_LIMIT) {
//         disturbanceCount = 0;
//         triggerAlert("🚨 Continuous voice disturbance detected!");
//         logToWindow("🎙️ Starting audio recording...");
//         startAudioRecording();
//       }

//       const canvas = document.createElement("canvas");
//       if (!videoRef.current) return;
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       if (!ctx) return;
//       ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//       const imgData = canvas.toDataURL("image/jpeg");

//       const formData = new FormData();
//       formData.append("user_id", config.user_id);
//       formData.append("event_id", config.event_id);
//       formData.append("imgData", imgData);
//       formData.append("discipline_id", config.discipline_id);
//       formData.append("voice_db", voice_db.toString());
//       formData.append("user_movements_updown", directionMap["Straight"].toString());
//       formData.append("user_movements_lr", directionMap["Left"].toString());
//       formData.append("user_movements_eyes", directionMap["Blink"].toString());

//       await sendTestData(formData);
//     }, 2000);

//     // Event listeners
//     keyDownRef.current = (event: KeyboardEvent) => {
//       const key = event.key.toLowerCase();
//       const combo =
//         (event.ctrlKey ? "ctrl+" : "") +
//         (event.altKey ? "alt+" : "") +
//         (event.metaKey ? "meta+" : "") +
//         key;

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
//         "f1": "Help",
//         "f12": "Dev Tools",
//         "printscreen": "Print Screen",
//         "meta": "Windows Key",
//       };

//       if (forbidden[combo]) {
//         event.preventDefault();
//         logToWindow(`🚫 Key detected: ${combo}`);
//         keyboardLogMutation.mutate(combo);
//         triggerAlert(`Unethical activity: ${forbidden[combo]} is not allowed.`);
//       }
//     };

//     contextMenuRef.current = (e: MouseEvent) => {
//       e.preventDefault();
//       logToWindow("🚫 Right-click detected");
//       triggerAlert("Unethical activity: Right-click is not allowed.");
//     };

//     window.addEventListener("blur", handleWindowChangeRef.current!);
//     window.addEventListener("keydown", keyDownRef.current!);
//     document.addEventListener("copy", copyRef.current);
//     document.addEventListener("paste", pasteRef.current);
//     document.addEventListener("cut", cutRef.current);
//     document.addEventListener("contextmenu", contextMenuRef.current!);
//     document.addEventListener("fullscreenchange", handleFullScreenChange);

//     isMonitoringRef.current = true;
//     setGamePaused(false);
//     setIsMonitoring(true);
//     logToWindow("🎥 Monitoring started.");
//   };

//   const stopMonitoring = useCallback(() => {
//     if (!enabled) return;
//     if (intervalRef.current) clearInterval(intervalRef.current);
//     if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
//     mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
//     videoRef.current?.remove();

//     window.removeEventListener("blur", handleWindowChangeRef.current!);
//     window.removeEventListener("keydown", keyDownRef.current!);
//     document.removeEventListener("copy", copyRef.current);
//     document.removeEventListener("paste", pasteRef.current);
//     document.removeEventListener("cut", cutRef.current);
//     document.removeEventListener("contextmenu", contextMenuRef.current!);
//     document.removeEventListener("fullscreenchange", handleFullScreenChange);

//     isMonitoringRef.current = false;
//     setIsMonitoring(false);
//     setGamePaused(false);
//     logToWindow("🛑 Monitoring stopped.");
//   }, [enabled]);

  

//   // Function to handle automatic game termination
//   const handleGameTermination = useCallback(async () => {
//     if (gameTerminated) return // Prevent multiple terminations

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

//   }, [navigate, event_id])


//   useEffect(() => {
//   if(!enabled) return;
//     const checkFullScreen = () => {
//       const isNowFullscreen = !!(
//         document.fullscreenElement ||
//         (document as any).webkitFullscreenElement ||
//         (document as any).mozFullScreenElement ||
//         (document as any).msFullscreenElement
//       );
//       setIsFullScreen(isNowFullscreen);
//       setGamePaused(!isNowFullscreen);
//     };

//     document.addEventListener("fullscreenchange", checkFullScreen);
//     return () => {
//       document.removeEventListener("fullscreenchange", checkFullScreen);
//     };
//   }, [enabled]);

//   // useEffect(() => {
//   //   if (warningCount > 3) {
//   //     stopMonitoring();
//   //     navigate(`/events/${event_id}`);
//   //     setDialogOpen(true); 
//   //     handleGameTermination?.();
//   //   }
//   // }, [warningCount,navigate , event_id , stopMonitoring , handleGameTermination]);

//   // const closeDialog = async () => {
//   //   if (warningCount >= 3) {
//   //     await stopMonitoring(); 
//   //     navigate(`/events/${event_id}`);  // THEN navigate
//   //     handleGameTermination?.();
//   //   } else {
//   //     setDialogOpen(false);
//   //   }
//   // }


//    useEffect(() => {
//     if (warningCount > 3) {
//         (async () => {
//             await stopMonitoring();
//             handleGameTermination?.();
//             navigate(`/events/${event_id}`);
//             setDialogOpen(true);
//         })();
//     }
//     }, [warningCount, navigate, event_id, stopMonitoring, handleGameTermination]);

//   const closeDialog = async () => {
//       if (warningCount >= 3) {
//           await stopMonitoring();
//           handleGameTermination?.();
//           navigate(`/events/${event_id}`);
//       } else {
//         setDialogOpen(false);
//       }
//   };

  
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
//   }
// }

"use client"

import { useMutation } from "@tanstack/react-query"
import { give_test, logKeyboardEvent, window_events } from "../lib/api"
import { useCallback, useEffect, useRef, useState } from "react"
import type { MonitoringData } from "../types"
import toast from "react-hot-toast"
import { API_BASE_URL } from "../lib/client"
import { useNavigate, useParams } from "react-router-dom"

const directionMap = {
  Straight: 0,
  Up: 1,
  Down: 2,
  Left: 3,
  Right: 4,
  Blink: 5,
}

const DISTURBANCE_THRESHOLD = 5
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


  // const focus_loss_count  = useRef(Number(0))

  const { mutate: sendTestData } = useMutation({
    mutationFn: (formData: FormData) => give_test(formData),
    onSuccess: (data) => {
      logToWindow(`✅ Data sent: ${JSON.stringify(data)}`)
      if (!enabled) return

      if (monitoringPausedRef.current) {
        console.log("⏸️ Monitoring paused - Ignoring API response while dialog is open")
        return
      }

      if (
        data.final_focus &&
        (data.final_focus.includes("Incorrect Position (Distracted)") ||
          data.final_focus.includes("Warning: Partial Distraction"))
      ) {
        console.log("focus warn count 🚀🚀🚀🚀🚀🚀" , foucus_warn_count)
        foucus_warn_count.current += 1
        if (foucus_warn_count.current > 2){
          foucus_warn_count.current = 0
          triggerAlert("🚨 Your Focus is Losing. See the screen")
          console.log("focus loosoe count 🔥🔥🔥🔥🔥" , focus_loss_count)
          focus_loss_count.current += 1
        }
      }
      // Check for violations
      if (
        data.phone_detected || 
        data.multiple_people === true || 
        data.person_count < 1 || 
        focus_loss_count.current > 5 ||  
        disturbanceCount > 5
      ) {
        let violationType = "";

        if (data.phone_detected) {
          violationType = "Phone detected";
        } else if (data.multiple_people === true) {
          violationType = "Multiple people detected";
        } else if (data.person_count < 1) {
          violationType = "No person found";
        } else if (disturbanceCount > 5) {
          violationType = "Continuously Voice Detected";
        } else if (focus_loss_count.current > 5) {
          violationType = "Your focus continuously lost";
        }

        // now reset counts **after** checking
        focus_loss_count.current = 0;
        disturbanceCount = 0;



        setWarningCount((prev) => {
          const next = prev + 1
          setLastType(violationType)

          setViolationHistory((prevHistory) => [...prevHistory, `${new Date().toLocaleTimeString()}: ${violationType}`])

          // console.log(`🚨 Warning ${next}/3: ${violationType}`)

          if (next === 1) {
            pauseMonitoring()
            triggerAlert(`⚠️ First Warning: ${violationType}`)
            setWarningTitle("⚠️ First Warning!")
            setDialogOpen(true)
          } else if (next === 2) {
            pauseMonitoring()
            triggerAlert(`⚠️ Second Warning: ${violationType}`)
            setWarningTitle("⚠️ Second Warning - Final Chance!")
            setDialogOpen(true)
          }
          else if (next >= 3) {
            console.log("🚨 Third warning detected - Terminating game immediately")
            setWarningTitle("⚠️ Game Terminated!")
            setDialogOpen(true)
            pauseMonitoring()
            setTimeout(() => {
              handleGameTermination()
            }, 100)
          }
          return next
        })
      }
      
      if (!monitoringPausedRef.current) {
        if (data.person_count < 1) {
          clearExistingTimeout("person_count")
          alertTimeouts.person_count = setTimeout(() => {
            triggerAlert("🚨 No Person Found")
          }, 5000)
        } else {
          clearExistingTimeout("person_count")
        }
        // if (data.focus_loss_count > 2) {
        //   clearExistingTimeout("focus")
        //   alertTimeouts.focus = setTimeout(() => {
        //     triggerAlert("🚨 Your Focus is Losing. See the screen")
        //   }, 3000)
        // } else {
        //   clearExistingTimeout("focus")
        // }
      }
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
