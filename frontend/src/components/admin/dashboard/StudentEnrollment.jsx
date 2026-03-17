import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeProvider';
import { Users, ChevronRight } from 'lucide-react';
import StatCard from './commonComponents/StatCard';
import SectionHeader from './commonComponents/SectionHeader';
import { useNavigate } from 'react-router-dom';
import { shallowEqual } from 'react-redux';

export default function StudentEnrollmentSection() {
  const { themeConfig, theme } = useTheme();
  const colors = themeConfig[theme];
  const navigate = useNavigate();
  
  // For section stat cards animation on hover
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Read data from Redux store — DashboardOverview already fetches this
  const { departments, isLoading: departmentsLoading } = useSelector(state => state.departments);

  const { students, loading: studentsLoading } = useSelector(
    state => ({
      students: state.users.students,
      loading: state.users.loading.students
    }),
    shallowEqual
  );

  // State for processed department data
  const [departmentStats, setDepartmentStats] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalNewStudents, setTotalNewStudents] = useState(0);
  const [overallGrowth, setOverallGrowth] = useState(0);

  // Process students by department
  useEffect(() => {
    if (departments.length > 0 && students.length > 0) {
      // For calculating new students this month
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const departmentData = departments.map((dept, index) => {
        // Students in this department
        const deptStudents = students.filter(student => 
          student.department && student.department === dept._id
        );
        
        // New students this month in this department
        const newDeptStudents = deptStudents.filter(student => {
          const createdAt = new Date(student.createdAt);
          return createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear;
        });
        
        // Calculate growth percentage
        const growth = deptStudents.length > 0 
          ? (newDeptStudents.length / deptStudents.length) * 100 
          : 0;
        
        // Generate a color based on index
        const colorPalette = ['#2E67FF', '#2F955A', '#F2683C', '#506EE5', '#8884d8', '#82ca9d', '#ffc658'];
        const color = colorPalette[index % colorPalette.length];
        
        return {
          id: dept._id,
          name: dept.name,
          students: deptStudents.length,
          newStudents: newDeptStudents.length,
          growth: growth.toFixed(1),
          color
        };
      });
      
      // Sort by number of students (descending)
      departmentData.sort((a, b) => b.students - a.students);
      
      // Calculate totals
      const total = departmentData.reduce((sum, dept) => sum + dept.students, 0);
      const newTotal = departmentData.reduce((sum, dept) => sum + dept.newStudents, 0);
      const avgGrowth = total > 0 ? (newTotal / total) * 100 : 0;
      
      setDepartmentStats(departmentData);
      setTotalStudents(total);
      setTotalNewStudents(newTotal);
      setOverallGrowth(avgGrowth.toFixed(1));
    }
  }, [departments, students]);

  const handleNavigateToStudentPage = () => {
    navigate('/admin/enrolledUsers');
  };

  if (departmentsLoading || studentsLoading) {
    return (
      <div className="mb-10">
        <SectionHeader 
          title="Student Enrollment" 
          subtitle="Loading department data..."
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!departmentsLoading && !studentsLoading && departments.length === 0 && students.length === 0) {
    return (
      <div className="mb-10">
        <SectionHeader 
          title="Student Enrollment" 
          subtitle="No department or student data available yet"
        />
        <div className={`${theme === 'dark' ? 'bg-[#1E2733]/30' : 'bg-white'} p-6 rounded-xl border ${theme === 'dark' ? 'border-[#1E2733]' : 'border-gray-200'}`}>
          <p className={colors.secondaryText}>No students or departments found. Add departments and register students to populate this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <SectionHeader 
        title="Student Enrollment" 
        subtitle="Overview of students enrolled across different departments"
      />
      
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 m-auto w-full">
        {/* Total Students Card */}
        <StatCard 
          id="total-students"
          title="Total Students"
          value={totalStudents}
          icon={<Users size={24} className={colors.icon} />}
          subtext={`${totalNewStudents} new this month`}
          trend={parseFloat(overallGrowth)}
          hoveredCard={hoveredCard}
          setHoveredCard={setHoveredCard}
        />
        
        {/* Department-wise Student Distribution */}

        {departmentStats.map((dept, index) => (
          <StatCard
            key={dept.id}
            id={`dept-${dept.id}`}
            title={dept.name}
            value={dept.students}
            icon={<Users size={24} style={{ color: dept.color }} />}
            subtext={dept.newStudents > 0 ? `${dept.newStudents} new` : "No new students"}
            trend={parseFloat(dept.growth)}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
        ))}
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={handleNavigateToStudentPage} 
          className={`flex items-center gap-2 ${colors.button.primary} py-2 px-4 rounded-lg text-sm font-medium`}
        >
          View Student Details
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}