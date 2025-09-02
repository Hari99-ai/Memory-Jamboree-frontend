"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { SocketURL } from "../lib/client"
import * as tf from "@tensorflow/tfjs";
import * as handPose from "@tensorflow-models/hand-pose-detection";
// import * as faceLandmarks from "@tensorflow-models/face-landmarks-detection";
import * as poseDetection from "@tensorflow-models/pose-detection";

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

  const prevFaceDetectedRef = useRef(0)
  const prevHandDetectedRef = useRef(0)

  const phoneReadySentRef = useRef(false) //
  // Add near other useState calls
  const [precheckTimer, setPrecheckTimer] = useState<number>(0);
  const lastSentRef = useRef<number | null>(null);


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
  const now = Date.now();
  const shouldForceSend = !lastSentRef.current || now - lastSentRef.current >= 5000;

  if (
    !shouldForceSend &&
    faceDetected === prevFaceDetectedRef.current &&
    handDetected === prevHandDetectedRef.current
  ) {
    return; // Skip duplicate updates unless forced
  }

  prevFaceDetectedRef.current = faceDetected;
  prevHandDetectedRef.current = handDetected;
  lastSentRef.current = now;

  safeSend({
    type: "prechecking",
    face: faceDetected,
    hand: handDetected,
    timestamp: now,
  });

  // Trigger phone ready status if both detected and not yet sent
  if (faceDetected === 1 && handDetected === 1 && !phoneReadySentRef.current) {
    phoneReadySentRef.current = true;
    sendPhoneStatus();
    console.log("✅ Phone ready sent to desktop");
  }
}, [faceDetected, handDetected, safeSend, sendPhoneStatus]);

