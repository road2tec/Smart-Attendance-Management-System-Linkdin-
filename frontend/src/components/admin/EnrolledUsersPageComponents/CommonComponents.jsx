import React from 'react';
import { ChevronRight, ShieldCheck, User } from 'lucide-react';
import { useTheme } from '../../../context/ThemeProvider';

// Status badge component
export const StatusBadge = ({ status }) => {
  const { isDark } = useTheme();
  let statusClass = "";
  
  const isActive = status === 'Active' || !status;
  const isInactive = status === 'Inactive';
  const isOnLeave = status === 'On Leave';

  if (isActive) {
    statusClass = isDark ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-100";
  } else if (isInactive) {
    statusClass = isDark ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-rose-50 text-rose-600 border-rose-100";
  } else if (isOnLeave) {
    statusClass = isDark ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-100";
  } else {
    statusClass = isDark ? "bg-gray-500/10 text-gray-500 border-gray-500/20" : "bg-gray-50 text-gray-600 border-gray-100";
  }
  
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${statusClass}`}>
      {status || 'Active'}
    </span>
  );
};

// Attendance indicator component
export const AttendanceIndicator = ({ percentage, isDark }) => {
  let colorClass = "";
  
  if (percentage >= 85) {
    colorClass = "bg-emerald-500";
  } else if (percentage >= 70) {
    colorClass = "bg-amber-500";
  } else {
    colorClass = "bg-rose-500";
  }
  
  return (
    <div className="flex items-center gap-4">
      <div className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-full h-2 overflow-hidden`}>
        <div 
          className={`${colorClass} h-full rounded-full transition-all duration-1000 shadow-lg`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className={`text-[10px] font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{percentage}%</span>
    </div>
  );
};

// Pagination component
export const Pagination = ({ currentPage, totalPages, paginate, isDark }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center gap-3 mt-10">
      <button 
        onClick={() => paginate(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
      >
        <ChevronRight className="rotate-180" size={18} />
      </button>
      
      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) pageNum = i + 1;
          else if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;
          
          return (
            <button
              key={i}
              onClick={() => paginate(pageNum)}
              className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${currentPage === pageNum ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100') : (isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900')}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      
      <button 
        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

// User Avatar component
export const UserAvatar = ({ firstName, isDark }) => {
  return (
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-transform ${isDark ? 'bg-[#1E2733] text-brand-primary shadow-black/20' : 'bg-indigo-50 text-indigo-600 shadow-indigo-100/50'}`}>
      {firstName?.charAt(0) || <User size={18} />}
    </div>
  );
};

// User Info component
export const UserInfo = ({ firstName, lastName, email, isDark }) => {
  return (
    <div className="flex flex-col">
      <div className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{firstName} {lastName}</div>
      <div className={`text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5`}>{email}</div>
    </div>
  );
};