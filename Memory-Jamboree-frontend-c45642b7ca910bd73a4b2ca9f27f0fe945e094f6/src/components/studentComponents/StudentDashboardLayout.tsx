import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ThemeProvider from "./theme-provider";

export default function StudentDashboardLayout() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {/* Root container: full-screen height, vertical layout */}
      <div className="flex flex-col h-screen bg-blue-50">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          
          <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}