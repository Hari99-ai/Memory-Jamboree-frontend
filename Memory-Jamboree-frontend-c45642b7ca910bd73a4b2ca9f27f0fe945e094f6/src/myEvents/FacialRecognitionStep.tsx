/* eslint-disable @typescript-eslint/no-explicit-any */
// components/events/FacialRecognitionStep.tsx
import { useEffect, useRef, useState } from "react";
import { get_face_verification } from "../lib/api";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface Props {
  onVerified: () => void;
  onClose: () => void;
}

export default function FacialRecognitionStep({ onVerified, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // Store stream reference
  const [verified, setVerified] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const storedId = sessionStorage.getItem("userId");
    console.log("userId", storedId);
    if (storedId) setUserId(storedId);
  }, []);

  // Enhanced camera stopping function
  const stopCamera = () => {
    console.log("Stopping camera...");
    
    try {
      // First try to stop tracks from the streamRef
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            console.log(`Stopping track: ${track.kind} (${track.id})`);
            track.stop();
            console.log(`Track ${track.id} stopped successfully`);
          } catch (e) {
            console.error(`Failed to stop track ${track.id}:`, e);
          }
        });
        streamRef.current = null;
      }
      
      // Then try to stop tracks from the video element as fallback
      const videoStream = videoRef.current?.srcObject as MediaStream;
      if (videoStream && videoStream !== streamRef.current) {
        const videoTracks = videoStream.getTracks();
        videoTracks.forEach((track) => {
          try {
            console.log(`Stopping video track: ${track.kind} (${track.id})`);
            track.stop();
            console.log(`Video track ${track.id} stopped successfully`);
          } catch (e) {
            console.error(`Failed to stop video track ${track.id}:`, e);
          }
        });
      }
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        console.log("Video source cleared");
      }
      
      setCameraActive(false);
      console.log("Camera stopped successfully");
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  };

  const { mutate, isPending: verificationLoading } = useMutation({
    mutationKey: ["face_verification"],
    mutationFn: async (formData: FormData) => {
      const res = await get_face_verification(formData);
      return res;
    },
    onSuccess: (data) => {
      setVerified(data.verified);
      setError(null);
      
      // Stop camera after successful verification
      if (data.verified) {
        console.log("Verification successful");
        // stopCamera();
      }
      if(data.verified === false) {
        toast.error("Face Not Matched ! Please sit upright and ensure your face is clearly centered in the webcam frame. ")
      }
    },
    onError: (err: any) => {
      setVerified(false);
      if (err?.response?.status === 401) {
        toast.error("Profile image is Missing. Please upload a clear image to proceed.");
      }
      else if(err?.response?.status === 404){
        toast.error("No face detected. Please ensure your face is clearly visible to the camera.");
      }
      else if (err?.response?.data?.error?.includes("Exception while processing img1_path")) {
        toast.error("Please Check your Profile Picture. Ensure your face is clearly visible into your profile");
      }
      else {
        // toast.error("Verification failed");
        setError(err?.message || "Verification failed");
      }
    },
  });

  useEffect(() => {
    console.log("Initializing camera...");
    let mounted = true;

    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("MediaDevices API not supported in this browser");
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");

        console.log("Available video devices:", videoDevices);

        // Prefer external camera (USB, Logitech) if available
        const externalCamera = videoDevices.find((d) =>
          d.label.toLowerCase().includes("usb") ||
          d.label.toLowerCase().includes("logitech")
        );

        const constraints: MediaStreamConstraints = {
          video: externalCamera ? { deviceId: { exact: externalCamera.deviceId } } : { facingMode: "user" },
          audio: false,
        };

        console.log("Requesting camera access with constraints:", constraints);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          console.log("Component unmounted, stopped obtained stream");
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("Camera started successfully");
          setCameraActive(true);
        }
      } catch (err: any) {
        console.error("Error accessing media devices:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera access was denied. Please enable camera permissions in your browser settings to continue.");
          setPermissionDenied(true);
        } else {
          setError(`Camera access failed: ${err.message || "Unknown error"}`);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      stopCamera();
    };
  }, []);

 
  const handleClose = () => {
    console.log("Close button clicked, stopping camera");
    stopCamera();
    onClose();
  };
 
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImageCaptured(true);
 
      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
      console.log("Image captured, sending for verification");
     
      const formData = new FormData();
      formData.append("id", userId || "");
      formData.append("webcam_image", base64Image);
 
      mutate(formData);
    }
  };

  const handleContinue = () => {
    console.log("Continue button clicked, stopping camera");
    // stopCamera();
    // Add a small delay to ensure camera is fully stopped before proceeding
    setTimeout(() => {
      onVerified();
    }, 100);
  };


  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-gray-800 overflow-y-auto">
      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 lg:p-10">
        {/* Video and Capture */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white text-red-600 hover:bg-gray-100 transition shadow"
        >
          <X className="w-6 h-6" />
        </button>
 
        <div className="w-full lg:w-1/2 flex flex-col items-center bg-white rounded-xl shadow-xl p-6 max-w-3xl mb-8 lg:mb-0">
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-700">Facial Recognition</h2>
          <div className="relative w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline // Important for iOS
              muted // Required for autoplay to work
              className="w-full max-w-[640px] aspect-video object-cover rounded-xl border shadow-md mx-auto"
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 rounded-xl">
                <div className="text-gray-600 text-center p-4">
                  {error ? "❌ Camera error" : "⏳ Initializing camera..."}
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={captureImage}
            disabled={!cameraActive || verified || verificationLoading}
            className={`mt-6 px-6 py-3 rounded-lg font-medium transition ${
              !cameraActive || verified || verificationLoading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {verificationLoading ? "Processing..." : "📸 Capture Image"}
          </button>
        </div>
 
        {/* Instructions and Continue */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6">
          <div className="max-w-md mx-auto text-center lg:text-left">
            <h3 className="text-2xl font-semibold mb-4 text-gray-100">Instructions</h3>
            <ul className="list-disc list-inside text-gray-200 space-y-2 text-left">
              <li>Ensure your face is centered and visible.</li>
              <li>Please don’t wear sunglasses or capes.</li>
              <li>Use a well-lit area for better accuracy.</li>
              <li>Click the capture button to authenticate.</li>
            </ul>
 
            <div className="mt-6">
              {permissionDenied && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4" role="alert">
                  <p className="font-bold">Camera Access Denied</p>
                  <p>To continue, please allow camera access in your browser's settings. You may need to reload the page after granting permission.</p>
                </div>
              )}
              {error && !permissionDenied && (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg mb-4 font-medium">
                  ❌ {error}
                </div>
              )}
              {imageCaptured && verificationLoading ? (
                <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg mb-4 font-medium animate-pulse">
                  ⏳ Verifying...
                </div>
              ) : null}
              {verified && (
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg mb-4 font-medium">
                  ✅ Face matched successfully
                </div>
              )}
              {/* {
                error && (
                  <div className="bg-green-100 text-red-800 px-4 py-3 rounded-lg mb-4 font-medium">
                    Something Error Occured ! Please Contact to Your Admin
                  </div>
                )
              } */}
 
              <button
                onClick={handleContinue}
                disabled={!verified}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
                  verified
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                Continue ➡️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}