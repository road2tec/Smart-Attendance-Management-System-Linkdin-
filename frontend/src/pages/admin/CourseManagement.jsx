import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeProvider';
import { Plus, Users, Layout, Book, Globe, Shield, Search, Filter } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAdminCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  fetchCoursesByDepartment,
  fetchTeacherCourses,
  fetchStudentCourses,
  assignTeacherToCourse
} from '../../app/features/courses/courseThunks';
import { clearCourseMessage } from '../../app/features/courses/courseSlice';

import DashboardCharts from '../../components/admin/courseManagement/DashboardCharts';
import SearchBar from '../../components/admin/courseManagement/SearchBar';
import CourseList from '../../components/admin/courseManagement/CourseList';
import EditCourseModal from '../../components/admin/courseManagement/ModalComponents/EditCourseModal';
import ViewCourseModal from '../../components/admin/courseManagement/ModalComponents/ViewCourseModal';
import CreateCourseModal from '../../components/admin/courseManagement/ModalComponents/CreateCourseModal';
import AssignTeacherModal from '../../components/admin/courseManagement/ModalComponents/AssignTeacherModal';
import { toast } from 'react-hot-toast'; 
import { fetchDepartments } from '../../app/features/departments/departmentThunks';
import { fetchTeachers } from '../../app/features/users/userThunks';
import { fetchAllGroups } from '../../app/features/groups/groupThunks';
import { createClassroom } from '../../app/features/classroom/classroomThunks';

