"use client"

import { useEffect, useState, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { usePhoneMonitoring } from "../hooks/usePhoneMonitoring.ts"

export default function PhoneStreamCam() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const discipline_id = searchParams.get("discipline_id")!
  const event_id = searchParams.get("event_id")!
  const user_id = searchParams.get("user_id")!
  const passcode = searchParams.get("passcode")!

  const [started, setStarted] = useState(false)
  const [timer, setTimer] = useState(30)
  const [showInstructions, setShowInstructions] = useState(false)
  const [cameraMode, setCameraMode] = useState<"user" | "environment">("environment") // front = user, back = environment

  const {
    videoRef,
    verified,
    isMonitoring,
    startMonitoring,
    phoneDetected,
    multiplePeople,
  } = usePhoneMonitoring({ event_id, discipline_id, user_id, passcode })

  /** ---- CAMERA ACCESS ---- */
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraMode },
        audio: true,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      console.log(`📷 Camera ready (${cameraMode})`)
    } catch (err) {
      console.error("Cannot access camera:", err)
      alert("Cannot access camera or microphone.")
    }
  }, [cameraMode, videoRef])

  useEffect(() => {
    initCamera()
    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks()
      tracks?.forEach((t) => t.stop())
    }
  }, [initCamera])

  /** ---- START MONITORING ---- */
  const handleStart = () => {
    if (!verified) return
    setShowInstructions(false)
    setStarted(true)
    setTimer(30)

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown)
          startMonitoring()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  /** ---- TIMER FORMAT ---- */
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  
  useEffect(() => {
    if (verified) {
      setShowInstructions(true)
    }
  }, [verified])

  const handleToggleCamera = () => {
    setCameraMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

      {/* Toggle Button */}
      <button
        onClick={handleToggleCamera}
        className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-md z-50"
      >
        {cameraMode === "environment" ? "Switch to Front" : "Switch to Back"}
      </button>

      {showInstructions && verified && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-white">
          <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg text-center">
            <h2 className="text-xl font-bold mb-4">Instructions 🚨</h2>
            <ul className="text-left mb-4 list-disc list-inside space-y-2">
              <li>Place the mobile device 1 to 1.2 meters away from the user.</li>
              <li>Camera should capture the user's face, desk, hands, and surroundings clearly.</li>
              <li>Avoid bright lights or glare directly in front of the camera.</li>
              <li>Click "Start" to begin monitoring after the countdown.</li>
            </ul>
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Start
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-14 left-3 bg-black/60 text-white px-3 py-1 rounded font-bold">
        {!started && !verified && "Verifying..."}
        {!started && verified && "Ready to start"}
        {started && !isMonitoring && `⏳ Starting in ${formatTimer(timer)}`}
        {isMonitoring && "🎥 Monitoring Active"}
      </div>

      <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded font-bold">
        Phone Detected: {phoneDetected} | Multiple People: {multiplePeople}
      </div>
    </div>
  )
}
