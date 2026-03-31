import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeProvider';
import axiosInstance from '../../utils/axiosInstance';
import { 
  Award, TrendingUp, Search, Calendar, 
  ChevronLeft, FileText, ChevronRight, PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const ParentResults = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API}/parent/dashboard`);
      setData(res.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assessment results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  const filteredResults = data?.filter(r => 
    r.testName.toLowerCase().includes(search.toLowerCase()) ||
    r.courseName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const averagePercentage = data?.length > 0 
    ? (data.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0) / data.length).toFixed(1)
    : '0.0';

  return (
    <div className={`min-h-screen p-6 md:p-10 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button 
              onClick={() => navigate('/parent/dashboard')}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${isDark ? 'text-slate-500 hover:text-purple-400' : 'text-slate-400 hover:text-purple-600'}`}
            >
              <ChevronLeft size={14} /> Back to Dashboard
            </button>
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Your Child's Test Results
            </h1>
            <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              A clear look at how your child is performing in their exams.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-80">
            <div className={`relative flex-1 group`}>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-purple-500' : 'text-slate-400'}`} size={16} />
              <input
                type="text"
                placeholder="Search assessments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-12 pr-6 py-3.5 rounded-2xl border text-sm font-bold transition-all outline-none ${
                    isDark ? 'bg-[#121A22] border-[#1E2733] text-white focus:border-purple-600 shadow-xl' : 'bg-white border-slate-100 focus:border-purple-600 shadow-sm'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden flex items-center justify-between ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
                < Award size={32} />
              </div>
              <div>
                <p className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Overall Average</p>
                <div className="flex items-end gap-2">
                  <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{averagePercentage}%</p>
                  <span className={`text-xs font-black mb-1.5 uppercase ${parseFloat(averagePercentage) >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {parseFloat(averagePercentage) >= 60 ? 'Good Progress' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
            <TrendingUp size={60} className={`opacity-5 ${isDark ? 'text-white' : 'text-purple-900'}`} />
          </div>

          <div className={`p-8 rounded-[2.5rem] border flex items-center justify-around ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="text-center">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Tests</p>
              <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{data?.length}</p>
            </div>
            <div className={`w-px h-12 ${isDark ? 'bg-[#1E2733]' : 'bg-slate-100'}`} />
            <div className="text-center">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Highest Score</p>
              <p className={`text-4xl font-black text-emerald-500`}>
                {data?.length > 0 ? Math.max(...data.map(r => parseFloat(r.percentage))) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResults.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              < Award size={48} className="mx-auto mb-4 opacity-10" />
              <p className={`text-slate-500 font-bold`}>No assessment records found.</p>
            </div>
          ) : (
            filteredResults.map((r) => {
              const pct = parseFloat(r.percentage);
              const isExcellent = pct >= 80;
              const isPass = pct >= 40;
              
              return (
                <div key={r._id} className={`group p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-[#121A22] border-[#1E2733] hover:border-purple-600/50 hover:shadow-2xl hover:shadow-purple-600/10' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-purple-100 shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isExcellent ? 'bg-emerald-500/10 text-emerald-500' : 
                        isPass ? 'bg-purple-600/10 text-purple-600' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className={`font-black tracking-tight text-base mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{r.testName}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject Test</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{pct}%</p>
                      <p className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {r.marksObtained} / {r.totalMarks} Marks
                      </p>
                      <p className={`text-[10px] font-black uppercase mt-1 ${isPass ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPass ? 'Passed \u2713' : 'Needs Focus'}
                      </p>
                    </div>
                  </div>

                  <div className={`w-full h-2 rounded-full mb-6 overflow-hidden ${isDark ? 'bg-[#0A0E13]' : 'bg-slate-100'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isExcellent ? 'bg-emerald-500' : 
                        isPass ? 'bg-purple-600' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1E2733]">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Course Title</p>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.courseName}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date Taken</p>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{new Date(r.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default ParentResults;
