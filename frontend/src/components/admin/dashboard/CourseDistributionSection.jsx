import React from 'react';
import { Book, ChevronRight, Users, CheckCircle, Clock } from 'lucide-react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const generateColor = (text) => {
  const colors = [
    '#506EE5', '#3B82F6', '#2E67FF', '#4F46E5', '#60A5FA', 
    '#2F955A', '#34D399', '#F2683C', '#F97316', '#FBBF24', '#F59E0B'
  ];
  const charSum = text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

const DepartmentDistributionChart = ({ coursesData, isDark }) => {
  const departmentGroups = coursesData.reduce((acc, course) => {
    const dept = course.department?.name || 'GEN-ED';
    if (!acc[dept]) {
      acc[dept] = {
        name: dept,
        count: 0,
        color: generateColor(dept)
      };
    }
    acc[dept].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(departmentGroups);
  const validChartData = chartData.length > 0 ? chartData : [{ name: 'Synchronizing', count: 1, color: '#2E67FF' }];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
         <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Syllabus Density</h3>
         <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
            Regional Mapping
         </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validChartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={8}
              dataKey="count"
              nameKey="name"
              stroke="none"
            >
              {validChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-[#0A0E13]/90 border-[#1E2733]' : 'bg-white/90 border-gray-100'}`}>
                      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{payload[0].name}</p>
                      <p className="text-[10px] font-bold text-brand-primary uppercase">{payload[0].value} Courses Assigned</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {validChartData.slice(0, 4).map((dept, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-2xl border flex items-center gap-4 ${isDark ? 'bg-[#1E2733]/30 border-[#1E2733]' : 'bg-gray-50/50 border-gray-100'}`}
          >
            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" style={{ backgroundColor: dept.color }}></div>
            <div>
              <h5 className={`text-xs font-black tracking-tight ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{dept.name}</h5>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{dept.count} Modules</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CourseDistributionSection({ coursesData, isDark }) {
  const navigate = useNavigate();
  
  const processedCourseData = (coursesData || []).map(course => ({
    id: course._id,
    name: course.courseName,
    code: course.courseCode,
    students: Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0,
    maxCapacity: course.maxCapacity || 1,
    department: course.department?.name || 'GEN-ED',
    isActive: course.isActive,
    color: generateColor(course.department?.name || course.courseName || '')
  }));
  
  const availableCourses = processedCourseData.filter(course => course.isActive && course.students < course.maxCapacity);
  const totalEnrolledStudents = processedCourseData.reduce((total, course) => total + course.students, 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Academic Architecture</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Institutional syllabus and capacity management</p>
        </div>
        <button 
          onClick={() => navigate('/admin/manageCourses')} 
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
            isDark ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
          }`}
        >
          Manage Curriculum
          <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Curriculum Index', value: processedCourseData.length, icon: Book, color: 'text-brand-primary' },
          { label: 'Global Enrollment', value: totalEnrolledStudents, icon: Users, color: 'text-emerald-400' },
          { label: 'Open Pathways', value: availableCourses.length, icon: CheckCircle, color: 'text-amber-400' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-[2rem] border flex items-center gap-6 ${isDark ? 'bg-[#1E2733]/30 border-[#1E2733]' : 'bg-gray-50/50 border-gray-100'}`}>
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm'} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#1E2733]/20 border-[#1E2733]' : 'bg-gray-50/30 border-gray-100'}`}>
           <div className="flex items-center justify-between mb-8">
              <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Priority Modules</h3>
              <Clock size={18} className="text-gray-500" />
           </div>
           
           <div className="space-y-4">
              {processedCourseData.slice(0, 4).map((course, index) => (
                <div key={index} className={`p-5 rounded-2xl border transition-all hover:translate-x-1 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: course.color }}></div>
                         <h4 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${course.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                         {course.isActive ? 'Active' : 'Draft'}
                      </span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                      <span>{course.code} • {course.department}</span>
                      <span>{course.students}/{course.maxCapacity} Seats Filled</span>
                   </div>
                   <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full bg-brand-primary rounded-full" 
                        style={{ width: `${(course.students / course.maxCapacity) * 100}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#1E2733]/20 border-[#1E2733]' : 'bg-gray-50/30 border-gray-100'}`}>
          <DepartmentDistributionChart coursesData={processedCourseData} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { useTheme } from '../../../context/ThemeProvider';
// import { Book, ChevronRight, Users, Award, Building } from 'lucide-react';
// import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// import SectionHeader from './commonComponents/SectionHeader';
// import { useNavigate } from 'react-router-dom';

// // Function to generate consistent colors based on department or course name
// const generateColor = (text) => {
//   const colors = [
//     '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
//     '#98D8C8', '#F78FB3', '#3498DB', '#F1C40F', 
//     '#9B59B6', '#2ECC71', '#E74C3C', '#1ABC9C'
//   ];
  
//   // Simple hash function to get consistent color for same text
//   const charSum = text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
//   return colors[charSum % colors.length];
// };

// export default function CourseDistributionSection({ coursesData }) {
//   const { themeConfig, theme } = useTheme();
//   const colors = themeConfig[theme];
//   const navigate = useNavigate();
  
//   // Process the courses data for chart display
//   const processedCourseData = coursesData.map(course => ({
//     id: course._id,
//     name: course.courseName,
//     code: course.courseCode,
//     students: course.enrolledStudents.length,
//     maxCapacity: course.maxCapacity,
//     department: course.department?.name || 'Unknown Department',
//     coordinator: course.courseCoordinator || 'Not Assigned',
//     academicYear: course.academicYear,
//     semester: course.semester,
//     description: course.courseDescription,
//     credits: course.credits,
//     color: generateColor(course.department?.name || course.courseName)
//   }));
  
//   const [selectedCourse, setSelectedCourse] = useState(processedCourseData[0]);
  
//   const handleNavigateToCourseInfo = () => {
//     navigate('/admin/manageCourses');
//   };

//   // Calculate total enrolled students
//   const totalEnrolledStudents = processedCourseData.reduce((total, course) => total + course.students, 0);
  
//   // Calculate total capacity
//   const totalCapacity = processedCourseData.reduce((total, course) => total + course.maxCapacity, 0);
  
//   // Calculate enrollment percentage
//   const enrollmentPercentage = totalCapacity > 0 
//     ? Math.round((totalEnrolledStudents / totalCapacity) * 100) 
//     : 0;

//   return (
//     <div className={`${theme === 'dark' ? 'bg-[#121A22]/40' : 'bg-white'} rounded-xl p-6 mb-10 border ${theme === 'dark' ? 'border-[#1E2733]' : 'border-gray-200'}`}>
//       <SectionHeader 
//         title="Course Distribution" 
//         subtitle="Distribution of students across different courses"
//       />
      
//       <div className="flex flex-col lg:flex-row items-center justify-between">
//         <div className="w-full lg:w-2/5">
//           <div className={`${colors.card} p-6 rounded-xl mb-4`}>
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-3">
//                 <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-[#1E2733]/50' : 'bg-gray-100'}`}>
//                   <Book size={20} className={colors.icon} />
//                 </div>
//                 <div>
//                   <h3 className={`${colors.secondaryText} text-sm`}>Total Courses</h3>
//                   <h2 className={`${colors.text} text-2xl font-bold`}>{processedCourseData.length}</h2>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3">
//                 <div className={`rounded-full p-2 ${theme === 'dark' ? 'bg-[#1E2733]/50' : 'bg-gray-100'}`}>
//                   <Users size={20} className={colors.icon} />
//                 </div>
//                 <div>
//                   <h3 className={`${colors.secondaryText} text-sm`}>Enrollment</h3>
//                   <h2 className={`${colors.text} text-2xl font-bold`}>{enrollmentPercentage}%</h2>
//                 </div>
//               </div>
//             </div>
            
//             <div className="space-y-4 max-h-64 overflow-y-auto">
//               {processedCourseData.map((course, index) => (
//                 <div 
//                   key={index} 
//                   className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
//                     selectedCourse && selectedCourse.id === course.id 
//                       ? theme === 'dark' ? 'bg-[#1E2733]/50' : 'bg-blue-100'
//                       : ''
//                   }`}
//                   onClick={() => setSelectedCourse(course)}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }}></div>
//                     <span className={`${colors.text} text-sm`}>{course.name}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className={`${colors.secondaryText} text-sm font-medium`}>{course.students}</span>
//                     <span className={`${colors.secondaryText} text-xs`}>/{course.maxCapacity}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
        
//         <div className="w-full lg:w-3/5 mt-6 lg:mt-0 flex flex-col items-center">
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={processedCourseData}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={100}
//                 paddingAngle={5}
//                 dataKey="students"
//                 nameKey="name"
//               >
//                 {processedCourseData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip 
//                 formatter={(value, _name, props) => [
//                   `${value} students (${Math.round((value / props.payload.maxCapacity) * 100)}% filled)`, 
//                   props.payload.name
//                 ]}
//                 contentStyle={{ 
//                   backgroundColor: theme === 'dark' ? '#121A22' : '#fff',
//                   borderColor: theme === 'dark' ? '#1E2733' : '#ddd',
//                   color: theme === 'dark' ? '#fff' : '#333'
//                 }}
//               />
//             </PieChart>
//           </ResponsiveContainer>
          
//           {selectedCourse && (
//             <div className={`${colors.card} p-4 rounded-xl w-full mt-4`}>
//               <h3 className={`${colors.text} font-semibold border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pb-2`}>
//                 {selectedCourse.name} ({selectedCourse.code})
//               </h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
//                 <div className="flex items-center gap-2">
//                   <Building size={16} className={colors.icon} />
//                   <span className={`${colors.secondaryText} text-sm`}>Department: </span>
//                   <span className={`${colors.text} text-sm font-medium`}>{selectedCourse.department}</span>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <Award size={16} className={colors.icon} />
//                   <span className={`${colors.secondaryText} text-sm`}>Credits: </span>
//                   <span className={`${colors.text} text-sm font-medium`}>{selectedCourse.credits}</span>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <Users size={16} className={colors.icon} />
//                   <span className={`${colors.secondaryText} text-sm`}>Enrollment: </span>
//                   <span className={`${colors.text} text-sm font-medium`}>
//                     {selectedCourse.students}/{selectedCourse.maxCapacity} 
//                     ({Math.round((selectedCourse.students / selectedCourse.maxCapacity) * 100)}%)
//                   </span>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <Book size={16} className={colors.icon} />
//                   <span className={`${colors.secondaryText} text-sm`}>{selectedCourse.semester} {selectedCourse.academicYear}</span>
//                 </div>
//               </div>
              
//               <p className={`${colors.secondaryText} text-sm mt-3`}>
//                 {selectedCourse.description || "No description available."}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="flex justify-end mt-4">
//         <button 
//           onClick={handleNavigateToCourseInfo} 
//           className={`flex items-center gap-2 ${colors.button.primary} py-2 px-4 rounded-lg text-sm font-medium`}
//         >
//           View Course Details
//           <ChevronRight size={16} />
//         </button>
//       </div>
//     </div>
//   );
// }