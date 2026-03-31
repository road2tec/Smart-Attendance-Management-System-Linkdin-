import React from 'react';
import { X, BookOpen, User, Building, Calendar, Hash, Users, Edit3, ShieldCheck, GraduationCap, MapPin } from 'lucide-react';

const ViewCourseModal = ({ course, isOpen, onClose, onEditClick, isDark }) => {
  if (!isOpen || !course) return null;

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-gray-50/50 border-gray-100 shadow-sm'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">{label}</p>
          <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value || 'Not Specified'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xl transition-opacity duration-500 animate-in fade-in" 
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden border transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-12 ${
        isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-white border-gray-100'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-10 py-10 border-b relative overflow-hidden ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
           <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-10 -mr-20 -mt-20 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform duration-700 hover:rotate-12 ${isDark ? 'bg-brand-primary text-white shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
                    <BookOpen size={40} strokeWidth={2.5} />
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-lg ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white'}`}>
                          {course.courseCode}
                       </span>
                       <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${course.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          <ShieldCheck size={12} /> {course.isActive ? 'Active Syllabus' : 'Archived'}
                       </div>
                    </div>
                    <h2 className={`text-3xl sm:text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                       {course.courseName}
                    </h2>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => { onEditClick(); onClose(); }}
                   className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                      isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black'
                   }`}
                 >
                    <Edit3 size={16} /> Edit Program
                 </button>
                 <button 
                   onClick={onClose}
                   className={`p-4 rounded-2xl transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                 >
                    <X size={24} />
                 </button>
              </div>
           </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-10 lg:p-14 overflow-y-auto max-h-[60vh] custom-scrollbar">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
              
              <div className="lg:col-span-8 space-y-12">
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 font-mono">Executive Summary</h4>
                    <p className={`text-lg font-medium leading-[1.8] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                       {course.courseDescription || "This academic course has no executive summary available at this time."}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailItem label="Academic Domain" value={course.department?.name} icon={Building} />
                    <DetailItem label="Lead Coordinator" value={`${course.courseCoordinator?.firstName || ''} ${course.courseCoordinator?.lastName || ''}`} icon={User} />
                    <DetailItem label="Session Identifier" value={course.academicYear} icon={Calendar} />
                    <DetailItem label="Institutional Term" value={course.semester} icon={GraduationCap} />
                    <DetailItem label="Credit Magnitude" value={`${course.credits} Credits`} icon={Hash} />
                    <DetailItem label="Student Density" value={`${course.enrolledStudents?.length || 0} / ${course.maxCapacity} Seats`} icon={Users} />
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-10">
                 <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-gray-900/50 border-[#1E2733]' : 'bg-gray-50 border-gray-100'}`}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 text-center">Instructional Faculty</h4>
                    <div className="space-y-6">
                       {course.instructors && course.instructors.length > 0 ? (
                         course.instructors.map(instructor => (
                           <div key={instructor._id} className="flex items-center gap-4 group">
                              <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white font-black text-sm shadow-xl shadow-brand-primary/10 transition-transform group-hover:scale-110">
                                 {instructor.firstName[0]}{instructor.lastName[0]}
                              </div>
                              <div className="flex-1">
                                 <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{instructor.firstName} {instructor.lastName}</p>
                                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Certified Faculty</p>
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="py-8 text-center opacity-40">
                            <Users size={32} className="mx-auto mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest italic text-gray-500">No Faculty Assigned</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br transition-all hover:scale-[1.02] ${isDark ? 'from-brand-primary/20 to-transparent border border-brand-primary/10' : 'from-indigo-600/5 to-transparent border border-indigo-100 shadow-xl shadow-indigo-100/20'}`}>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                          <MapPin size={20} />
                       </div>
                       <h4 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>Operational Status</h4>
                    </div>
                    <p className={`text-[11px] font-bold leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                       This course is currently processing academic records and managing instructional workflows.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseModal;