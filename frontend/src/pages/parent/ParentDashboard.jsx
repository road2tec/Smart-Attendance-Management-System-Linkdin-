import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeProvider';
import axiosInstance from '../../utils/axiosInstance';
import { useSocket } from '../../context/SocketContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  GraduationCap, BookOpen, ClipboardCheck, TrendingUp,
  CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw, Award, BarChart3
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const StatCard = ({ icon: Icon, label, value, color, isDark }) => (
  <div className={`rounded-3xl p-6 border flex items-center gap-4 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={26} className="text-white" />
    </div>
    <div>
      <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      <p className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
    </div>
  </div>
);

const statusColor = {
  present: { light: 'text-emerald-600 bg-emerald-50', dark: 'text-emerald-400 bg-emerald-500/10' },
  late: { light: 'text-amber-600 bg-amber-50', dark: 'text-amber-400 bg-amber-500/10' },
  absent: { light: 'text-rose-600 bg-rose-50', dark: 'text-rose-400 bg-rose-500/10' },
};

const ParentDashboard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`${API}/parent/dashboard`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchDashboard(); 
  }, []);

  useEffect(() => {
    if (socket && data?.student?._id) {
        const studentId = data.student._id;
        
        // Listen for new results for this student
        socket.on('new-result', (payload) => {
            // Check if it's for this specific student (though user room usually handles this)
            fetchDashboard();
            toast.success(`Result Published: Score is out for ${payload.assessmentName}`);
        });

        // Listen for attendance updates
        socket.on('attendance-update', (payload) => {
            if (payload.studentId === studentId) {
                fetchDashboard();
                toast.info(`Attendance Notice: ${data.student.firstName} is marked ${payload.status}`);
            }
        });
    }

    return () => {
        if (socket) {
            socket.off('new-result');
            socket.off('attendance-update');
        }
    };
  }, [socket, data?.student?._id]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-8 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-8 rounded-3xl border text-center ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Unable to Load Dashboard</h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{error}</p>
          <button onClick={fetchDashboard} className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const { student, attendance, results, courses } = data;
  const pct = parseFloat(attendance.attendancePercentage);
  const pctColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`min-h-screen p-6 md:p-10 font-sans ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        theme={isDark ? 'dark' : 'light'}
      />
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className={`relative p-8 md:p-12 rounded-[3rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500 blur-[120px] opacity-10 -mr-32 -mt-32 rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Your Child's Progress</p>
                  <h1 className={`text-2xl md:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {student.firstName} {student.lastName}
                  </h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${isDark ? 'bg-[#1E2733] text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  Roll No: {student.rollNumber || 'N/A'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${isDark ? 'bg-[#1E2733] text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {student.email}
                </span>
              </div>
            </div>
            {/* Attendance Ring */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke={isDark ? '#1E2733' : '#f1f5f9'} strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={pctColor} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50 * pct / 100} ${2 * Math.PI * 50 * (1 - pct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{pct}%</span>
                  <span className={`text-[9px] font-black uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Attendance</span>
                </div>
              </div>
              {pct < 75 && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">
                  <AlertTriangle size={12} /> Low Attendance — Action Recommended
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle} label="Present" value={attendance.presentCount} color="bg-emerald-500" isDark={isDark} />
          <StatCard icon={Clock} label="Late" value={attendance.lateCount} color="bg-amber-500" isDark={isDark} />
          <StatCard icon={XCircle} label="Absent" value={attendance.absentCount} color="bg-rose-500" isDark={isDark} />
          <StatCard icon={BookOpen} label="Subjects" value={courses.length} color="bg-purple-600" isDark={isDark} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Attendance */}
          <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`px-6 py-5 border-b flex items-center gap-3 ${isDark ? 'border-[#1E2733]' : 'border-slate-100'}`}>
              <BarChart3 size={18} className="text-purple-500" />
              <h2 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Attendance Log</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-[#1E2733] max-h-72 overflow-y-auto">
              {attendance.recentRecords.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No attendance records found.</p>
                </div>
              ) : (
                attendance.recentRecords.map((rec) => {
                  const colors = statusColor[rec.status] || statusColor.absent;
                  const colorClass = isDark ? colors.dark : colors.light;
                  return (
                    <div key={rec._id} className={`flex items-center justify-between px-6 py-3 ${isDark ? 'hover:bg-[#1E2733]/50' : 'hover:bg-slate-50'} transition-colors`}>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{rec.sessionName}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(rec.markedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${colorClass}`}>
                        {rec.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Results */}
          <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`px-6 py-5 border-b flex items-center gap-3 ${isDark ? 'border-[#1E2733]' : 'border-slate-100'}`}>
              <Award size={18} className="text-purple-500" />
              <h2 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Latest Test Results</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-[#1E2733] max-h-72 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No assessment results yet.</p>
                </div>
              ) : (
                results.map((r) => {
                  const pct = parseFloat(r.percentage);
                  const isPass = pct >= 40;
                  return (
                    <div key={r._id} className={`flex items-center justify-between px-6 py-3 ${isDark ? 'hover:bg-[#1E2733]/50' : 'hover:bg-slate-50'} transition-colors`}>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{r.testName}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{r.courseName} • {new Date(r.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{r.marksObtained}/{r.totalMarks}</span>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isPass ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        {courses.length > 0 && (
          <div className={`rounded-3xl border p-6 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-5">
              <ClipboardCheck size={18} className="text-purple-500" />
              <h2 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Current Subjects ({courses.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(c => (
                <div key={c._id} className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0D1117] border-[#1E2733]' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.courseName}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.courseCode} • {c.departmentName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ParentDashboard;
