"use client";

import { useCallback,  useEffect,  useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePhoneCaptured } from "../hooks/usePhoneCaptured.ts";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/client.ts";
import { usePhoneMonitoring } from "../hooks/usePhoneMonitoring.ts";


export default function PhoneStreamCam() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [, setCaptured] = useState(false);
  const discipline_id = searchParams.get("discipline_id")!;
  const event_id = searchParams.get("event_id")!;
  const user_id = searchParams.get("user_id")!;

   const [countdown, setCountdown] = useState<number | null>(null);

  const [showInstructions, setShowInstructions] = useState(true); 
  const [cameraMode, setCameraMode] = useState<"user" | "environment">("user");
  // const [monitoringActive, setMonitoringActive] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [isStoped , setIsStopped] = useState(false)

  const { captureAndSend } = usePhoneCaptured({
    event_id,
    disc_id: discipline_id,
    user_id,
    videoRef,
  });

  const { startMonitoring, StartPhoneMonitoring , StopPhoneMonitoring } = usePhoneMonitoring({
    event_id,
    discipline_id: discipline_id,
    user_id,
    videoRef,
  })


  const { data: verifyData } = useQuery({
    queryKey: ['check-verify', event_id, discipline_id, user_id],
    queryFn: async () => {
      const res = await api.get(`/check-verify/${event_id}/${discipline_id}/${user_id}`)
      return res.data
    },
    refetchInterval: (data:any) => data?.verified ? false : 2000,
    enabled: !isStoped
  })

  useEffect(() => {
    if (isStoped && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        console.log("📷 Camera stopped due to monitoring stop");
      }
    }
  }, [isStoped]);



  useEffect(() => {
    if (!verifyData) return

      // Case 1: Monitoring should stop
      if (verifyData.wstatus === 1 || verifyData.status === 1 || verifyData.msg === "Session not found") {
        StopPhoneMonitoring();
        setIsStopped(true);
        setShowInstructions(false); // Hide instructions
        setShowWarning(false);      // Hide warnings
        return;
      }


    if(verifyData.captured == 1){
      let timer = 10;
      setCountdown(timer);

      const countdownInterval = setInterval(() => {
        timer -= 1;
        setCountdown(timer);

        if (timer <= 0) {
          clearInterval(countdownInterval);
          if (videoRef.current) {
            captureAndSend();
            setCaptured(true);
            setCountdown(null);
            console.log("📸 Picture captured after countdown");
          }
        }
      }, 1000);
    }


    // Case 2: Verified → start monitoring after 5s
    if (verifyData.verified == 1) {
      setShowWarning(false) 
      const timer = setTimeout(() => {
        console.log("✅ Verified. Starting monitoring...")
        StartPhoneMonitoring()
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setShowWarning(true)
    }
  }, [verifyData, StartPhoneMonitoring, StopPhoneMonitoring])



  



  // Start camera manually
  const startCamera = useCallback(
    async (mode?: "user" | "environment") => {
      if (!videoRef.current) return;
      const videoEl = videoRef.current;

      // Stop previous stream if any
      if (videoEl.srcObject) {
        (videoEl.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        videoEl.srcObject = null;
      }

      const cameraToUse = mode ?? cameraMode;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraToUse },
          audio: false,
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
      }
    },
    [cameraMode]
  );

  // When clicking Start in instructions


  const handleStart = () => {
    setShowInstructions(false);
    startCamera();    
  };

  
  const handleToggleCamera = () => {
    const newMode = cameraMode === "environment" ? "user" : "environment";
    startCamera(newMode);
  };





  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {isStoped ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 p-6">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center space-y-4">
            <h2 className="text-lg font-bold text-red-600">🚨 Monitoring Stopped</h2>
            <p className="text-gray-800">
              Monitoring for this session has been stopped.
            </p>
          </div>
        </div>
      ) : (
        <>
          {startMonitoring ? (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-md shadow-md">
              📡 Monitoring Active
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-md shadow-md">
              ⏳ Waiting for Verification
            </div>
          )}
          
          {/* {showWarning && !verifyData?.verified && verifyData?.msg !== "Session not found" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 p-6">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center space-y-4">
                <h2 className="text-lg font-bold text-red-600">
                  ⚠️ Adjust Your Camera
                </h2>
                <ul className="text-gray-800 text-left list-disc list-inside space-y-2">
                  <li>Place your phone 1–1.2 meters away from you.</li>
                  <li>Your face must be clearly visible.</li>
                  <li>Your laptop screen and desk should be visible.</li>
                  <li>No books, papers, or notes on the desk.</li>
                </ul>

            
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Recapture
                </button>
              </div>
            </div>
          )} */}

          {countdown !== null && countdown <= 5 && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold z-50">
              {countdown === 0 ? "Start!" : countdown}
            </div>
          )}
          {/* 
          {!showInstructions && captured && (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-md shadow-md">
              Picture captured ✅
            </div>
          )} */}

          {!showInstructions && !startMonitoring && (
          <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4 z-50">
            {/* Toggle Camera Button */}
            <button
              onClick={handleToggleCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg"
            >
              {cameraMode === "environment" ? "Switch to Front Camera" : "Switch to Back Camera"}
            </button>

            {/* Refresh Button */}
            {/* <button
              onClick={handleStart} // restart camera with current mode
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg"
            >
              🔄 Retake
            </button> */}
          </div>
        )}


          {showInstructions && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-white">
              <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg text-center">
                <h2 className="text-xl font-bold mb-4">Instructions 🚨</h2>
                <ul className="text-left mb-4 list-disc list-inside space-y-2">
                  <li>Place the mobile device 1–1.2 meters away from the user.</li>
                  <li>Ensure face, desk, hands, laptop and surroundings are visible.</li>
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
        </>
      )}
    </div>
  );
}




