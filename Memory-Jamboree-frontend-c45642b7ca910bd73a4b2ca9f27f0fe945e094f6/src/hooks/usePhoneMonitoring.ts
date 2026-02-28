import { useMutation } from "@tanstack/react-query"
import { phone_monitoring } from "../lib/api"
import { useRef, useState, useCallback } from "react"

interface PhoneMonitoringProps {
  event_id: string
  discipline_id: string
  user_id: string
  videoRef: React.RefObject<HTMLVideoElement | null>
}

export const usePhoneMonitoring = ({ 
  event_id, 
  discipline_id, 
  user_id, 
  videoRef 
}: PhoneMonitoringProps) => {
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [startMonitoring, setStartMonitoring] = useState(false)

  const { mutate: sendTestData } = useMutation({
    mutationFn: (formData: FormData) => phone_monitoring(formData),
    onSuccess: (data) => {
      if (data.monitoring_stopped) { 
        // alert("⚠ Monitoring Stopped")
        StopPhoneMonitoring()
      }
    },
    onError: (err) => {
      console.error("Monitoring error:", err)
      StopPhoneMonitoring()
    }
  })
  
  const StartPhoneMonitoring = useCallback(async () => {
    if (startMonitoring) return
    setStartMonitoring(true)

    // 🔊 check mic/video once before monitoring loop
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    const hasMic = stream.getAudioTracks().length > 0
    console.log("🎙️ Microphone access granted:", hasMic)

    intervalRef.current = setInterval(() => {
      if (!videoRef.current) return

      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const imgData = canvas.toDataURL("image/jpeg")

      const formData = new FormData()
      formData.append("imgData", imgData)
      formData.append("disc_id", discipline_id)
      formData.append("user_id", user_id)
      formData.append("event_id", event_id)

      console.log("📡 Sending monitoring frame...")
      sendTestData(formData)
    }, 2000)
  }, [discipline_id, user_id, event_id, videoRef, sendTestData, startMonitoring])

  const StopPhoneMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStartMonitoring(false)
    console.log("🛑 Monitoring stopped")
  }, [])

  return {
    StartPhoneMonitoring,
    StopPhoneMonitoring,
    startMonitoring,
  }
}
