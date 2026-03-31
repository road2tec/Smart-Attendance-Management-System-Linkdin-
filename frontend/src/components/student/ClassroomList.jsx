import React from 'react';
import { BookOpen, MapPin, Users, Calendar } from 'lucide-react';

const ClassroomList = ({
  classrooms,
  onSelectClassroom,
  currentTheme,
  isDark
}) => {

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className={`p-10 rounded-2xl flex flex-col items-center justify-center border ${isDark ? 'bg-[#0A0E13]/50 border-[#1E2733]/50' : 'bg-gray-50 border-gray-100'} border-dashed`}>
        <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-[#121A22]' : 'bg-white shadow-sm'}`}>
          <BookOpen className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <h2 className={`text-xl font-bold mb-2 ${currentTheme.text}`}>No Active Classes</h2>
        <p className={`${currentTheme.secondaryText} text-center max-w-sm`}>You are not enrolled in any classrooms yet. Check with your administrator if this is a mistake.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold tracking-tight ${currentTheme.text}`}>
          My Subjects
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom, index) => (
          <div
            key={classroom._id}
            className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${
              isDark 
                ? 'bg-[#121A22] border border-[#1E2733]/80 hover:border-brand-primary/50 hover:shadow-[0_8px_30px_rgba(80,110,229,0.15)]' 
                : 'bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-xl'
            }`}
            onClick={() => onSelectClassroom(classroom)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Top Gradient Banner */}
            <div className={`h-28 relative overflow-hidden flex items-center justify-center ${
              isDark 
                ? 'bg-gradient-to-br from-[#1A2520] to-[#0A0E13] border-b border-[#2F955A]/20' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
              {/* Decorative graphic */}
              <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 blur-2xl ${isDark ? 'bg-brand-primary' : 'bg-white'}`}></div>
              <div className={`absolute -left-6 -bottom-6 w-24 h-24 rounded-full opacity-20 blur-xl ${isDark ? 'bg-emerald-500' : 'bg-indigo-300'}`}></div>
              
              <div className="relative z-10 text-center px-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'bg-[#0A0E13]/80 text-gray-300' : 'bg-white/20 text-white backdrop-blur-md'}`}>
                  {classroom.course?.courseCode || 'Code'}
                </span>
                <h3 className={`text-xl font-extrabold line-clamp-1 ${isDark ? 'text-brand-light' : 'text-white'}`}>
                  {classroom.course?.courseName || 'Unnamed Course'}
                </h3>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 relative">
              
              <div className={`flex items-center justify-between mb-4 pb-4 border-b ${isDark ? 'border-[#1E2733]/50' : 'border-gray-100'}`}>
                <div className="flex items-center max-w-[50%]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Teacher</p>
                    <p className={`text-sm font-semibold truncate ${currentTheme.text}`}>
                      {classroom.assignedTeacher ? `${classroom.assignedTeacher.firstName} ${classroom.assignedTeacher.lastName}` : 'TBA'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-right justify-end max-w-[50%]">
                  <div className="truncate text-right">
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Group</p>
                    <p className={`text-sm font-semibold truncate ${currentTheme.text}`}>
                      {classroom.group?.name || 'All'}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-3 shrink-0 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClassroom(classroom);
                  }}
                  className={`w-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
                    isDark
                      ? 'bg-[#1E2733] text-white hover:bg-brand-primary hover:shadow-[0_0_15px_rgba(80,110,229,0.3)]'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-md'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Open Class
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomList;
