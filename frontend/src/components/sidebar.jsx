import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  BarChart,
  ShieldAlert,
  Activity,
  BookUser,
  Grid,
  ShieldCheck
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import { useSelector } from "react-redux";

const Sidebar = ({collapsed: externalCollapsed, setCollapsed: setExternalCollapsed}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const { isDark } = useTheme();
  const [sidebarContent, setSidebarContent] = useState([]);
  const { user } = useSelector(state => state.auth);
  const location = useLocation();

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse = () => {
    if (setExternalCollapsed) setExternalCollapsed(!externalCollapsed);
    else setInternalCollapsed(!internalCollapsed);
  };

  const sideBarItems = {
    teacher: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, link: "/teacher/dashboard" },
      { id: "students", label: "Students", icon: <User size={20} />, link: "/teacher/students" },
      { id: "courses", label: "My Subjects", icon: <BookOpen size={20} />, link: "/teacher/courses" },
      { id: "classroom", label: "Classroom", icon: <BookUser size={20} />, link: "/teacher/classroom" },
      { id: "materials", label: "Study Material", icon: <BookOpen size={20} />, link: "/teacher/materials" },
      { id: "quizzes", label: "Manage Tests", icon: <ShieldCheck size={20} />, link: "/teacher/quizzes" },
      { id: "manageGroups", label: "Manage Groups", icon: <Users size={20} />, link: "/teacher/manageGroups" },
      { id: "groups", label: "Attendance Records", icon: <Grid size={20} />, link: "/teacher/groups" },
      { id: "results", label: "My Scores", icon: <BarChart size={20} />, link: "/teacher/results" },
      { id: "approvals", label: "Approvals", icon: <ShieldCheck size={20} />, link: "/teacher/approvals" },
    ],
    student: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, link: "/student/dashboard" },
      { id: "attendance", label: "My Attendance", icon: <ClipboardList size={20} />, link: "/student/attendance" },
      { id: "materials", label: "Study Material", icon: <BookOpen size={20} />, link: "/student/materials" },
      { id: "assessments", label: "My Tests", icon: <ShieldCheck size={20} />, link: "/student/assessments" },
      { id: "results", label: "My Scores", icon: <BarChart size={20} />, link: "/student/results" },
      { id: "group", label: "My Group", icon: <Users size={20} />, link: "/student/group" },
    ],
    admin: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, link: "/admin/dashboard" },
      { id: "approvals", label: "Approvals", icon: <ShieldCheck size={20} />, link: "/admin/approvals" },
      { id: "users", label: "Users", icon: <User size={20} />, link: "/admin/enrolledUsers" },
      { id: "departments", label: "Departments", icon: <Grid size={20} />, link: "/admin/manageDepartments" },
      { id: "courses", label: "Courses", icon: <BookOpen size={20} />, link: "/admin/manageCourses" },
      { id: "groups", label: "Groups", icon: <Users size={20} />, link: "/admin/manageGroups" },
      { id: "attendance", label: "Attendance", icon: <ClipboardList size={20} />, link: "/admin/manageAttendance" },
      { id: "live", label: "Live Monitoring", icon: <Activity size={20} />, link: "/admin/live-monitoring" },
      { id: "results", label: "Results", icon: <BarChart size={20} />, link: "/admin/results" },
      { id: "logs", label: "Security Logs", icon: <ShieldAlert size={20} />, link: "/admin/logs" },
    ]
  };

  useEffect(() => {
    if (user && user.role) {
      setSidebarContent(sideBarItems[user.role] || []);
    }
  }, [user]);

  const isActive = (path) => location.pathname === path;

  return (
    <div 
      className={`
        transition-all duration-300 ease-in-out z-40 h-screen sticky top-0
        ${isCollapsed ? "w-20" : "w-72"} 
        flex flex-col border-r shadow-2xl shadow-black/10
        ${isDark ? 'bg-[#020617] border-white/5' : 'bg-white border-slate-200/60'}
      `}
    >
      {/* Sidebar Header */}
      <div className={`p-6 flex justify-between items-center border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Activity className="text-white" size={18} />
            </div>
            <span className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SmartAttend
            </span>
          </div>
        )}
        <button 
          onClick={toggleCollapse} 
          className={`
            p-2 rounded-xl transition-all duration-200
            ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-50 text-slate-500'}
            ${isCollapsed ? 'mx-auto' : 'ml-auto'}
          `}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 custom-scrollbar">
        {sidebarContent.map((item) => {
          const active = isActive(item.link);
          return (
            <Link
              key={item.id}
              to={item.link}
              className={`
                flex items-center ${isCollapsed ? 'justify-center p-3.5' : 'px-5 py-4'} 
                rounded-2xl transition-all duration-300 group
                ${active 
                  ? 'bg-brand-primary/10 text-brand-primary shadow-sm shadow-brand-primary/10' 
                  : isDark ? 'text-slate-500 hover:bg-white/5 hover:text-slate-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <div className={`transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${active ? 'text-brand-primary' : ''}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`ml-4 text-sm font-black uppercase tracking-[0.1em] transition-colors duration-300`}>
                  {item.label}
                </span>
              )}
              {active && !isCollapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-brand-primary animate-bloom" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile/Settings */}
      <div className={`p-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        {!isCollapsed && <div className={`mb-4 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>System</div>}
        <Link 
          to="/admin/adminSettings"
          className={`
            flex items-center ${isCollapsed ? 'justify-center p-3.5' : 'px-5 py-4'} 
            rounded-2xl transition-all duration-300 group
            ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900'}
          `}
        >
          <Settings size={20} className="transition-transform duration-300 group-hover:rotate-45" />
          {!isCollapsed && <span className="ml-4 text-sm font-black uppercase tracking-[0.1em]">Settings</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;