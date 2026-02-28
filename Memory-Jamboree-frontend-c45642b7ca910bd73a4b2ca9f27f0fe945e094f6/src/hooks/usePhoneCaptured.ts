import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { capture_img } from "../lib/api";

interface UsePhoneCapturedProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  disc_id: string;
  event_id: string;
  user_id: string;
}

export const usePhoneCaptured = ({
  videoRef,
  disc_id,
  event_id,
  user_id,
}: UsePhoneCapturedProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [verified , setVerified] = useState(false)

  const captureAndSend = useCallback(async () => {
    if (!videoRef?.current) {
      toast.error("Camera not available ❌");
      return;
    }

    const videoEl = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Failed to get canvas context ❌");
      return;
    }

    // Capture frame
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const frameBase64 = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(frameBase64);
    // setLoading(true);

    try {
      // Send to backend
      const formData = new FormData();
      formData.append("imgData", frameBase64);
      formData.append("event_id", event_id);
      formData.append("user_id", user_id);
      formData.append("disc_id", disc_id);

      // const res = await fetch("/capture", { method: "POST", body: formData });
      // const data = await res.json();
      const data = await capture_img(formData)

      if (data.status === "success") {
        toast.success("Image captured and saved successfully ✅");
        // setVerified(true)

      } else {
        toast.error(data.message || "Failed to save image ❌");
      }
    } catch (err: any) {
      toast.error(err.message || "Capture failed ❌");
    } finally {
      // setLoading(false);
    }
  }, [videoRef, disc_id, event_id, user_id]);

  return { capturedImage, captureAndSend  };
};
