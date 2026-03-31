import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeProvider';
import axiosInstance from '../../utils/axiosInstance';
import { 
  BookOpen, Hash, Building2, User, 
  ChevronLeft, GraduationCap, ChevronRight, Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const ParentCourses = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API}/parent/dashboard`);
      setData(res.data.courses);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load course information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 md:p-10 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-[#1E2733]">
          <div>
            <button 
              onClick={() => navigate('/parent/dashboard')}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${isDark ? 'text-slate-500 hover:text-purple-400' : 'text-slate-400 hover:text-purple-600'}`}
            >
              <ChevronLeft size={14} /> Back to Dashboard
            </button>
            <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Subjects & Classes
            </h1>
            <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              A list of all subjects your child is currently studying.
            </p>
          </div>
          <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                <BookOpen size={20} />
            </div>
            <div>
              <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{data?.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Courses</p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
              <p className={`text-slate-500 font-bold`}>No courses currently enrolled.</p>
            </div>
          ) : (
            data?.map((c) => (
              <div key={c._id} className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-2 ${isDark ? 'bg-[#121A22] border-[#1E2733] hover:border-purple-600/50 hover:shadow-2xl hover:shadow-purple-600/10 shadow-lg shadow-black/20' : 'bg-white border-slate-100 hover:shadow-2xl hover:shadow-purple-100 shadow-sm shadow-slate-200/50'}`}>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[80px] -mr-16 -mt-16 rounded-full group-hover:bg-purple-600/20 transition-all duration-500" />
                
                <div className="flex flex-col h-full relative z-10">
                  <div className="mb-6 flex justify-between items-start">
                    <div className={`p-4 rounded-3xl transition-colors ${isDark ? 'bg-purple-600/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                      <Layout size={24} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${isDark ? 'bg-[#0A0E13] text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                      Main Subject
                    </span>
                  </div>

                  <h3 className={`text-xl font-black leading-tight mb-2 pr-4 transition-colors ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-purple-500`}>
                    {c.courseName}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-8">
                    <Hash size={14} className="text-purple-500 opacity-50" />
                    <span className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {c.courseCode}
                    </span>
                  </div>

                  <div className="mt-auto space-y-4 pt-6 border-t border-slate-100 dark:border-[#1E2733]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-[#0A0E13] border-[#1E2733] text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <Building2 size={14} />
                      </div>
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Department</p>
                        <p className={`text-xs font-bold leading-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{c.departmentName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-[#0A0E13] border-[#1E2733] text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                <User size={14} />
                            </div>
                            <div>
                                <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Teacher</p>
                                <p className={`text-xs font-bold leading-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Professor</p>
                            </div>
                        </div>
                        <button className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white' : 'bg-slate-50 text-slate-400 hover:bg-purple-600 hover:text-white shadow-sm'}`}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ParentCourses;
