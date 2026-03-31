import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import ClassroomList from '../../components/student/ClassroomList';
import ClassroomView from '../../components/student/ClassroomView';
import { getClassroomsByStudent, getClassroomById } from '../../app/features/classroom/classroomThunks';
import { getAttendanceWindowStatus, markAttendanceByFaceAndLocation, getStudentAttendance } from '../../app/features/attendance/attendanceThunks';

const StudentClassroomPortal = () => {
  const { themeConfig, theme, isDark } = useTheme();
  const currentTheme = themeConfig[theme];
  const dispatch = useDispatch();
  
  // Get student ID from auth state
  const { user } = useSelector((state) => state.auth);
  const studentId = user?._id;
  
  // Access the Redux state using useSelector
  const { 
    studentClassrooms: classrooms, 
    currentClassroom: selectedClassroomData,
    isLoading: classroomsLoading 
  } = useSelector((state) => state.classrooms);

  const {
    attendanceWindow,
    currentAttendanceStatus,
    studentAttendance,
    isLoading: attendanceLoading
  } = useSelector((state) => state.attendance);
  
  // State for selected classroom
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  
  // Fetch classrooms when component mounts
  useEffect(() => {
    if (studentId) {
      dispatch(getClassroomsByStudent(studentId));
    }
  }, [dispatch, studentId]);
  
  // When user selects a classroom, fetch the detailed data
  useEffect(() => {
    if (selectedClassroom?._id) {
      dispatch(getClassroomById(selectedClassroom._id));

      // Fetch initial attendance window status
      dispatch(getAttendanceWindowStatus(selectedClassroom._id));

      // Set up polling for attendance window status (every 10 seconds)
      const intervalId = setInterval(() => {
        dispatch(getAttendanceWindowStatus(selectedClassroom._id));
      }, 10000);

      // Get student attendance history for this course
      if (selectedClassroom.course?._id) {
        dispatch(getStudentAttendance(selectedClassroom.course._id));
      }

      return () => clearInterval(intervalId);
    }
  }, [dispatch, selectedClassroom?._id, selectedClassroom?.course?._id]); // Use IDs instead of full objects
  
  // Handle classroom selection
  const handleClassroomSelection = (classroom) => {
    setSelectedClassroom(classroom);
  };
  
  // Handle going back to classroom list
  const handleBackToClassrooms = () => {
    setSelectedClassroom(null);
  };
  
  // Function to mark attendance using facial recognition and location
  const handleMarkAttendance = async (faceEmbeddingData, location) => {
    if (selectedClassroom && attendanceWindow.isOpen) {
      await dispatch(markAttendanceByFaceAndLocation({
        classId: selectedClassroom._id,
        faceEmbeddingData,
        location
      }));
      
      // Refresh attendance window status after marking attendance
      dispatch(getAttendanceWindowStatus(selectedClassroom._id));
    }
  };
  
  const isLoading = classroomsLoading || attendanceLoading;
  
  if (isLoading) {
    return (
      <div className={`min-h-screen ${currentTheme.gradientBackground} flex items-center justify-center font-sans`}>
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className={`w-16 h-16 border-4 border-t-transparent border-brand-primary/20 rounded-full`}></div>
            <div className={`absolute top-0 left-0 w-16 h-16 border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}></div>
          </div>
          <h3 className={`text-xl font-bold tracking-tight ${currentTheme.gradient?.text || currentTheme.text}`}>Loading your classrooms...</h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${currentTheme.gradientBackground} font-sans`}>
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
        <div className={`mb-10 ${isDark ? 'opacity-90' : 'opacity-100'}`}>
          <h1 className={`text-4xl font-extrabold mb-3 tracking-tight ${currentTheme.text}`}>
            {selectedClassroom ? 'My Live Class' : 'Active Classes Today'}
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
            {selectedClassroom 
              ? `Join and mark attendance for ${selectedClassroom.name || 'this class'}`
              : 'Click on a class to mark your attendance while the teacher is present.'}
          </p>
        </div>
        
        {selectedClassroom ? (
          <div className={`${currentTheme.card} p-1 md:p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-gray-100'} transition-all duration-300 animate-in fade-in zoom-in-95`}>
            <button 
              onClick={handleBackToClassrooms}
              className={`mb-6 ml-4 md:ml-0 px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-lg transition-all ${isDark 
                ? 'bg-[#121A22] text-gray-300 hover:text-white border border-[#1E2733] hover:border-[#2D3748] shadow-sm' 
                : 'bg-white text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-100 shadow-sm'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to All Classes</span>
            </button>
            
            <ClassroomView 
              selectedClassroom={selectedClassroomData || selectedClassroom}
              onBack={handleBackToClassrooms}
              attendanceWindow={attendanceWindow}
              currentAttendanceStatus={currentAttendanceStatus}
              studentAttendance={studentAttendance}
              onMarkAttendance={handleMarkAttendance}
              currentTheme={currentTheme}
              isDark={isDark}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview Card */}
            <div className={`${currentTheme.card} p-6 md:p-8 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-emerald-100/50'} shadow-sm`}>
              <h3 className={`text-sm tracking-widest uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme === 'dark' ? 'from-emerald-400 to-teal-400' : 'from-emerald-600 to-teal-600'} mb-6`}>
                Your Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl relative overflow-hidden group ${isDark 
                  ? 'bg-gradient-to-br from-[#121A22] to-[#0A0E13] border border-[#1E2733] hover:border-emerald-500/50' 
                  : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md'} transition-all duration-300`}
                >
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-400'}`}></div>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Enrolled Classes</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {classrooms?.data?.length || 0}
                    </h3>
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl relative overflow-hidden group ${isDark 
                  ? 'bg-gradient-to-br from-[#121A22] to-[#0A0E13] border border-[#1E2733] hover:border-amber-500/50' 
                  : 'bg-white border border-gray-100 hover:border-amber-200 hover:shadow-md'} transition-all duration-300`}
                >
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${theme === 'dark' ? 'bg-amber-500' : 'bg-amber-400'}`}></div>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Active Today</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {classrooms?.data?.filter(c => c.isActive)?.length || 0}
                    </h3>
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl relative overflow-hidden group ${isDark 
                  ? 'bg-gradient-to-br from-[#121A22] to-[#0A0E13] border border-[#1E2733] hover:border-brand-primary/50' 
                  : 'bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-md'} transition-all duration-300`}
                >
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${theme === 'dark' ? 'bg-brand-primary' : 'bg-indigo-400'}`}></div>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Attendance this week</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {studentAttendance?.attendanceRate || '0%'}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            
            <ClassroomList 
              classrooms={classrooms?.data || []}
              selectedClassroom={selectedClassroom}
              onSelectClassroom={handleClassroomSelection}
              currentTheme={currentTheme}
              isDark={isDark}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassroomPortal;