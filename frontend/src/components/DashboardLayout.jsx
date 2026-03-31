import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { useTheme } from "../context/ThemeProvider";

const DashboardLayout = ({ children, role }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      {/* Structural Sidebar */}
      <Sidebar role={role} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Navbar title="SmartAttend Secure" />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
