import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { CalendarCheck } from 'lucide-react';
import HeroSection from '../../components/admin/dashboard/HeroSection';
import StudentEnrollmentSection from '../admin/dashboard/StudentEnrollment';
import CourseDistributionSection from '../admin/dashboard/CourseDistributionSection';
import GroupDistribution from '../admin/GroupDistribution';
import AttendanceCharts from '../admin/dashboard/AttendanceCharts';

import { fetchStudents } from '../../app/features/users/userThunks';
import { fetchAdminCourses } from '../../app/features/courses/courseThunks';
import { fetchAllGroups } from '../../app/features/groups/groupThunks';
import { fetchDepartments } from '../../app/features/departments/departmentThunks';
import {
  getDailyAttendanceReport,
  getOverallAttendance,
} from '../../app/features/attendanceStats/attendanceStatsThunks';

export default function DashboardOverview() {
  const { themeConfig, theme, isDark } = useTheme();
  const colors = themeConfig[theme];
  const dispatch = useDispatch();
  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const students = useSelector(state => state.users.students);
  const courses = useSelector(state => state.courses.courses);
  const allGroups = useSelector(state => state.groups.allGroups);
  const departments = useSelector(state => state.departments.departments);
  const overallAttendance = useSelector(state => state.attendanceStats.overallAttendance);
  const dailyReport = useSelector(state => state.attendanceStats.dailyReport);

  // Fetch all data once on mount
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchAdminCourses());
    dispatch(fetchAllGroups());
    dispatch(fetchDepartments());
    dispatch(getOverallAttendance());
    dispatch(getDailyAttendanceReport(new Date().toISOString().split('T')[0]));
  }, [dispatch]);

  const colorPalette = ['#2E67FF', '#2F955A', '#F2683C', '#506EE5', '#8884d8', '#82ca9d', '#ffc658'];

  const departmentData = useMemo(() => departments.map((dept, index) => {
    const deptCourses = courses.filter(
      course => course.department && course.department._id === dept._id
    );
    const deptGroups = allGroups[dept._id] || [];
    const totalStudentsInGroups = deptGroups.reduce(
      (sum, group) => sum + (group.students ? group.students.length : 0),
      0
    );
    return {
      departmentId: dept._id,
      departmentName: dept.name,
      departmentCode: dept.code || dept.name.substring(0, 4).toUpperCase(),
      color: colorPalette[index % colorPalette.length],
      totalCourses: deptCourses.length,
      totalGroups: deptGroups.length,
      totalStudents: totalStudentsInGroups,
      courses: deptCourses.map(c => ({
        id: c._id,
        name: c.courseName || c.title,
        code: c.courseCode
      })),
      groups: deptGroups.map((group, gIndex) => ({
        name: group.name || `Group ${String.fromCharCode(65 + gIndex)}`,
        departmentName: dept.name,
        departmentColor: colorPalette[index % colorPalette.length],
        students: group.students ? group.students.length : 0,
        departmentId: dept._id
      }))
    };
  }), [allGroups, courses, departments]);

  const attendanceByCourse = overallAttendance?.attendanceByCourse || [];
  const attendanceByGroup = overallAttendance?.attendanceByGroup || [];
  const lowAttendanceStudents = overallAttendance?.lowAttendanceStudents || [];
  const overallStats = overallAttendance?.overallStats || {};
  const totalAttendanceRecords = overallStats?.totalRecords || 0;
  const presentCount = overallStats?.statusCounts?.present || 0;
  const lateCount = overallStats?.statusCounts?.late || 0;
  const computedOverallAttendance = totalAttendanceRecords > 0
    ? Math.round(((presentCount + (lateCount * 0.5)) / totalAttendanceRecords) * 100)
    : 0;

  const attendanceData = attendanceByCourse.slice(0, 6).map((course, index) => ({
    name: course.courseCode || course.courseName || `Course ${index + 1}`,
    attendance: Math.round(Number(course.attendanceRate || 0))
  }));

  const allGroupsFlat = departmentData.flatMap(d => d.groups);
  const groupAttendanceData = attendanceByGroup.slice(0, 5).map((group, index) => ({
    name: group.groupName || allGroupsFlat[index]?.name || `Group ${index + 1}`,
    attendance: Math.round(Number(group.attendanceRate || 0))
  }));

  const todayAttendanceRate = dailyReport?.summary?.attendanceRate
    ? Math.round(Number(dailyReport.summary.attendanceRate))
    : computedOverallAttendance;
  const todaysClasses = dailyReport?.classSessions?.length || 0;
  const onTrackStudents = Math.max(students.length - lowAttendanceStudents.length, 0);
  const onTrackPercentage = students.length > 0
    ? Math.round((onTrackStudents / students.length) * 100)
    : 0;

  const topCourse = attendanceByCourse[0];
  const liveNotifications = [
    todaysClasses > 0
      ? {
          type: 'attendance',
          message: `${todaysClasses} class session${todaysClasses === 1 ? '' : 's'} recorded today`,
          time: 'Today'
        }
      : null,
    lowAttendanceStudents.length > 0
      ? {
          type: 'attendance',
          message: `${lowAttendanceStudents.length} student${lowAttendanceStudents.length === 1 ? '' : 's'} are below 75% attendance`,
          time: 'Live'
        }
      : null,
    topCourse
      ? {
          type: 'course',
          message: `${topCourse.courseName || topCourse.courseCode || 'Top course'} is leading at ${Math.round(Number(topCourse.attendanceRate || 0))}% attendance`,
          time: 'Latest'
        }
      : null
  ].filter(Boolean);

  const systemBadges = [
    `${students.length} students`,
    `${courses.length} courses`,
    `${allGroupsFlat.length} groups`,
    `${departments.length} departments`
  ].filter(Boolean);

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Dynamic Header Section */}
        <div className={`relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden border ${
          isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full opacity-10 -mr-32 -mt-32 ${
            isDark ? 'bg-brand-primary' : 'bg-indigo-400'
          }`}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                   isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white shadow-lg'
                 }`}>
                   Institutional OS v2.0
                 </div>
                 <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                 }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                    System Online
                 </div>
              </div>
              <h1 className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Executive <span className={isDark ? 'text-brand-primary' : 'text-indigo-600'}>Intelligence</span>
              </h1>
              <p className={`mt-4 text-lg font-medium max-w-xl leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Welcome back, Administrator. Your institution's academic velocity and compliance metrics are synchronized.
              </p>
            </div>
            
            <div className={`px-8 py-6 rounded-[2rem] border backdrop-blur-md flex flex-col items-center justify-center ${
              isDark ? 'bg-[#1E2733]/40 border-[#1E2733]' : 'bg-gray-50/50 border-gray-100'
            }`}>
               <CalendarCheck size={32} className={`mb-3 ${isDark ? 'text-brand-primary' : 'text-indigo-600'}`} />
               <span className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{formattedDate}</span>
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Operational Window</span>
            </div>
          </div>
        </div>

        {/* Dashboard Components */}
        <HeroSection
          stats={{
            totalStudents: students.length,
            activeCourses: courses.length,
            todaysClasses,
            averageAttendance: todayAttendanceRate,
          }}
          progress={{
            title: 'Cohort Maturity',
            description: students.length
              ? `${onTrackStudents} students currently meet institutional attendance compliance.`
              : 'Institutional enrollment data pending synchronization.',
            percent: onTrackPercentage,
          }}
          systemStatus={{
            title: 'Data Integrity',
            summary: totalAttendanceRecords > 0
              ? `Cryptographic verification of ${totalAttendanceRecords} records complete.`
              : 'Awaiting primary attendance broadcast from faculty nodes.',
            badges: systemBadges,
          }}
          notifications={liveNotifications}
          isDark={isDark}
        />

        <div className="grid grid-cols-1 gap-10">
           <StudentEnrollmentSection isDark={isDark} />
           
           <div className={`p-10 rounded-[3rem] border backdrop-blur-md ${
             isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'
           }`}>
             <CourseDistributionSection coursesData={courses} isDark={isDark} />
           </div>

           <GroupDistribution
             departmentData={departmentData}
             theme={theme}
             colors={colors}
             isDark={isDark}
           />

           <div className={`p-10 rounded-[3rem] border backdrop-blur-md ${
             isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'
           }`}>
              <AttendanceCharts
                attendanceData={attendanceData}
                groupAttendanceData={groupAttendanceData}
                isDark={isDark}
              />
           </div>
        </div>
      </div>
    </div>
  );
}