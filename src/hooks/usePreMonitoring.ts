// "use client";

// import { useEffect, useRef, useState, useCallback } from "react"
// import * as mpPose from "@mediapipe/pose"
// import * as cocoSsd from "@tensorflow-models/coco-ssd"
// import { any } from "zod";

// interface UsePreMonitoringProps {
//   onValidationChange?: (valid: boolean) => void
// }

// export function usePreMonitoring({ onValidationChange }: UsePreMonitoringProps) {
//   const frontVideoRef = useRef<HTMLVideoElement | null>(null)
//   const backVideoRef = useRef<HTMLVideoElement | null>(null)

//   const [headVisible, setHeadVisible] = useState(false)
//   const [handsVisible, setHandsVisible] = useState(false)
//   const [legsVisible, setLegsVisible] = useState(false)
//   const [tableVisible, setTableVisible] = useState(false)
//   const [laptopVisible, setLaptopVisible] = useState(false)

//   const [missingParts, setMissingParts] = useState<string[]>([])
//   const [validationPassed, setValidationPassed] = useState(false)

//   const poseDetectorRef = useRef<mpPose.Pose | null>(null)
//   const objectModelRef = useRef<cocoSsd.ObjectDetection | null>(null)

//   /** ---- Init Models ---- */
//   const loadModels = useCallback(async () => {
//     const pose = new mpPose.Pose({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
//     })
//     pose.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//     })

//     pose.onResults((results) => {
//       const landmarks = results.poseLandmarks
//       if (!landmarks) return

//       setHeadVisible(Boolean(landmarks[0]))
//       setHandsVisible(Boolean(landmarks[15] && landmarks[16]))
//       setLegsVisible(Boolean(landmarks[23] && landmarks[24]))
//     })

//     poseDetectorRef.current = pose
//     objectModelRef.current = await cocoSsd.load()
//   }, [])

//   /** ---- Validate a video frame ---- */
//   const validateFrame = useCallback(async (video: HTMLVideoElement | null) => {
//     if (!video || !poseDetectorRef.current || !objectModelRef.current) return

//     const model = objectModelRef.current
//     const predictions = await model.detect(video)

//     setTableVisible(predictions.some(p => p.class === "dining table" || p.class === "desk"))
//     setLaptopVisible(predictions.some(p:any => p.class === "laptop"))

//     await poseDetectorRef.current.send({ image: video })
//   }, [])

//   /** ---- Monitoring loop ---- */
//   const startValidation = useCallback(() => {
//     const interval = setInterval(() => {
//       validateFrame(frontVideoRef.current)
//       validateFrame(backVideoRef.current)
//     }, 500)
//     return () => clearInterval(interval)
//   }, [validateFrame])

//   /** ---- Check validation and missing parts ---- */

//   return {
//     frontVideoRef,
//     backVideoRef,
//     headVisible,
//     setMissingParts,
//     setValidationPassed,
//     onValidationChange,
//     handsVisible,
//     legsVisible,
//     tableVisible,
//     laptopVisible,
//     missingParts,      // <-- array of missing items
//     validationPassed,
//     startValidation,
//   }
// }
