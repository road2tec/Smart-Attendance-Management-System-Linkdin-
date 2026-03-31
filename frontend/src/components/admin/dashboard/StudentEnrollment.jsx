import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Users, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shallowEqual } from 'react-redux';

const MiniStatCard = ({ title, value, subtext, trend, icon: Icon, color, isDark }) => (
  <div className={`p-6 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] ${
    isDark ? 'bg-[#1E2733]/30 border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'
  }`}>
    <div className="flex justify-between items-start mb-4">
       <div className={`p-3 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm'}`} style={{ color }}>
          <Icon size={20} />
       </div>
       {trend && (
         <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
           parseFloat(trend) >= 0 
             ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
             : (isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')
         }`}>
           {parseFloat(trend) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
           {Math.abs(parseFloat(trend))}%
         </div>
       )}
    </div>
    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
    <div className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
    <p className="text-[10px] font-medium text-gray-500 mt-2 italic">{subtext}</p>
  </div>
);

export default function StudentEnrollmentSection({ isDark }) {
  const navigate = useNavigate();
  const { departments, isLoading: departmentsLoading } = useSelector(state => state.departments);
  const { students, loading: studentsLoading } = useSelector(
    state => ({
      students: state.users.students,
      loading: state.users.loading.students
    }),
    shallowEqual
  );

  const [departmentStats, setDepartmentStats] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalNewStudents, setTotalNewStudents] = useState(0);
  const [overallGrowth, setOverallGrowth] = useState(0);

  useEffect(() => {
    if (departments.length > 0 && students.length > 0) {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const departmentData = departments.map((dept, index) => {
        const deptStudents = students.filter(student => 
          student.department && (student.department === dept._id || student.department?._id === dept._id)
        );
        
        const newDeptStudents = deptStudents.filter(student => {
          const createdAt = new Date(student.createdAt);
          return createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear;
        });
        
        const growth = deptStudents.length > 0 
          ? (newDeptStudents.length / deptStudents.length) * 100 
          : 0;
        
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
      
      departmentData.sort((a, b) => b.students - a.students);
      const total = departmentData.reduce((sum, dept) => sum + dept.students, 0);
      const newTotal = departmentData.reduce((sum, dept) => sum + dept.newStudents, 0);
      const avgGrowth = total > 0 ? (newTotal / total) * 100 : 0;
      
      setDepartmentStats(departmentData);
      setTotalStudents(total);
      setTotalNewStudents(newTotal);
      setOverallGrowth(avgGrowth.toFixed(1));
    }
  }, [departments, students]);

  if (departmentsLoading || studentsLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
         <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retrieving Enrollment Matrix...</p>
      </div>
    );
  }

  return (
    <div className={`p-8 sm:p-10 rounded-[3rem] border backdrop-blur-md ${
      isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'
    }`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Cohort Distribution</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Cross-departmental enrollment analytics</p>
        </div>
        <button 
          onClick={() => navigate('/admin/enrolledUsers')} 
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
            isDark ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
          }`}
        >
          Manage Personnel
          <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniStatCard 
          title="Total Institutional Cohort"
          value={totalStudents}
          subtext={`${totalNewStudents} fresh enrollments this period`}
          trend={overallGrowth}
          icon={Users}
          color="#2E67FF"
          isDark={isDark}
        />
        
        {departmentStats.slice(0, 3).map((dept) => (
          <MiniStatCard
            key={dept.id}
            title={`${dept.name} Division`}
            value={dept.students}
            subtext={dept.newStudents > 0 ? `${dept.newStudents} new entrants` : "Stability maintained"}
            trend={dept.growth}
            icon={Users}
            color={dept.color}
            isDark={isDark}
          />
        ))}
      </div>
      
      {departmentStats.length > 3 && (
        <div className="mt-8 pt-8 border-t border-dashed border-gray-800/30">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">
             + {departmentStats.length - 3} Additional Academic Divisions Synchronized
           </p>
        </div>
      )}
    </div>
  );
}