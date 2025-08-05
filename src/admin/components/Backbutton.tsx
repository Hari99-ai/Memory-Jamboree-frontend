import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackbuttonProps {
  label?: string;
  className?: string;
}

const Backbutton: React.FC<BackbuttonProps> = ({ 
  label = "Back", 
  className = ""
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 mb-4">
      <button
        onClick={() => navigate(-1)}
        className={`
          flex items-center gap-1 px-3 py-1.5
          text-white text-sm font-semibold
          rounded-full
          shadow-lg border border-blue-300
          bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500
          backdrop-blur-md bg-opacity-80
          transition-colors duration-200 ease-in-out
          hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-400
          focus:outline-none focus:ring-2 focus:ring-blue-300
          active:bg-blue-600
          ${className}
        `}
        style={{
          boxShadow: "0 4px 24px 0 rgba(49,130,206,0.15), 0 1.5px 6px rgba(49,130,206,0.15)",
          backdropFilter: "blur(5px)",
        }}
        type="button"
      >
        <ArrowLeft size={16} />
        <span>{label}</span>
      </button>
    </div>
  );
};

export default Backbutton;