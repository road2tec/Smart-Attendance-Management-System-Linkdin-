import React from 'react';
import { Search, Filter, Building, Users, X, Info } from 'lucide-react';

const SearchAndFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  isFilterOpen, 
  setIsFilterOpen,
  selectedCourse, 
  setSelectedCourse,
  selectedGroup, 
  setSelectedGroup,
  courses,
  groups,
  isDark
}) => {
  
  const inputClass = `w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${
    isDark 
      ? 'bg-[#0A0E13] border-transparent focus:border-brand-primary text-white placeholder-gray-700' 
      : 'bg-gray-50 border-transparent focus:border-indigo-600 text-gray-900 placeholder-gray-300'
  }`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-brand-primary' : 'text-gray-400 group-focus-within:text-indigo-600'}`} size={18} />
          <input
            type="text"
            placeholder="Quantum search by name, email or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-14`}
          />
        </div>
        
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isFilterOpen 
              ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100')
              : (isDark ? 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10' : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:bg-gray-50')
          }`}
        >
          <Filter size={14} />
          {isFilterOpen ? 'Hide Parameters' : 'Refine Search'}
        </button>
      </div>

      {isFilterOpen && (
        <div className={`p-8 rounded-[2rem] border animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-gray-50 border-gray-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Building size={12} /> Academic Domain
              </label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">All Domains</option>
                  {courses.map((course, index) => (
                    <option key={index} value={course} className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                      {course}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                   <Filter size={14} className="text-gray-500" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Users size={12} /> Target Cohort
              </label>
              <div className="relative">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">All Groups</option>
                  {groups.map((group, index) => (
                    <option key={index} value={group} className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                      {group}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                   <Users size={14} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800/10 dark:border-white/5 flex items-center gap-3">
             <Info className="text-brand-primary w-4 h-4" />
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Use specific filters to narrow down personnel registry matches.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;