import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeProvider';
import axiosInstance from '../../utils/axiosInstance';
import { 
  ClipboardCheck, Calendar, Filter, Download,
  CheckCircle, Clock, XCircle, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const ParentAttendance = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API}/parent/dashboard`);
      setData(res.data.attendance);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  const filteredRecords = data?.recentRecords.filter(r => 
    filter === 'all' ? true : r.status === filter
  ) || [];

  const statusColor = {
    present: { light: 'text-emerald-600 bg-emerald-50 border-emerald-100', dark: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    late: { light: 'text-amber-600 bg-amber-50 border-amber-100', dark: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    absent: { light: 'text-rose-600 bg-rose-50 border-rose-100', dark: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  };

  return (
    <div className={`min-h-screen p-6 md:p-10 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/parent/dashboard')}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${isDark ? 'text-slate-500 hover:text-purple-400' : 'text-slate-400 hover:text-purple-600'}`}
            >
              <ChevronLeft size={14} /> Back to Dashboard
            </button>
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Your Child's Attendance Log
            </h1>
            <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              A simple list of every class your child attended or missed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-[#121A22] border-[#1E2733] text-slate-400 hover:text-white hover:border-purple-500/50' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-sm'}`}>
              <Download size={18} />
            </button>
            <div className={`flex items-center gap-1 p-1 rounded-2xl border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
              {['all', 'present', 'late', 'absent'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filter === f 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                      : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{data?.presentCount}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Present</p>
            </div>
          </div>
          <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
            <div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{data?.lateCount}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Classes Late</p>
            </div>
          </div>
          <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <XCircle size={24} />
            </div>
            <div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{data?.absentCount}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Classes Absent</p>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className={`rounded-[2rem] border overflow-hidden ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-[#1E2733]/30' : 'bg-slate-50/50'}>
                  <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Class Name</th>
                  <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date & Time</th>
                  <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</th>
                  <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#1E2733]' : 'divide-slate-50'}`}>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <ClipboardCheck size={40} className="mx-auto mb-3 opacity-20" />
                      <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No records found for the selected filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const colors = statusColor[rec.status] || statusColor.absent;
                    return (
                      <tr key={rec._id} className={`${isDark ? 'hover:bg-[#1E2733]/30' : 'hover:bg-slate-50/50'} transition-colors group`}>
                        <td className="px-8 py-5">
                          <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'} group-hover:text-purple-500 transition-colors`}>{rec.sessionName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Normal Class</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={14} className="text-purple-500 opacity-50" />
                            <span className="text-xs font-bold">
                              {new Date(rec.markedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] opacity-50">•</span>
                            <span className="text-xs font-bold">
                              {new Date(rec.markedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${isDark ? colors.dark : colors.light}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Success</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentAttendance;
