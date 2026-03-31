import React, { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

const StudentDashboard = () => {
  const params = useParams();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // State for dashboard data
  const [attendanceData, setAttendanceData] = useState([]);
  
  useEffect(() => {
    // Mock data for initial view
    setAttendanceData([
      { name: 'Programming 101', present: 12, absent: 2, total: 14, percentage: 86 },
      { name: 'Data Structures', present: 8, absent: 1, total: 9, percentage: 89 },
      { name: 'Web Development', present: 15, absent: 3, total: 18, percentage: 83 },
      { name: 'Mobile Apps', present: 7, absent: 0, total: 7, percentage: 100 },
    ]);
  }, []);

  useEffect(() => {
    if (params.courseId) {
      setSelectedCourse({ _id: params.courseId, name: `Course ${params.courseId}` });
    }
    if (params.classId) {
      setSelectedClass({ _id: params.classId, name: `Class ${params.classId}` });
    }
  }, [params.courseId, params.classId]);

  return (
    <DashboardLayout role="student">
       <div className="space-y-6">
          <Outlet context={{ attendanceData, selectedCourse, selectedClass }} />
       </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;