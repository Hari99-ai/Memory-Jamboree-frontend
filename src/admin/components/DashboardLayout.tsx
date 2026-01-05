import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#245cab] text-white shadow-lg hover:bg-[#1e4a96] transition-colors lg:hidden"
        aria-label="Toggle sidebar"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Container */}
      <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
        isMobile ? 'w-0' : (open ? "w-60" : "w-14")
      }`}>
        <div 
          className={`fixed top-0 left-0 bottom-0 bg-[#245cab] z-40 transition-all duration-300 ease-in-out ${
            isMobile && !open ? '-translate-x-full' : 'translate-x-0'
          }`}
          style={{ width: open ? '240px' : '56px' }}
        >
          <AdminSidebar open={open} setOpen={setOpen} isMobile={isMobile} />
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className={`flex-1 overflow-auto bg-gradient-to-br from-[#e8f0fe] to-[#f3f8ff] px-4 py-10 ${
        isMobile ? 'ml-0' : ''
      }`}>
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}