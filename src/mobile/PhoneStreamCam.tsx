"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePhoneMonitoring } from "../hooks/usePhoneMonitoring.ts";
// import { usePreMonitoring } from "../hooks/usePreMonitoring.ts";
// import PhoneStreamFrameCapture from "./PhoneStream.tsx";

export default function PhoneStreamCam() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const discipline_id = searchParams.get("discipline_id")!;
  const event_id = searchParams.get("event_id")!;
  const user_id = searchParams.get("user_id")!;
  const passcode = searchParams.get("passcode")!;

  const [started, setStarted] = useState(false);
  // const [timer, setTimer] = useState(30);
  const [showInstructions, setShowInstructions] = useState(false);
  // const [cameraMode, setCameraMode] = useState<"user" | "environment">("environment");

  const {
    videoRef,
    verified,
    isMonitoring,
    // sendPhoneStatus,
    // startCameraPrecheck,
    // precheckTimer
    precheckTimer,
    // sendPrecheck,
    // setPrecheckTimer,
    cameraMode,
    // setCameraMode,
    startCamera,
    // startPrecheckCountdown,
    reconnectMessage
    // phoneDetected,
    // multiplePeople,
  } = usePhoneMonitoring({ event_id, discipline_id, user_id, passcode });

  // const {
  //   // frontVideoRef,
  //   // backVideoRef,
  //   validationPassed,
  //   startValidation,
  //   setMissingParts,
  //   setValidationPassed,
  //   onValidationChange,
  //   missingParts,
  //   handsVisible,
  //   headVisible,
  //   // legsVisible,
  //   // tableVisible,
  //   laptopVisible
  // } = usePreMonitoring({
  //   onValidationChange: (valid) => console.log("Position valid:", valid),
  // });

  /** ---- CAMERA ACCESS ---- */
  // const initCamera = useCallback(async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: cameraMode },
  //       audio: true,
  //     });
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       await videoRef.current.play();
  //     }
  //     console.log(`📷 Camera ready (${cameraMode})`);
  //   } catch (err) {
  //     console.error("Cannot access camera:", err);
  //     alert("Cannot access camera or microphone.");
  //   }
  // }, [cameraMode, videoRef]);

  // useEffect(() => {
  //   initCamera();
  //   return () => {
  //     const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
  //     tracks?.forEach((t) => t.stop());
  //   };
  // }, [initCamera]);

  // useEffect(() => {
  //   const missing: string[] = []
  //   if (!headVisible) missing.push("Head")
  //   if (!handsVisible) missing.push("Hands")
  //   // if (!legsVisible) missing.push("Legs")
  //   // if (!tableVisible) missing.push("Table")
  //   if (!laptopVisible) missing.push("Laptop")
    
  //   setMissingParts(missing)
  //   const valid = missing.length === 0
  //   setValidationPassed(valid)
  //   if (onValidationChange) onValidationChange(valid)
  // }, [headVisible, handsVisible, legsVisible, tableVisible, laptopVisible, onValidationChange])

  // /** ---- START MONITORING ---- */
  const handleStart = async () => {
    if (!verified) return;

    // Start pre-monitoring validation first
    // startValidation();

    // console.log("validation" , validationPassed)

    // if (!validationPassed) {
    //   alert("Please adjust your position until the camera captures you clearly.");
    //   return;
    // }

    // If validation passes, start countdown
    setShowInstructions(false);
    setStarted(true);

    // startPrecheckCountdown(30)
    // setTimeout(() => {
    //   sendPrecheck();
    // }, 30 * 1000);

    // const countdown = setInterval(() => {
    //   setPrecheckTimer((prev) => {
    //     if (prev <= 1) {
    //       clearInterval(countdown);
    //       // startCameraPrecheck()
    //       // sendPhoneStatus();
    //       return 0;
    //     }
    //     return prev - 1;
    //   });
    // }, 1000);
  };


  // const handleStart = async () => {
  //   if (!verified) return;
  //   setShowInstructions(false);
  //   setStarted(true);

  //   startCameraPrecheck(30_000);
  // };

  const handleToggleCamera = () => {
  const newMode = cameraMode === "environment" ? "user" : "environment"
  startCamera(newMode)
}

  /** ---- TIMER FORMAT ---- */
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /** ---- SHOW INSTRUCTIONS AFTER VERIFY ---- **/

  useEffect(() => {
    if (verified) {
      setShowInstructions(true);
    }
  }, [verified]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      {/* {missingParts.length > 0 && (
        <div className="text-red-500 p-4">
          Missing: {missingParts.join(", ")}
        </div>
      )} */}

      {/* {videoRef.current && (
        <PhoneStreamFrameCapture
          videoRef={videoRef}
          discipline_id={discipline_id}
          event_id={event_id}
          user_id={user_id}
        />
      )} */}

      {/* Camera Toggle Button */}
      <button
        onClick={handleToggleCamera}
        className="absolute bottom-0 right-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-md z-50"
      >
        {cameraMode === "environment" ? "Switch to Front" : "Switch to Back"}
      </button>

      {/* Status Display */}
      <div className="absolute top-5 left-3 bg-black/60 text-white px-3 py-1 rounded font-bold">
        {!started && !verified && "Verifying..."}
        {!started && verified && "Ready to start"}
        {started && !isMonitoring && precheckTimer > 0 && 
          `⏳ Complete verification in ${formatTimer(precheckTimer)} seconds...`}
        {isMonitoring && "🎥 Monitoring Active"}
        {reconnectMessage && reconnectMessage} 
      </div>

      {/* Pre-monitoring instructions */}
      {showInstructions && verified && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-white">
          <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg text-center">
            <h2 className="text-xl font-bold mb-4">Instructions 🚨</h2>
            <ul className="text-left mb-4 list-disc list-inside space-y-2">
              <li>Place the mobile device 1 to 1.2 meters away from the user.</li>
              <li>Ensure face, desk, hands, and surroundings are clearly visible.</li>
              <li>Avoid bright lights or glare in front of the camera.</li>
              <li>Click "Start" to begin monitoring after validation passes.</li>
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

      
      {/* Status footer */}
      {/* <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded font-bold">
        Phone Detected: {phoneDetected} | Multiple People: {multiplePeople}
      </div> */}
    </div>
  );
}
