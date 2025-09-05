"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { SocketURL } from "../lib/client"
// import * as tf from "@tensorflow/tfjs";
// import * as handPose from "@tensorflow-models/hand-pose-detection";
// // import * as faceLandmarks from "@tensorflow-models/face-landmarks-detection";
// import * as poseDetection from "@tensorflow-models/pose-detection";
// import "@tensorflow/tfjs-backend-webgl";
// import "@tensorflow/tfjs-backend-cpu";


interface PhoneMonitoringProps {
  event_id: string
  discipline_id: string
  user_id: string
  passcode?: string
}


export function usePhoneMonitoring({ event_id, discipline_id, user_id, passcode }: PhoneMonitoringProps) {
  const wsRef = useRef<WebSocket | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [verified, setVerified] = useState(false)
  const [paused, setPaused] = useState(false)
  

  const [phoneDetected, setPhoneDetected] = useState(0)
  const [multiplePeople, setMultiplePeople] = useState(0)

  const [faceDetected, setFaceDetected] = useState(0)
  const [handDetected, setHandDetected] = useState(0)
    const precheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // const prevFaceDetectedRef = useRef(0)
  // const prevHandDetectedRef = useRef(0)

  const phoneReadySentRef = useRef(false)
  const [precheckTimer, setPrecheckTimer] = useState<number>(0);

  const [cameraMode, setCameraMode] = useState<"user" | "environment">("environment");

  

  // Add near other useState calls
  // const [precheckTimer, setPrecheckTimer] = useState<number>(0);
  // const lastSentRef = useRef<number | null>(null);


//  const [verificationTimer, setVerificationTimer] = useState<number | null>(null);
// const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);



  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /** ---- SAFE WS SEND ---- */
  const safeSend = useCallback((payload: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify(payload))
  }, [])

  const safe_send = useCallback(async (ws: WebSocket | null, payload: any) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    try {
      ws.send(JSON.stringify(payload))
    } catch (err) {
      console.warn("⚠️ Failed to send WS message:", err, payload)
    }
  }, [])

  const sendPhoneStatus = useCallback(() => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not open. Retrying phone_ready in 1s...");
      setTimeout(sendPhoneStatus, 1000); // retry after 1s
      return;
    }

    safe_send(ws, {
      type: "phone_ready", // must match backend
      discipline_id: String(discipline_id),
      event_id,
      user_id
    });

    console.log("📡 Sent phone_status (phone_ready) to desktop");
  }, [discipline_id, event_id, user_id, safeSend]);


