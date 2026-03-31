import React from "react";
import { Clock, Calendar, MapPin, UserCheck, CheckCircle, XCircle } from "lucide-react";

const ClassesSection = ({ 
    title, 
    classes, 
    emptyMessage, 
    icon, 
    type,
    openAttendanceModal, 
    isDark 
  }) => {
    return (
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#121A22] border-[#1E2733]/50 shadow-lg shadow-black/10' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            {React.cloneElement(icon, { className: "w-5 h-5" })}
          </div>
          <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
            {classes.length}
          </span>
        </div>
        
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {classes.map((classItem, index) => (
              <div 
                key={classItem.id}
                className={`group p-4 rounded-xl border transition-all duration-300 ${
                  type === 'ongoing' 
                    ? (isDark ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200')
                    : type === 'past'
                      ? (isDark ? 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600' : 'bg-gray-50 border-gray-100 hover:border-gray-200 shadow-sm')
                      : (isDark ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40' : 'bg-blue-50/50 border-blue-100 hover:border-blue-200')
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-transform group-hover:scale-110 ${
                      type === 'ongoing' 
                        ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                        : type === 'past'
                          ? (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500')
                          : (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600')
                    }`}>
                      {type === 'ongoing' ? <Clock className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-sm sm:text-base leading-tight truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{classItem.title}</h3>
                      <div className="flex flex-wrap text-xs mt-1.5 gap-3">
                        <span className={`flex items-center font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                          {classItem.time}
                        </span>
                        <span className={`flex items-center font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                          {classItem.room}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center shrink-0">
                    {type === 'ongoing' && !classItem.attended ? (
                      <button 
                        onClick={() => openAttendanceModal(classItem)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                          isDark 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 hover:shadow-emerald-500/40' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                        }`}
                      >
                        <UserCheck className="h-4 w-4" />
                        Mark Me Present
                      </button>
                    ) : classItem.attended ? (
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                        I am Present
                      </div>
                    ) : type === 'past' ? (
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <XCircle className="h-3.5 w-3.5" />
                        I was Absent
                      </div>
                    ) : (
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                        isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        <Calendar className="h-3.5 w-3.5" />
                        Starts Soon
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-10 rounded-2xl text-center border-2 border-dashed ${isDark ? 'bg-gray-800/20 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`h-14 w-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-gray-800 text-gray-600' : 'bg-white text-gray-300'}`}>
              {React.cloneElement(icon, { className: "w-7 h-7" })}
            </div>
            <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-900'}`}>{emptyMessage}</p>
            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>No classes found here right now.</p>
          </div>
        )}
      </div>
    );
  };
export default ClassesSection;