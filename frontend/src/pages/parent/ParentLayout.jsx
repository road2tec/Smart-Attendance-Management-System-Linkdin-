import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { logout } from '../../app/features/auth/authThunks';

import {
  LayoutDashboard, GraduationCap, LogOut, Shield, Sun, Moon,
  ClipboardCheck, Award, BookOpen
} from 'lucide-react';

const navItems = [
  { to: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/parent/attendance', icon: ClipboardCheck, label: 'Attendance Log' },
  { to: '/parent/results', icon: Award, label: 'Exam Results' },
  { to: '/parent/courses', icon: BookOpen, label: 'Subjects' },
];

const ParentLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`w-64 flex-shrink-0 flex flex-col border-r ${isDark ? 'bg-[#0D1117] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
        {/* Logo */}
        <div className={`p-6 border-b ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDark ? 'bg-purple-600' : 'bg-purple-600'}`}>
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>SmartAttend</p>
              <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Parent Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className={`px-6 py-4 mx-4 mt-4 rounded-2xl ${isDark ? 'bg-[#121A22]' : 'bg-purple-50'}`}>
          <p className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {user?.firstName} {user?.lastName}
          </p>
          <p className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email}</p>
          <span className={`mt-2 inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
            Parent
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? (isDark ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white')
                    : (isDark ? 'text-slate-400 hover:bg-[#1E2733] hover:text-white' : 'text-slate-500 hover:bg-purple-50 hover:text-purple-700')
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-4 border-t ${isDark ? 'border-[#1E2733]' : 'border-gray-100'} space-y-2`}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isDark ? 'text-slate-400 hover:bg-[#1E2733] hover:text-white' : 'text-slate-500 hover:bg-gray-100'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-rose-500 hover:bg-rose-500/10`}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ParentLayout;
