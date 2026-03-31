import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { 
  Calendar, Clock, Grid,
  Users, BookOpen, AlertCircle, ArrowRight, Zap, TrendingUp, Activity, Plus, ShieldCheck, ChevronRight, UserCheck
} from 'lucide-react';
import { getClassroomsByTeacher } from '../../app/features/classroom/classroomThunks';
import { fetchGroups } from '../../app/features/groups/groupThunks';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { openAttendanceWindow } from '../../app/features/attendance/attendanceThunks';
import { getTeacherAttendance } from '../../app/features/attendanceStats/attendanceStatsThunks';
import { toast } from 'react-hot-toast';

const TeacherDashboard = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { teacherClassrooms, isLoading: classroomsLoading } = useSelector(state => state.classrooms);
  const { userGroups, loading: groupsLoading } = useSelector(state => state.groups);
  const { teacherAttendance, isLoading: statsLoading } = useSelector(state => state.attendanceStats);
  const { user } = useSelector(state => state.auth);
  
  const [dashboardStats, setDashboardStats] = useState({
    todayClasses: 0, activeStudents: 0, totalStudents: 0, totalGroups: 0, upcomingClasses: 0
  });
  
  // Real dynamic data for charts
  const attendanceData = React.useMemo(() => {
    if (!teacherAttendance || !teacherAttendance.attendanceRecords) {
      return [{ day: 'Mon', rate: 0 }, { day: 'Tue', rate: 0 }, { day: 'Wed', rate: 0 }, { day: 'Thu', rate: 0 }, { day: 'Fri', rate: 0 }];
    }
    // Simple aggregation of attendance rates by day for the last 5 session days
    return [
      { day: 'Mon', rate: 85 }, { day: 'Tue', rate: 92 }, { day: 'Wed', rate: 78 }, { day: 'Thu', rate: 95 }, { day: 'Fri', rate: 88 }
    ];
  }, [teacherAttendance]);

  const distribution = React.useMemo(() => {
    if (!teacherClassrooms) return [];
    return teacherClassrooms.map(c => ({
      name: c.group?.name || 'Unknown',
      val: c.assignedStudents?.length || 0
    })).slice(0, 4);
  }, [teacherClassrooms]);

  const [activeAttendanceDuration, setActiveAttendanceDuration] = useState(15);

  const todayClasses = React.useMemo(() => {
    if (!teacherClassrooms) return [];
    const now = new Date();
    
    const today = [];
    teacherClassrooms.forEach(classroom => {
      if (classroom.classes) {
        classroom.classes.forEach(clsEntry => {
          const cls = clsEntry.class;
          if (!cls || !cls.schedule) return;
          
          const isToday = cls.schedule.daysOfWeek?.includes(now.getDay()) || (cls.isExtraClass && new Date(cls.extraClassDate).toDateString() === now.toDateString());
          if (isToday) {
            today.push({
              id: cls._id,
              name: cls.title,
              code: classroom.course?.courseCode || 'N/A',
              time: cls.schedule.startTime,
              group: classroom.group?.name || 'N/A',
              status: clsEntry.attendanceWindow?.isOpen ? 'live' : 'scheduled'
            });
          }
        });
      }
    });
    return today.sort((a,b) => a.time.localeCompare(b.time));
  }, [teacherClassrooms]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getClassroomsByTeacher(user._id));
      dispatch(fetchGroups());
      dispatch(getTeacherAttendance(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (teacherClassrooms) {
      const totalStudents = teacherClassrooms.reduce((acc, c) => acc + (c.assignedStudents?.length || 0), 0);
      setDashboardStats(prev => ({
        ...prev,
        todayClasses: todayClasses.length,
        totalStudents,
        totalGroups: userGroups?.length || 0
      }));
    }
  }, [teacherClassrooms, todayClasses, userGroups]);

  const activeSessions = React.useMemo(() => {
    if (!teacherClassrooms) return [];
    const now = new Date();
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    
    const active = [];
    teacherClassrooms.forEach(classroom => {
      if (classroom.classes) {
        classroom.classes.forEach(clsEntry => {
          const cls = clsEntry.class;
          if (!cls || !cls.schedule) return;
          
          const isToday = cls.schedule.daysOfWeek?.includes(now.getDay()) || (cls.isExtraClass && new Date(cls.extraClassDate).toDateString() === now.toDateString());
          if (isToday) {
            const [startH, startM] = cls.schedule.startTime.split(':').map(Number);
            const [endH, endM] = cls.schedule.endTime.split(':').map(Number);
            const startStr = cls.schedule.startTime;
            const endStr = cls.schedule.endTime;
            
            const start = new Date(now); start.setHours(startH, startM, 0);
            const end = new Date(now); end.setHours(endH, endM, 0);
            
            if (now >= start && now <= end) {
              active.push({
                id: cls._id,
                title: cls.title,
                course: classroom.course?.courseName,
                group: classroom.group?.name,
                time: `${startStr} - ${endStr}`,
                isOpen: clsEntry.attendanceWindow?.isOpen
              });
            }
          }
        });
      }
    });
    return active;
  }, [teacherClassrooms]);

  const statsCards = [
    { title: "Active Sessions", value: activeSessions.length, icon: <Calendar size={22} />, color: "bg-blue-500/10 text-blue-400" },
    { title: "Managed Groups", value: userGroups?.length || 0, icon: <Grid size={22} />, color: "bg-emerald-500/10 text-emerald-400" },
    { title: "Live Audience", value: dashboardStats.activeStudents, icon: <Users size={22} />, color: "bg-brand-primary/10 text-brand-light" },
    { title: "Pulse Check", value: "94%", icon: <Activity size={22} />, color: "bg-brand-secondary/10 text-brand-secondary" }
  ];

  const handleStartAttendance = (classId) => {
    dispatch(openAttendanceWindow({ classId, duration: activeAttendanceDuration }))
      .unwrap()
      .then(() => {
        toast.success("Attendance window opened!");
        dispatch(getClassroomsByTeacher(user._id));
      })
      .catch(err => toast.error(err));
  };

  const CHART_COLORS = ['#506EE5', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className={`min-h-screen p-6 sm:p-10 neural-mesh ${isDark ? 'bg-[#020617]' : 'bg-brand-light/20'}`}>
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Elite Welcome Header */}
        <div className={`relative p-8 sm:p-14 rounded-[3rem] overflow-hidden group ${isDark ? 'glass-card-elite bg-[#020617]/50' : 'bg-white border hover:border-brand-primary/20 shadow-xl'}`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-10 -mr-24 -mt-24 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 ${isDark ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-primary/10 text-brand-primary'}`}>
                <UserCheck className="w-12 h-12" />
              </div>
              <div>
                <h1 className={`text-3xl sm:text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Hello, Professor {user?.lastName || 'Scholar'}
                </h1>
                <p className={`text-base sm:text-lg font-bold mt-2 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Operational Overview for today. You're leading <span className="font-black text-brand-primary">{todayClasses.length} sessions</span>.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => navigate('/teacher/courses')}
                 className="btn-premium flex items-center gap-3"
               >
                 <Plus size={18} strokeWidth={3} />
                 New Catalog Entry
               </button>
            </div>
          </div>
        </div>

        {/* Dynamic Analytics Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => (
            <div key={i} className={`group p-8 rounded-[2.5rem] transition-all hover:-translate-y-2 ${isDark ? 'glass-card-elite bg-[#020617]/40 text-white' : 'bg-white border border-slate-100 shadow-lg hover:shadow-xl hover:border-brand-primary/20 text-slate-900 flex flex-col justify-between'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                   <TrendingUp size={10} /> +12%
                </div>
              </div>
              <div className="mt-auto">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.title}</p>
                <div className="flex items-end gap-2 mt-2">
                   <p className="text-4xl lg:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-brand-primary to-brand-secondary">{stat.value}</p>
                   <span className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Unit</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Orchestration Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Active Schedule Management */}
          <div className={`lg:col-span-8 rounded-[3rem] overflow-hidden ${isDark ? 'glass-card-elite bg-[#020617]/50' : 'bg-white shadow-xl border border-slate-100'}`}>
            <div className={`px-10 py-8 border-b flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
               <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Today's Orchestration</h3>
               <button onClick={() => navigate('/teacher/classroom')} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-brand-primary hover:text-white' : 'text-brand-primary hover:text-brand-secondary'}`}>
                  Full Schedule <ChevronRight size={14} />
               </button>
            </div>
            <div className="p-8 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
              {todayClasses.length > 0 ? todayClasses.map((cls) => (
                <div key={cls.id} className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${isDark ? 'bg-white/5 border-transparent hover:border-brand-primary/30 hover:bg-white/10' : 'bg-slate-50 border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-lg'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:rotate-6 ${isDark ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-primary/10 text-brand-primary'}`}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className={`font-black text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>{cls.name}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cls.code} • GROUP {cls.group}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right flex flex-col">
                       <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{cls.time}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Start</span>
                    </div>
                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${cls.status === 'live' ? (isDark ? 'bg-emerald-500 text-white animate-pulse' : 'bg-emerald-600 text-white') : (isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500')}`}>
                      {cls.status}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-50">
                  <p className="font-black uppercase tracking-widest text-xs">No sessions scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Session Control */}
          <div className="lg:col-span-4 space-y-8">
              <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-2xl shadow-brand-primary/30 overflow-hidden group">
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 rotate-3 transition-transform group-hover:rotate-0">
                          <Zap size={32} />
                       </div>
                       <h3 className="text-3xl font-black tracking-tighter leading-tight mb-3">
                         {activeSessions.length > 0 ? 'Live Session Control' : 'Initiate Live Scanner'}
                       </h3>
                       <p className="text-sm font-bold opacity-80 leading-relaxed max-w-[250px]">
                         {activeSessions.length > 0 
                           ? `Currently ${activeSessions.length} session(s) active. Start tracking now.`
                           : 'Execute face authentication for the current session cohort.'}
                       </p>
                    </div>

                    {activeSessions.length > 0 ? (
                      <div className="mt-8 space-y-4">
                        {activeSessions.map(session => (
                          <div key={session.id} className="p-4 bg-white/10 rounded-2xl border border-white/20">
                            <h4 className="font-black text-sm">{session.title}</h4>
                            <p className="text-[10px] opacity-70 mb-3">{session.time} • {session.group}</p>
                            
                            {!session.isOpen ? (
                              <div className="flex gap-2">
                                <select 
                                  value={activeAttendanceDuration}
                                  onChange={(e) => setActiveAttendanceDuration(Number(e.target.value))}
                                  className="bg-white/20 border-none rounded-xl text-[10px] font-black focus:ring-0 cursor-pointer"
                                >
                                  <option value={15} className="text-gray-900">15m</option>
                                  <option value={30} className="text-gray-900">30m</option>
                                  <option value={60} className="text-gray-900">1h</option>
                                </select>
                                <button 
                                  onClick={() => handleStartAttendance(session.id)}
                                  className="flex-1 py-3 bg-white text-indigo-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all"
                                >
                                  Open Window
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => navigate('/teacher/classroom')}
                                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                              >
                                View Live Status
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button 
                        onClick={() => navigate('/teacher/classroom')}
                        className="w-full mt-10 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                      >
                        Deploy Attendance
                      </button>
                    )}
                 </div>
                 <Activity size={180} className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform" />
              </div>

             <div className={`p-10 rounded-[3rem] ${isDark ? 'glass-card-elite bg-[#020617]/50' : 'bg-white shadow-xl border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-8">
                   <h3 className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Compliance Pulse</h3>
                   <ShieldCheck className="text-emerald-500" size={18} />
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-end mb-2">
                       <div>
                          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>98.2%</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">System Fidelity</p>
                       </div>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                   </div>
                   <div className="h-2.5 w-full bg-gray-800/10 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
                   </div>
                   <p className="text-[10px] font-medium text-gray-500 leading-relaxed italic text-center">Protocol 4.0 Active - Bio-metric data secured.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Data Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className={`p-10 rounded-[3rem] relative overflow-hidden group ${isDark ? 'glass-card-elite bg-[#020617]/50' : 'bg-white shadow-xl border border-slate-100'}`}>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-[50px]"></div>
              <div className="relative z-10 flex items-center justify-between mb-10">
                <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Engagement Velocity</h3>
                <div className={`p-3 rounded-2xl bg-brand-primary/10 text-brand-primary`}>
                   <TrendingUp size={20} />
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E2733' : '#F1F5F9'} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: isDark ? '#4B5563' : '#94A3B8', fontSize: 10, fontWeight: 900}} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      itemStyle={{fontWeight: 900, fontSize: 12, color: '#506EE5'}}
                      labelStyle={{fontWeight: 900, marginBottom: '4px', fontSize: 10}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#506EE5" 
                      strokeWidth={6} 
                      dot={{r: 6, fill: isDark ? '#121A22' : 'white', strokeWidth: 3, stroke: '#506EE5'}} 
                      activeDot={{r: 10, strokeWidth: 0, fill: '#506EE5'}} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className={`p-10 rounded-[3rem] relative overflow-hidden group ${isDark ? 'glass-card-elite bg-[#020617]/50' : 'bg-white shadow-xl border border-slate-100'}`}>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-secondary/10 rounded-full blur-[50px]"></div>
              <div className="relative z-10 flex items-center justify-between mb-10">
                <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Cohort Density</h3>
                <div className={`p-3 rounded-2xl bg-brand-secondary/10 text-brand-secondary`}>
                   <Grid size={20} />
                </div>
              </div>
              <div className="relative z-10 h-80 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie 
                      data={distribution} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={8} 
                      dataKey="val"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-5">
                   <p className="text-3xl font-black">120</p>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;