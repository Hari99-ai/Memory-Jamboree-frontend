import { Link, useNavigate } from "react-router-dom";
import {isMobile} from 'react-device-detect'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogin = () => {
    if(isMobile){
      navigate("/mobile-login")
    }else{
      navigate("/auth/login")
    }
  }
  
  return (
    <nav className="w-screen fixed flex justify-center mt-8 z-10">
      <div
        className="w-[60vw] md:w-[80%] max-w-4xl flex items-center justify-between px-8 py-3 rounded-full backdrop-blur-md shadow-lg"
        style={{
          backgroundColor: "rgba(248, 251, 254, 0.6)", // matches --secondary-base with opacity
          fontFamily: "var(--font-main)", // Correct font family variable
        }}
      >
        {/* Logo */}
        <div
          className="text-lg font-semibold"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-heading)" }}
        >
          <img src="/Landing/memoryChampion_2.png" alt="logo" className="h-14 w-auto object-contain" />
        </div>

        {/* Center Links */}
        <div className="hidden md:flex space-x-6 text-[16px] font-light" style={{ fontFamily: "var(--font-main)" }}>
          <Link
            to="/"
            className="hover:text-primary-1 active:text-primary-1 transition-colors duration-300"
          >
            About
          </Link>
          <Link
            to="/"
            className="hover:text-primary-1 active:text-primary-1 transition-colors duration-300"
          >
            How It Works?
          </Link>
          <Link
            to="/"
            className="hover:text-primary-1 active:text-primary-1 transition-colors duration-300"
          >
            Contact
          </Link>
        </div>

        {/* Right Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleLogin}
            className="px-5 py-2 text-[16px] hover:text-white hover:bg-[#245cab] hover:border-2 cursor-pointer bg-transparent border-2 border-[#245cab] text-[#245cab] rounded-full transition"
            style={{ fontFamily: "var(--font-main)" }}
          >
            Login
          </button>
          <Link to="/auth/first-register"
            className="px-5 py-2 text-[16px] hover:text-[#245cab] hover:bg-transparent hover:border-2 hover:border-[#245cab] cursor-pointer bg-[#245cab] text-white rounded-full transition"
            style={{ fontFamily: "var(--font-main)" }}
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
