// UserTypeToggle.jsx
import React from 'react';
import { GraduationCap, Briefcase } from 'lucide-react';

const UserTypeToggle = ({ viewMode, setViewMode, isDark }) => {
  return (
    <div className={`p-1.5 rounded-[1.5rem] flex items-center gap-1 border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200 shadow-inner'}`}>
      <button
        onClick={() => setViewMode('students')}
        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
          viewMode === 'students'
            ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-indigo-600 shadow-sm')
            : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
        }`}
      >
        <GraduationCap size={16} />
        Academic Cohort
      </button>
      <button
        onClick={() => setViewMode('teachers')}
        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
          viewMode === 'teachers'
            ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-indigo-600 shadow-sm')
            : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
        }`}
      >
        <Briefcase size={16} />
        Instructional Faculty
      </button>
    </div>
  );
};

export default UserTypeToggle;