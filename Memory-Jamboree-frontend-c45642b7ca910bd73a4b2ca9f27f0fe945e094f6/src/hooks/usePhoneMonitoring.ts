import { useCallback, useEffect, useRef, useState } from "react";
import { useProctoringWebSocket } from "./useProctoringWebSocket";

interface PhoneMonitoringProps {
  event_id: string;
  discipline_id: string;
  user_id: string;
  passcode: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const FRAME_INTERVAL_MS = 1000;
const MONITORING_INTERVAL_MS = 2000;

export const usePhoneMonitoring = ({
  event_id,
  discipline_id,
  user_id,
  passcode,
  videoRef,
}: PhoneMonitoringProps) => {
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const monitoringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const [startMonitoring, setStartMonitoring] = useState(false);
  const [verified, setVerified] = useState(false);

  const clearIntervals = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  }, []);

  const captureImage = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, [videoRef]);

  const { isConnected, sendJson, disconnect } = useProctoringWebSocket({
    role: "phone",
    disciplineId: discipline_id,
    eventId: event_id,
    userId: user_id,
    enabled: Boolean(event_id && discipline_id && user_id && passcode),
    onOpen: () => {
      setVerified(false);
      sendJson({
        type: "verify",
        passcode: passcode ?? "",
        user_id,
      });
    },
    onMessage: (payload: Record<string, unknown>) => {
      switch (payload?.type) {
        case "verified":
          setVerified(true);
          sendJson({
            type: "phone_ready",
            user_id,
            timestamp: new Date().toISOString(),
          });
          break;
        case "start_monitoring":
          setStartMonitoring(true);
          break;
        case "stop_monitoring":
        case "phone_disconnected":
          setStartMonitoring(false);
          clearIntervals();
          break;
        default:
          break;
      }
    },
    onClose: () => {
      setVerified(false);
      setStartMonitoring(false);
      clearIntervals();
    },
  });

  useEffect(() => {
    if (!isConnected || !verified || !startMonitoring) {
      clearIntervals();
      return;
    }

    frameIntervalRef.current = setInterval(() => {
      const image = captureImage();
      if (!image) return;

      sendJson({
        type: "frame",
        image,
        timestamp: new Date().toISOString(),
      });
    }, FRAME_INTERVAL_MS);

    monitoringIntervalRef.current = setInterval(() => {
      const imgData = captureImage();
      if (!imgData) return;

      sendJson({
        type: "monitoring",
        imgData,
        voice_db: 0,
        timestamp: new Date().toISOString(),
      });
    }, MONITORING_INTERVAL_MS);

    return () => {
      clearIntervals();
    };
  }, [
    captureImage,
    clearIntervals,
    isConnected,
    sendJson,
    startMonitoring,
    verified,
  ]);

  const StartPhoneMonitoring = useCallback(() => {
    setStartMonitoring(true);
  }, []);

  const StopPhoneMonitoring = useCallback(() => {
    setStartMonitoring(false);
    clearIntervals();
    sendJson({
      type: "stop_monitoring",
      timestamp: new Date().toISOString(),
    });
  }, [clearIntervals, sendJson]);

  useEffect(() => {
    return () => {
      clearIntervals();
      disconnect(1000, "phone_unmount");
    };
  }, [clearIntervals, disconnect]);

  return {
    StartPhoneMonitoring,
    StopPhoneMonitoring,
    startMonitoring,
    verified,
    isConnected,
  };
};


// import { useCallback, useEffect, useRef, useState } from "react";
// import { useProctoringWebSocket } from "./useProctoringWebSocket";

// interface PhoneMonitoringProps {
//   event_id: string;
//   discipline_id: string;
//   user_id: string;
//   passcode: string;
//   videoRef: React.RefObject<HTMLVideoElement | null>;
// }

// const FRAME_INTERVAL_MS = 1000;
// const MONITORING_INTERVAL_MS = 2000;

// export const usePhoneMonitoring = ({
//   event_id,
//   discipline_id,
//   user_id,
//   passcode,
//   videoRef,
// }: PhoneMonitoringProps) => {
//   const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const monitoringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
//     null
//   );

//   const [startMonitoring, setStartMonitoring] = useState(false);
//   const [verified, setVerified] = useState(false);

//   const clearIntervals = useCallback(() => {
//     if (frameIntervalRef.current) {
//       clearInterval(frameIntervalRef.current);
//       frameIntervalRef.current = null;
//     }
//     if (monitoringIntervalRef.current) {
//       clearInterval(monitoringIntervalRef.current);
//       monitoringIntervalRef.current = null;
//     }
//   }, []);

//   const captureImage = useCallback(() => {
//     const video = videoRef.current;
//     if (!video || !video.videoWidth || !video.videoHeight) {
//       return null;
//     }

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return null;

//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     return canvas.toDataURL("image/jpeg", 0.7);
//   }, [videoRef]);

//   const { isConnected, sendJson, disconnect } = useProctoringWebSocket({
//     role: "phone",
//     disciplineId: discipline_id,
//     eventId: event_id,
//     userId: user_id,
//     enabled: Boolean(event_id && discipline_id && user_id),
//     onOpen: () => {
//       setVerified(false);
//       sendJson({
//         type: "verify",
//         passcode: passcode ?? "",
//         user_id,
//       });
//     },
//     onMessage: (payload: Record<string, unknown>) => {
//       switch (payload?.type) {
//         case "verified":
//           setVerified(true);
//           sendJson({
//             type: "phone_ready",
//             user_id,
//             timestamp: new Date().toISOString(),
//           });
//           break;
//         case "start_monitoring":
//           setStartMonitoring(true);
//           break;
//         case "stop_monitoring":
//         case "phone_disconnected":
//           setStartMonitoring(false);
//           clearIntervals();
//           break;
//         default:
//           break;
//       }
//     },
//     onClose: () => {
//       setVerified(false);
//       setStartMonitoring(false);
//       clearIntervals();
//     },
//   });

//   useEffect(() => {
//     if (!isConnected || !verified || !startMonitoring) {
//       clearIntervals();
//       return;
//     }

//     frameIntervalRef.current = setInterval(() => {
//       const image = captureImage();
//       if (!image) return;

//       sendJson({
//         type: "frame",
//         image,
//         timestamp: new Date().toISOString(),
//       });
//     }, FRAME_INTERVAL_MS);

//     monitoringIntervalRef.current = setInterval(() => {
//       const imgData = captureImage();
//       if (!imgData) return;

//       sendJson({
//         type: "monitoring",
//         imgData,
//         voice_db: 0,
//         timestamp: new Date().toISOString(),
//       });
//     }, MONITORING_INTERVAL_MS);

//     return () => {
//       clearIntervals();
//     };
//   }, [
//     captureImage,
//     clearIntervals,
//     isConnected,
//     sendJson,
//     startMonitoring,
//     verified,
//   ]);

//   const StartPhoneMonitoring = useCallback(() => {
//     setStartMonitoring(true);
//   }, []);

//   const StopPhoneMonitoring = useCallback(() => {
//     setStartMonitoring(false);
//     clearIntervals();
//     sendJson({
//       type: "stop_monitoring",
//       timestamp: new Date().toISOString(),
//     });
//   }, [clearIntervals, sendJson]);

//   useEffect(() => {
//     return () => {
//       clearIntervals();
//       disconnect(1000, "phone_unmount");
//     };
//   }, [clearIntervals, disconnect]);

//   return {
//     StartPhoneMonitoring,
//     StopPhoneMonitoring,
//     startMonitoring,
//     verified,
//     isConnected,
//   };
// };
// 