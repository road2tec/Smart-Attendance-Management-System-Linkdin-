import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Book, Users, ChevronRight, Search, LoaderCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchAllGroups } from '../../../app/features/groups/groupThunks';
import { fetchCoursesByDepartment } from '../../../app/features/courses/courseThunks';
import { createClassroom } from '../../../app/features/classroom/classroomThunks';
import { toast } from 'react-hot-toast';

const TeacherAllocationModal = ({ isOpen, onClose, isDark, user }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redux state
  const { allGroups, loading: groupsLoading } = useSelector((state) => state.groups);
  const { departmentCourses, isLoading: coursesLoading } = useSelector((state) => state.courses);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllGroups());
      if (user?.department) {
        dispatch(fetchCoursesByDepartment(user.department));
      }
    }
  }, [isOpen, dispatch, user?.department]);

  const handleCreate = async () => {
    if (!selectedCourse || !selectedGroup) return;

    setIsSubmitting(true);
    try {
      await dispatch(createClassroom({
        teacherId: user._id,
        groupId: selectedGroup._id,
        courseId: selectedCourse._id
      })).unwrap();
      
      toast.success('Classroom allocated successfully!');
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Failed to create classroom allocation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Safeguard array conversions
  const coursesArray = Array.isArray(departmentCourses) ? departmentCourses : [];
  const groupsArray = allGroups ? Object.values(allGroups).flat() : [];

  const filteredCourses = coursesArray.filter(c => 
    c.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groupsArray.filter(g => 
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
      <div className={`relative w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl ${isDark ? 'bg-[#121A22] border border-[#1E2733]' : 'bg-white border border-gray-100'}`}>
        
        {/* Header */}
        <div className={`p-8 border-b ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Allocation Wizard
              </h2>
              <p className={`text-xs font-semibold uppercase tracking-widest mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Self-Assign Academic Module
              </p>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  step >= s 
                    ? (isDark ? 'bg-brand-primary' : 'bg-indigo-600') 
                    : (isDark ? 'bg-gray-800' : 'bg-gray-100')
                }`}
              />
            ))}
          </div>
        </div>

        {/* Search Bar - only visible in interactive steps */}
        {step < 3 && (
          <div className={`px-8 py-4 border-b ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder={step === 1 ? "Search Courses..." : "Search Student Groups..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-medium border transition-all ${
                  isDark 
                    ? 'bg-[#0A0E13] border-[#1E2733] text-white focus:border-brand-primary' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600'
                }`}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-8 max-h-[400px] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Book className="w-4 h-4 text-brand-primary" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Select course module</span>
              </div>
              
              {coursesLoading ? (
                <div className="flex justify-center py-10"><LoaderCircle className="animate-spin text-brand-primary" /></div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid gap-3">
                  {filteredCourses.map(course => (
                    <button
                      key={course._id}
                      onClick={() => { setSelectedCourse(course); setStep(2); setSearchTerm(''); }}
                      className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all text-left ${
                        isDark ? 'hover:bg-[#1E2733] border-[#1E2733]' : 'hover:bg-indigo-50/50 border-gray-100 hover:border-indigo-100'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-brand-light' : 'text-indigo-600'}`}>{course.courseCode}</div>
                        <div className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.courseName}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 opacity-50">No modular catalogs found.</div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-primary" />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Target student cohort</span>
                </div>
                <button onClick={() => setStep(1)} className="text-[10px] font-bold text-brand-primary uppercase underline">Change Course</button>
              </div>

              {groupsLoading ? (
                <div className="flex justify-center py-10"><LoaderCircle className="animate-spin text-brand-primary" /></div>
              ) : filteredGroups.length > 0 ? (
                <div className="grid gap-3">
                  {filteredGroups.map(group => (
                    <button
                      key={group._id}
                      onClick={() => { setSelectedGroup(group); setStep(3); }}
                      className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all text-left ${
                        isDark ? 'hover:bg-[#1E2733] border-[#1E2733]' : 'hover:bg-indigo-50/50 border-gray-100 hover:border-indigo-100'
                      }`}
                    >
                      <div>
                        <div className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{group.name}</div>
                        <div className={`text-[10px] font-bold text-gray-500 uppercase mt-1`}>{group.students?.length || 0} Members enrolled</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 opacity-50">No groups detected.</div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-300">
               <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white shadow-xl'}`}>
                     <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Allocation</h3>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Synchronizing the following academic nexus:</p>
               </div>

               <div className={`grid grid-cols-2 gap-4 text-left`}>
                  <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-gray-50 border-gray-100'}`}>
                     <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Module</p>
                     <p className={`font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{selectedCourse.courseName}</p>
                     <p className="text-[9px] font-bold text-brand-primary">{selectedCourse.courseCode}</p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-gray-50 border-gray-100'}`}>
                     <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Cohort</p>
                     <p className={`font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{selectedGroup.name}</p>
                     <p className="text-[9px] font-bold text-brand-primary">{selectedGroup.students?.length || 0} Students</p>
                  </div>
               </div>

               <div className={`p-4 rounded-2xl flex items-center gap-3 text-left ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-700'}`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-bold leading-tight">By deploying this classroom, students in this cohort will immediately receive modular access on their portals.</p>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={isSubmitting}
                    className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-brand-primary text-white shadow-xl shadow-brand-primary/20 disabled:opacity-50`}
                  >
                    {isSubmitting ? 'Syncing...' : 'Deploy Nexus'}
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className={`p-6 px-8 flex justify-between items-center ${isDark ? 'bg-[#121A22]/50 border-t border-[#1E2733]' : 'bg-gray-50 border-t border-gray-100'}`}>
          <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Faculty OS • Allocation Subsystem</p>
          <div className="flex gap-1.5">
             {[1, 2, 3].map(i => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full ${step === i ? 'bg-brand-primary' : (isDark ? 'bg-gray-800' : 'bg-gray-200')}`} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAllocationModal;
