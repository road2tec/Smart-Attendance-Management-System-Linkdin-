import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClassroomsByStudent } from '../../app/features/classroom/classroomThunks';
import { getMyAttendance } from '../../app/features/attendanceStats/attendanceStatsThunks';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeProvider';

// ExpandableSection Component
const ExpandableSection = ({ title, children, isOpen = false }) => {
  const [expanded, setExpanded] = useState(isOpen);
  const { theme, themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  
  return (
    <div className="mb-4">
      <div 
        className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-[#121A22] border border-[#1E2733]/50 hover:bg-[#1A2520]/40 hover:border-brand-primary/30 shadow-lg' 
            : 'bg-white border border-gray-100 hover:bg-gray-50 shadow-sm'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className={`font-semibold text-lg ${currentTheme.text}`}>{title}</h3>
        <div className={`text-sm font-medium px-3 py-1 rounded-full ${
          theme === 'dark' ? 'bg-[#1E2733] text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {expanded ? 'Hide Log' : 'Open Log'}
        </div>
      </div>
      
      <div className={`transition-all duration-500 overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
        {children}
      </div>
    </div>
  );
};

// Classroom Card Component
const ClassroomCard = ({ classroom, onClick, isActive, theme }) => {
  const { themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  
  // Calculate attendance percentage if attendance data exists
  const attendancePercentage = classroom.attendanceStats ? 
    Math.round(parseFloat(classroom.attendanceStats.attendancePercentage)) : 0;
  
  return (
    <div 
      className={`relative overflow-hidden ${currentTheme.card} p-5 rounded-xl cursor-pointer mb-4 transition-all duration-300 group ${
        isActive 
          ? (theme === 'dark' ? 'ring-1 ring-brand-primary bg-[#121A22] shadow-[0_0_15px_rgba(80,110,229,0.15)]' : 'ring-2 ring-indigo-500 bg-indigo-50/30') 
          : 'hover:-translate-y-1 hover:shadow-lg'
      }`}
      onClick={() => onClick(classroom)}
    >
      {/* Active Indicator Strip */}
      {isActive && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme === 'dark' ? 'bg-brand-primary' : 'bg-indigo-600'}`}></div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`text-lg font-bold mb-1 truncate max-w-[200px] ${currentTheme.text} group-hover:text-brand-primary transition-colors`}>
            {classroom.course?.courseName || "Unnamed Course"}
          </h3>
          <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {classroom.course?.courseCode || "No Code"}
          </div>
        </div>
        <div className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
          theme === 'dark' ? 'bg-[#1E2733] text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          {(classroom.assignedTeacher?.firstName + " " + (classroom.assignedTeacher?.lastName || ''))?.trim() || "Not assigned"}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1E2733]/50">
        <div className="flex justify-between items-end mb-2">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>My Attendance</span>
          <span className={`text-xl font-bold ${
            attendancePercentage >= 80 ? 'text-emerald-500' : 
            attendancePercentage >= 60 ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {attendancePercentage}%
          </span>
        </div>
        <div className={`w-full ${theme === 'dark' ? 'bg-[#0A0E13]' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              attendancePercentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
              attendancePercentage >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
              'bg-gradient-to-r from-rose-400 to-rose-500'
            }`} 
            style={{ width: `${attendancePercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Attendance Records Table Component
const AttendanceRecordsTable = ({ records, theme }) => {
  const [showAllRecords, setShowAllRecords] = useState(false);
  const { themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  
  // Limit displayed records if not showing all
  const displayedRecords = showAllRecords ? records : records.slice(0, 10); // Show more records by default
  
  // Helper function to get teacher name
  const getTeacherName = (record) => {
    if (record.teacher) {
      return `${record.teacher.firstName} ${record.teacher.lastName}`;
    } else if (record.markedBy === 'student') {
      return 'Self';
    } else {
      return `Auto (${record.markedBy})`;
    }
  };
  
  // Helper function to format date from record
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Helper function to get the day of week
  const getDayOfWeek = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  return (
    <div className="w-full">
      <div className={`overflow-hidden rounded-xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-gray-200'}`}>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto no-scrollbar">
          <table className="min-w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 backdrop-blur-md ${theme === 'dark' ? 'bg-[#0A0E13]/90' : 'bg-gray-50/90'}`}>
              <tr>
                <th scope="col" className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Date
                </th>
                <th scope="col" className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Day
                </th>
                <th scope="col" className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Status
                </th>
                <th scope="col" className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Status Marked By
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#1E2733]/30' : 'divide-gray-100'}`}>
              {displayedRecords && displayedRecords.length > 0 ? (
                displayedRecords.map((record, idx) => (
                  <tr key={idx} className={`transition-colors ${theme === 'dark' ? 'hover:bg-[#121A22]/80' : 'hover:bg-gray-50'} ${idx % 2 === 0 ? (theme === 'dark' ? 'bg-[#121A22]/30' : 'bg-transparent') : ''}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${currentTheme.text}`}>
                      {formatDate(record.markedAt || record.createdAt)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getDayOfWeek(record.markedAt || record.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        record.status === 'present' ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : 
                        record.status === 'late' ? (theme === 'dark' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200') :
                        record.status === 'excused' ? (theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200') :
                        record.status === 'absent' ? (theme === 'dark' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200') :
                        record.status === 'ongoing' ? (theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse') :
                        record.status === 'session-out' ? (theme === 'dark' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-50 text-gray-700 border-gray-200') :
                        (theme === 'dark' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200')
                      }`}>
                      {
                        record.status === 'session-out' ? 'Class Ended' :
                        record.status === 'ongoing' ? 'In Progress' :
                        record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')
                      }
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getTeacherName(record)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={`px-6 py-8 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {records && records.length > 5 && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setShowAllRecords(!showAllRecords)}
            className={`text-sm tracking-wide font-medium transition-colors ${
              theme === 'dark' 
                ? 'text-brand-primary hover:text-brand-light' 
                : 'text-indigo-600 hover:text-indigo-700'
            }`}
          >
            {showAllRecords ? 'Show less' : `See more (${records.length} total)`}
          </button>
        </div>
      )}
    </div>
  );
};

// Progress Chart Component for Attendance
const AttendanceProgressChart = ({ attendanceData, theme }) => {
  const { themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  
  // Check if attendance data is properly structured
  if (!attendanceData || !attendanceData.records || attendanceData.records.length === 0) {
    return (
      <div className={`${currentTheme.card} p-10 rounded-2xl flex flex-col items-center justify-center h-[28rem] border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-gray-100'}`}>
        <div className={`p-4 rounded-full mb-4 ${theme === 'dark' ? 'bg-[#121A22]' : 'bg-gray-50'}`}>
          <BarChart className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <p className={`text-lg font-medium tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No attendance data available yet.
        </p>
        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          Check back after your first class.
        </p>
      </div>
    );
  }
  
  // Extract records and stats from the attendance data
  const records = attendanceData.records || [];
  const stats = attendanceData.stats || { 
    presentCount: 0, 
    absentCount: 0, 
    lateCount: 0, 
    totalClasses: 0,
    attendancePercentage: "0.00"
  };
  
  // Transform attendance history for the line chart
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.markedAt || a.createdAt) - new Date(b.markedAt || b.createdAt)
  );
  
  // Calculate cumulative attendance percentage over time
  let present = 0;
  const cumulativeData = sortedRecords.map((record, index) => {
    if (record.status === 'present' || record.status === 'late') present++;
    return {
      day: index + 1,
      percentage: Math.round((present / (index + 1)) * 100),
      date: new Date(record.markedAt || record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });
  
  // Pie chart data for present/absent/late/excused ratio
  const pieData = [
    { name: 'Present', value: stats.presentCount, color: '#10B981' },
    { name: 'Absent', value: stats.absentCount, color: '#F43F5E' },
    { name: 'Late', value: stats.lateCount || 0, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  return (
    <div className={`${currentTheme.card} p-6 md:p-8 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]' : 'border-gray-100'} shadow-sm`}>
      <h3 className={`text-xl font-bold tracking-tight mb-8 ${currentTheme.text}`}>
        Subject Details
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Attendance over time (line chart) */}
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0A0E13]/50 border border-[#1E2733]/30' : 'bg-gray-50/50'}`}>
          <h4 className={`text-sm uppercase tracking-widest font-semibold mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            My Attendance Trend
          </h4>
          <div className="-ml-3 mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={cumulativeData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#506EE5' : '#4F46E5'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#506EE5' : '#4F46E5'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E2733' : '#e5e7eb'} />
                <XAxis 
                  dataKey="day" 
                  stroke={theme === 'dark' ? '#5E6E82' : '#9CA3AF'}
                  tick={{ fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#5E6E82' : '#9CA3AF'} 
                  domain={[0, 100]}
                  tickFormatter={(tick) => `${tick}%`}
                  tick={{ fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ stroke: theme === 'dark' ? '#1E2733' : '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#121A22' : 'white',
                    borderColor: theme === 'dark' ? '#1E2733' : '#e5e7eb',
                    color: theme === 'dark' ? 'white' : '#111827',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ fontWeight: 600 }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                  labelFormatter={(value, entry) => `Day ${value}: ${entry[0]?.payload?.date}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke={theme === 'dark' ? '#506EE5' : '#4F46E5'} 
                  strokeWidth={3}
                  dot={{ fill: theme === 'dark' ? '#0A0E13' : 'white', stroke: theme === 'dark' ? '#506EE5' : '#4F46E5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: theme === 'dark' ? '#506EE5' : '#4F46E5', stroke: theme === 'dark' ? '#121A22' : 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Attendance Status Pie Chart */}
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0A0E13]/50 border border-[#1E2733]/30' : 'bg-gray-50/50'} flex flex-col`}>
          <h4 className={`text-sm uppercase tracking-widest font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Status Breakdown
          </h4>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={false}
                  cornerRadius={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#121A22' : 'white',
                    borderColor: theme === 'dark' ? '#1E2733' : '#e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontWeight: 600, color: currentTheme.text }}
                  formatter={(value) => [value, 'Sessions']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500, color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Data Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className={`text-4xl font-bold tracking-tighter ${
                parseFloat(stats.attendancePercentage) >= 80 ? 'text-emerald-500' : 
                parseFloat(stats.attendancePercentage) >= 60 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {stats.attendancePercentage ? `${Math.round(parseFloat(stats.attendancePercentage))}%` : '0%'}
              </span>
              <span className={`text-xs uppercase font-semibold tracking-wider mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Overall
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-[#1E2733]">
        {/* Attendance Records Table in Expandable Section */}
        <ExpandableSection title="Attendance Log" isOpen={false}>
          <AttendanceRecordsTable 
            records={records} 
            theme={theme} 
          />
        </ExpandableSection>
      </div>
    </div>
  );
};

// Main Student Attendance Page Component
const StudentAttendancePage = () => {
  const dispatch = useDispatch();
  const { theme, themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  
  const { user } = useSelector(state => state.auth);
  const studentClassrooms = useSelector(state => state.classrooms.studentClassrooms || []);
  const classroomsLoading = useSelector(state => state.classrooms.isLoading);
  const attendanceData = useSelector(state => state.attendanceStats.studentAttendance || {});
  const attendanceLoading = useSelector(state => state.attendanceStats.isLoading);
  
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomsAttendanceData, setClassroomsAttendanceData] = useState({});
  
  // Fetch classrooms on component mount (requires user._id)
  useEffect(() => {
    if (user?._id) dispatch(getClassroomsByStudent(user._id));
  }, [dispatch, user?._id]);
  
  // Fetch attendance data when a classroom is selected
  useEffect(() => {
    if (selectedClassroom) {
      dispatch(getMyAttendance(selectedClassroom._id));
    }
  }, [selectedClassroom, dispatch]);
  
  // Set first classroom as selected when classrooms are loaded
  useEffect(() => {
    if (studentClassrooms && studentClassrooms.length > 0 && !selectedClassroom) {
      setSelectedClassroom(studentClassrooms[0]);
    }
  }, [studentClassrooms, selectedClassroom]);
  
  // Process attendance data properly from the Redux store with synthesis
  const processedAttendanceData = React.useMemo(() => {
    if (!attendanceData || !attendanceData.records || !attendanceData.stats || !selectedClassroom) return null;
    
    const records = [...(attendanceData.records || [])];
    const stats = { ...(attendanceData.stats || {}) };
    const now = new Date();
    
    // Synthesize session history for the audit
    const classroom = selectedClassroom;
    if (classroom.classes && classroom.classes.length > 0) {
      classroom.classes.forEach(clsEntry => {
        const cls = clsEntry.class;
        if (!cls || !cls.schedule) return;

        const { startDate, endDate, startTime, endTime, daysOfWeek } = cls.schedule;
        const startValidDate = new Date(startDate);
        const endValidDate = new Date(endDate);
        
        // Iterate through dates from startDate until now
        let currentIter = new Date(startValidDate);
        while (currentIter <= now && currentIter <= endValidDate) {
          if (daysOfWeek.includes(currentIter.getDay())) {
            // Found a scheduled session date
            const dateStr = currentIter.toDateString();
            
            // Check if there's already a record for this date
            const existing = records.find(r => new Date(r.markedAt || r.createdAt).toDateString() === dateStr);
            
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            
            const sessionStart = new Date(currentIter);
            sessionStart.setHours(startH, startM, 0, 0);
            const sessionEnd = new Date(currentIter);
            sessionEnd.setHours(endH, endM, 0, 0);

            if (!existing) {
              if (now > sessionEnd) {
                // Past session, no record -> ABSENT
                records.push({
                  status: 'absent',
                  markedAt: sessionEnd,
                  markedBy: 'System',
                  title: cls.title
                });
              } else if (now >= sessionStart && now <= sessionEnd) {
                // Ongoing session, no record yet
                records.push({
                  status: 'ongoing',
                  markedAt: sessionStart,
                  markedBy: 'Live',
                  title: cls.title
                });
              }
            } else if (now > sessionEnd) {
              // Present, but also session ended -> tag it as ended if needed (UI handled)
            }
          }
          // Move to next day
          currentIter.setDate(currentIter.getDate() + 1);
        }
      });
    }

    // Sort records by date descending
    const finalRecords = records.sort((a, b) => new Date(b.markedAt || b.createdAt) - new Date(a.markedAt || a.createdAt));

    // Recalculate stats accurately including synthesized absences
    const totalPossible = finalRecords.filter(r => r.status !== 'ongoing').length;
    const presentCount = finalRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const updatedStats = {
      ...stats,
      totalClasses: totalPossible,
      absentCount: finalRecords.filter(r => r.status === 'absent').length,
      attendancePercentage: totalPossible > 0 ? ((presentCount / totalPossible) * 100).toFixed(0) : "0"
    };

    return {
      records: finalRecords,
      stats: updatedStats
    };
  }, [attendanceData, selectedClassroom]);
  
  // Store attendance data for each classroom separately
  useEffect(() => {
    if (processedAttendanceData && selectedClassroom && selectedClassroom._id) {
      setClassroomsAttendanceData(prevData => ({
        ...prevData,
        [selectedClassroom._id]: processedAttendanceData
      }));
    }
  }, [processedAttendanceData, selectedClassroom]);
  
  // Get the attendance data for the currently selected classroom
  const currentClassroomAttendance = React.useMemo(() => {
    if (!selectedClassroom || !selectedClassroom._id) return null;
    // Use the attendance data specifically for this classroom
    return classroomsAttendanceData[selectedClassroom._id] || processedAttendanceData;
  }, [selectedClassroom, classroomsAttendanceData, processedAttendanceData]);
  
  if (classroomsLoading) {
    return (
      <div className={`${currentTheme.background} min-h-screen p-4 md:p-6 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Calculate attendance percentages for classroom cards
  const classroomsWithStats = React.useMemo(() => {
    if (!Array.isArray(studentClassrooms)) return [];
    
    return studentClassrooms.map(classroom => {
      // Get attendance data specific for this classroom
      const classroomAttendance = classroomsAttendanceData[classroom._id];
      
      if (classroomAttendance && classroomAttendance.stats) {
        return {
          ...classroom,
          attendanceStats: classroomAttendance.stats
        };
      }
      
      // If the classroom is currently selected but we don't have stored data yet
      if (selectedClassroom && classroom._id === selectedClassroom._id && 
          processedAttendanceData && processedAttendanceData.stats) {
        return {
          ...classroom,
          attendanceStats: processedAttendanceData.stats
        };
      }
      
      return classroom;
    });
  }, [studentClassrooms, selectedClassroom, processedAttendanceData, classroomsAttendanceData]);
  
  // Calculate average attendance across all courses
  const averageAttendance = React.useMemo(() => {
    const classroomsWithAttendance = classroomsWithStats.filter(c => 
      c.attendanceStats && c.attendanceStats.attendancePercentage
    );
    
    if (classroomsWithAttendance.length === 0) return 0;
    
    const totalAttendance = classroomsWithAttendance.reduce((sum, classroom) => {
      return sum + parseFloat(classroom.attendanceStats.attendancePercentage || 0);
    }, 0);
    
    return Math.round(totalAttendance / classroomsWithAttendance.length);
  }, [classroomsWithStats]);
  
  return (
    <div className={`${currentTheme.background} min-h-screen p-4 md:p-8 font-sans`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl md:text-4xl font-extrabold mb-8 tracking-tight ${currentTheme.text}`}>
          Attendance History
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left sidebar with classroom cards */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold tracking-tight ${currentTheme.text}`}>
                  My Subjects
                </h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-[#1E2733] text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {classroomsWithStats.length} Total
                </span>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {classroomsWithStats.length > 0 ? (
                  classroomsWithStats.map((classroom, index) => (
                    <div 
                      key={classroom._id}
                      className="animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                    >
                      <ClassroomCard 
                        classroom={classroom}
                        onClick={setSelectedClassroom}
                        isActive={selectedClassroom && selectedClassroom._id === classroom._id}
                        theme={theme}
                      />
                    </div>
                  ))
                ) : (
                  <div className={`${currentTheme.card} p-8 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-gray-100'}`}>
                    <p className={`text-center font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No classrooms found. You aren't enrolled in any classes yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Summary of attendance stats */}
            {classroomsWithStats.length > 0 && (
              <div className={`${currentTheme.card} p-6 rounded-2xl border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-gray-100'} shadow-sm`}>
                <h3 className={`text-sm uppercase tracking-widest font-semibold mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Summary
                </h3>
                
                {/* Overall average attendance */}
                <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-transparent to-transparent py-2">
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Attendance Score
                  </div>
                  <div className={`text-3xl font-extrabold ${
                    averageAttendance >= 80 ? 'text-emerald-500' : 
                    averageAttendance >= 60 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {averageAttendance}%
                  </div>
                </div>
                
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={classroomsWithStats
                        .filter(classroom => classroom.attendanceStats)
                        .map(classroom => ({
                          name: classroom.course?.courseCode || "Code",
                          attendance: classroom.attendanceStats ? 
                            Math.round(parseFloat(classroom.attendanceStats.attendancePercentage)) : 0
                        }))}
                      margin={{ top: 10, right: 0, bottom: 0, left: -25 }}
                      barSize={16}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E2733' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="name" 
                        stroke={theme === 'dark' ? '#5E6E82' : '#9CA3AF'}
                        tick={{ fontSize: 11, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis 
                        stroke={theme === 'dark' ? '#5E6E82' : '#9CA3AF'}
                        tickFormatter={(tick) => `${tick}%`}
                        tick={{ fontSize: 11, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        cursor={{ fill: theme === 'dark' ? '#1E2733' : '#f3f4f6', opacity: 0.4 }}
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#121A22' : 'white',
                          borderColor: theme === 'dark' ? '#1E2733' : '#e5e7eb',
                          color: theme === 'dark' ? 'white' : '#111827',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ fontWeight: 600 }}
                        formatter={(value) => [`${value}%`, 'Attendance']}
                      />
                      <Bar 
                        dataKey="attendance" 
                        name="Attendance" 
                        radius={[4, 4, 0, 0]}
                      >
                        {classroomsWithStats
                          .filter(classroom => classroom.attendanceStats)
                          .map((entry, index) => {
                            const val = entry.attendanceStats ? Math.round(parseFloat(entry.attendanceStats.attendancePercentage)) : 0;
                            const color = val >= 80 ? (theme === 'dark' ? '#34D399' : '#10B981') : 
                                          val >= 60 ? (theme === 'dark' ? '#FBBF24' : '#F59E0B') : 
                                          (theme === 'dark' ? '#FB7185' : '#F43F5E');
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
          
          {/* Main content area with selected classroom attendance details */}
          <div className="lg:col-span-8">
            {attendanceLoading ? (
              <div className={`${currentTheme.card} p-10 rounded-2xl flex flex-col items-center justify-center h-[28rem] border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-gray-100'}`}>
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4`}></div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Loading analytics...</p>
              </div>
            ) : selectedClassroom && currentClassroomAttendance ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <AttendanceProgressChart 
                  attendanceData={currentClassroomAttendance} 
                  theme={theme} 
                />
              </div>
            ) : (
              <div className={`${currentTheme.card} p-10 rounded-2xl flex flex-col items-center justify-center h-[28rem] border ${theme === 'dark' ? 'border-[#1E2733]/50' : 'border-gray-100'}`}>
                <div className={`p-6 rounded-full mb-6 ${theme === 'dark' ? 'bg-[#121A22]' : 'bg-gray-50'}`}>
                  <BarChart className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                </div>
                <p className={`text-xl font-semibold tracking-tight ${currentTheme.text} mb-2`}>
                  Select a Classroom
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center max-w-sm`}>
                  Choose a classroom from the sidebar to view detailed attendance statistics and history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;