import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
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
  const { themeConfig, theme } = useTheme();
  const colors = themeConfig[theme];
  const dispatch = useDispatch();

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
    <div className={`${colors.background} min-h-screen p-6`}>
      <div className={`${colors.gradientBackground} rounded-2xl p-6 shadow-xl`}>

        <HeroSection
          stats={{
            totalStudents: students.length,
            activeCourses: courses.length,
            todaysClasses,
            averageAttendance: todayAttendanceRate,
          }}
          progress={{
            title: 'Student Progress',
            description: students.length
              ? `${onTrackStudents} of ${students.length} students are above the attendance threshold`
              : 'No student attendance data is available yet.',
            percent: onTrackPercentage,
          }}
          systemStatus={{
            title: 'Data Sync Status',
            summary: totalAttendanceRecords > 0
              ? `${totalAttendanceRecords} attendance records are reflected in the dashboard`
              : 'Attendance data will appear here as records are captured.',
            badges: systemBadges,
          }}
          notifications={liveNotifications}
        />

        <StudentEnrollmentSection />

        <CourseDistributionSection coursesData={courses} />

        <GroupDistribution
          departmentData={departmentData}
          theme={theme}
          colors={colors}
        />

        <AttendanceCharts
          attendanceData={attendanceData}
          groupAttendanceData={groupAttendanceData}
        />
      </div>
    </div>
  );
}