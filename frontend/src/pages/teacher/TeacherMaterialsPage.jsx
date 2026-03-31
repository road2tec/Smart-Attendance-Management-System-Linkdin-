import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { getClassroomsByTeacher } from '../../app/features/classroom/classroomThunks';
import MaterialSharing from '../../components/teacher/MaterialSharing';
import { BookOpen, FolderOpen, ChevronDown } from 'lucide-react';

const TeacherMaterialsPage = () => {
  const { isDark, themeConfig, theme } = useTheme();
  const currentTheme = themeConfig[theme];
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { teacherClassrooms, loading } = useSelector((state) => state.classrooms);
  
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(getClassroomsByTeacher(user._id));
    }
  }, [dispatch, user?._id]);

  // Format array for classroom list
  const classroomsList = Array.isArray(teacherClassrooms) ? teacherClassrooms : [];

  const handleClassSelection = (e) => {
    const classId = e.target.value;
    if (classId) {
      const selected = classroomsList.find(c => c._id === classId);
      // Construct the classroom object exactly as MaterialSharing expects it
      if (selected) {
        setSelectedClassroom({
          id: selected._id,
          courseName: selected.course?.courseName || "Unnamed Course",
          groupName: selected.group ? selected.group.name : "Unassigned"
        });
      }
    } else {
      setSelectedClassroom(null);
    }
  };

  return (
    <div className={`min-h-screen p-6 sm:p-10 neural-mesh ${isDark ? 'bg-[#020617]' : 'bg-brand-light/20'}`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className={`relative p-8 sm:p-12 rounded-[3rem] overflow-hidden group ${isDark ? 'glass-card-elite bg-[#020617]/50' : 'bg-white border shadow-xl'}`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-10 -mr-24 -mt-24 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isDark ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-primary/10 text-brand-primary'}`}>
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className={`text-3xl sm:text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Study Materials
                </h1>
                <p className={`text-sm font-bold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Upload notes and share announcements with your students.
                </p>
              </div>
            </div>
            
            {/* Classroom Selector */}
            {classroomsList.length > 0 && (
              <div className="relative min-w-[250px]">
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Select Class</label>
                <div className="relative">
                  <select 
                    onChange={handleClassSelection}
                    className={`w-full appearance-none px-5 py-4 rounded-2xl border font-bold text-sm outline-none cursor-pointer transition-all duration-300 ${
                      isDark 
                        ? 'bg-[#121A22] border-brand-primary/20 text-white focus:border-brand-primary/60 hover:border-brand-primary/40' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-primary'
                    }`}
                  >
                    <option value="">Choose your class...</option>
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
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className={`rounded-[3rem] p-6 sm:p-10 border ${isDark ? 'glass-card-elite bg-[#020617]/50 border-transparent' : 'bg-white shadow-xl border-slate-100'}`}>
          {loading && !classroomsList.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading materials...</p>
            </div>
          ) : selectedClassroom ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <MaterialSharing isDark={isDark} currentTheme={currentTheme} classroom={selectedClassroom} />
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed ${isDark ? 'border-brand-primary/20 bg-brand-primary/5' : 'border-slate-200 bg-slate-50/50'}`}>
               <FolderOpen size={64} className={`mb-6 opacity-30 ${isDark ? 'text-brand-primary' : 'text-slate-400'}`} />
               <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Class Selected</h3>
               <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>
                 Please select a class from the list above to manage materials.
               </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default TeacherMaterialsPage;
