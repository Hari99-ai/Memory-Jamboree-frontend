import { useState, useEffect, useRef } from 'react';
import { verifyFaceForExam, startExamMonitoring, stopExamMonitoring, monitorFaceDuringExam } from '../lib/api';

export default function ExamPage() {
  const [verified, setVerified] = useState(false);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState<number | null>(null); // score can be number or null
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Capture and verify face
  const captureAndVerifyFace = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = 320;
    canvasRef.current.height = 240;
    context.drawImage(videoRef.current, 0, 0, 320, 240);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvasRef.current?.toBlob(resolve, 'image/jpeg')
    );

    if (!blob) return;

    const formData = new FormData();
    formData.append('face', blob);

    try {
      const res = await verifyFaceForExam(formData);
      if (res.verified) {
        setVerified(true);
        console.log('Face verified!');
      } else {
        alert('Face not recognized. Try again.');
      }
    } catch (err) {
      console.error('Face verification failed', err);
      alert('Face verification failed. Please try again.');
    }
  };

  // Start Exam
  const startExam = async () => {
    if (!verified) {
      alert('Please verify your face before starting the exam.');
      return;
    }

    try {
      await startExamMonitoring();
      setStarted(true);
      console.log('Monitoring started');
    } catch (err) {
      console.error('Monitoring start failed:', err);
      alert('Failed to start exam monitoring. Please try again.');
    }
  };

  // Stop Exam
  const stopExam = async () => {
    try {
      const response = await stopExamMonitoring();
      console.log('Monitoring stopped');
      if (response.score !== undefined) {
        setScore(response.score);
      }
      setStarted(false);
    } catch (err) {
      console.error('Monitoring stop failed:', err);
      alert('Failed to stop exam monitoring.');
    }
  };

  // Monitor Face during Exam
  useEffect(() => {
    if (!started || score !== null) return;

    const interval = setInterval(() => {
      if (!canvasRef.current || !videoRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, 320, 240);

      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('frame', blob);

        try {
          const res = await monitorFaceDuringExam(formData);
          if (res.event) {
            console.log(res.event);
          }
        } catch (err) {
          console.error('Monitoring error:', err);
        }
      }, 'image/jpeg');
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [started, score]);

  // Webcam setup
  useEffect(() => {
    if (!videoRef.current) return;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Camera access denied', err));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-center mb-6">Exam Portal</h1>
      <video ref={videoRef} autoPlay className="mx-auto border rounded mb-2" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!verified && (
        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={captureAndVerifyFace}
        >
          Verify Face to Start
        </button>
      )}

      {verified && !started && (
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
          onClick={startExam}
        >
          Start Exam
        </button>
      )}

      {started && (
        <div>
          <p className="mt-4">Exam started! You are being monitored.</p>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded mt-4"
            onClick={stopExam}
          >
            End Exam
          </button>
        </div>
      )}

      {score !== null && (
        <div className="mt-4">
          <h2>Your Score: {score}</h2>
        </div>
      )}
    </div>
  );
}