// 🔹 sendPrecheck with forced resend every 5 seconds
  const sendPrecheck = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth / 2;
    canvas.height = videoRef.current.videoHeight / 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            safeSend({
              type: "prechecking",
              image: reader.result
            });
          // startPrecheckCountdown(30)
        };
        reader.readAsDataURL(blob);
    }, "image/jpeg", 0.5);
}, [faceDetected, handDetected, safeSend]);

 const startPrecheckCountdown = useCallback((duration: number) => {
  if (precheckTimeoutRef.current) clearInterval(precheckTimeoutRef.current);
  setPrecheckTimer(duration);

  precheckTimeoutRef.current = setInterval(() => {
    setPrecheckTimer((prev) => {
      if (prev <= 1) {
        clearInterval(precheckTimeoutRef.current!);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}, []);



// // Utility: wait for video dimensions to be ready
// function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
//   return new Promise((resolve) => {
//     if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
//       resolve();
//     } else {
//       video.addEventListener(
//         "loadedmetadata",
//         () => resolve(),
//         { once: true }
//       );
//     }
//   });
// }

// const startCameraPrecheck = useCallback(
//   async (
//     durationMs: number = 30000,
//     onTick?: (remainingMs: number) => void,
//     externalDeviceId?: string
//   ) => {
//     if (!videoRef.current) return;
//     const videoEl = videoRef.current;

//     // Stop any previous stream
//     const prevStream = videoEl.srcObject as MediaStream | null;
//     prevStream?.getTracks().forEach((t) => t.stop());
//     videoEl.srcObject = null;

//     // Reset state
//     setPrecheckTimer(Math.ceil(durationMs / 1000));
//     phoneReadySentRef.current = false;

//     try {
//       // Ensure backend ready
//       await tf.setBackend("webgl").catch(() => tf.setBackend("cpu"));
//       await tf.ready();
//       console.log("✅ TFJS backend:", tf.getBackend());

//       // Start camera
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: externalDeviceId
//           ? { deviceId: { exact: externalDeviceId }, width: 640, height: 480 }
//           : { facingMode: "user", width: 640, height: 480 },
//         audio: false,
//       });

//       videoEl.srcObject = stream;
//       videoEl.autoplay = true;
//       videoEl.playsInline = true;
//       videoEl.muted = true;
//       await videoEl.play();
//       await waitForVideoReady(videoEl);
//       console.log("📹 Video ready:", videoEl.videoWidth, "x", videoEl.videoHeight);

//       // Create detectors
//       const handDetector = await handPose.createDetector(
//         handPose.SupportedModels.MediaPipeHands,
//         { runtime: "tfjs", maxHands: 1 }
//       );
//       const poseDetector = await poseDetection.createDetector(
//         poseDetection.SupportedModels.BlazePose,
//         { runtime: "tfjs", modelType: "lite" }
//       );

//       // Warm-up models
//       await handDetector.estimateHands(videoEl);
//       await poseDetector.estimatePoses(videoEl);
//       console.log("🔥 Models warmed up");

//       const startTime = Date.now();
//       let handFrames = 0;
//       let faceFrames = 0;
//       const requiredFrames = 2;

//       const processFrame = async () => {
//         if (!videoEl || videoEl.readyState < 2) {
//           requestAnimationFrame(processFrame);
//           return;
//         }

//         try {
//           // --- Hand detection ---
//           const hands = await handDetector.estimateHands(videoEl);
//           let handFound = hands.length > 0;
//           handFrames = handFound ? handFrames + 1 : 0;
//           const localHandDetected = handFrames >= requiredFrames ? 1 : 0;
//           setHandDetected(localHandDetected);

//           if (handFound) {
//             hands.forEach((hand: any) => {
//               const keypoints = hand.keypoints || [];
//               console.log(
//                 "Hand keypoints:",
//                 keypoints.map((kp: any) => ({
//                   name: kp.name,
//                   score: kp.score ?? "no score",
//                   x: kp.x.toFixed(1),
//                   y: kp.y.toFixed(1),
//                 }))
//               );
//             });
//           }

//           // --- Face detection ---
//           const poses = await poseDetector.estimatePoses(videoEl);
//           console.log("poses raw:", poses);

//           const faceFound = poses.some((pose) =>
//             pose.keypoints.some(kp => {
//               // Only count if coordinates exist
//               const hasValidCoord = !isNaN(kp.x) && !isNaN(kp.y);
//               const highScore = (kp.score ?? 0) > 0.25;
//               const isFacePart = ["nose","left_eye","right_eye","mouth"].includes(kp.name ?? "");
//               return hasValidCoord && highScore && isFacePart;
//             })
//           );

//           faceFrames = faceFound ? faceFrames + 1 : 0;
//           const localFaceDetected = faceFrames >= requiredFrames ? 1 : 0;
//           setFaceDetected(localFaceDetected);

//           // Send intermediate status
//           sendPrecheck(localFaceDetected, localHandDetected);


//           // Debug status
//           console.log("Precheck frame:", {
//             handDetected: localHandDetected,
//             faceDetected: localFaceDetected,
//           });
//         } catch (err) {
//           console.error("Frame processing error:", err);
//         }

//         // Timer logic
//         const elapsed = Date.now() - startTime;
//         const remaining = durationMs - elapsed;
//         setPrecheckTimer(Math.max(Math.ceil(remaining / 1000), 0));
//         onTick?.(remaining);

//         if (remaining <= 0) {
//           safeSend({
//             type: "prechecking-final",
//             face: faceDetected,
//             hand: handDetected,
//             timestamp: Date.now(),
//           });

//           if (faceDetected && handDetected && !phoneReadySentRef.current) {
//             phoneReadySentRef.current = true;
//             sendPhoneStatus();
//             console.log("✅ Precheck passed: phone ready sent");
//           } else {
//             console.warn("❌ Precheck failed: face or hand not detected reliably");
//           }
//           return;
//         }

//         requestAnimationFrame(processFrame);
//       };

//       processFrame();
//     } catch (err) {
//       console.error("❌ Failed to start precheck:", err);
//     }
//   },
//   [sendPhoneStatus, sendPrecheck, safeSend]
// );




  /** ---- PHONE ALERT LOOP ---- */
  const startPhoneAlertLoop = useCallback(() => {
    if (alertIntervalRef.current) clearInterval(alertIntervalRef.current)

    alertIntervalRef.current = setInterval(() => {
      if (!paused && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        safeSend({
          type: "phone_alert",
          disciplineId: discipline_id,
          event_id,
          user_id,
          alert: { phone_detected: phoneDetected, multiple_people: multiplePeople },
        })
      }
    }, 2000)
  }, [phoneDetected, multiplePeople, paused, discipline_id, event_id, user_id, safeSend])

  const stopPhoneAlertLoop = useCallback(() => {
    if (alertIntervalRef.current) clearInterval(alertIntervalRef.current)
  }, [])

  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null) 

  const startCamera = useCallback(
    async (mode?: "user" | "environment") => {
      if (!videoRef.current) return;
      const videoEl = videoRef.current;

      // Stop previous stream
      if (videoEl.srcObject) {
        (videoEl.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        videoEl.srcObject = null;
      }

      const cameraToUse = mode ?? cameraMode;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraToUse },
          audio: true,
        });
        videoEl.srcObject = stream;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.muted = true;
        await videoEl.play();
        setCameraMode(cameraToUse);
        console.log(`📹 Camera started: ${cameraToUse}`);
      } catch (err) {
        console.warn(`⚠️ Failed to open camera (${cameraToUse}):`, err);
        return;
      }

      // Start always-running frame loop (precheck / preview)
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = setInterval(() => {
        if (!videoEl || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth / 2;
        canvas.height = videoEl.videoHeight / 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const reader = new FileReader();
          reader.onloadend = () => {
            safeSend({
              type: "frame", // always send frame regardless of monitoring
              image: reader.result,
              timestamp: Date.now(),
            });
          };
          reader.readAsDataURL(blob);
        }, "image/jpeg", 0.5);
      }, 2000);
    },
    [cameraMode, safeSend]
  );

  const stopCamera = useCallback(() => {
    if (!videoRef.current) return;
    const videoEl = videoRef.current;

    // Stop all tracks
    if (videoEl.srcObject) {
      const stream = videoEl.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoEl.srcObject = null;
      console.log("📹 Camera stopped");
    }

    // Clear the frame sending interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  /** ---- START MONITORING ---- */
  const startMonitoring = useCallback(() => {
    if (!videoRef.current || isMonitoring) return;
    setIsMonitoring(true);
    startPhoneAlertLoop();

    // Start separate monitoring frame loop
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
    monitorIntervalRef.current = setInterval(() => {
      const videoEl = videoRef.current;
      if (!videoEl || paused || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth / 2;
      canvas.height = videoEl.videoHeight / 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          safeSend({
            type: "monitoring", // separate from precheck frames
            imgData: reader.result,
            user_id,
            event_id,
            discipline_id,
            multiple_people: multiplePeople,
            phone_detected: phoneDetected,
            voice_db: 0,
            timestamp: Date.now(),
          });
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.5);
    }, 2000);
  }, [isMonitoring, paused, user_id, event_id, discipline_id, phoneDetected, multiplePeople, safeSend, startPhoneAlertLoop]);



  const stopMonitoring = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setIsMonitoring(false)
    setPaused(false)
    stopPhoneAlertLoop()
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current)
      monitorIntervalRef.current = null
    }
    if (precheckTimeoutRef.current) clearTimeout(precheckTimeoutRef.current);
  }, [stopPhoneAlertLoop, safeSend, user_id, event_id, discipline_id])


  /** ---- WS INIT ---- */
  const initWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`${SocketURL}/phone/${discipline_id}/${event_id}/${user_id}`)
    wsRef.current = ws


    let retryCount = 0
    const MAX_RETRIES = 20 // 20 retries ~ 40 seconds if interval is 2s
    const RETRY_INTERVAL = 2000 // 2 seconds


    const retryConnection = () => {
      if (retryCount >= MAX_RETRIES) {
        console.error("❌ Max WS retry attempts reached. Could not connect to desktop.")
        alert("Unable to connect to desktop after multiple attempts.")
        return
      }
      retryCount += 1
      console.log(`🔁 Retrying WS connection in ${RETRY_INTERVAL / 1000}s (attempt ${retryCount})`)
      setTimeout(() => {
        initWebSocket()
      }, RETRY_INTERVAL)
    }

    ws.onopen = () => {
      console.log("Phone WS connected")
      retryCount = 0 
      safeSend({ type: "verify", passcode })
      startCamera()
      // sendPhoneStatus()
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "verified") {
        setVerified(true)
        // sendPhoneStatus();
        // startPrecheckCountdown(30);

      }
      if (data.type === "start_monitoring") {
        console.log("▶️ Desktop requested start_monitoring");

        if (!isMonitoring) {
          // Optional: show countdown toast
          // toast.info("⏳ Monitoring will start in 5 seconds...");

          setTimeout(() => {
            startMonitoring();
            startPhoneAlertLoop();
            // toast.success("🎥 Monitoring Started");
          }, 5000); // 5000ms = 5 seconds
        }
      }

      if (data.type === "pause_monitoring") {
        setPaused(true)
        if (monitorIntervalRef.current) {
          clearInterval(monitorIntervalRef.current)
          monitorIntervalRef.current = null
        }
      }

      if (data.type === "resume_monitoring"){
        setPaused(false)
        if (!isMonitoring) {
          startMonitoring() 
          startPhoneAlertLoop()
        }
      }
    
      if (data.type === "stop_monitoring") {
        console.log("⛔ Stop monitoring received");
        stopMonitoring();
        safeSend({ type: "stop_ack" }); 
        alert("Monitoring stopped");
      }

        
      if (data.type === "monitoring") {
        setPhoneDetected(data.phone_detected == 1 ? 1 : 0)
        setMultiplePeople(data.multiple_people == 1 ? 1 : 0)
      }


      if (data.type === "precheck_reset" || data.type === "preset") {
        setHandDetected(0);
        setFaceDetected(0);
        phoneReadySentRef.current = false;

        console.log("🔄 Received precheck reset, scheduling precheck in 10s");
        startPrecheckCountdown(10); 
        setTimeout(() => {
          sendPrecheck();
        }, 10000);
      }

      if(data.type === "desktop_disconnected"){
        safeSend({type: "phone_disconnected"})
        alert("Desktop disconnected")
        stopMonitoring()
        stopCamera()
      }
      
      if (data.type === "error" && data.message === "Desktop must be connected first") {
          console.warn("⚠️ Desktop not ready yet. Retrying WS...")
          ws.close() // triggers retryConnection
          return
      }
    }

    
    ws.onclose = () => {
      console.log("Phone WS closed")
        safeSend({
        type: "phone_disconnected",
        user_id,
        event_id,
        discipline_id,
      });
      retryConnection()
      stopMonitoring()
      setTimeout(initWebSocket, 5000)
    }

    ws.onerror = (err) => console.error("Phone WS error:", err)
  }, [discipline_id, event_id, user_id, passcode, stopMonitoring, safeSend])

  // useEffect(() => {
  //   startCamera();
  // }, [cameraMode, startCamera]);


  /** ---- HOOK EFFECT ---- */
  useEffect(() => {
    initWebSocket()
    return () => {
      stopMonitoring()
      if (wsRef.current) wsRef.current.close()
    }
  }, [initWebSocket, stopMonitoring])

  return {
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    videoRef,
    verified,
    setVerified,
    paused,
    setPaused,
    phoneDetected,
    multiplePeople,
    setPhoneDetected,
    setMultiplePeople,
    sendPhoneStatus,
    sendPrecheck,
    precheckTimer,
    setPrecheckTimer,
    cameraMode,
    startCamera,
    startPrecheckCountdown
  }
}
