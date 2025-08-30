import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Effect to prevent background scrolling when the menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* MODIFIED: The main nav container now has a higher z-index to stay on top of the dropdown */}
      <nav className="w-screen fixed flex justify-center mt-8 z-20">
        <div
          className="w-[90vw] md:w-[80%] max-w-4xl flex items-center justify-between px-4 sm:px-8 py-3 rounded-full backdrop-blur-md shadow-lg"
          style={{
            backgroundColor: "rgba(248, 251, 254, 0.6)",
            fontFamily: "var(--font-main)",
          }}
        >
          {/* Logo */}
          <Link to="/" className="z-30">
            <img
              src="/Landing/memoryChampion_2.png"
              alt="logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Links (Unchanged) */}
          <div className="hidden md:flex items-center space-x-6 text-[16px] font-light">
            <Link to="/" className="hover:text-primary-1 transition-colors">About</Link>
            <Link to="/" className="hover:text-primary-1 transition-colors">How It Works?</Link>
            <Link to="/" className="hover:text-primary-1 transition-colors">Contact</Link>
          </div>
          <div className="hidden md:flex space-x-2">
            <Link to="/auth/login" className="px-5 py-2 text-[16px] hover:text-white hover:bg-[#245cab] cursor-pointer bg-transparent border-2 border-[#245cab] text-[#245cab] rounded-full transition">Login</Link>
            <Link to="/auth/first-register" className="px-5 py-2 text-[16px] hover:text-[#245cab] hover:bg-transparent hover:border-2 hover:border-[#245cab] cursor-pointer bg-[#245cab] text-white rounded-full transition">Register</Link>
          </div>

          {/* Hamburger / Close Button */}
          <div className="md:hidden flex items-center z-30">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#245cab] focus:outline-none"
            >
              {isMenuOpen ? (
                // Close (X) icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MODIFIED: Half-Screen Mobile Menu that slides from the top */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full z-10 bg-white/90 backdrop-blur-lg shadow-lg transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ fontFamily: "var(--font-main)" }}
      >
        {/* Inner container for links with padding */}
        <div className="flex flex-col items-center space-y-6 text-xl pt-32 pb-12">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-primary-1">About</Link>
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-primary-1">How It Works?</Link>
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-primary-1">Contact</Link>

          <div className="flex flex-col items-center space-y-4 pt-8 w-4/5 max-w-xs">
            <Link to="/auth/login" onClick={() => setIsMenuOpen(false)} className="px-8 py-2 text-lg border-2 border-[#245cab] text-[#245cab] rounded-full transition w-full text-center">Login</Link>
            <Link to="/auth/first-register" onClick={() => setIsMenuOpen(false)} className="px-8 py-2 text-lg bg-[#245cab] text-white rounded-full transition w-full text-center">Register</Link>
          </div>
        </div>
      </div>
    </>
  );
}