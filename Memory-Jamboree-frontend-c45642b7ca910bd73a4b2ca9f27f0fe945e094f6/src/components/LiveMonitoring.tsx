import { useState } from "react";

export default function LiveMonitoring() {
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const startMonitoring = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/start-monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setStatus(data.message);
    } catch (err:any) {
      setStatus("Failed to start monitoring.");
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/stop-monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setStatus(data.message);
    } catch (err) {
      setStatus("Failed to stop monitoring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-3xl font-bold mb-4">Live Exam Monitoring</h1>

      <div className="space-x-4">
        <button
          onClick={startMonitoring}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Start Monitoring
        </button>

        <button
          onClick={stopMonitoring}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop Monitoring
        </button>
      </div>

      <p className="mt-6 text-lg font-medium text-gray-700">{status}</p>
    </div>
  );
}
