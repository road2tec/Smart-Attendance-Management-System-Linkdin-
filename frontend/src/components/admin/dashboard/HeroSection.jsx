import React from 'react';
import { Users, Book, CalendarCheck, Clock, Bell, ArrowUpRight, Shield, Zap } from 'lucide-react';

export default function HeroSection({
  stats,
  progress,
  notifications = [],
  systemStatus,
  isDark
}) {
  const formatCount = (value) => new Intl.NumberFormat().format(Number(value || 0));

  const quickStats = [
    { 
      icon: <Users size={22} />, 
      label: 'Global Cohort', 
      value: formatCount(stats?.totalStudents),
      color: 'text-brand-primary'
    },
    { 
      icon: <Book size={22} />, 
      label: 'Active Syllabus', 
      value: formatCount(stats?.activeCourses),
      color: 'text-emerald-400'
    },
    { 
      icon: <CalendarCheck size={22} />, 
      label: 'Live Sessions', 
      value: formatCount(stats?.todaysClasses),
      color: 'text-amber-400'
    },
    { 
      icon: <Zap size={22} />, 
      label: 'Avg Velocity', 
      value: `${Math.round(Number(stats?.averageAttendance || 0))}%`,
      color: 'text-rose-400'
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Primary Analytics Grid */}
      <div className={`lg:col-span-8 p-8 sm:p-10 rounded-[3rem] border backdrop-blur-md ${
        isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-10">
           <div>
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Operational Pulse</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time institutional telemetry</p>
           </div>
           <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl ${isDark ? 'bg-[#1E2733]/50 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
              <Clock size={14} className="animate-spin-slow" />
              <span className="text-xs font-black uppercase tracking-widest">Live Feed</span>
           </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className={`p-6 rounded-[2rem] border transition-all duration-500 hover:scale-105 ${
              isDark ? 'bg-[#1E2733]/30 border-[#1E2733]' : 'bg-gray-50/50 border-gray-100'
            }`}>
              <div className={`${isDark ? stat.color : 'text-indigo-600'} mb-4`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Progress Card */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-brand-primary/5 border-brand-primary/20' : 'bg-indigo-50/50 border-indigo-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-brand-light/60' : 'text-indigo-600'}`}>
                {progress?.title || 'Maturity Index'}
              </h3>
              <div className={`p-1.5 rounded-lg ${isDark ? 'bg-brand-primary text-white' : 'bg-indigo-600 text-white'}`}>
                 <ArrowUpRight size={14} />
              </div>
            </div>
            <p className={`text-sm font-medium leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {progress?.description}
            </p>
            <div className="space-y-2">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Efficiency Threshold</span>
                  <span>{progress?.percent}%</span>
               </div>
               <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                 <div
                   className={`h-full rounded-full transition-all duration-1000 ${isDark ? 'bg-brand-primary shadow-[0_0_15px_rgba(46,103,255,0.5)]' : 'bg-indigo-600'}`}
                   style={{ width: `${progress?.percent}%` }}
                 ></div>
               </div>
            </div>
          </div>
          
          {/* System Integrity Card */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-emerald-400/60' : 'text-emerald-600'}`}>
                {systemStatus?.title || 'System Stability'}
              </h3>
              <Shield size={16} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
            </div>
            <p className={`text-sm font-medium leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {systemStatus?.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {systemStatus?.badges?.map((badge, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Interaction & Notification Panel */}
      <div className={`lg:col-span-4 p-8 rounded-[3rem] border backdrop-blur-md flex flex-col ${
        isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Broadcasts</h2>
          <div className={`p-2 rounded-xl scale-75 ${isDark ? 'bg-[#1E2733] text-brand-primary' : 'bg-indigo-100 text-indigo-600'}`}>
            <Bell size={20} className="animate-bounce" />
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          {(notifications.length ? notifications : [{ type: 'system', message: 'All operational nodes report nominal status.', time: 'System Time' }]).map((notification, index) => (
            <div 
              key={index} 
              className={`p-5 rounded-2xl border-l-4 transition-all hover:translate-x-1 ${
                notification.type === 'attendance' 
                  ? (isDark ? 'bg-rose-500/5 border-rose-500/50 shadow-lg shadow-rose-900/5' : 'bg-rose-50 border-rose-500')
                  : (isDark ? 'bg-brand-primary/5 border-brand-primary/50 shadow-lg shadow-brand-primary/5' : 'bg-indigo-50 border-indigo-500')
              }`}
            >
              <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-3">
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{notification.time}</span>
                 <div className={`w-1.5 h-1.5 rounded-full ${notification.type === 'attendance' ? 'bg-rose-500' : 'bg-brand-primary'}`}></div>
              </div>
            </div>
          ))}
        </div>
        
        <button className={`w-full mt-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all transform active:scale-95 ${
          isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}>
          Console Explorer
        </button>
      </div>
    </div>
  );
}