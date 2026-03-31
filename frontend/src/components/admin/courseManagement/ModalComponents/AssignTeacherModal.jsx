import React, { useState, useEffect } from 'react';
import { X, UserCheck, Users, ShieldCheck, GraduationCap, Info } from 'lucide-react';

const AssignTeacherModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  course, 
  groups, 
  teachers, 
  isDark,
  isLoading 
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);

  useEffect(() => {
    if (isOpen && course) {
      setSelectedTeacher('');
      setSelectedGroup('');
      
      if (teachers && course.department) {
        const deptTeachers = teachers.filter(
          teacher => teacher.department && teacher?.department?._id?.toString() === course?.department?._id?.toString()
        );
        setFilteredTeachers(deptTeachers);
      } else {
        setFilteredTeachers(teachers || []);
      }
      
      if (groups && course.department) {
        const deptGroups = [];
        Object.keys(groups).forEach(deptId => {
          if (deptId === course.department._id) {
            deptGroups.push(...groups[deptId]);
          }
        });
        setFilteredGroups(deptGroups);
      } else {
        setFilteredGroups([]);
      }
    }
  }, [isOpen, course, teachers, groups]);

  if (!isOpen) return null;

  const selectClass = `w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm appearance-none cursor-pointer ${
    isDark 
      ? 'bg-[#121A22]/50 border-transparent focus:border-brand-primary text-white' 
      : 'bg-gray-50 border-transparent focus:border-indigo-600 text-gray-900'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
         className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 animate-in fade-in" 
         onClick={onClose}
      />
      
      <div className={`relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-8 ${
        isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-white border-gray-100'
      }`}>
        <div className={`px-10 py-8 border-b flex items-center justify-between ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-brand-primary/20 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
                <UserCheck size={24} />
             </div>
             <div>
                <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Deploy Faculty</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Assigning to {course?.courseCode}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-3 rounded-2xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-500 hover:text-white' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-900'}`}
          >
            <X size={20} />
          </button>
        </div>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              courseId: course._id,
              teacherId: selectedTeacher,
              groupId: selectedGroup,
            });
          }}
          className="p-10 space-y-8"
        >
          <div className={`p-6 rounded-2xl border flex items-center gap-4 ${isDark ? 'bg-brand-primary/5 border-brand-primary/10' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
             <Info className="text-brand-primary w-5 h-5 shrink-0" />
             <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                This action will link the selected instructor to the specified student cohort for this academic program.
             </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <ShieldCheck size={12} /> Target Faculty
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className={selectClass}
                required
              >
                <option value="">Select an Instructor</option>
                {filteredTeachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id} className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Users size={12} /> Student Cohort / Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={selectClass}
                required
              >
                <option value="">Select a Cohort</option>
                {filteredGroups.map(group => (
                  <option key={group._id} value={group._id} className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={`pt-8 border-t flex flex-col sm:flex-row justify-end gap-4 ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Dismiss
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedTeacher || !selectedGroup}
              className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 disabled:scale-100 ${
                isDark 
                  ? 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-secondary' 
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Deploy Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTeacherModal;