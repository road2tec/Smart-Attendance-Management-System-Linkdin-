import React from 'react';
import { Clock, Users, BookOpen, ChevronRight, Zap, CheckCircle, AlertCircle } from 'lucide-react';

const SessionCard = ({ session, onStartAttendance, isDark }) => {
  const { title, courseName, groupName, schedule, isExtraClass, sessionStatus } = session;

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'in-progress': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'cancelled': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className={`group relative p-6 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] ${
      isDark 
        ? 'bg-[#1E2733]/40 border-[#1E2733] hover:bg-[#1E2733]/60' 
        : 'bg-white/80 border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5'
    }`}>
      {/* Glow Effect */}
      <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative space-y-4">
        {/* Header: Title & Status */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor()}`}>
                {sessionStatus || 'scheduled'}
              </span>
              {isExtraClass && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> Extra
                </span>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-gray-800 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
            <Clock size={20} strokeWidth={2.5} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
               <BookOpen size={14} />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Course</span>
               <span className={`text-xs font-bold truncate max-w-[100px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                 {courseName}
               </span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
               <Users size={14} />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Group</span>
               <span className={`text-xs font-bold truncate max-w-[100px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                 {groupName}
               </span>
             </div>
          </div>
        </div>

        {/* Footer: Time & Action */}
        <div className={`pt-4 border-t flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-50'}`}>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Time Window</span>
            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {schedule?.startTime} — {schedule?.endTime}
            </span>
          </div>
          
          <button 
            onClick={() => onStartAttendance(session)}
            className={`flex items-center gap-2 pl-6 pr-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300'
            }`}
          >
            Start Attendance
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
