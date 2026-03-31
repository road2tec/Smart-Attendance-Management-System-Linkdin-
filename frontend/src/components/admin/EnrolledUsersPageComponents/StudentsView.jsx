import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  MoreVertical, Edit2, Trash2, Shield, 
  IdCard, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Search, FileText,
  Users, ShieldCheck, Send, Loader
} from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';

const StudentsView = ({ 
  currentStudents, 
  filteredStudents, 
  selectedCourse, 
  selectedGroup, 
  currentPage, 
  itemsPerPage, 
  totalPages, 
  paginate,
  onEditStudent,
  onDeleteStudent,
  isDark 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className={`overflow-hidden rounded-[3rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#1E2733] bg-[#0A0E13]/30' : 'border-gray-50 bg-gray-50/50'}`}>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Personnel Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Registry ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Institutional Unit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Clearance</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto opacity-30">
                       <Users size={48} className="mx-auto mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest">Registry Empty</p>
                       <p className="text-[10px] font-bold mt-2">No personnel records found matching current synchronization parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentStudents.map(student => (
                  <StudentRow 
                    key={student._id || student.id} 
                    student={student}
                    onEditStudent={onEditStudent}
                    onDeleteStudent={onDeleteStudent}
                    isDark={isDark}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Elite Pagination */}
        <div className={`px-8 py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-6 ${isDark ? 'border-[#1E2733] bg-[#0A0E13]/30' : 'border-gray-50 bg-gray-50/30'}`}>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Showing <span className={isDark ? 'text-white' : 'text-gray-900'}>{currentStudents.length}</span> of {filteredStudents.length} entries
           </p>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                 {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${currentPage === pageNum ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100') : (isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900')}`}
                      >
                        {pageNum}
                      </button>
                    )
                 })}
              </div>

              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const StudentRow = ({ student, onEditStudent, onDeleteStudent, isDark }) => {
  const [sending, setSending] = useState(false);

  const handleEmailParent = async () => {
    setSending(true);
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await axiosInstance.post(`${API}/email/parent-report`, { studentId: student._id || student.id });
      toast.success(res.data.message || 'Parent report sent!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send parent report.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <tr className={`group transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50/80'}`}>
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-transform group-hover:scale-110 ${isDark ? 'bg-[#1E2733] text-brand-primary shadow-black/20' : 'bg-indigo-50 text-indigo-600 shadow-indigo-100/50'}`}>
            {student.profileImage ? (
               <img src={student.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
               <span>{student.firstName?.[0]}{student.lastName?.[0]}</span>
            )}
          </div>
          <div className="flex flex-col">
            <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.firstName} {student.lastName}</p>
            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-tighter mt-0.5">
               <Mail size={10} strokeWidth={3} /> {student.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col">
           <span className={`text-xs font-black font-mono ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{student.rollNumber || 'REF-N-A'}</span>
           <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-0.5">Registry ID</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col">
           <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{student.department?.name || 'GEN-ED'}</span>
           <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500 mt-0.5">GROUP {student.group?.name || 'ALPHA'}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.status === 'active' || !student.status ? (isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-50 text-rose-600')}`}>
           <ShieldCheck size={12} /> {student.status || 'Active'}
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
           <button 
             onClick={handleEmailParent}
             disabled={sending}
             className={`flex items-center gap-1.5 px-3 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white'} disabled:opacity-50`}
             title="Email Parent 6-Month Report"
           >
             {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
             Email Parent
           </button>
           <button 
             onClick={() => onEditStudent && onEditStudent(student)}
             className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
             title="Edit Records"
           >
             <Edit2 size={16} />
           </button>
           <button 
             onClick={() => onDeleteStudent && onDeleteStudent(student)}
             className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
             title="Terminate Clearance"
           >
             <Trash2 size={16} />
           </button>
        </div>
      </td>
    </tr>
  );
};

export default StudentsView;