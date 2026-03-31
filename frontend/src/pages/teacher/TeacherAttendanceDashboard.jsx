
import React, { useEffect, useState, lazy, Suspense, useMemo, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { ChevronDown, ChevronUp, Download, Users, Clock, AlertTriangle, X, Zap } from 'lucide-react';
import { 
  getClassroomAttendance, 
  getTeacherAttendance,
  getDailyAttendanceReport 
} from '../../app/features/attendanceStats/attendanceStatsThunks';
import { getClassroomsByTeacher } from '../../app/features/classroom/classroomThunks';
// Lazy loaded components
const StudentDetailsModal = lazy(() => import('../../components/teacher/modals/StudentDetailsModal'));
const LowAttendanceAlert = lazy(() => import('../../components/teacher/modals/LowAttendanceAlert'));
const LateStudentsPanel = lazy(() => import('../../components/teacher/modals/LateStudentsPanel'));
import { useTheme } from '../../context/ThemeProvider';

// AttendanceProcessor class with optimizations
class AttendanceProcessor {
  constructor(attendanceData) {
    this.data = attendanceData;
    this.flattenedRecords = null;
    this.studentStatsCache = new Map();
    this.processedStatsCache = null;
  }

  // Lazy initialization of flattened data
  getFlattenedData() {
    if (this.flattenedRecords === null) {
      this.flattenedRecords = this.flattenData();
    }
    return this.flattenedRecords;
  }

  flattenData() {
    console.log('Starting data flattening...');
    const flattened = [];
    
    if (!this.data || !Array.isArray(this.data)) {
      console.warn('Invalid data format:', this.data);
      return flattened;
    }

    this.data.forEach(classGroup => {
      if (!classGroup || !classGroup.records || !Array.isArray(classGroup.records)) {
        console.warn('Invalid class group:', classGroup);
        return;
      }

      classGroup.records.forEach(record => {
        if (!record || !record.student) {
          console.warn('Invalid record:', record);
          return;
        }

        const markedAtDate = new Date(record.markedAt);
        flattened.push({
          ...record,
          className: classGroup.className,
          studentName: `${record.student.firstName || ''} ${record.student.lastName || ''}`.trim(),
          rollNumber: record.student.rollNumber,
          classDate: markedAtDate.toDateString(),
          classTime: markedAtDate.toLocaleTimeString(),
          isLate: this.isStudentLate(record),
          markedAtTimestamp: markedAtDate.getTime() // For faster sorting
        });
      });
    });
    
    console.log(`Flattened ${flattened.length} records`);
    return flattened;
  }

  isStudentLate(record) {
    try {
      const markedTime = new Date(record.markedAt);
      const classStartTime = new Date(record.class?.schedule?.startTime || record.markedAt);
      return markedTime > classStartTime;
    } catch (error) {
      console.warn('Error checking late status:', error);
      return false;
    }
  }

  getStudentSummary(rollNumber) {
    // Check cache first
    if (this.studentStatsCache.has(rollNumber)) {
      return this.studentStatsCache.get(rollNumber);
    }

    const flattenedData = this.getFlattenedData();
    const studentRecords = flattenedData.filter(
      record => record.rollNumber === rollNumber
    );

    if (studentRecords.length === 0) {
      const result = { error: 'Student not found' };
      this.studentStatsCache.set(rollNumber, result);
      return result;
    }

    const totalClasses = studentRecords.length;
    const presentClasses = studentRecords.filter(r => r.status === 'present').length;
    const absentClasses = studentRecords.filter(r => r.status === 'absent').length;
    const lateClasses = studentRecords.filter(r => r.isLate).length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100) : 0;

    const result = {
      studentName: studentRecords[0].studentName,
      rollNumber: rollNumber,
      totalClasses,
      presentClasses,
      absentClasses,
      lateClasses,
      attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
      records: studentRecords.sort((a, b) => b.markedAtTimestamp - a.markedAtTimestamp)
    };

    // Cache the result
    this.studentStatsCache.set(rollNumber, result);
    return result;
  }

  findLowAttendanceStudents(threshold = 75) {
    console.log('Finding low attendance students...');
    const flattenedData = this.getFlattenedData();
    const studentStats = new Map();

    // Build stats more efficiently
    flattenedData.forEach(record => {
      const rollNumber = record.rollNumber;
      if (!studentStats.has(rollNumber)) {
        studentStats.set(rollNumber, {
          studentName: record.studentName,
          rollNumber: rollNumber,
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
          lateClasses: 0
        });
      }

      const stats = studentStats.get(rollNumber);
      stats.totalClasses++;
      
      if (record.status === 'present') {
        stats.presentClasses++;
      } else {
        stats.absentClasses++;
      }
      
      if (record.isLate) {
        stats.lateClasses++;
      }
    });

    const lowAttendanceStudents = Array.from(studentStats.values())
      .map(student => ({
        ...student,
        attendancePercentage: student.totalClasses > 0 
          ? parseFloat(((student.presentClasses / student.totalClasses) * 100).toFixed(2))
          : 0
      }))
      .filter(student => student.attendancePercentage < threshold)
      .sort((a, b) => a.attendancePercentage - b.attendancePercentage);

    console.log(`Found ${lowAttendanceStudents.length} low attendance students`);
    return lowAttendanceStudents;
  }

  findConsecutivelyLateStudents(consecutiveDays = 3) {
    console.log('Finding consistently late students...');
    const flattenedData = this.getFlattenedData();
    const studentRecords = new Map();
    
    // Group records by student
    flattenedData.forEach(record => {
      const rollNumber = record.rollNumber;
      if (!studentRecords.has(rollNumber)) {
        studentRecords.set(rollNumber, []);
      }
      studentRecords.get(rollNumber).push(record);
    });

    const consistentlyLateStudents = [];

    studentRecords.forEach((records, rollNumber) => {
      const sortedRecords = records.sort((a, b) => a.markedAtTimestamp - b.markedAtTimestamp);
      
      let consecutiveLateCount = 0;
      let maxConsecutiveLate = 0;
      let currentStreak = [];
      let longestStreak = [];

      sortedRecords.forEach(record => {
        if (record.isLate && record.status === 'present') {
          consecutiveLateCount++;
          currentStreak.push(record);
          maxConsecutiveLate = Math.max(maxConsecutiveLate, consecutiveLateCount);
          
          if (consecutiveLateCount > longestStreak.length) {
            longestStreak = [...currentStreak];
          }
        } else {
          consecutiveLateCount = 0;
          currentStreak = [];
        }
      });

      if (maxConsecutiveLate >= consecutiveDays) {
        consistentlyLateStudents.push({
          studentName: records[0].studentName,
          rollNumber: rollNumber,
          maxConsecutiveLate: maxConsecutiveLate,
          longestLateStreak: longestStreak,
          totalLateClasses: records.filter(r => r.isLate).length,
          totalClasses: records.length
        });
      }
    });

    const result = consistentlyLateStudents.sort((a, b) => b.maxConsecutiveLate - a.maxConsecutiveLate);
    console.log(`Found ${result.length} consistently late students`);
    return result;
  }

  getAttendanceStats(startDate = null, endDate = null) {
    // Use cache if no date filtering
    if (!startDate && !endDate && this.processedStatsCache) {
      return this.processedStatsCache;
    }

    console.log('Calculating attendance stats...');
    const flattenedData = this.getFlattenedData();
    let filteredRecords = flattenedData;

    if (startDate) {
      const startTime = new Date(startDate).getTime();
      filteredRecords = filteredRecords.filter(record => 
        record.markedAtTimestamp >= startTime
      );
    }

    if (endDate) {
      const endTime = new Date(endDate).getTime();
      filteredRecords = filteredRecords.filter(record => 
        record.markedAtTimestamp <= endTime
      );
    }

    const totalRecords = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'present').length;
    const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
    const lateCount = filteredRecords.filter(r => r.isLate).length;

    const stats = {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: totalRecords > 0 ? parseFloat(((presentCount / totalRecords) * 100).toFixed(2)) : 0,
      lateRate: totalRecords > 0 ? parseFloat(((lateCount / totalRecords) * 100).toFixed(2)) : 0,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };

    // Cache if no filtering
    if (!startDate && !endDate) {
      this.processedStatsCache = stats;
    }

    console.log('Stats calculated:', stats);
    return stats;
  }

  exportToCSV() {
    const flattenedData = this.getFlattenedData();
    const headers = [
      'Student Name', 'Roll Number', 'Class Name', 'Date', 'Time', 
      'Status', 'Late', 'Face Recognized', 'Marked By'
    ];
    
    const csvData = [headers];
    
    flattenedData.forEach(record => {
      csvData.push([
        record.studentName,
        record.rollNumber,
        record.className,
        record.classDate,
        record.classTime,
        record.status,
        record.isLate ? 'Yes' : 'No',
        record.faceRecognized ? 'Yes' : 'No',
        record.markedBy
      ]);
    });
    
    return csvData.map(row => row.join(',')).join('\n');
  }
}

