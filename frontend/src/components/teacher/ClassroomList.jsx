import React from "react";
import { PlusCircle } from "lucide-react";
import ClassroomCard from './ClassroomCard';
import { useTheme } from "../../context/ThemeProvider";

export default function ClassroomList({ classrooms, onSelect, onNewClass, onNewAllocation }) {
  const { isDark, themeConfig } = useTheme();
  console.log(classrooms);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-medium ${
          isDark 
            ? 'text-white'
            : 'text-slate-900'
        }`}>
          Your Teaching Schedule
        </h2>
        <button 
          onClick={onNewClass}
          className={`
          ${isDark 
            ? themeConfig.dark.button.primary
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md'
          } 
          px-4 py-2 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all`}>
          <PlusCircle size={18} className="mr-2" />
          New Class
        </button>
      </div>
      
      {classrooms.length === 0 ? (
        <div className={`text-center p-10 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 ${
          isDark 
            ? 'bg-[#121A22] border-[#1E2733] text-gray-500' 
            : 'bg-white border-gray-100 text-slate-400 shadow-sm'
        }`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
             <PlusCircle className="w-8 h-8 opacity-20" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-slate-800'}`}>No Classrooms Allocated</h3>
          <p className="max-w-xs mx-auto text-xs leading-relaxed mb-6 font-medium">
            It looks like you haven't assigned yourself to any groups or courses yet. Let's get your semester started.
          </p>
          <button 
            onClick={onNewAllocation}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isDark 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-105' 
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-105 hover:shadow-indigo-200'
            }`}
          >
            Start New Allocation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map(classroom => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onClick={() => onSelect(classroom)}
            />
          ))}
        </div>
      )}
    </div>
  );
}