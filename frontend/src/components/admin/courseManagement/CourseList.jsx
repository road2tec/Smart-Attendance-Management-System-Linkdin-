import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Edit2, Trash2, Users, BookOpen, GraduationCap, Calendar, User, Clock, MoreVertical, ShieldCheck, XCircle, Info } from 'lucide-react';

const CourseCard = ({ course, onView, onEdit, onDelete, onAssignTeacher, isDark, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  const progress = Math.min(100, Math.round(((course.enrolledStudents?.length || 0) / (course.maxCapacity || 1)) * 100));
  
  return (
    <div className={`group rounded-[2rem] overflow-hidden border transition-all duration-500 ${isExpanded ? 'shadow-2xl' : 'hover:shadow-lg'} ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div 
        className={`p-6 sm:p-8 flex items-center justify-between cursor-pointer select-none`}
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 ${isExpanded ? 'scale-110' : ''} ${isDark ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
            <BookOpen size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white'}`}>
                {course.courseCode}
              </span>
              <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {course.courseName}
              </h3>
            </div>
            <p className={`text-xs font-bold font-mono tracking-tight ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
               {course.department?.name || 'GEN-ED'} • {course.credits} CREDITS • {course.semester || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-right">
             <div className="flex items-center gap-2 justify-end mb-1">
                <Users size={14} className="text-gray-400" />
                <span className={`text-sm font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{course.enrolledStudents?.length || 0} / {course.maxCapacity}</span>
             </div>
             <div className="w-24 h-1 bg-gray-800/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full" style={{ width: `${progress}%` }}></div>
             </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course.isActive ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')}`}>
             {course.isActive ? <ShieldCheck size={12} /> : <XCircle size={12} />}
             {course.isActive ? 'Live' : 'Archived'}
          </div>

          <div className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
             {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      
      {/* Expanded Content with Grid Layout */}
      <div className={`grid transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className={`p-8 sm:p-10 border-t ${isDark ? 'border-[#1E2733] bg-[#0E151C]' : 'border-gray-50 bg-gray-50/30'}`}>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                   <div>
                      <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                         <Info size={14} /> Course Abstract
                      </h4>
                      <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                         {course.courseDescription || "No detailed description provided for this academic program."}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
                         <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Academic Metadata</h4>
                         <ul className="space-y-4">
                            <li className="flex items-center justify-between text-xs">
                               <span className="text-gray-500 font-bold uppercase tracking-tighter">Academic Year</span>
                               <span className={`font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{course.academicYear}</span>
                            </li>
                            <li className="flex items-center justify-between text-xs">
                               <span className="text-gray-500 font-bold uppercase tracking-tighter">Semester</span>
                               <span className={`font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{course.semester}</span>
                            </li>
                            <li className="flex items-center justify-between text-xs">
                               <span className="text-gray-500 font-bold uppercase tracking-tighter">Credits</span>
                               <span className={`font-black ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{course.credits} STACK</span>
                            </li>
                         </ul>
                      </div>

                      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
                         <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center justify-between ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Instructors
                            <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-500">{course.instructors?.length || 0}</span>
                         </h4>
                         <div className="space-y-3">
                            {course.instructors && course.instructors.length > 0 ? (
                               course.instructors.map(instructor => (
                                 <div key={instructor._id} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-50 text-indigo-600'}`}>
                                       {instructor.firstName[0]}{instructor.lastName[0]}
                                    </div>
                                    <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{instructor.firstName} {instructor.lastName}</p>
                                 </div>
                               ))
                            ) : (
                               <p className="text-xs italic text-gray-500">Self-Managed Course</p>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className={`p-6 rounded-3xl border ${isDark ? 'bg-brand-primary/5 border-brand-primary/10' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
                      <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-brand-light/60' : 'text-brand-primary'}`}>Academic Ownership</h4>
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-brand-primary text-white' : 'bg-brand-primary text-white'}`}>
                            <User size={24} />
                         </div>
                         <div>
                            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {course.createdBy ? `${course.createdBy.firstName} ${course.createdBy.lastName}` : (course.courseCoordinator?.firstName ? `${course.courseCoordinator.firstName} ${course.courseCoordinator.lastName}` : 'ADMIN SYSTEM')}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Course Developer</p>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-3">
                      <button 
                        className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-brand-primary text-white hover:bg-brand-secondary' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
                        onClick={(e) => { e.stopPropagation(); onView(course); }}
                      >
                        <Eye size={16} strokeWidth={3} /> Analyze Portal
                      </button>
                      
                      {userRole === 'admin' && (
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                             className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest border transition-colors ${isDark ? 'bg-transparent border-[#1E2733] text-gray-400 hover:text-white hover:border-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                             onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                           >
                             <Edit2 size={14} /> Edit
                           </button>
                           <button 
                             className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors`}
                             onClick={(e) => { e.stopPropagation(); onDelete(course._id); }}
                           >
                             <Trash2 size={14} /> Purge
                           </button>
                        </div>
                      )}
                      {userRole === 'admin' && (
                        <button 
                          className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${isDark ? 'border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10' : 'border-indigo-100 text-indigo-600 hover:bg-indigo-50'}`}
                          onClick={(e) => { e.stopPropagation(); onAssignTeacher(course); }}
                        >
                          <Users size={16} strokeWidth={3} /> Assign Staff
                        </button>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseList = ({ courses, onView, onEdit, onDelete, onAssignTeacher, isDark, userRole }) => {
  if (!courses || courses.length === 0) {
    return (
      <div className={`p-16 rounded-[2.5rem] border-4 border-dashed animate-in fade-in zoom-in duration-500 text-center ${isDark ? 'bg-[#121A22]/30 border-[#1E2733] text-gray-600' : 'bg-white border-gray-100 text-gray-400'}`}>
        <BookOpen size={48} className="mx-auto mb-6 opacity-20" />
        <h3 className="text-xl font-black mb-2">No Active Courses</h3>
        <p className="text-sm font-medium">Initiate a new academic program to populate your portal.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom duration-700">
      {courses.map((course, idx) => (
        <CourseCard
          key={course._id}
          course={course}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignTeacher={onAssignTeacher}
          isDark={isDark}
          userRole={userRole}
          style={{ animationDelay: `${idx * 100}ms` }}
        />
      ))}
    </div>
  );
};

export default CourseList;