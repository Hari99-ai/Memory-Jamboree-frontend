import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sidebar";
import { useState } from "react";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Container */}
      <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
        open ? "w-60" : "w-14"
      }`}>
        <div className="fixed top-0 left-0 bottom-0 bg-[#245cab] z-40 transition-all duration-300 ease-in-out" 
             style={{ width: open ? '240px' : '56px' }}>
          <AdminSidebar open={open} setOpen={setOpen} />
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-[#e8f0fe] to-[#f3f8ff] px-4 py-10">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}