import { useEffect, useState } from "react";
 
export default function CountdownOverlay({message}:{message:string}) {
  const [count, setCount] = useState(5);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
 
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-black/90 to-gray-900/95 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-4 -translate-y-12">
        <p className="text-white text-3xl font-medium mb-10">{message}</p>
        <div className="relative p-12 rounded-3xl shadow-2xl bg-white/10 border border-white/20 text-white text-7xl font-extrabold tracking-wider animate-scale">
          {count > 0 ? count : "Go!"}
        </div>
      </div>
 
      <style>{`
        @keyframes scaleUpDown {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
 
        .animate-scale {
          animation: scaleUpDown 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}