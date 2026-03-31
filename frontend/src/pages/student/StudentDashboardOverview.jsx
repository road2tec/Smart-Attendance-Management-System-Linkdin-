import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeProvider';
import { getClassroomsByStudent } from '../../app/features/classroom/classroomThunks';
import { fetchMyResults } from '../../app/features/results/resultsThunks';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  ChevronRight,
  Calendar,
  FileText,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import SolveTestModal from '../../components/student/modals/SolveTestModal';

// Main Student Dashboard Overview Component
const StudentDashboardOverview = () => {
  const { theme, themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { user } = useSelector((state) => state.auth);
  const studentClassrooms = useSelector(state => state.classrooms.studentClassrooms || []);
  const classroomsLoading = useSelector(state => state.classrooms.isLoading);
  const { studentResults } = useSelector(state => state.results || {});

  // Local State
  const [greeting, setGreeting] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [activeClassroomId, setActiveClassroomId] = useState(null);

  // Initial Data Fetching
  useEffect(() => {
    if (user?._id) {
      dispatch(getClassroomsByStudent(user._id));
      dispatch(fetchMyResults());
    }
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [dispatch, user?._id]);

  // Derived Statistics
  const activeCoursesCount = studentClassrooms?.length || 0;
  
  // Calculate average score from results
  const averageScore = useMemo(() => {
    if (!studentResults || studentResults.length === 0) return 0;
    const totalScore = studentResults.reduce((acc, result) => {
      const obtained = result.obtainedMarks ?? result.marksObtained ?? 0;
      const percentage = result.totalMarks > 0 ? (obtained / result.totalMarks) * 100 : 0;
      return acc + (isNaN(percentage) ? 0 : percentage);
    }, 0);
    return Math.round(totalScore / studentResults.length);
  }, [studentResults]);

  // Extract upcoming classes from real classroom data
  const upcomingClasses = useMemo(() => {
    if (!studentClassrooms || studentClassrooms.length === 0) return [];
    
    let sessions = [];
    const today = new Date();
    
    studentClassrooms.forEach(classroom => {
      if (classroom.classes && classroom.classes.length > 0) {
        classroom.classes.forEach(clsEntry => {
          const cls = clsEntry.class;
          if (!cls || !cls.schedule) return;

          // Find the next occurrence in the next 7 days
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            
            if (cls.schedule.daysOfWeek.includes(checkDate.getDay())) {
              const [hours, minutes] = cls.schedule.startTime.split(':');
              const sessionDate = new Date(checkDate);
              sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                const [endHours, endMinutes] = cls.schedule.endTime.split(':');
                const sessionEndDate = new Date(checkDate);
                sessionEndDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

                if (sessionDate >= today || (today >= sessionDate && today <= sessionEndDate)) {
                  sessions.push({
                    id: cls._id,
                    courseName: cls.title,
                    courseCode: classroom.course?.courseCode,
                    teacher: classroom.assignedTeacher ? (classroom.assignedTeacher.firstName + ' ' + classroom.assignedTeacher.lastName) : 'Faculty',
                    time: cls.schedule.startTime + ' - ' + cls.schedule.endTime,
                    date: sessionDate,
                    dateFormatted: sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    attendanceOpen: (clsEntry.attendanceWindow?.isOpen || (today >= sessionDate && today <= sessionEndDate)) || false
                  });
                  break; // Just take the next one for this specific class
                }
            }
          }
        });
      }
    });

    return sessions.sort((a, b) => a.date - b.date).slice(0, 5);
  }, [studentClassrooms]);

  // Extract upcoming assessments
  const upcomingAssessments = useMemo(() => {
    if (!studentClassrooms || !Array.isArray(studentClassrooms)) return [];
    
    let tests = [];
    studentClassrooms.forEach(classroom => {
      if (classroom.assessments && classroom.assessments.length > 0) {
        classroom.assessments.forEach(ass => {
          // Compare dates by day to include today's tests
          const testDate = new Date(ass.date);
          const today = new Date();
          const isTodayOrFuture = testDate.setHours(0,0,0,0) >= today.setHours(0,0,0,0);

          if (isTodayOrFuture) {
            const isSubmitted = studentResults?.some(res => 
              String(res.classroom?._id || res.classroom) === String(classroom._id) && 
              res.assessmentName?.trim() === ass.title?.trim()
            );

            if (!isSubmitted) {
              tests.push({
                ...ass,
                courseName: classroom.course?.courseName,
                courseCode: classroom.course?.courseCode,
                remainingDays: Math.max(0, Math.ceil((new Date(ass.date) - new Date()) / (1000 * 60 * 60 * 24)))
              });
            }
          }
        });
      }
    });

    return tests.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [studentClassrooms, studentResults]);

  // Extract interactive assessments that are NOT results (pending)
  const pendingInteractiveTests = useMemo(() => {
    if (!studentClassrooms || studentClassrooms.length === 0) return [];
    
    let pending = [];
    studentClassrooms.forEach(classroom => {
      if (classroom.assessments && classroom.assessments.length > 0) {
        classroom.assessments.forEach(ass => {
          // If it's interactive (has questions) and not submitted
          if (ass.questions && ass.questions.length > 0) {
            const isSubmitted = studentResults?.some(res => 
                String(res.classroom?._id || res.classroom) === String(classroom._id) && 
                res.assessmentName?.trim() === ass.title?.trim()
            );

            if (!isSubmitted) {
                pending.push({
                    ...ass,
                    classroomId: classroom._id,
                    courseName: classroom.course?.courseName
                });
            }
          }
        });
      }
    });
    return pending;
  }, [studentClassrooms, studentResults]);

  // Find classes with open attendance windows
  const activeAttendanceClasses = useMemo(() => {
    if (!studentClassrooms || studentClassrooms.length === 0) return [];
    
    let active = [];
    const now = new Date();
    studentClassrooms.forEach(classroom => {
      if (classroom.classes && classroom.classes.length > 0) {
        classroom.classes.forEach(clsEntry => {
          const cls = clsEntry.class;
          if (!cls || !cls.schedule) return;
          
          const [startHours, startMinutes] = cls.schedule.startTime.split(':');
          const [endHours, endMinutes] = cls.schedule.endTime.split(':');
          
          const startTime = new Date(now);
          startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
          
          const endTime = new Date(now);
          endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

          // Hard lock: Attendance is only valid during the scheduled window (plus 1 min buffer)
          const isTimeValid = now <= new Date(endTime.getTime() + 60000); 
          const isOngoing = now >= startTime && now <= endTime;

          if ((clsEntry.attendanceWindow?.isOpen || isOngoing) && isTimeValid) {
            active.push({
              classId: clsEntry.class?._id,
              courseName: clsEntry.class?.title || classroom.course?.courseName,
              closesAt: clsEntry.attendanceWindow?.closesAt || endTime
            });
          }
        });
      }
    });
    return active;
  }, [studentClassrooms]);

  // Extract recent materials
  const recentMaterials = useMemo(() => {
    if (!studentClassrooms || studentClassrooms.length === 0) return [];
    
    // Flatten materials from all accessible classrooms
    let materials = [];
    studentClassrooms.forEach(classroom => {
      if (classroom.sharedResources && classroom.sharedResources.length > 0) {
        classroom.sharedResources.forEach(res => {
          materials.push({
            title: res.title,
            type: res.type,
            uploadedAt: res.createdAt,
            courseName: classroom.course?.courseName,
            courseCode: classroom.course?.courseCode,
            link: (res.files && res.files.length > 0) 
              ? (res.files[0].url.startsWith('http') ? res.files[0].url : `${import.meta.env.VITE_API_URL}${res.files[0].url}`)
              : res.link
          });
        });
      }
    });
    
    // Sort by uploadedAt descending
    return materials
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 4);
  }, [studentClassrooms]);

  // Loading State
  if (classroomsLoading && (!studentClassrooms || studentClassrooms.length === 0)) {
    return (
      <div className={`${currentTheme.background} min-h-screen p-6 md:p-8 flex items-center justify-center`}>
         <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
            <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Loading SmartPort...</p>
         </div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.background} min-h-screen p-4 md:p-8 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* WELCOME BANNER */}
        <div className={`relative overflow-hidden rounded-3xl ${currentTheme.card} p-8 lg:p-10 border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-indigo-100'} shadow-lg`}>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className={`text-sm font-medium tracking-wider uppercase mb-1 ${theme === 'dark' ? 'text-brand-light' : 'text-brand-primary'}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight ${currentTheme.text} mb-2`}>
                {greeting}, {user?.firstName || 'Student'}
              </h1>
              <p className={`text-base md:text-lg ${currentTheme.secondaryText} max-w-xl`}>
                Here is everything that is happening in your subjects today.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/student/classrooms')}
                className={`${currentTheme.button.primary} whitespace-nowrap shadow-[0_0_20px_rgba(80,110,229,0.3)] hover:shadow-[0_0_25px_rgba(80,110,229,0.5)]`}
              >
                Go to Classrooms
              </button>
            </div>
          </div>
        </div>

        {/* PENDING INTERACTIVE TESTS */}
        {pendingInteractiveTests.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className={`text-xl font-black tracking-tight ${currentTheme.text} flex items-center gap-2`}>
                   <Activity className={theme === 'dark' ? 'text-brand-primary' : 'text-indigo-600'} size={24} />
                   Active Challenges
                </h2>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    {pendingInteractiveTests.length} Pending
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingInteractiveTests.map((test) => (
                    <div key={test._id} className={`p-6 rounded-[2.5rem] border relative overflow-hidden group transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-[#121A22] border-[#1E2733] hover:border-brand-primary/40' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200'}`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-indigo-500/20 text-brand-light' : 'bg-indigo-600 text-white'}`}>
                                    {test.type}
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                    <Clock size={10} /> Due: {new Date(test.dueDate).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className={`text-lg font-black leading-tight mb-1 truncate ${currentTheme.text}`}>{test.title}</h3>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-6 ${currentTheme.secondaryText}`}>{test.courseName}</p>
                            
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                    {test.questions?.length || 0} Questions
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedAssessment(test);
                                        setActiveClassroomId(test.classroomId);
                                    }}
                                    className="btn-premium px-6 py-2 text-[10px]"
                                >
                                    Solve & Submit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* Solve Test Modal */}
        {selectedAssessment && (
            <SolveTestModal 
                assessment={selectedAssessment}
                classroomId={activeClassroomId}
                isDark={theme === 'dark'}
                onClose={() => setSelectedAssessment(null)}
                onSubmitted={() => {
                    dispatch(getClassroomsByStudent());
                    dispatch(fetchMyResults());
                    setSelectedAssessment(null);
                }}
            />
        )}

        {/* ACTIVE ATTENDANCE ALERTS */}
        {activeAttendanceClasses.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top duration-700">
            {activeAttendanceClasses.map((active, idx) => (
              <div key={idx} className={`relative overflow-hidden rounded-2xl p-6 border ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-emerald-50 border-emerald-200 shadow-sm'} flex flex-col md:flex-row justify-between items-center gap-4 group`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/40"></div>
                    <div className="relative bg-emerald-500 text-white p-3 rounded-full shadow-lg">
                      <Activity size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${currentTheme.text}`}>Attendance is LIVE!</h3>
                    <p className={`text-sm ${currentTheme.secondaryText}`}>
                      Class: <span className="font-bold">{active.courseName}</span> • Closes at {new Date(active.closesAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/student/attendance/mark/${active.classId}`)}
                  className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap ${
                    theme === 'dark' 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  }`}
                >
                  Mark Attendance Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* QUICK STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Stat 1: Active Courses */}
          <div 
            onClick={() => navigate('/student/classrooms')}
            className={`${currentTheme.card} p-6 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-indigo-50/80'} shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-400/30' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'}`}>
                <BookOpen size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                Active
              </span>
            </div>
            <div>
              <h3 className={`text-3xl font-black ${currentTheme.text}`}>{activeCoursesCount}</h3>
              <p className={`text-[13px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>My Subjects</p>
            </div>
          </div>

          {/* Stat 2: Assessments */}
          <div 
            onClick={() => navigate('/student/assessments')}
            className={`${currentTheme.card} p-6 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-purple-50/80'} shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-400/30' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'}`}>
                <FileText size={24} />
              </div>
            </div>
            <div>
              <h3 className={`text-3xl font-black ${currentTheme.text}`}>{studentResults?.length || 0}</h3>
              <p className={`text-[13px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Test Scores</p>
            </div>
          </div>

          {/* Stat 3: Avg Score */}
          <div 
            onClick={() => navigate('/student/results')}
            className={`${currentTheme.card} p-6 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-amber-50/80'} shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-400/30' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'}`}>
                <Award size={24} />
              </div>
            </div>
            <div>
              <h3 className={`text-3xl font-black ${currentTheme.text}`}>{averageScore}%</h3>
              <p className={`text-[13px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Average Score</p>
            </div>
          </div>

          {/* Stat 4: Upcoming */}
          <div 
            onClick={() => navigate('/student/assessments')}
            className={`${currentTheme.card} p-6 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-rose-50/80'} shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-400/30' : 'bg-rose-100 text-rose-600 group-hover:bg-rose-200'}`}>
                <Clock size={24} />
              </div>
            </div>
            <div>
              <h3 className={`text-3xl font-black ${currentTheme.text}`}>{upcomingAssessments.length}</h3>
              <p className={`text-[13px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Upcoming Tests</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: 2 SPANS (Results & Enrolled Courses) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* LATEST RESULTS WIDGET */}
            <div className={`${currentTheme.card} p-6 lg:p-8 rounded-3xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-slate-100'} shadow-sm`}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className={`text-xl font-black tracking-tight ${currentTheme.text} flex items-center gap-2`}>
                    <TrendingUp className={theme === 'dark' ? 'text-brand-primary' : 'text-indigo-600'} size={24} />
                    My Latest Scores
                  </h2>
                  <p className={`text-sm mt-1 ${currentTheme.secondaryText}`}>Your most recent test and exam results</p>
                </div>
                <button 
                  onClick={() => navigate('/student/results')}
                  className={`text-sm font-black uppercase tracking-widest flex items-center transition-colors ${theme === 'dark' ? 'text-brand-light hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
                >
                  View History <ChevronRight size={16} />
                </button>
              </div>

              {studentResults && studentResults.length > 0 ? (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-[#1E2733]/80' : 'border-slate-200'} text-[10px] font-black uppercase tracking-[0.1em] ${currentTheme.secondaryText}`}>
                        <th className="pb-4">Test Name</th>
                        <th className="pb-4">Course</th>
                        <th className="pb-4">Score</th>
                        <th className="pb-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-[#1E2733]/50">
                      {studentResults.slice(0, 4).map((result, idx) => {
                        const percentage = (result.marksObtained / result.totalMarks) * 100;
                        const isPass = percentage >= 40; // Assuming 40% is pass mark
                        return (
                          <tr key={result._id || idx} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-[#121A22]/50' : 'hover:bg-slate-50'}`}>
                            <td className={`py-4 pr-4 font-bold ${currentTheme.text}`}>
                              {result.testName || `Assessment ${idx + 1}`}
                              <div className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${currentTheme.secondaryText}`}>
                                {new Date(result.date || result.createdAt).toLocaleDateString('en-US', { disableDate: true, month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </td>
                            <td className={`py-4 pr-4 text-xs font-bold ${currentTheme.secondaryText}`}>
                              {result.classroom?.course?.courseName || 'General'}
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-black ${currentTheme.text}`}>{result.marksObtained}</span>
                                <span className={`text-[10px] font-black ${currentTheme.secondaryText}`}>/ {result.totalMarks}</span>
                                <div className={`px-2 py-0.5 text-[10px] font-black rounded-md ${theme === 'dark' ? 'bg-[#1E2733]' : 'bg-slate-100'}`}>
                                  {Math.round(percentage)}%
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                isPass 
                                  ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                                  : (theme === 'dark' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200')
                              }`}>
                                {isPass ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                {isPass ? 'Pass' : 'Review'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-10 rounded-xl border border-dashed ${theme === 'dark' ? 'border-[#1E2733] bg-[#121A22]/50' : 'border-slate-200 bg-slate-50/50'}`}>
                  <Award className={`mx-auto h-12 w-12 mb-3 text-brand-primary opacity-20`} />
                  <p className={`font-black text-sm uppercase tracking-widest ${currentTheme.text}`}>No results posted yet</p>
                  <p className={`text-xs mt-1 ${currentTheme.secondaryText}`}>Your test scores will appear here once graded.</p>
                </div>
              )}
            </div>

            {/* MY COURSES WIDGET */}
            <div className={`${currentTheme.card} p-6 lg:p-8 rounded-3xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-slate-100'} shadow-sm`}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className={`text-xl font-black tracking-tight ${currentTheme.text} flex items-center gap-2`}>
                    <BookOpen className={theme === 'dark' ? 'text-brand-primary' : 'text-indigo-600'} size={24} />
                    My Learning Space
                  </h2>
                </div>
                <button 
                  onClick={() => navigate('/student/classrooms')}
                  className={`text-sm font-black uppercase tracking-widest flex items-center transition-colors ${theme === 'dark' ? 'text-brand-light hover:text-white' : 'text-indigo-600 hover:text-indigo-800'}`}
                >
                  Enter Portal <ChevronRight size={16} />
                </button>
              </div>

              {studentClassrooms && studentClassrooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentClassrooms.slice(0, 4).map((classroom) => (
                    <div 
                      key={classroom._id} 
                      onClick={() => navigate('/student/classrooms')}
                      className={`group cursor-pointer flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                        theme === 'dark' 
                          ? 'bg-[#121A22]/80 border-[#1E2733]/60 hover:border-brand-primary/50 hover:bg-[#16202A]' 
                          : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-sm shadow-indigo-100/20'
                      }`}
                    >
                      <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center mr-4 shadow-inner ${
                        theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'
                      }`}>
                        <BookOpen size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-base font-black truncate ${currentTheme.text} group-hover:text-brand-primary transition-colors`}>
                          {classroom.course?.courseName || classroom.name}
                        </h4>
                        <p className={`text-[11px] font-black uppercase tracking-widest truncate mt-0.5 ${currentTheme.secondaryText}`}>
                          {classroom.course?.courseCode || 'Course'} • Prof. {classroom.assignedTeacher?.lastName || 'TBA'}
                        </p>
                      </div>
                      <ChevronRight className={`shrink-0 ml-2 transition-transform group-hover:translate-x-1 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} size={18} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-10 rounded-xl border border-dashed ${theme === 'dark' ? 'border-[#1E2733] bg-[#121A22]/50' : 'border-slate-200 bg-slate-50/50'}`}>
                   <p className={`font-black text-sm uppercase tracking-widest ${currentTheme.text}`}>You aren't enrolled in any classrooms</p>
                </div>
              )}
            </div>
            
          </div>
          
          {/* RIGHT COLUMN: 1 SPAN (Upcoming Schedule & Materials feed) */}
          <div className="xl:col-span-1 space-y-8">
            
            {/* UPCOMING CLASSES WIDGET */}
            <div className={`${currentTheme.card} p-6 lg:p-8 rounded-3xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-slate-100'} shadow-sm flex flex-col h-[400px]`}>
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className={`text-xl font-black tracking-tight ${currentTheme.text} flex items-center gap-2`}>
                  <Calendar className={theme === 'dark' ? 'text-brand-primary' : 'text-indigo-600'} size={22} />
                  Up Next
                </h2>
                <button 
                  onClick={() => navigate('/student/classrooms')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`}
                > View All </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((session, idx) => (
                    <div key={idx} className="relative pl-6 pb-2 last:pb-0">
                      {/* Timeline Line */}
                      {idx !== upcomingClasses.length - 1 && (
                        <div className={`absolute left-[9px] top-6 bottom-[-16px] w-[2px] rounded-full ${theme === 'dark' ? 'bg-[#1E2733]' : 'bg-slate-200'}`}></div>
                      )}
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-4 flex items-center justify-center ${theme === 'dark' ? 'bg-[#020617] border-brand-primary shadow-[0_0_10px_rgba(80,110,229,0.5)]' : 'bg-white border-indigo-500 shadow-md'}`}></div>
                      
                      <div className={`p-4 rounded-2xl border transition-all ${
                        idx === 0 
                          ? (theme === 'dark' ? 'bg-brand-primary/10 border-brand-primary/30 shadow-[inset_0_0_20px_rgba(80,110,229,0.05)]' : 'bg-indigo-50 border-indigo-200') 
                          : (theme === 'dark' ? 'bg-[#121A22]/50 border-[#1E2733]/50' : 'bg-white border-slate-100')
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            idx === 0 
                              ? (theme === 'dark' ? 'bg-brand-primary text-white shadow-sm' : 'bg-indigo-600 text-white') 
                              : (theme === 'dark' ? 'bg-[#1E2733] text-slate-300' : 'bg-slate-100 text-slate-600')
                          }`}>
                            {session.dateFormatted}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${currentTheme.secondaryText}`}>
                            {session.time}
                          </span>
                        </div>
                        <h4 className={`text-base font-black mt-2 ${currentTheme.text}`}>{session.courseName}</h4>
                        <div className="flex justify-between items-end mt-1">
                          <p className={`text-xs font-bold ${currentTheme.secondaryText}`}>Prof. {session.teacher}</p>
                          {session.attendanceOpen && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/student/attendance/mark/${session.id}`);
                              }}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all"
                            >
                              Mark Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`h-full flex flex-col items-center justify-center text-center p-4`}>
                    <Calendar className={`h-10 w-10 mb-3 opacity-20 text-brand-primary`} />
                    <p className={`text-xs font-black uppercase tracking-widest ${currentTheme.secondaryText}`}>No class scheduled</p>
                  </div>
                )}
              </div>
            </div>

            {/* RECENT MATERIALS WIDGET */}
            <div className={`${currentTheme.card} p-6 lg:p-8 rounded-3xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-slate-100'} shadow-sm flex flex-col h-[400px]`}>
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className={`text-xl font-black tracking-tight ${currentTheme.text} flex items-center gap-2`}>
                  <FileText className={theme === 'dark' ? 'text-brand-primary' : 'text-indigo-600'} size={22} />
                  New Materials
                </h2>
                <button 
                  onClick={() => navigate('/student/materials')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`}
                > Library </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-3">
                {recentMaterials.length > 0 ? (
                  recentMaterials.map((mat, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => navigate('/student/materials')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                        theme === 'dark' ? 'bg-[#121A22]/50 border-[#1E2733]/50 hover:bg-[#16202A] hover:border-brand-primary/30' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${theme === 'dark' ? 'bg-indigo-500/10 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black line-clamp-1 ${currentTheme.text}`}>{mat.title}</h4>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${currentTheme.secondaryText} line-clamp-1`}>{mat.courseName || mat.classroomName}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`h-full flex flex-col items-center justify-center text-center p-4`}>
                    <Activity className={`h-10 w-10 mb-3 opacity-20 text-brand-primary`} />
                    <p className={`text-xs font-black uppercase tracking-widest ${currentTheme.secondaryText}`}>No new uploads</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboardOverview;