// 🔹 startCameraPrecheck with 30-second timer & final notification
const startCameraPrecheck = useCallback(
  async (durationMs: number = 30000, onTick?: (remainingMs: number) => void) => {
    if (!videoRef.current) return;
    const videoEl = videoRef.current;

    // Stop previous stream
    const prevStream = videoEl.srcObject as MediaStream | null;
    prevStream?.getTracks().forEach((t) => t.stop());
    videoEl.srcObject = null;

    // Reset timer
    setPrecheckTimer(Math.ceil(durationMs / 1000));
    phoneReadySentRef.current = false;

    try {
      await tf.setBackend("webgl");
      await tf.ready();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
        audio: false,
      });
      videoEl.srcObject = stream;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.muted = true;
      await videoEl.play();

      const handDetector = await handPose.createDetector(
        handPose.SupportedModels.MediaPipeHands,
        { runtime: "tfjs", maxHands: 1 }
      );

      const poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        { runtime: "tfjs", modelType: "lite" }
      );

      const startTime = Date.now();
      let localHandDetected = 0;
      let localHeadDetected = 0;

      const processFrame = async () => {
        if (!videoEl || videoEl.readyState < 2) {
          requestAnimationFrame(processFrame);
          return;
        }

        try {
          const hands = await handDetector.estimateHands(videoEl);
          localHandDetected = hands.some((hand:any) => (hand.score?.[0] ?? 0) > 0.8) ? 1 : 0;
          setHandDetected(localHandDetected);

          const poses = await poseDetector.estimatePoses(videoEl);
          localHeadDetected = poses.some((pose) =>
            pose.keypoints.some(
              (kp) =>
                ["nose", "left_eye", "right_eye"].includes(kp.name ?? "") &&
                (kp.score ?? 0) > 0.5
            )
          )
            ? 1
            : 0;
          setFaceDetected(localHeadDetected);

          sendPrecheck();
        } catch (err) {
          console.error("Frame processing error:", err);
        }

        const elapsed = Date.now() - startTime;
        const remaining = durationMs - elapsed;

        setPrecheckTimer(Math.max(Math.ceil(remaining / 1000), 0));
        onTick?.(remaining);

        if (remaining <= 0) {
          // Always send final status
          safeSend({
            type: "prechecking-final",
            face: localHeadDetected,
            hand: localHandDetected,
            timestamp: Date.now(),
          });

          if (localHandDetected === 1 && localHeadDetected === 1 && !phoneReadySentRef.current) {
            phoneReadySentRef.current = true;
            sendPhoneStatus();
            console.log("✅ Precheck passed: sent phone status to desktop");
          } else {
            console.log("❌ Precheck failed: hand or head not detected");
          }

          return;
        }

        requestAnimationFrame(processFrame);
      };

      processFrame();
    } catch (err) {
      console.error("Failed to start precheck:", err);
    }
  },
  [sendPhoneStatus, sendPrecheck, safeSend]
);



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

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
        audio: false, // audio not needed for frame sending
      })

      const videoEl = videoRef.current
      videoEl.srcObject = stream
      videoEl.autoplay = true
      videoEl.playsInline = true
      videoEl.muted = true
      await videoEl.play()

      // Start frame streaming loop (every 2s)
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = setInterval(() => {
        if (!videoEl || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

        const canvas = document.createElement("canvas")
        canvas.width = videoEl.videoWidth / 2
        canvas.height = videoEl.videoHeight / 2
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (!blob) return
          const reader = new FileReader()
          reader.onloadend = () => {
            safeSend({
              type: "frame",
              image: reader.result,
              timestamp: Date.now(),
            })
          }
          reader.readAsDataURL(blob)
        }, "image/jpeg", 0.5)
      }, 2000)
    } catch (err) {
      console.error("Failed to access camera:", err)
    }
  }, [safeSend])

  /** ---- MONITORING ---- */
   const startMonitoring = useCallback(async () => {
    if (isMonitoring || !videoRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
        audio: true
      })

      const videoEl = videoRef.current
      videoEl.srcObject = stream
      videoEl.autoplay = true
      videoEl.playsInline = true
      videoEl.muted = true
      await videoEl.play()

      setIsMonitoring(true)
      startPhoneAlertLoop()

      monitorIntervalRef.current = setInterval(() => {
        if (!videoEl || paused) return
        const canvas = document.createElement("canvas")
        canvas.width = videoEl.videoWidth / 2
        canvas.height = videoEl.videoHeight / 2
        const ctx = canvas.getContext("2d")
        
        if (!ctx) return
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (!blob) return
          const reader = new FileReader()
          reader.onloadend = () => {
            safeSend({
              type: "monitoring",
              imgData: reader.result,
              user_id,
              event_id,
              discipline_id,
              multiple_people: multiplePeople,
              phone_detected: phoneDetected,
              voice_db: 0,
            })
          }
          reader.readAsDataURL(blob)
        }, "image/jpeg", 0.5)
      }, 2000)

    } catch (err) {
      console.error("Failed to start monitoring:", err)
      setIsMonitoring(false)
    }
  }, [isMonitoring, paused, user_id, event_id, discipline_id, multiplePeople, phoneDetected, safeSend, startPhoneAlertLoop])

  

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
  }, [stopPhoneAlertLoop, safeSend, user_id, event_id, discipline_id])


  /** ---- WS INIT ---- */
  const initWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`${SocketURL}/phone/${discipline_id}/${event_id}/${user_id}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("Phone WS connected")
      safeSend({ type: "verify", passcode })
      startCamera()
      // sendPhoneStatus()
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "verified") {
        setVerified(true)
        // sendPhoneStatus();

      }
      if (data.type === "start_monitoring") {
        console.log("▶️ Desktop requested start_monitoring")
        if (!isMonitoring) {
          startMonitoring() 
          startPhoneAlertLoop()
        }
      }

      if (data.type === "precheck_reset") {
        setHandDetected(0);
        setFaceDetected(0);
        startCameraPrecheck(10_000);
        phoneReadySentRef.current = false;
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
        stopMonitoring()
        alert("Monitoring stopped")
        return
      }
        
      if (data.type === "monitoring") {
        setPhoneDetected(data.phone_detected == 1 ? 1 : 0)
        setMultiplePeople(data.multiple_people == 1 ? 1 : 0)
      }
    }

    ws.onclose = () => {
      console.log("Phone WS closed")
      stopMonitoring()
      setTimeout(initWebSocket, 5000)
    }

    ws.onerror = (err) => console.error("Phone WS error:", err)
  }, [discipline_id, event_id, user_id, passcode, stopMonitoring, safeSend])






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
    startCameraPrecheck,
    precheckTimer
  }
}
