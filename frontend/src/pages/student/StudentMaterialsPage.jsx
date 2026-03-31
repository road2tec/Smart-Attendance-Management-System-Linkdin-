import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { getClassroomsByStudent } from '../../app/features/classroom/classroomThunks';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  BookOpen,
  FolderOpen
} from 'lucide-react';

const StudentMaterialsPage = () => {
  const { theme, themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const classrooms = useSelector(state => state.classrooms.studentClassrooms || []);
  const isLoading = useSelector(state => state.classrooms.isLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  useEffect(() => {
    if (user?._id) {
      dispatch(getClassroomsByStudent(user._id));
    }
  }, [dispatch, user]);

  // Aggregate all materials from all classrooms
  const allMaterials = React.useMemo(() => {
    if (!classrooms || !Array.isArray(classrooms)) return [];
    
    let docs = [];
    classrooms.forEach(cls => {
      if (cls.sharedResources && cls.sharedResources.length > 0) {
        cls.sharedResources.forEach(res => {
          docs.push({
            title: res.title,
            type: res.type,
            url: (() => {
              const rawUrl = (res.files && res.files.length > 0) ? res.files[0].url : res.link;
              if (!rawUrl) return null;
              return rawUrl.startsWith('http') ? rawUrl : `${import.meta.env.VITE_API_URL}${rawUrl}`;
            })(),
            uploadedAt: res.createdAt,
            uploadedBy: res.uploadedBy ? (res.uploadedBy.firstName + ' ' + res.uploadedBy.lastName) : 'Faculty',
            courseName: cls.course?.courseName || 'General',
            courseCode: cls.course?.courseCode || 'N/A',
            departmentName: cls.department?.name || 'General Department',
            classId: cls._id
          });
        });
      }
    });
    return docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [classrooms]);

  const filteredMaterials = allMaterials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || m.departmentName === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = ['All', ...new Set(allMaterials.map(m => m.departmentName))];

  if (isLoading) {
    return (
      <div className={`${currentTheme.background} min-h-screen p-8 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.background} min-h-screen p-4 md:p-8 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${currentTheme.text} mb-2`}>
            My Study Notes
          </h1>
          <p className={`${currentTheme.secondaryText} text-lg`}>
            All notes and files from your subjects in one place.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-slate-600 group-focus-within:text-brand-primary' : 'text-slate-400 group-focus-within:text-brand-primary'}`} size={18} />
            <input 
              type="text" 
              placeholder="Search for notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-[#121A22] border-[#1E2733] text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20' 
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
             <Filter size={18} className={currentTheme.secondaryText} />
             {uniqueDepartments.map(dept => (
               <button
                 key={dept}
                 onClick={() => setSelectedDepartment(dept)}
                 className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                   selectedDepartment === dept 
                     ? (theme === 'dark' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-md shadow-indigo-200')
                     : (theme === 'dark' ? 'bg-[#121A22] text-slate-400 border border-[#1E2733] hover:border-slate-600' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200')
                 }`}
               >
                 {dept}
               </button>
             ))}
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material, idx) => (
              <div 
                key={idx}
                className={`group flex flex-col p-6 rounded-3xl border transition-all hover:scale-[1.02] ${
                  theme === 'dark' 
                    ? 'bg-[#121A22]/80 border-[#1E2733] hover:border-brand-primary/50' 
                    : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-4 rounded-2xl ${
                    theme === 'dark' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <FileText size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                    theme === 'dark' ? 'bg-[#1E2733] text-slate-400' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {material.type || 'Document'}
                  </span>
                </div>
                
                <h3 className={`text-lg font-bold mb-1 truncate ${currentTheme.text} group-hover:text-brand-primary transition-colors`}>
                  {material.title}
                </h3>
                <p className={`text-xs font-medium mb-4 ${currentTheme.secondaryText}`}>
                  [{material.departmentName}] • {material.courseName}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#1E2733]/50">
                  <span className={`text-[11px] font-semibold ${currentTheme.secondaryText}`}>
                    Added on {new Date(material.uploadedAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex gap-2">
                    {material.url && (
                        <a 
                            href={material.url.startsWith('http') 
                                ? (material.url.includes('cloudinary.com') ? material.url.replace('/upload/', '/upload/fl_attachment/') : material.url)
                                : `${import.meta.env.VITE_API_URL}${material.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`${material.title.replace(/\s+/g, '_')}_document`}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-brand-primary/20 text-brand-primary' : 'hover:bg-indigo-50 text-indigo-600'}`}
                            title="Download material"
                        >
                            <Download size={18} />
                        </a>
                    )}
                    {material.url && (
                        <a 
                            href={material.url.startsWith('http') ? material.url : `${import.meta.env.VITE_API_URL}${material.url}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            title="View link"
                        >
                            <ExternalLink size={18} />
                        </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed ${
            theme === 'dark' ? 'border-[#1E2733] bg-[#121A22]/30' : 'border-slate-200 bg-slate-50/30'
          }`}>
             <FolderOpen className={`h-16 w-16 mb-4 opacity-20 ${currentTheme.text}`} />
             <h3 className={`text-xl font-bold ${currentTheme.text}`}>No notes found</h3>
             <p className={`text-sm mt-1 ${currentTheme.secondaryText}`}>Try a different search or check back later.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentMaterialsPage;