export default function CourseManagement() {
  const { themeConfig, theme, isDark } = useTheme();
  
  const initialFormState = {
    courseName: '',
    courseCode: '',
    courseDescription: '',
    courseCoordinator: null,
    department: null,
    academicYear: '',
    semester: '',
    credits: 0,
    maxCapacity: 0,
    isActive: true
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isAssigningTeacher, setIsAssigningTeacher] = useState(false);
  
  const dispatch = useDispatch();
  
  const { courses = [], isLoading = false, error = null, message = null } = useSelector(state => state.courses || {});
  const departmentsState = useSelector((state) => state.departments);
  const { departments = [], loading: departmentsLoading } = departmentsState;
  const { user } = useSelector(state => state.auth);
  const usersState = useSelector((state) => state.users);
  const { teachers = [], loading: { teachers: teachersLoading } } = usersState;
  const groupsState = useSelector((state) => state.groups);
  const { allGroups = {}, loading: groupsLoading } = groupsState;

  // Load courses when component mounts
  useEffect(() => {
    if (user.role === 'admin') {
      dispatch(fetchAdminCourses());
    } else if (user.role === 'teacher') {
      dispatch(fetchTeacherCourses());
    } else if (user.role === 'student') {
      dispatch(fetchStudentCourses());
    }
  }, [dispatch, user.role]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!departments.length && !departmentsLoading) dispatch(fetchDepartments());
      if (!teachers.length && !teachersLoading) dispatch(fetchTeachers());
      if (Object.keys(allGroups).length === 0 && !groupsLoading) dispatch(fetchAllGroups());
    };
    fetchInitialData();
  }, [dispatch]);
  
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearCourseMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearCourseMessage());
    }
  }, [message, error, dispatch]);

  const filteredCourses = courses.filter(course =>
    course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // If user is a teacher, automatically set them as coordinator
    const finalData = { ...formData };
    if (user.role === 'teacher' && !finalData.courseCoordinator) {
      finalData.courseCoordinator = user._id || user.id || user.userId;
    }

    if (isValidFormData(finalData)) {
      try {
        await dispatch(createCourse(finalData)).unwrap();
        setIsCreating(false);
        resetFormData();
        toast.success('Course established in registry');
      } catch (err) {
        console.error('Failed to create course:', err);
        if (err.error?.includes('E11000') || err.message?.includes('E11000')) {
          toast.error('CREATION DENIED: Course Code already exists in the institutional archives.');
        } else {
          toast.error(err.message || 'Institutional protocol failed: Course creation rejected.');
        }
      }
    } else {
      // Provide actionable feedback for invalid data
      const missing = [];
      if (!finalData.courseName) missing.push('Identity Name');
      if (!finalData.courseCode) missing.push('Catalogue Code');
      if (!finalData.department) missing.push('Academic Domain (Department)');
      if (!finalData.academicYear) missing.push('Session Year');
      if (finalData.credits <= 0) missing.push('Credit Weight (>0)');
      if (finalData.maxCapacity <= 0) missing.push('Student Capacity (>0)');
      
      toast.error(`SUBMISSION BLOCKED: Missing mandatory metadata: ${missing.join(', ')}`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Delete this course? This action is permanent.')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
      } catch (err) {
        console.error('Failed to delete course:', err);
      }
    }
  };

  const isValidFormData = (data) => {
    return (
      data.courseName && 
      data.courseCode && 
      data.courseDescription && 
      data.academicYear && 
      data.department &&
      data.credits > 0 &&
      data.maxCapacity > 0
    );
  };
  
  const resetFormData = () => setFormData(initialFormState);
  
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setIsViewing(true);
  };
  
  const handleOpenEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      courseName: course.courseName || '',
      courseCode: course.courseCode || '',
      courseDescription: course.courseDescription || '',
      courseCoordinator: course.courseCoordinator?._id || '',
      department: course.department?._id || '',
      academicYear: course.academicYear || '',
      semester: course.semester || '',
      credits: course.credits || 0,
      maxCapacity: course.maxCapacity || 0,
      isActive: course.isActive !== undefined ? course.isActive : true
    });
    setIsEditing(true);
  };
  
  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (selectedCourse && isValidFormData(formData)) {
      try {
        const updatedData = {...formData};
        if (updatedData.courseCoordinator === '') updatedData.courseCoordinator = null;
        
        await dispatch(updateCourse({ 
          courseId: selectedCourse._id, 
          courseData: updatedData 
        })).unwrap();
        
        setIsEditing(false);
        resetFormData();
      } catch (err) {
        console.error('Failed to update course:', err);
      }
    }
  };

  const handleOpenAssignTeacherModal = (course) => {
    setSelectedCourse(course);
    setIsAssigningTeacher(true);
  };

  const handleAssignTeacher = async (data) => {
    try {
      await dispatch(assignTeacherToCourse(data)).unwrap();
      await dispatch(createClassroom(data)).unwrap();
      setIsAssigningTeacher(false);
    } catch (err) {
      console.error('Failed to assign teacher:', err);
    }
  };

  return (
    <div className={`min-h-screen p-6 sm:p-10 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Modern Header */}
        <div className={`relative p-8 sm:p-12 rounded-[2.5rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`absolute top-0 right-0 w-80 h-80 blur-3xl rounded-full opacity-10 -mr-24 -mt-24 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}>
                <Layout className="w-10 h-10" />
              </div>
              <div>
                <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Ledger</h1>
                <p className={`text-sm sm:text-base font-medium mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Orchestrate your institution's academic offerings.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-100/50 text-gray-400'}`}>
                  <Shield size={14} />
                  {user?.role} Portal
               </div>
               
               {user?.role === 'teacher' && (
                 <button
                  className={`flex items-center gap-3 px-8 py-4 rounded-[1.25rem] font-black text-sm transition-all hover:scale-105 active:scale-95 ${
                    isDark 
                      ? 'bg-brand-primary text-white shadow-2xl shadow-brand-primary/20 hover:bg-brand-secondary' 
                      : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'
                  }`}
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedCourse(null);
                    resetFormData();
                  }}
                >
                  <Plus size={20} strokeWidth={3} />
                  New Course
                </button>
               )}
            </div>
          </div>
        </div>

        {/* Dashboard Charts - Pass props to handle modernization internally */}
        <DashboardCharts courses={courses} isDark={isDark} />
        
        {/* Interactive Action Bar */}
        <div className={`p-6 rounded-[2rem] border backdrop-blur-md flex flex-col md:flex-row items-center gap-6 ${isDark ? 'bg-[#121A22]/80 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
          <div className="relative flex-1 w-full">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
            <input 
              type="text"
              placeholder="Filter by name or course code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent border-2 border-transparent focus:border-brand-primary transition-all font-medium text-sm ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
             <button className={`p-4 rounded-xl transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                <Filter size={20} />
             </button>
             <div className={`h-8 w-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
             <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {filteredCourses.length} Courses Found
             </p>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
             <p className="text-sm font-black uppercase tracking-widest text-gray-500">Syncing Knowledge...</p>
          </div>
        ) : (
          <CourseList 
            courses={filteredCourses} 
            onView={handleViewCourse}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteCourse} 
            onAssignTeacher={handleOpenAssignTeacherModal}
            isDark={isDark}
            userRole={user?.role}
          />
        )}
      </div>
      
      {/* Modals - Standardized Modals */}
      <CreateCourseModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={handleCreateCourse}
        formData={formData}
        handleInputChange={handleFormInputChange}
        isDark={isDark}
        departments={departments}
        teachers={teachers}
      />
      
      <EditCourseModal
        isOpen={isEditing}
        course={selectedCourse}
        onClose={() => setIsEditing(false)}
        onSubmit={handleEditCourse}
        formData={formData}
        handleInputChange={handleFormInputChange}
        isDark={isDark}
        departments={departments}
        teachers={teachers}
      />
      
      <ViewCourseModal
        course={selectedCourse}
        isOpen={isViewing}
        onClose={() => setIsViewing(false)}
        onEditClick={() => {
          handleOpenEditModal(selectedCourse);
          setIsViewing(false);
        }}
        isDark={isDark}
        departments={departments}
        teachers={teachers}
      />
  
      <AssignTeacherModal
        isOpen={isAssigningTeacher}
        onClose={() => setIsAssigningTeacher(false)}
        onSubmit={handleAssignTeacher}
        course={selectedCourse}
        groups={allGroups}
        teachers={teachers}
        isDark={isDark}
        isLoading={isLoading}
      />
    </div>
  );
}