"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { SocketURL } from "../lib/client"

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
    sendPhoneStatus
  }
}
