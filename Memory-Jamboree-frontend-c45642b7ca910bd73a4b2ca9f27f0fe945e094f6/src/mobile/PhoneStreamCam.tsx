"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/client.ts";
import { usePhoneCaptured } from "../hooks/usePhoneCaptured.ts";
import { usePhoneMonitoring } from "../hooks/usePhoneMonitoring.ts";

export default function PhoneStreamCam() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const discipline_id = searchParams.get("discipline_id") ?? "";
  const event_id = searchParams.get("event_id") ?? "";
  const user_id = searchParams.get("user_id") ?? "";
  const passcode = searchParams.get("passcode") ?? "";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [captured, setCaptured] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [cameraMode, setCameraMode] = useState<"user" | "environment">("user");
  const [isStopped, setIsStopped] = useState(false);

  const { captureAndSend } = usePhoneCaptured({
    event_id,
    disc_id: discipline_id,
    user_id,
    videoRef,
  });

  const { startMonitoring, StopPhoneMonitoring, verified, isConnected } =
    usePhoneMonitoring({
      event_id,
      discipline_id,
      user_id,
      passcode,
      videoRef,
    });

  const { data: verifyData } = useQuery({
    queryKey: ["check-verify", event_id, discipline_id, user_id],
    queryFn: async () => {
      const res = await api.get(
        `/check-verify/${event_id}/${discipline_id}/${user_id}`
      );
      return res.data;
    },
    enabled: Boolean(event_id && discipline_id && user_id) && !isStopped,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!verifyData) return;

    if (
      verifyData.wstatus === 1 ||
      verifyData.status === 1 ||
      verifyData.msg === "Session not found"
    ) {
      StopPhoneMonitoring();
      setIsStopped(true);
      setShowInstructions(false);
      return;
    }

    if (verifyData.captured !== 1 || captured) return;

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
        }
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [verifyData, StopPhoneMonitoring, captureAndSend, captured]);

  useEffect(() => {
    if (!isStopped || !videoRef.current) return;
    const stream = videoRef.current.srcObject as MediaStream | null;
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  }, [isStopped]);

  const startCamera = useCallback(
    async (mode?: "user" | "environment") => {
      if (!videoRef.current) return;
      const videoEl = videoRef.current;

      if (videoEl.srcObject) {
        (videoEl.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        videoEl.srcObject = null;
      }

      const cameraToUse = mode ?? cameraMode;
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
    },
    [cameraMode]
  );

  const handleStart = () => {
    setShowInstructions(false);
    startCamera();
  };

  const handleToggleCamera = () => {
    const nextMode = cameraMode === "environment" ? "user" : "environment";
    startCamera(nextMode);
  };

  if (!passcode) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid Phone Link</h2>
          <p>Passcode is missing. Request a fresh phone link from desktop.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

      {isStopped ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 p-6">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center space-y-4">
            <h2 className="text-lg font-bold text-red-600">Monitoring Stopped</h2>
            <p className="text-gray-800">Monitoring for this session has been stopped.</p>
          </div>
        </div>
      ) : (
        <>
          {startMonitoring ? (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-md shadow-md">
              Monitoring Active
            </div>
          ) : verified ? (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md shadow-md">
              Phone Verified - Waiting for Desktop Start
            </div>
          ) : !isConnected ? (
            <div className="absolute top-3 left-3 bg-amber-600 text-white px-3 py-1 rounded-md shadow-md">
              Reconnecting to server...
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-md shadow-md">
              Waiting for Verification
            </div>
          )}

          {countdown !== null && countdown <= 5 && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold z-50">
              {countdown === 0 ? "Start!" : countdown}
            </div>
          )}

          {!showInstructions && !startMonitoring && (
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4 z-50">
              <button
                onClick={handleToggleCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg"
              >
                {cameraMode === "environment"
                  ? "Switch to Front Camera"
                  : "Switch to Back Camera"}
              </button>
            </div>
          )}

          {showInstructions && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-white">
              <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg text-center">
                <h2 className="text-xl font-bold mb-4">Instructions</h2>
                <ul className="text-left mb-4 list-disc list-inside space-y-2">
                  <li>Place the mobile device 1-1.2 meters away from the user.</li>
                  <li>Ensure face, desk, hands, laptop and surroundings are visible.</li>
                  <li>Avoid bright lights or glare in front of the camera.</li>
                  <li>Click Start and wait for desktop to begin monitoring.</li>
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

// import { useCallback,  useEffect,  useRef, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { usePhoneCaptured } from "../hooks/usePhoneCaptured.ts";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "../lib/client.ts";
// import { usePhoneMonitoring } from "../hooks/usePhoneMonitoring.ts";


// export default function PhoneStreamCam() {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const [, setCaptured] = useState(false);
//   const discipline_id = searchParams.get("discipline_id")!;
//   const event_id = searchParams.get("event_id")!;
//   const user_id = searchParams.get("user_id")!;

//    const [countdown, setCountdown] = useState<number | null>(null);

//   const [showInstructions, setShowInstructions] = useState(true); 
//   const [cameraMode, setCameraMode] = useState<"user" | "environment">("user");
//   // const [monitoringActive, setMonitoringActive] = useState(false)
//   const [, setShowWarning] = useState(false)
//   const [isStoped , setIsStopped] = useState(false)

//   const { captureAndSend } = usePhoneCaptured({
//     event_id,
//     disc_id: discipline_id,
//     user_id,
//     videoRef,
//   });

//   const { startMonitoring, StartPhoneMonitoring , StopPhoneMonitoring } = usePhoneMonitoring({
//     event_id,
//     discipline_id: discipline_id,
//     user_id,
//     videoRef,
//   })


//   const { data: verifyData } = useQuery({
//     queryKey: ['check-verify', event_id, discipline_id, user_id],
//     queryFn: async () => {
//       const res = await api.get(`/check-verify/${event_id}/${discipline_id}/${user_id}`)
//       return res.data
//     },
//     refetchInterval: (data:any) => data?.verified ? false : 2000,
//     enabled: !isStoped
//   })

//   useEffect(() => {
//     if (isStoped && videoRef.current) {
//       const stream = videoRef.current.srcObject as MediaStream;
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//         videoRef.current.srcObject = null;
//         console.log("📷 Camera stopped due to monitoring stop");
//       }
//     }
//   }, [isStoped]);



//   useEffect(() => {
//     if (!verifyData) return

//       // Case 1: Monitoring should stop
//       if (verifyData.wstatus === 1 || verifyData.status === 1 || verifyData.msg === "Session not found") {
//         StopPhoneMonitoring();
//         setIsStopped(true);
//         setShowInstructions(false);
//         setShowWarning(false);      
//         return;
//       }


//     if(verifyData.captured == 1){
//       let timer = 10;
//       setCountdown(timer);

//       const countdownInterval = setInterval(() => {
//         timer -= 1;
//         setCountdown(timer);

//         if (timer <= 0) {
//           clearInterval(countdownInterval);
//           if (videoRef.current) {
//             captureAndSend();
//             setCaptured(true);
//             setCountdown(null);
//             console.log("📸 Picture captured after countdown");
//           }
//         }
//       }, 1000);
//     }


//     // Case 2: Verified → start monitoring after 5s
//     if (verifyData.verified == 1) {
//       setShowWarning(false) 
//       const timer = setTimeout(() => {
//         console.log("✅ Verified. Starting monitoring...")
//         StartPhoneMonitoring()
//       }, 5000)

//       return () => clearTimeout(timer)
//     } else {
//       setShowWarning(true)
//     }
//   }, [verifyData, StartPhoneMonitoring, StopPhoneMonitoring])



  



//   // Start camera manually
//   const startCamera = useCallback(
//     async (mode?: "user" | "environment") => {
//       if (!videoRef.current) return;
//       const videoEl = videoRef.current;

//       // Stop previous stream if any
//       if (videoEl.srcObject) {
//         (videoEl.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
//         videoEl.srcObject = null;
//       }

//       const cameraToUse = mode ?? cameraMode;

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: cameraToUse },
//           audio: false,
//         });
//         videoEl.srcObject = stream;
//         videoEl.autoplay = true;
//         videoEl.playsInline = true;
//         videoEl.muted = true;
//         await videoEl.play();
//         setCameraMode(cameraToUse);
//         console.log(`📹 Camera started: ${cameraToUse}`);
//       } catch (err) {
//         console.warn(`⚠️ Failed to open camera (${cameraToUse}):`, err);
//       }
//     },
//     [cameraMode]
//   );

//   // When clicking Start in instructions


//   const handleStart = () => {
//     setShowInstructions(false);
//     startCamera();    
//   };

  
//   const handleToggleCamera = () => {
//     const newMode = cameraMode === "environment" ? "user" : "environment";
//     startCamera(newMode);
//   };





//   return (
//     <div className="fixed inset-0 flex flex-col items-center justify-center">
//       <video
//         ref={videoRef}
//         className="w-full h-full object-cover"
//         playsInline
//         muted
//       />

//       {isStoped ? (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 p-6">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center space-y-4">
//             <h2 className="text-lg font-bold text-red-600">🚨 Monitoring Stopped</h2>
//             <p className="text-gray-800">
//               Monitoring for this session has been stopped.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <>
//           {startMonitoring ? (
//             <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-md shadow-md">
//               📡 Monitoring Active
//             </div>
//           ) : (
//             <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-md shadow-md">
//               ⏳ Waiting for Verification
//             </div>
//           )}
          
//           {/* {showWarning && !verifyData?.verified && verifyData?.msg !== "Session not found" && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 p-6">
//               <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center space-y-4">
//                 <h2 className="text-lg font-bold text-red-600">
//                   ⚠️ Adjust Your Camera
//                 </h2>
//                 <ul className="text-gray-800 text-left list-disc list-inside space-y-2">
//                   <li>Place your phone 1–1.2 meters away from you.</li>
//                   <li>Your face must be clearly visible.</li>
//                   <li>Your laptop screen and desk should be visible.</li>
//                   <li>No books, papers, or notes on the desk.</li>
//                 </ul>

            
//                 <button
//                   onClick={() => setShowWarning(false)}
//                   className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                 >
//                   Recapture
//                 </button>
//               </div>
//             </div>
//           )} */}

//           {countdown !== null && countdown <= 5 && (
//             <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold z-50">
//               {countdown === 0 ? "Start!" : countdown}
//             </div>
//           )}
//           {/* 
//           {!showInstructions && captured && (
//             <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-md shadow-md">
//               Picture captured ✅
//             </div>
//           )} */}

//           {!showInstructions && !startMonitoring && (
//           <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4 z-50">
//             {/* Toggle Camera Button */}
//             <button
//               onClick={handleToggleCamera}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg"
//             >
//               {cameraMode === "environment" ? "Switch to Front Camera" : "Switch to Back Camera"}
//             </button>

//             {/* Refresh Button */}
//             {/* <button
//               onClick={handleStart} // restart camera with current mode
//               className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg"
//             >
//               🔄 Retake
//             </button> */}
//           </div>
//         )}


//           {showInstructions && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-white">
//               <div className="bg-gray-900 p-6 rounded shadow-lg max-w-lg text-center">
//                 <h2 className="text-xl font-bold mb-4">Instructions 🚨</h2>
//                 <ul className="text-left mb-4 list-disc list-inside space-y-2">
//                   <li>Place the mobile device 1–1.2 meters away from the user.</li>
//                   <li>Ensure face, desk, hands, laptop and surroundings are visible.</li>
//                   <li>Avoid bright lights or glare in front of the camera.</li>
//                   <li>Click "Start" to begin monitoring after validation passes.</li>
//                 </ul>
//                 <button
//                   onClick={handleStart}
//                   className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                 >
//                   Start
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