// Loading component
const LoadingSpinner = ({ message = "Loading Attendance Data..." }) => (
  <div className="flex flex-col justify-center items-center py-24 gap-6">
    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">{message}</p>
  </div>
);

// Error boundary component
const ErrorFallback = ({ error, resetError }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
    <p className="text-red-600 mb-4">{error.message}</p>
    <button 
      onClick={resetError}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

// Expandable section component
const ExpandableSection = ({ title, children, defaultExpanded = false, icon }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { isDark } = useTheme();

  return (
    <div className={`rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${isDark ? 'bg-[#121A22]/30 border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-8 py-6 flex items-center justify-between transition-all ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-800 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
            {icon}
          </div>
          <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
        </div>
        <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className="text-gray-500" strokeWidth={3} />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-8 border-t border-inherit">
          {children}
        </div>
      </div>
    </div>
  );
};

// Student Details Modal Component
const StudentModal = ({ student, onClose }) => {
  const { isDark } = useTheme();
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
      <div className={`relative w-full max-w-4xl rounded-[3.5rem] border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 ${isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-white border-gray-100'}`}>
        <div className="relative p-8 sm:p-12 space-y-10">
          <div className="flex justify-between items-start">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white'}`}>
                    Individual Audit
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID: {student.rollNumber}</span>
               </div>
               <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</h2>
            </div>
            <button onClick={onClose} className={`p-4 rounded-2xl transition-all ${isDark ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200'}`}>
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Modules Total', value: student.totalClasses, color: 'text-brand-primary', bg: isDark ? 'bg-brand-primary/10' : 'bg-indigo-50' },
              { label: 'Presence Index', value: student.presentClasses, color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
              { label: 'Absent Gap', value: student.absentClasses, color: 'text-rose-500', bg: isDark ? 'bg-rose-500/10' : 'bg-rose-50' },
              { label: 'Latency Log', value: student.lateClasses, color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' }
            ].map((stat, idx) => (
              <div key={idx} className={`p-6 rounded-[2rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-gray-900/50 border-[#1E2733]' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Aggregate Reliability</span>
               <span className={`text-lg font-black ${student.attendancePercentage >= 75 ? 'text-brand-primary' : 'text-rose-500'}`}>{student.attendancePercentage}%</span>
            </div>
            <div className={`h-4 w-full rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
               <div className={`h-full transition-all duration-1000 ${student.attendancePercentage >= 75 ? 'bg-brand-primary' : 'bg-rose-500'}`} style={{ width: `${student.attendancePercentage}%` }}></div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {student.records?.slice(0, 10).map((record, index) => (
              <div key={index} className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div>
                    <p className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.classDate}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{record.classTime} • {record.class?.title || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   {record.isLate && (
                     <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest">Latency</span>
                   )}
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${record.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                     {record.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherAttendanceDashboard = () => {
  const dispatch = useDispatch();
  const { themeConfig, theme, isDark } = useTheme();
  // Protected against undefined themeConfig to prevent white screen
  const currentTheme = themeConfig ? themeConfig[theme] : null;

  const { teacherClassrooms } = useSelector((state) => state.classrooms);
  const { classroomAttendance, isLoading, error } = useSelector((state) => state.attendanceStats);
  const { user } = useSelector(state => state.auth);
  
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [itemsToShow, setItemsToShow] = useState(10);
  const [processingError, setProcessingError] = useState(null);
  
  const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28'];
  const teacherId = user?._id;

  // Memoized attendance processor
  const attendanceProcessor = useMemo(() => {
    if (!classroomAttendance) {
      console.log('No classroom attendance data available');
      return null;
    }

    try {
      console.log('Creating attendance processor with data:', classroomAttendance.recordsByClass || {});
      
      // Transform the data to match the expected format
      const transformedData = Object.entries(classroomAttendance.recordsByClass || {}).map(([className, classData]) => ({
        className,
        records: Array.isArray(classData.records) ? classData.records : []
      }));
      
      if (transformedData.length === 0) {
        console.log('No transformed data available. Rendering empty dashboard.');
      }
      
      return new AttendanceProcessor(transformedData);
    } catch (error) {
      console.error('Error creating attendance processor:', error);
      setProcessingError(error.message);
      return null;
    }
  }, [classroomAttendance]);

  // Memoized processed data
  const processedData = useMemo(() => {
    if (!attendanceProcessor) {
      return null;
    }

    try {
      setProcessingError(null);
      console.log('Processing attendance data...');
      
      const stats = attendanceProcessor.getAttendanceStats();
      const lowAttendanceStudents = attendanceProcessor.findLowAttendanceStudents(75);
      const lateStudents = attendanceProcessor.findConsecutivelyLateStudents(2);

      // Get student summaries for table
      const flattenedData = attendanceProcessor.getFlattenedData();
      const uniqueStudents = [...new Set(flattenedData.map(r => r.rollNumber))];
      const studentSummaries = uniqueStudents
        .map(rollNumber => attendanceProcessor.getStudentSummary(rollNumber))
        .filter(summary => !summary.error);

      const result = {
        stats,
        lowAttendanceStudents,
        lateStudents,
        studentSummaries,
        allRecords: flattenedData
      };
      
      console.log('Data processed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error processing attendance data:', error);
      setProcessingError(error.message);
      return null;
    }
  }, [attendanceProcessor]);

  const { stats, lowAttendanceStudents, lateStudents, studentSummaries, allRecords } = processedData || {
    stats: { totalRecords: 0, attendanceRate: 0, lateRate: 0, presentCount: 0, absentCount: 0, lateCount: 0 },
    lowAttendanceStudents: [],
    lateStudents: [],
    studentSummaries: [],
    allRecords: []
  };

  const sessionLogs = useMemo(() => {
    if (!allRecords) return [];
    const sessionsMap = new Map();
    allRecords.forEach(record => {
      const key = `${record.className}_${record.classDate}`;
      if (!sessionsMap.has(key)) {
        sessionsMap.set(key, {
          className: record.className,
          classDate: record.classDate,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          totalCount: 0,
          timestamp: record.markedAtTimestamp
        });
      }
      const s = sessionsMap.get(key);
      s.totalCount++;
      if (record.status === 'present') s.presentCount++;
      else if (record.status === 'absent') s.absentCount++;
      if (record.isLate) s.lateCount++;
    });
    return Array.from(sessionsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [allRecords]);

  // Effect for fetching teacher classrooms
  useEffect(() => {
    console.log('Teacher ID check:', teacherId);
    if (teacherId) {
      dispatch(getClassroomsByTeacher(teacherId));
    } else {
      console.warn('No teacherId available');
    }
  }, [dispatch, teacherId]);

  // Effect for setting initial classroom
  useEffect(() => {
    console.log('Classroom selection effect:', {
      teacherClassrooms: teacherClassrooms?.length,
      selectedClassroom,
      isLoading
    });
    
    if (teacherClassrooms?.length > 0 && !selectedClassroom && !isLoading) {
      const firstClassroomId = teacherClassrooms[0]._id;
      console.log('Setting first classroom:', firstClassroomId);
      setSelectedClassroom(firstClassroomId);
      dispatch(getClassroomAttendance(firstClassroomId));
    }
  }, [teacherClassrooms, dispatch, selectedClassroom, isLoading]);

  // Debounced classroom change handler
  const handleClassroomChange = useCallback((e) => {
    const classroomId = e.target.value;
    console.log('Classroom change:', classroomId);
    setSelectedClassroom(classroomId);
    setSelectedClass(null);
    setProcessingError(null);
    
    if (classroomId) {
      dispatch(getClassroomAttendance(classroomId));
    }
  }, [dispatch]);
  const handleExportCSV = () => {
    if (!attendanceProcessor) return;
    
    const csvData = attendanceProcessor.exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleCloseModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!teacherClassrooms || teacherClassrooms.length === 0) {
    return (
      <div className={`p-6 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'} min-h-screen`}>
        <div className={`${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'} p-4 text-center rounded-2xl border`}>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            You don't have any classrooms assigned yet.
          </p>
        </div>
      </div>
    );
  }

  if (!classroomAttendance && isLoading) {
    return <LoadingSpinner />;
  }

  if (!classroomAttendance) {
    return (
      <div className={`p-6 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'} min-h-screen`}>
        <div className={`${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'} p-4 rounded-2xl border`}>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Please select a classroom to view attendance data.
          </p>
          <button 
            onClick={() => selectedClassroom && dispatch(getClassroomAttendance(selectedClassroom))}
            className={`mt-4 px-4 py-2 rounded-lg font-bold text-sm ${isDark ? 'bg-brand-primary text-white' : 'bg-indigo-600 text-white'}`}
            disabled={!selectedClassroom}
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className={`p-6 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'} min-h-screen`}>
        <div className={`${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'} p-4 rounded-2xl border`}>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Processing attendance data...
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering with processed data:', processedData);

  return (
    <div className={`min-h-screen p-4 sm:p-8 animate-in fade-in duration-700 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Modern Header */}
        <div className={`relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full opacity-10 -mr-32 -mt-32 ${isDark ? 'bg-brand-primary' : 'bg-indigo-400'}`}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white shadow-lg'}`}>
                     Attendance Summary
                   </div>
                   <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                      Live Status
                   </div>
                </div>
                <h1 className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Attendance <span className="text-brand-primary">Analytics</span>
                </h1>
                <p className={`mt-4 text-lg font-medium max-w-xl leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  View and track student attendance history.
                </p>
             </div>
             
             <div className="flex flex-col sm:flex-row items-center gap-4">
               <button
                 onClick={handleExportCSV}
                 className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                   isDark ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                 }`}
               >
                 <Download size={16} strokeWidth={3} />
                 Download Report
               </button>
             </div>
          </div>
        </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <div className="w-64">
          <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-2 ml-1`}>
            Select Classroom
          </label>
          <select 
            value={selectedClassroom || ''} 
            onChange={handleClassroomChange}
            className={`w-full px-5 py-3 rounded-2xl border font-bold text-xs appearance-none transition-all ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary' : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600 shadow-sm'}`}
          >
            {teacherClassrooms && teacherClassrooms.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name || `${classroom.course?.courseName || 'Unnamed Course'} - ${classroom.group?.name || 'Unnamed Group'}`}
              </option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-2 ml-1`}>
            View Mode
          </label>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            className={`w-full px-5 py-3 rounded-2xl border font-bold text-xs appearance-none transition-all ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary' : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600 shadow-sm'}`}
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed Analysis</option>
            <option value="analytics">Advanced Analytics</option>
            <option value="sessions">Session Log</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Records', value: stats.totalRecords, icon: Users, color: 'text-brand-primary' },
          { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: Zap, color: 'text-emerald-500' },
          { label: 'Latency Rate', value: `${stats.lateRate}%`, icon: Clock, color: 'text-amber-500' },
          { label: 'Critical Risk', value: lowAttendanceStudents.length, icon: AlertTriangle, color: 'text-rose-500' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-[2rem] border flex items-center gap-6 ${isDark ? 'bg-[#1E2733]/30 border-[#1E2733]' : 'bg-gray-50/50 border-gray-100'}`}>
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm'} ${stat.color}`}>
              <stat.icon size={24} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className={`p-8 rounded-[3rem] border backdrop-blur-md ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance Chart</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Overall class presence visualization</p>
          </div>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest appearance-none transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
          >
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="line">Trend Line</option>
          </select>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={[
                    { name: 'Present', value: stats.presentCount },
                    { name: 'Absent', value: stats.absentCount },
                    { name: 'Late', value: stats.lateCount }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {[ '#2E67FF', '#F2683C', '#FBBF24'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-[#0A0E13]/90 border-[#1E2733]' : 'bg-white/90 border-gray-100'}`}>
                          <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{payload[0].name}</p>
                          <p className="text-[10px] font-bold text-brand-primary uppercase">{payload[0].value} Records Logs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            ) : (
              <BarChart data={studentSummaries.slice(0, 15)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E2733' : '#eee'} />
                <XAxis 
                  dataKey="studentName" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#1E2733' : '#f8fafc', radius: 12 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-[#0A0E13]/90 border-[#1E2733]' : 'bg-white/90 border-gray-100'}`}>
                          <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{payload[0].payload.studentName}</p>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-brand-primary uppercase">{payload[0].value}% Attendance</p>
                            <p className="text-[8px] font-bold text-amber-500 uppercase">{payload[1].value} Late Logs</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="attendancePercentage" fill="#2E67FF" radius={[6, 6, 6, 6]} barSize={24} />
                <Bar dataKey="lateClasses" fill="#FBBF24" radius={[6, 6, 6, 6]} barSize={24} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expandable Sections */}
      {viewMode !== 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<LoadingSpinner />}>
            <ExpandableSection 
              title="Low Attendance Students" 
              icon={<AlertTriangle size={20} />}
              defaultExpanded={lowAttendanceStudents.length > 0}
            >
              <div className="space-y-4">
                {lowAttendanceStudents.slice(0, 5).map((student, index) => (
                  <div key={index} className={`p-4 rounded-2xl border flex justify-between items-center ${isDark ? 'bg-[#121A22] border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                    <div>
                      <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">ID: {student.rollNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-rose-500">{student.attendancePercentage}%</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{student.presentClasses}/{student.totalClasses} Marks</p>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>

            <ExpandableSection 
              title="Latency Anomalies" 
              icon={<Clock size={20} />}
            >
              <div className="space-y-4">
                {lateStudents.slice(0, 5).map((student, index) => (
                  <div key={index} className={`p-4 rounded-2xl border flex justify-between items-center ${isDark ? 'bg-[#121A22] border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                    <div>
                      <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">STREAK: {student.maxConsecutiveLate} DAYS</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-amber-500">{student.maxConsecutiveLate}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Sequential Latency</p>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          </Suspense>
        </div>
      )}

      {/* Student Details Table */}
      <div className={`rounded-[3rem] border overflow-hidden backdrop-blur-md ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
        <div className={`px-8 py-6 border-b ${isDark ? 'border-[#1E2733] bg-gray-900/30' : 'bg-gray-50/50 border-gray-100'}`}>
          <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance Logs</h3>
        </div>
        {viewMode === 'sessions' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}>
                <tr>
                  {['Session Date', 'Class Name', 'Attendance %', 'Summary', 'Status'].map((header) => (
                    <th key={header} className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {sessionLogs.slice(0, itemsToShow).map((session, index) => {
                  const rate = session.totalCount > 0 ? Math.round(((session.presentCount + session.lateCount * 0.5) / session.totalCount) * 100) : 0;
                  return (
                    <tr key={index} className={`transition-colors ${isDark ? 'hover:bg-gray-800/30 divide-[#1E2733]' : 'hover:bg-gray-50 divide-gray-100'}`}>
                      <td className="px-8 py-5">
                        <div className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{session.classDate}</div>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                        {session.className || 'General Session'}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div 
                              className={`h-full rounded-full ${
                                rate >= 90 ? 'bg-emerald-500' :
                                rate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                          <span className={`text-[10px] font-black tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                            {session.presentCount} P
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500">
                            {session.absentCount} A
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${session.lateCount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {session.lateCount} Late
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sessionLogs.length > itemsToShow && (
              <div className={`p-6 border-t ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
                <button
                  onClick={() => setItemsToShow(itemsToShow + 10)}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-gray-800/50 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black'}`}
                >
                  Show More Records ({sessionLogs.length - itemsToShow} left)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}>
                <tr>
                  {['Student Name', 'ID/Roll No', 'Attendance %', 'Total Logs', 'Late Logs', 'Action'].map((header) => (
                    <th key={header} className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {studentSummaries.slice(0, itemsToShow).map((student, index) => (
                  <tr key={index} className={`transition-colors ${isDark ? 'hover:bg-gray-800/30 divide-[#1E2733]' : 'hover:bg-gray-50 divide-gray-100'}`}>
                    <td className="px-8 py-5">
                      <div className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</div>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {student.rollNumber}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <div 
                            className={`h-full rounded-full ${
                              student.attendancePercentage >= 90 ? 'bg-emerald-500' :
                              student.attendancePercentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${student.attendancePercentage}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] font-black tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {student.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-gray-400 tracking-widest">
                      {student.presentClasses} / {student.totalClasses}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${student.lateClasses > 2 ? 'bg-rose-500/10 text-rose-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        {student.lateClasses} Logs
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => handleStudentClick(student)}
                        className={`text-[9px] font-black uppercase tracking-widest transition-all hover:text-brand-primary ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {studentSummaries.length > itemsToShow && (
              <div className={`p-6 border-t ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
                <button
                  onClick={() => setItemsToShow(itemsToShow + 10)}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-gray-800/50 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black'}`}
                >
                  Show More Records ({studentSummaries.length - itemsToShow} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

       {showStudentModal && selectedStudent && (
        <StudentModal student={selectedStudent} onClose={handleCloseModal} />
       )}
      </div>
    </div>
  );
};

// export default TeacherAttendanceDashboard;

export default TeacherAttendanceDashboard;