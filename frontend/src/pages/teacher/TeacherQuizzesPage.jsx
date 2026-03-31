import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { getClassroomsByTeacher } from '../../app/features/classroom/classroomThunks';
import CreateTestModal from '../../components/teacher/modals/CreateTestModal';
import { ClipboardCheck, ShieldCheck, ChevronDown, PlusCircle, Calendar, Clock, FileText } from 'lucide-react';

const TeacherQuizzesPage = () => {
  const { isDark, themeConfig, theme } = useTheme();
  const currentTheme = themeConfig[theme];
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { teacherClassrooms, loading } = useSelector((state) => state.classrooms);
  
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(getClassroomsByTeacher(user._id));
    }
  }, [dispatch, user?._id]);

  const classroomsList = Array.isArray(teacherClassrooms) ? teacherClassrooms : [];

  const handleClassSelection = (e) => {
    const classId = e.target.value;
    if (classId) {
      const selected = classroomsList.find(c => c._id === classId);
      if (selected) {
        setSelectedClassroom(selected);
      }
    } else {
      setSelectedClassroom(null);
    }
  };

  // Extract quizzes associated with the selected classroom
  const activeQuizzes = useMemo(() => {
    if (!selectedClassroom) return [];
    if (!selectedClassroom.assessments) return [];
    
    return selectedClassroom.assessments.map(ass => {
      const isPast = new Date(ass.date) < new Date();
      return {
        ...ass,
        isPast,
        displayDate: new Date(ass.date).toLocaleDateString()
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedClassroom, classroomsList]);

  return (
    <div className={`min-h-screen p-6 sm:p-10 neural-mesh ${isDark ? 'bg-[#020617]' : 'bg-brand-light/20'}`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className={`relative p-8 sm:p-12 rounded-[3rem] overflow-hidden group ${isDark ? 'glass-card-elite bg-[#020617]/50' : 'bg-white border shadow-xl'}`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-10 -mr-24 -mt-24 ${isDark ? 'bg-brand-secondary' : 'bg-pink-300'}`}></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isDark ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-brand-secondary/10 text-brand-secondary'}`}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h1 className={`text-3xl sm:text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Assessment Studio
                </h1>
                <p className={`text-sm font-bold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Design and deploy quizzes and evaluations.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {classroomsList.length > 0 && (
                <div className="relative min-w-[250px]">
                  <div className="relative">
                    <select 
                      onChange={handleClassSelection}
                      className={`w-full appearance-none px-5 py-4 rounded-2xl border font-bold text-sm outline-none cursor-pointer transition-all duration-300 ${
                        isDark 
                          ? 'bg-[#121A22] border-brand-secondary/20 text-white focus:border-brand-secondary/60 hover:border-brand-secondary/40' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-secondary'
                      }`}
                    >
                      <option value="">Select Target Cohort...</option>
                      {classroomsList.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.course?.courseName || 'Class'} • {cls.group?.name || ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
              )}
              
              {selectedClassroom && (
                <button 
                  onClick={() => setIsTestModalOpen(true)}
                  className="btn-premium whitespace-nowrap px-6 py-4 flex items-center gap-2"
                >
                  <PlusCircle size={18} /> Deploy Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className={`rounded-[3rem] p-6 sm:p-10 border ${isDark ? 'glass-card-elite bg-[#020617]/50 border-transparent' : 'bg-white shadow-xl border-slate-100'}`}>
          {loading && !classroomsList.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading Matrix...</p>
            </div>
          ) : selectedClassroom ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               
               <div className="flex items-center gap-2 mb-8">
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-indigo-50 text-indigo-600'}`}>Active Quizzes</div>
                  <div className={`w-full h-[1px] ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
               </div>

               {activeQuizzes.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {activeQuizzes.map(quiz => (
                     <div key={quiz._id} className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:border-brand-secondary/50' : 'bg-slate-50 border-slate-200 hover:border-brand-secondary/30 hover:shadow-lg'}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div className={`p-4 rounded-2xl ${isDark ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-indigo-100 text-indigo-700'}`}>
                             <FileText size={24} />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${quiz.isPast ? (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500') : (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')}`}>
                             {quiz.isPast ? 'Concluded' : 'Scheduled'}
                          </span>
                        </div>
                        <h3 className={`text-lg font-bold mb-1 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{quiz.title}</h3>
                        <p className={`text-xs font-bold mb-6 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{quiz.type.toUpperCase()}</p>
                        
                        <div className={`flex items-center gap-6 pt-4 border-t ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                           <div className="flex items-center gap-2 text-xs font-semibold">
                             <Calendar size={14} /> {quiz.displayDate}
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-20 opacity-50">
                    <ClipboardCheck size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-sm">No assessments deployed for this cohort.</p>
                 </div>
               )}

            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed ${isDark ? 'border-brand-secondary/20 bg-brand-secondary/5' : 'border-slate-200 bg-slate-50/50'}`}>
               <ShieldCheck size={64} className={`mb-6 opacity-30 ${isDark ? 'text-brand-secondary' : 'text-slate-400'}`} />
               <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Cohort Selected</h3>
               <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>
                 Please select a target classroom from the dropdown above to manage its quizzes.
               </p>
            </div>
          )}
        </div>
        
        {/* Modals */}
        {isTestModalOpen && selectedClassroom && (
          <CreateTestModal
            classroom={selectedClassroom}
            isDark={isDark}
            onClose={() => {
              setIsTestModalOpen(false);
              dispatch(getClassroomsByTeacher(user._id));
            }}
            onSaved={() => {
              setIsTestModalOpen(false);
              dispatch(getClassroomsByTeacher(user._id));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherQuizzesPage;
