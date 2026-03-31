import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, BookOpen, AlertCircle, Calendar, Clock, 
  Download, RefreshCw, BarChart2, Mail
} from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';
import { getOverallAttendance } from '../../app/features/attendanceStats/attendanceStatsThunks';
import { toast } from 'react-toastify';


const AttendanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  
  const { overallAttendance, isLoading, isError, message } = useSelector((state) => state.attendanceStats);
  const { user, token: reduxToken } = useSelector((state) => state.auth);
  // Fallback to localStorage if redux state is not yet hydrated
  const token = reduxToken || localStorage.getItem('authToken');
  
  const [isNotifying, setIsNotifying] = useState(false);
  const [isBulkNotifying, setIsBulkNotifying] = useState(false);
  
  useEffect(() => {
    dispatch(getOverallAttendance());
  }, [dispatch]);

  const handleNotifyParents = async (studentIds) => {
    if (!studentIds || studentIds.length === 0) return;
    setIsNotifying(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendanceStats/notify-parents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentIds })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Alerts sent to parents successfully.');
      } else {
        toast.error(data.message || 'Failed to send alerts.');
      }
    } catch (error) {
      toast.error('Network error occurred while notifying parents.');
    } finally {
      setIsNotifying(false);
    }
  };
 
   const handleBulk6MonthReport = async () => {
     if (!window.confirm("This will analyze attendance for the last 6 months and send emails to parents of students with low attendance (<75%). Proceed?")) return;
     
     setIsBulkNotifying(true);
     try {
       const response = await fetch(`${import.meta.env.VITE_API_URL}/email/bulk-6-month-report`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({ threshold: 75 })
       });
       const data = await response.json();
       if (response.ok) {
         toast.success(data.message || '6-Month reports sent successfully.');
       } else {
         toast.error(data.message || 'Failed to trigger bulk reports.');
       }
     } catch (error) {
       toast.error('Network error occurred during bulk reporting.');
     } finally {
       setIsBulkNotifying(false);
     }
   };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary/30 border-t-brand-primary"></div>
      </div>
    );
  }

  if (isError || !overallAttendance) {
    return (
      <div className="p-8 glass-card rounded-[32px] bg-red-500/10 border-red-500/20 text-red-500">
         <h3 className="font-black uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
           <AlertCircle size={18}/> Data Error
         </h3>
         <p className="font-bold">{message || "No attendance data available."}</p>
      </div>
    );
  }

  const { overallStats, attendanceByClass, attendanceByCourse, lowAttendanceStudents, sessionLogs } = overallAttendance;

  const totalRecords = overallStats?.totalRecords || 0;
  const presentRate = totalRecords > 0 ? Math.round((((overallStats?.statusCounts?.present) || 0) / totalRecords) * 100) : 0;
  const lateRate = totalRecords > 0 ? Math.round((((overallStats?.statusCounts?.late) || 0) / totalRecords) * 100) : 0;
  const absentRate = totalRecords > 0 ? Math.round((((overallStats?.statusCounts?.absent) || 0) / totalRecords) * 100) : 0;

  const defaulters = Array.isArray(lowAttendanceStudents)
    ? lowAttendanceStudents.filter((student) => Number(student?.attendancePercentage || 0) < 75)
    : [];

  const CHART_COLORS = isDark ? ['#8b5cf6', '#2563eb', '#f59e0b', '#ef4444'] : ['#8b5cf6', '#2563eb', '#f59e0b', '#f87171'];

  const statusData = [
    { name: 'Present', value: overallStats.statusCounts.present || 0 },
    { name: 'Late', value: overallStats.statusCounts.late || 0 },
    { name: 'Absent', value: overallStats.statusCounts.absent || 0 }
  ];

  const statsCards = [
    { title: "Total Sessions", value: totalRecords, icon: <Calendar size={20}/>, color: "bg-blue-500/10 text-blue-500" },
    { title: "Present Rate", value: `${presentRate}%`, icon: <Users size={20}/>, color: "bg-emerald-500/10 text-emerald-500" },
    { title: "Late Rate", value: `${lateRate}%`, icon: <Clock size={20}/>, color: "bg-amber-500/10 text-amber-500" },
    { title: "Absent Rate", value: `${absentRate}%`, icon: <AlertCircle size={20}/>, color: "bg-red-500/10 text-red-500" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="space-y-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform Analytics</h1>
            <p className={`text-base font-bold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monitoring campus-wide attendance trends and security logs.</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => dispatch(getOverallAttendance())}
                className={`p-4 rounded-2xl transition-all border ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:shadow-md'}`}
             >
                <RefreshCw size={20} />
             </button>
             <button className="btn-premium px-8 py-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20">
                <Download size={18} /> Export Data
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => (
            <div key={i} className={`glass-card p-8 rounded-[32px] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                   <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.title}</p>
                   <p className={`text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 p-2 rounded-[24px] bg-slate-100 dark:bg-white/5 w-fit overflow-x-auto max-w-full custom-scrollbar">
           {['overview', 'classes', 'sessions', 'courses', 'defaulters'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
             >
                {tab}
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className={`glass-card p-10 rounded-[40px] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <h3 className={`text-xl font-black tracking-tight mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Overall Status</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className={`glass-card p-10 rounded-[40px] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Attention Needed</h3>
                      <span className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 inline-block">Low Attendance</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {defaulters.length > 0 && (
                        <button 
                          onClick={() => handleNotifyParents(defaulters.map(s => s.studentId))}
                          disabled={isNotifying}
                          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'} disabled:opacity-50`}
                        >
                          <Mail size={14} /> {isNotifying ? 'Sending...' : 'Alert Defaulters'}
                        </button>
                      )}
                      <button 
                        onClick={handleBulk6MonthReport}
                        disabled={isBulkNotifying}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-brand-primary/20 text-brand-light hover:bg-brand-primary hover:text-white' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white'} disabled:opacity-50`}
                      >
                        <BarChart2 size={14} /> {isBulkNotifying ? 'Processing...' : 'Bulk 6-Month Reports'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {lowAttendanceStudents?.map((student, i) => (
                      <div key={i} className={`p-5 rounded-3xl border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                         <div className="flex justify-between items-center">
                            <div>
                               <h4 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>{student.studentName || 'Student'}</h4>
                               <p className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{student.rollNumber} • {student.groupName}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-lg font-black ${student.attendancePercentage < 75 ? 'text-red-500' : 'text-brand-primary'}`}>{Math.round(student.attendancePercentage)}%</span>
                              {student.attendancePercentage < 75 && (
                                <button 
                                  onClick={() => handleNotifyParents([student.studentId])}
                                  title="Send Parent Email Alert"
                                  disabled={isNotifying}
                                  className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'bg-white border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500'} disabled:opacity-50`}
                                >
                                  <Mail size={16} />
                                </button>
                              )}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className={`glass-card p-10 rounded-[40px] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
               <h3 className={`text-xl font-black tracking-tight mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>Attendance by Class Average</h3>
               <div className="h-[500px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={attendanceByClass}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#e2e8f0'} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900}} />
                     <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '16px', border: 'none'}}
                     />
                     <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                     <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className={`glass-card p-10 rounded-[40px] overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
               <h3 className={`text-xl font-black tracking-tight mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Global Session Logs</h3>
               <div className="overflow-x-auto">
                 <table className="min-w-full">
                   <thead className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
                     <tr>
                       {['Date', 'Class', 'Instructor', 'Engagement', 'Status Breakdown'].map((header) => (
                         <th key={header} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                           {header}
                         </th>
                       ))}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-inherit">
                     {(sessionLogs || []).map((session, index) => (
                       <tr key={index} className={`transition-colors ${isDark ? 'divide-white/5 hover:bg-white/5' : 'divide-slate-100 hover:bg-slate-50'}`}>
                         <td className="px-6 py-4">
                           <div className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.date}</div>
                         </td>
                         <td className="px-6 py-4 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                           {session.className || 'General'}
                         </td>
                         <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           {session.teacherName || 'System'}
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className={`w-12 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                               <div 
                                 className={`h-full rounded-full ${
                                   session.rate >= 90 ? 'bg-emerald-500' :
                                   session.rate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                 }`}
                                 style={{ width: `${session.rate}%` }}
                               ></div>
                             </div>
                             <span className={`text-[10px] font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                               {Math.round(session.rate)}%
                             </span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                                {session.presentCount} P
                              </span>
                              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500">
                                {session.absentCount} A
                              </span>
                              {(session.lateCount > 0) && (
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500">
                                  {session.lateCount} L
                                </span>
                              )}
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;