// "use client";

// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { usePhoneMonitoring } from "../hooks/usePhoneMonitoring.ts";
// // import { usePreMonitoring } from "../hooks/usePreMonitoring.ts";
// // import PhoneStreamFrameCapture from "./PhoneStream.tsx";

// export default function PhoneStreamCam() {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);

//   const discipline_id = searchParams.get("discipline_id")!;
//   const event_id = searchParams.get("event_id")!;
//   const user_id = searchParams.get("user_id")!;
//   const passcode = searchParams.get("passcode")!;

//   const [started, setStarted] = useState(false);
//   // const [timer, setTimer] = useState(30);
//   const [showInstructions, setShowInstructions] = useState(false);
//   // const [cameraMode, setCameraMode] = useState<"user" | "environment">("environment");

//   const {
//     videoRef,
//     verified,
//     isMonitoring,
//     // sendPhoneStatus,
//     // startCameraPrecheck,
//     // precheckTimer
//     precheckTimer,
//     // sendPrecheck,
//     // setPrecheckTimer,
//     cameraMode,
//     // setCameraMode,
//     startCamera,
//     // startPrecheckCountdown,
//     reconnectMessage
//     // phoneDetected,
//     // multiplePeople,
//   } = usePhoneMonitoring({ event_id, discipline_id, user_id, passcode });

//   // const {
//   //   // frontVideoRef,
//   //   // backVideoRef,
//   //   validationPassed,
//   //   startValidation,
//   //   setMissingParts,
//   //   setValidationPassed,
//   //   onValidationChange,
//   //   missingParts,
//   //   handsVisible,
//   //   headVisible,
//   //   // legsVisible,
//   //   // tableVisible,
//   //   laptopVisible
//   // } = usePreMonitoring({
//   //   onValidationChange: (valid) => console.log("Position valid:", valid),
//   // });

//   /** ---- CAMERA ACCESS ---- */
//   // const initCamera = useCallback(async () => {
//   //   try {
//   //     const stream = await navigator.mediaDevices.getUserMedia({
//   //       video: { facingMode: cameraMode },
//   //       audio: true,
//   //     });
//   //     if (videoRef.current) {
//   //       videoRef.current.srcObject = stream;
//   //       await videoRef.current.play();
//   //     }
//   //     console.log(`📷 Camera ready (${cameraMode})`);
//   //   } catch (err) {
//   //     console.error("Cannot access camera:", err);
//   //     alert("Cannot access camera or microphone.");
//   //   }
//   // }, [cameraMode, videoRef]);

//   // useEffect(() => {
//   //   initCamera();
//   //   return () => {
//   //     const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
//   //     tracks?.forEach((t) => t.stop());
//   //   };
//   // }, [initCamera]);

//   // useEffect(() => {
//   //   const missing: string[] = []
//   //   if (!headVisible) missing.push("Head")
//   //   if (!handsVisible) missing.push("Hands")
//   //   // if (!legsVisible) missing.push("Legs")
//   //   // if (!tableVisible) missing.push("Table")
//   //   if (!laptopVisible) missing.push("Laptop")
    
