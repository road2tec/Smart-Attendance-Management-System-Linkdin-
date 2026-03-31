import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from './../../context/ThemeProvider';
import { 
  Search, Download, Filter, ChevronDown, 
  UserCircle, Users, Calendar, ChevronRight, X, UserPlus, ShieldCheck, GraduationCap, Briefcase, LayoutGrid, ShieldAlert
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeachers, fetchStudents, updateUser, deleteUser } from '../../app/features/users/userThunks';

// Import components
import UserTypeToggle from '../../components/admin/EnrolledUsersPageComponents/UserTypeToggle';
import SearchAndFilters from '../../components/admin/EnrolledUsersPageComponents/SearchAndFilters';
import StudentsView from '../../components/admin/EnrolledUsersPageComponents/StudentsView';
import TeachersView from '../../components/admin/EnrolledUsersPageComponents/TeachersView';
import SummaryCard from '../../components/admin/EnrolledUsersPageComponents/SummaryCard';
import EditStudentModal from '../../components/admin/EnrolledUsersPageComponents/EditStudentModal';

const EnrolledUsersPage = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const isTeacher = currentUser?.role === 'teacher';

  const [viewMode, setViewMode] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const { teachers = [], students = [], loading } = useSelector((state) => state.users);

  useEffect(() => {
    if (isTeacher) setViewMode('students');
  }, [isTeacher]);

  useEffect(() => {
    if (!isTeacher && !teachers.length && !loading.teachers) {
      dispatch(fetchTeachers());
    }
    // Optimization: Check if students already loaded or fetch anyway to ensure fresh data
    dispatch(fetchStudents());
  }, [dispatch, isTeacher]);

  const departments = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    return [...new Set(students.map(student => student.department?.name).filter(Boolean))];
  }, [students]);

  const groups = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    const filtered = selectedCourse ? students.filter(s => s.department?.name === selectedCourse) : students;
    return [...new Set(filtered.map(s => s.group?.name).filter(Boolean))];
  }, [students, selectedCourse]);

  const filteredTeachers = useMemo(() => (
    teachers.filter(t => 
      searchTerm === '' || 
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [teachers, searchTerm]);

  const filteredStudents = useMemo(() => (
    students.filter(s => {
      const matchesSearch = searchTerm === '' || 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = selectedCourse === '' || s.department?.name === selectedCourse;
      const matchesGroup = selectedGroup === '' || s.group?.name === selectedGroup;
      return matchesSearch && matchesCourse && matchesGroup;
    })
  ), [students, searchTerm, selectedCourse, selectedGroup]);

  const currentItems = viewMode === 'students' 
    ? filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const totalItems = viewMode === 'students' ? filteredStudents.length : filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedCourse, selectedGroup, viewMode]);

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`URGENT: Permanent administrative termination of ${student.firstName} ${student.lastName}? This protocol is irreversible.`)) {
      try {
        await dispatch(deleteUser(student._id || student.id)).unwrap();
      } catch (err) {
        console.error('Termination sequence failure', err);
      }
    }
  };

  const handleSaveStudent = async (studentId, updatedData) => {
    try {
      await dispatch(updateUser({ userId: studentId, userData: updatedData })).unwrap();
      setIsEditModalOpen(false);
      dispatch(fetchStudents());
    } catch (err) {
      console.error('Data persistence failed', err);
    }
  };

  return (
    <div className={`min-h-screen p-6 sm:p-10 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Elite Institutional Header */}
        <div className={`relative p-10 sm:p-16 rounded-[4rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full opacity-10 -mr-40 -mt-40 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>
          <div className={`absolute bottom-0 left-0 w-64 h-64 blur-[80px] rounded-full opacity-5 -ml-20 -mb-20 ${isDark ? 'bg-emerald-500' : 'bg-emerald-200'}`}></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl skew-x-1 ${isDark ? 'bg-brand-primary text-white shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
                <Users size={40} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                   {isTeacher ? 'Student Registry' : 'Personnel Archives'}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                   <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                      Institutional Bureau
                   </div>
                   <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-brand-primary">
                      {totalItems} Secure Entries
                   </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button className={`group flex items-center gap-3 px-8 py-5 rounded-[1.75rem] font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <Download size={16} className="transition-transform group-hover:-translate-y-1" /> 
                  Export Vault
               </button>
            </div>
          </div>
        </div>

        {/* Action Control Center */}
        <div className={`p-10 rounded-[3.5rem] border space-y-10 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
           <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
              {!isTeacher && (
                <UserTypeToggle viewMode={viewMode} setViewMode={setViewMode} isDark={isDark} />
              )}
              
              <div className="flex-1 max-w-2xl">
                <SearchAndFilters 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm}
                  isFilterOpen={isFilterOpen} 
                  setIsFilterOpen={setIsFilterOpen}
                  selectedCourse={selectedCourse} 
                  setSelectedCourse={setSelectedCourse}
                  selectedGroup={selectedGroup} 
                  setSelectedGroup={setSelectedGroup}
                  courses={departments}
                  groups={groups}
                  isDark={isDark}
                />
              </div>
           </div>

           {(searchTerm || selectedCourse || selectedGroup) && (
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-inherit">
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mr-2">Active Filters:</p>
                 {searchTerm && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95">
                       Query: {searchTerm} <X size={12} className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setSearchTerm('')} />
                    </div>
                 )}
                 {selectedCourse && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95">
                       Unit: {selectedCourse} <X size={12} className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setSelectedCourse('')} />
                    </div>
                 )}
                 {selectedGroup && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95">
                       Cohort: {selectedGroup} <X size={12} className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setSelectedGroup('')} />
                    </div>
                 )}
                 <button onClick={() => { setSearchTerm(''); setSelectedCourse(''); setSelectedGroup(''); }} className="ml-4 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all">Clear Protocol</button>
              </div>
           )}
        </div>

        {/* Unified Data Matrix */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {viewMode === 'students' ? (
            <StudentsView 
              currentStudents={currentItems}
              filteredStudents={filteredStudents}
              selectedCourse={selectedCourse}
              selectedGroup={selectedGroup}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              paginate={setCurrentPage}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              isDark={isDark}
            />
          ) : (
            <TeachersView 
              currentTeachers={currentItems}
              filteredTeachers={filteredTeachers}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              paginate={setCurrentPage}
              isDark={isDark}
            />
          )}
        </div>

        {/* Global Strategy Metrics */}
        {!isTeacher && (
          <div className="pt-6">
            <SummaryCard teachers={teachers} students={students} isDark={isDark} />
          </div>
        )}
      </div>

      <EditStudentModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={editingStudent}
        onSave={handleSaveStudent}
        isDark={isDark}
      />
    </div>
  );
};

export default EnrolledUsersPage;