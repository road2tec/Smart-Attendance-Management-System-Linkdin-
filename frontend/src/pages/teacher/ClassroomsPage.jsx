import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Book, Calendar, Clock, File, Users, CheckCircle, PlusCircle, ChevronRight, ArrowLeft, Bell, Sun, Moon, UserCheck, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';
import ClassroomList from '../../components/teacher/ClassroomList';
import ClassroomHeader from '../../components/teacher/ClassroomHeader';
import ClassScheduler from '../../components/teacher/ClassScheduler';
import MaterialSharing from '../../components/teacher/MaterialSharing'
import ClassHistory from '../../components/teacher/ClassHistory';
import { getClassroomsByTeacher } from '../../app/features/classroom/classroomThunks';
import ClassroomAttendance from '../../components/teacher/ClassroomAttendance';
import ClassSchedulingModal from '../../components/teacher/modals/ClassSchedulingModal';
import TeacherAllocationModal from '../../components/teacher/modals/TeacherAllocationModal';
import CreateTestModal from '../../components/teacher/modals/CreateTestModal';
import StudentProgressTab from '../../components/teacher/StudentProgressTab';
import SessionCard from '../../components/teacher/SessionCard';
import { scheduleClass } from '../../app/features/class/classThunks';

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const [view, setView] = useState('classrooms');
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [attendanceActive, setAttendanceActive] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedClassroomForScheduling, setSelectedClassroomForScheduling] = useState(null);
  const { user } = useSelector(state => state.auth);
  const { theme, toggleTheme, themeConfig, isDark } = useTheme();
  const currentTheme = themeConfig[theme];
  const { teacherClassrooms, loading: classroomsLoading } = useSelector(state => state.classrooms);
  
  const isLoading = classroomsLoading;

  useEffect(() => {
    dispatch(getClassroomsByTeacher(user._id));
  }, [dispatch, user._id]);
  
  const getClassroomData = () => {
    if (!teacherClassrooms || !Array.isArray(teacherClassrooms) || teacherClassrooms.length === 0) {
      return [];
    }
    
    return teacherClassrooms.map(assignment => {
      const { _id, department, assignedTeacher, group, course, assignedStudents, sharedResources, createdAt, updatedAt } = assignment;
      const nextClass = course?.schedule?.length > 0 ? formatNextClassTime(course.schedule[0]) : "No scheduled classes";
      const attendanceRate = `${Math.floor(85 + Math.random() * 15)}%`;
      
      return {
        id: _id,
        courseName: course?.courseName || "Unnamed Course",
        groupName: group ? group.name : "Unassigned",
        department: department?.name || "Department",
        students: assignedStudents?.length || 0,
        nextClass,
        attendanceRate,
        sharedResources,
        courseDetails: course,
        teacherDetails: assignedTeacher,
        departmentDetails: department,
        groupDetails: group,
        assignedStudents,
        createdAt,
        updatedAt
      };
    });
  };

  const getAllSessions = () => {
    if (!teacherClassrooms || !Array.isArray(teacherClassrooms)) return [];
    
    const sessions = [];
    teacherClassrooms.forEach(classroom => {
      if (classroom.classes && Array.isArray(classroom.classes)) {
        classroom.classes.forEach(sessionEntry => {
          if (sessionEntry.class) {
            sessions.push({
              ...sessionEntry.class,
              classroomId: classroom._id,
              courseName: classroom.course?.courseName || classroom.course?.title,
              groupName: classroom.group?.name,
              sessionStatus: sessionEntry.status,
              attendanceWindow: sessionEntry.attendanceWindow,
              // Full classroom details for navigation
              classroomFull: classroom
            });
          }
        });
      }
    });

    // Sort by session status (in-progress first) then by start time or extra class
    return sessions.sort((a, b) => {
      if (a.sessionStatus === 'in-progress' && b.sessionStatus !== 'in-progress') return -1;
      if (b.sessionStatus === 'in-progress' && a.sessionStatus !== 'in-progress') return 1;
      return (a.schedule?.startTime || '').localeCompare(b.schedule?.startTime || '');
    });
  };

  const handleStartAttendance = (session) => {
    // Navigate to classroom view first
    setActiveClassroom({ 
      ...session.classroomFull, 
      id: session.classroomId,
      courseName: session.courseName,
      groupName: session.groupName,
      enrolledStudents: session.classroomFull.assignedStudents || []
    });
    
    // Switch to classroom view and attendance tab
    setView('classroom');
    setActiveTab('schedule'); // or 'attendance' if it exists
    setAttendanceActive(true);
  };

  const formatNextClassTime = (schedule) => {
    if (!schedule) return "Not scheduled";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    if (schedule.day && schedule.time) {
      const scheduleDay = days.indexOf(schedule.day);
      if (scheduleDay === dayOfWeek) return `Today, ${schedule.time}`;
      if (scheduleDay === (dayOfWeek + 1) % 7) return `Tomorrow, ${schedule.time}`;
      return `${schedule.day}, ${schedule.time}`;
    }
    return "Schedule information unavailable";
  };

  const handleClassroomSelect = (classroom) => {
    const assignedStudents = Array.isArray(classroom.assignedStudents) ? classroom.assignedStudents : Object.values(classroom.assignedStudents);
    setActiveClassroom({ ...classroom, enrolledStudents: assignedStudents });
    setView('classroom');
  };

  const handleBackToClasses = () => {
    setView('classrooms');
    setActiveClassroom(null);
    setAttendanceActive(false);
  };

  const toggleAttendance = () => setAttendanceActive(!attendanceActive);

  const handleNewClass = () => {
    if (!teacherClassrooms || teacherClassrooms.length === 0) {
      // Instead of an alert, let's just open the allocation modal to help them get started
      setIsAllocationModalOpen(true);
      return;
    }
    const firstClassroom = getClassroomData()[0];
    setSelectedClassroomForScheduling(firstClassroom);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (scheduleData) => {
    try {
      await dispatch(scheduleClass({ ...scheduleData, classroom: selectedClassroomForScheduling?.id, teacher: user._id })).unwrap();
      setIsScheduleModalOpen(false);
      setSelectedClassroomForScheduling(null);
      dispatch(getClassroomsByTeacher(user._id));
    } catch (err) {
      console.error('Error scheduling class:', err);
      alert(err || 'Failed to schedule class.');
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Modern Header */}
        <div className={`relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full opacity-10 -mr-32 -mt-32 ${isDark ? 'bg-brand-primary' : 'bg-indigo-400'}`}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              {view === 'classroom' ? (
                <button 
                  onClick={handleBackToClasses}
                  className={`flex items-center gap-3 mb-6 px-4 py-2 rounded-xl border transition-all ${isDark ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-black'}`}
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Return to Hub</span>
                </button>
              ) : (
                <div className="flex items-center gap-4 mb-4">
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white shadow-lg'}`}>
                     Faculty OS v2.0
                   </div>
                   <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                      Operational
                   </div>
                </div>
              )}
              
              <h1 className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {view === 'classroom' ? (
                  activeClassroom.courseName
                ) : (
                  <>Academic <span className={isDark ? 'text-brand-primary' : 'text-indigo-600'}>Classrooms</span></>
                )}
              </h1>
              <p className={`mt-4 text-lg font-medium max-w-xl leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {view === 'classroom' 
                  ? `Active management of ${activeClassroom.groupName} cohort within the ${activeClassroom.department} division.`
                  : `Welcome, ${user.firstName}. Synchronize your academic modules and student engagement metrics.`}
              </p>
            </div>
            
            <div className={`px-8 py-6 rounded-[2rem] border backdrop-blur-md flex flex-col items-center justify-center ${isDark ? 'bg-[#1E2733]/40 border-[#1E2733]' : 'bg-gray-50/50 border-gray-100'}`}>
               <div className="flex items-center gap-4 mb-3">
                  <button onClick={toggleTheme} title="Toggle Theme" className={`p-3 rounded-xl transition-colors ${isDark ? 'bg-gray-800 text-brand-primary hover:bg-gray-700' : 'bg-white text-indigo-600 shadow-sm border border-gray-200'}`}>
                    {isDark ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
                  </button>
                  <button 
                    onClick={() => setIsAllocationModalOpen(true)}
                    title="New Classroom Allocation"
                    className={`p-3 rounded-xl transition-all ${isDark ? 'bg-brand-primary text-white hover:scale-110' : 'bg-indigo-600 text-white hover:scale-110 shadow-lg shadow-indigo-200'}`}
                  >
                    <PlusCircle size={20} strokeWidth={3} />
                  </button>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800 text-brand-light' : 'bg-gray-100 text-indigo-600'}`}>
                    <Calendar size={20} strokeWidth={3} />
                  </div>
               </div>
               <span className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="animate-in slide-in-from-bottom duration-1000">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-6">
               <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Synchronizing Classroom Matrix...</p>
            </div>
          ) : view === 'classrooms' ? (
            <div className="space-y-12">
              {/* Separate Sessions View (New) */}
              {getAllSessions().length > 0 && (
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                        <Zap size={20} strokeWidth={3} />
                      </div>
                      <div className="flex flex-col">
                        <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Daily Schedule
                        </h2>
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Upcoming Active Sessions</span>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {getAllSessions().map((session, idx) => (
                        <SessionCard 
                          key={session._id || idx}
                          session={session}
                          onStartAttendance={handleStartAttendance}
                          isDark={isDark}
                        />
                      ))}
                   </div>
                </div>
              )}

              <div className="space-y-6">
                <ClassroomList 
                  classrooms={getClassroomData()} 
                  onSelect={handleClassroomSelect}
                  onNewClass={handleNewClass}
                  onNewAllocation={() => setIsAllocationModalOpen(true)}
                  isDark={isDark} 
                />
              </div>
              
              {isScheduleModalOpen && selectedClassroomForScheduling && (
                <ClassSchedulingModal
                  isDark={isDark}
                  currentTheme={currentTheme}
                  classroom={selectedClassroomForScheduling}
                  onClose={() => setIsScheduleModalOpen(false)}
                  onSave={handleSaveSchedule}
                  classToEdit={null}
                />
              )}
              
              {isAllocationModalOpen && (
                <TeacherAllocationModal
                  isOpen={isAllocationModalOpen}
                  onClose={() => {
                    setIsAllocationModalOpen(false);
                    dispatch(getClassroomsByTeacher(user._id));
                  }}
                  isDark={isDark}
                  user={user}
                />
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {attendanceActive ? (
                <ClassroomAttendance
                  classroom={activeClassroom} 
                  onClose={toggleAttendance}
                  isDark={isDark}
                />
              ) : (
                <>
                  <ClassroomHeader 
                    classroom={activeClassroom} 
                    onAttendanceToggle={toggleAttendance}
                    isDark={isDark} 
                  />
                  
                  <div className={`rounded-[3rem] border overflow-hidden backdrop-blur-md ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
                    <div className={`flex items-center gap-2 p-4 border-b flex-wrap ${isDark ? 'border-[#1E2733] bg-gray-900/30' : 'bg-gray-50/50 border-gray-100'}`}>
                      {['materials', 'schedule', 'history', 'progress'].map((tab) => (
                        <button 
                          key={tab}
                          className={`px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                            activeTab === tab 
                              ? (isDark ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-50') 
                              : (isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:text-black hover:bg-gray-100')
                          }`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab === 'history' ? 'Class History' : tab === 'progress' ? '📊 Progress' : tab}
                        </button>
                      ))}
                      <button
                        onClick={() => setIsTestModalOpen(true)}
                        className={`ml-auto px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                          isDark ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        + New Test
                      </button>
                    </div>
                    
                    <div className="p-8 sm:p-12">
                      {activeTab === 'materials' && <MaterialSharing isDark={isDark} currentTheme={currentTheme} classroom={activeClassroom} />}
                      {activeTab === 'schedule' && <ClassScheduler isDark={isDark} currentTheme={currentTheme} classroom={activeClassroom} />}
                      {activeTab === 'history' && <ClassHistory isDark={isDark} currentTheme={currentTheme} classroom={activeClassroom} />}
                      {activeTab === 'progress' && <StudentProgressTab classroom={activeClassroom} isDark={isDark} />}
                    </div>
                  </div>
                </>
              )}

              {/* Create Test Modal */}
              {isTestModalOpen && activeClassroom && (
                <CreateTestModal
                  classroom={activeClassroom}
                  isDark={isDark}
                  onClose={() => setIsTestModalOpen(false)}
                  onSaved={() => setActiveTab('progress')}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}