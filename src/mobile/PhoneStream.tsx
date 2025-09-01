"use client";

import { useEffect, useRef } from "react";
import { SocketURL } from "../lib/client";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>; // allow null
  discipline_id: string;
  event_id: string;
  user_id: string;
}


export default function PhoneStreamFrameCapture({ videoRef, discipline_id, event_id, user_id }: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    wsRef.current = new WebSocket(`${SocketURL}/phone/${discipline_id}/${event_id}/${user_id}`);
    wsRef.current.onopen = () => console.log("📡 Live camera streaming started");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    frameIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !ctx || wsRef.current?.readyState !== WebSocket.OPEN) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      
      const frame = canvas.toDataURL("image/jpeg", 0.5);
        wsRef.current.send(JSON.stringify({
        type: "frame",
        image: frame,
        timestamp: Date.now()
      }));
    }, 1000);
    console.log("frame send to phone 📱")
    

    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      wsRef.current?.close();
    };
  }, [videoRef, discipline_id, event_id, user_id]);

  return null;
}




// "use client";

// import { useEffect, useRef } from "react";
// // import { useSearchParams } from "react-router-dom";

// const PhoneStream = () => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const wsRef = useRef<WebSocket | null>(null);
//   // const [searchParams] = useSearchParams();

//   // const sessionId = searchParams.get("session");
//   // const disciplineId = searchParams.get("discipline");

//   const sessionId = "buiz0pwf0"
//   const disciplineId = 9

//   useEffect(() => {
//     const startStreaming = async () => {
//       if (!sessionId || !disciplineId) {
//         console.error("❌ Missing sessionId or disciplineId");
//         return;
//       }

//       const wsUrl = `wss://aidev.gravitinfosystems.com:5000/ws/phone/${sessionId}/${disciplineId}`;
//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;

//       ws.onopen = () => {
//         console.log("✅ WebSocket connected (Phone)");

//         ws.send(JSON.stringify({ type: "phone_connected" }));
//       };
      
//       ws.onerror = (err) => {
//         console.error("❌ WebSocket error:", err);
//       };

//       ws.onmessage = async (event) => {
//         let data: any;
//         try {
//           data = JSON.parse(event.data);
//         } catch {
//           data = event.data;
//         }

//         if (data.type === "start_camera") {
//           console.log("📸 Starting phone camera...");

//           try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//               video: true,
//               audio: false, // Set to true if you need mic
//             });
//             if (videoRef.current) {
//               videoRef.current.srcObject = stream;
//             }
//             console.log("✅ Camera stream started");
//           } catch (err) {
//             console.error("❌ Camera access error:", err);
//             alert("Camera access failed. Please allow camera permission.");
//           }
//         }
//       };
//     };

//     startStreaming();

//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//         console.log("🔌 WebSocket closed (Phone)");
//       }
//       if (videoRef.current?.srcObject) {
//         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//         tracks.forEach((track) => track.stop());
//         videoRef.current.srcObject = null;
//         console.log("🛑 Camera stream stopped");
//       }
//     };
//   }, [sessionId, disciplineId]);

//   return (
//     <div className="h-screen w-screen bg-black">
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         muted
//         className="h-full w-full object-cover"
//       />
//     </div>
//   );
// };

// export default PhoneStream;
