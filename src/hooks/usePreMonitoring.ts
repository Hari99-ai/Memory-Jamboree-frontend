"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as mpPose from "@mediapipe/pose"
import * as cocoSsd from "@tensorflow-models/coco-ssd"

interface UsePreMonitoringProps {
  onValidationChange?: (valid: boolean) => void
}

export function usePreMonitoring({ onValidationChange }: UsePreMonitoringProps) {
  const frontVideoRef = useRef<HTMLVideoElement | null>(null)
  const backVideoRef = useRef<HTMLVideoElement | null>(null)

  const [headVisible, setHeadVisible] = useState(false)
  const [handsVisible, setHandsVisible] = useState(false)
  const [legsVisible, setLegsVisible] = useState(false)
  const [tableVisible, setTableVisible] = useState(false)
  const [laptopVisible, setLaptopVisible] = useState(false)

  const [validationPassed, setValidationPassed] = useState(false)

  const poseDetectorRef = useRef<mpPose.Pose | null>(null)
  const objectModelRef = useRef<cocoSsd.ObjectDetection | null>(null)

  /** ---- Init Models ---- */
  const loadModels = useCallback(async () => {
    const pose = new mpPose.Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` })
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
    poseDetectorRef.current = pose
    
    objectModelRef.current = await cocoSsd.load()
  }, [])

  /** ---- Validate a video frame ---- */
  const validateFrame = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video || !poseDetectorRef.current || !objectModelRef.current) return

    const pose = poseDetectorRef.current
    const model = objectModelRef.current

    // Create tensor from video frame
    const predictions = await model.detect(video)

    // Check for table/laptop
    setTableVisible(predictions.some(p => p.class === "dining table" || p.class === "desk"))
    setLaptopVisible(predictions.some(p => p.class === "laptop"))

    // Pose detection
    pose.onResults((results) => {
      const landmarks = results.poseLandmarks
      if (!landmarks) return

      // Check head, hands, legs
      setHeadVisible(Boolean(landmarks[0]))
      setHandsVisible(Boolean(landmarks[15] && landmarks[16]))
      setLegsVisible(Boolean(landmarks[23] && landmarks[24]))
    })

    await pose.send({ image: video })
  }, [])

  /** ---- Monitoring loop ---- */
  const startValidation = useCallback(() => {
    const interval = setInterval(() => {
      validateFrame(frontVideoRef.current)
      validateFrame(backVideoRef.current)
    }, 500)
    return () => clearInterval(interval)
  }, [validateFrame])

  /** ---- Effect ---- */
  useEffect(() => {
    loadModels()
  }, [loadModels])

  useEffect(() => {
    const valid = headVisible && handsVisible && legsVisible && tableVisible && laptopVisible
    setValidationPassed(valid)
    if (onValidationChange) onValidationChange(valid)
  }, [headVisible, handsVisible, legsVisible, tableVisible, laptopVisible, onValidationChange])

  return {
    frontVideoRef,
    backVideoRef,
    headVisible,
    handsVisible,
    legsVisible,
    tableVisible,
    laptopVisible,
    validationPassed,
    startValidation,
  }
}
