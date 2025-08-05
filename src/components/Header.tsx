import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface HeaderProps {
  onTimeUp: () => void; 
}

export default function Header({onTimeUp} : HeaderProps) {
  const { time } = useParams();
  // console.log("time" , time)
  const parsedTime = parseInt(time || "0", 10);
  const initialTime = parsedTime ? parsedTime * 60 : 0;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, initialTime]);

  const formatTime = (seconds: number) => {
    const minutes = String(Math.floor(seconds / 60));
    const secs = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  return (
    <div className="flex justify-between w-[80%] mt-2">
      <p className="text-lg">Time Limit: {time}</p>
      <p className="text-lg">Time Left: {formatTime(timeLeft)} minutes</p>
    </div>
  )
}