//   //   setMissingParts(missing)
//   //   const valid = missing.length === 0
//   //   setValidationPassed(valid)
//   //   if (onValidationChange) onValidationChange(valid)
//   // }, [headVisible, handsVisible, legsVisible, tableVisible, laptopVisible, onValidationChange])

//   // /** ---- START MONITORING ---- */
//   const handleStart = async () => {
//     if (!verified) return;

//     // Start pre-monitoring validation first
//     // startValidation();

//     // console.log("validation" , validationPassed)

//     // if (!validationPassed) {
//     //   alert("Please adjust your position until the camera captures you clearly.");
//     //   return;
//     // }

//     // If validation passes, start countdown
//     setShowInstructions(false);
//     setStarted(true);

//     // startPrecheckCountdown(30)
//     // setTimeout(() => {
//     //   sendPrecheck();
//     // }, 30 * 1000);

//     // const countdown = setInterval(() => {
//     //   setPrecheckTimer((prev) => {
//     //     if (prev <= 1) {
//     //       clearInterval(countdown);
//     //       // startCameraPrecheck()
//     //       // sendPhoneStatus();
//     //       return 0;
//     //     }
//     //     return prev - 1;
//     //   });
//     // }, 1000);
//   };


//   // const handleStart = async () => {
//   //   if (!verified) return;
//   //   setShowInstructions(false);
//   //   setStarted(true);

//   //   startCameraPrecheck(30_000);
//   // };

//   const handleToggleCamera = () => {
//   const newMode = cameraMode === "environment" ? "user" : "environment"
//   startCamera(newMode)
// }

//   /** ---- TIMER FORMAT ---- */
//   const formatTimer = (seconds: number) => {
//     const m = Math.floor(seconds / 60).toString().padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   /** ---- SHOW INSTRUCTIONS AFTER VERIFY ---- **/

//   useEffect(() => {
//     if (verified) {
//       setShowInstructions(true);
//     }
//   }, [verified]);

//   return (
//     <div className="fixed inset-0 flex flex-col items-center justify-center">
//       <video
//         ref={videoRef}
//         className="w-full h-full object-cover"
//         autoPlay
//         playsInline
//         muted
//       />
      
//       {/* {missingParts.length > 0 && (
//         <div className="text-red-500 p-4">
//           Missing: {missingParts.join(", ")}
//         </div>
//       )} */}

//       {/* {videoRef.current && (
//         <PhoneStreamFrameCapture
//           videoRef={videoRef}
//           discipline_id={discipline_id}
//           event_id={event_id}
//           user_id={user_id}
//         />
//       )} */}

//       {/* Camera Toggle Button */}
//       <button
//         onClick={handleToggleCamera}
//         className="absolute bottom-0 right-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md shadow-md z-50"
//       >
//         {cameraMode === "environment" ? "Switch to Front" : "Switch to Back"}
//       </button>

//       {/* Status Display */}
//       <div className="absolute top-5 left-3 bg-black/60 text-white px-3 py-1 rounded font-bold">
//         {!started && !verified && "Verifying..."}
//         {!started && verified && "Ready to start"}
//         {started && !isMonitoring && precheckTimer > 0 && 
//           `⏳ Complete verification in ${formatTimer(precheckTimer)} seconds...`}
//         {isMonitoring && "🎥 Monitoring Active"}
//         {reconnectMessage && reconnectMessage} 
//       </div>

//       {/* Pre-monitoring instructions */}
//       {showInstructions && verified && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-white">
//           <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg text-center">
//             <h2 className="text-xl font-bold mb-4">Instructions 🚨</h2>
//             <ul className="text-left mb-4 list-disc list-inside space-y-2">
//               <li>Place the mobile device 1 to 1.2 meters away from the user.</li>
//               <li>Ensure face, desk, hands, and surroundings are clearly visible.</li>
//               <li>Avoid bright lights or glare in front of the camera.</li>
//               <li>Click "Start" to begin monitoring after validation passes.</li>
//             </ul>
//             <button
//               onClick={handleStart}
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//             >
//               Start
//             </button>
//           </div>
//         </div>
//       )}

      
//       {/* Status footer */}
//       {/* <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded font-bold">
//         Phone Detected: {phoneDetected} | Multiple People: {multiplePeople}
//       </div> */}
//     </div>
//   );
// }
