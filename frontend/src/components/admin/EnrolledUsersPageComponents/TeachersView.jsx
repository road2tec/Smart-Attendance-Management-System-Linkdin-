import React from 'react';
import { 
  Users, Mail, Briefcase, ShieldCheck, 
  ChevronRight, Hash, Building, Clock, 
  GraduationCap, Search, Shield, ChevronLeft
} from 'lucide-react';

const TeachersView = ({
  currentTeachers,
  filteredTeachers,
  currentPage,
  itemsPerPage,
  totalPages,
  paginate,
  isDark
}) => {
  if (currentTeachers.length === 0) {
    return (
      <div className={`p-20 text-center rounded-[3rem] border backdrop-blur-md ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className={`inline-flex items-center justify-center h-20 w-20 rounded-[1.5rem] mb-6 ${isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
          <Search size={32} />
        </div>
        <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Faculty Dossiers Absent</h3>
        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          No instructional personnel found matching current registry parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className={`overflow-hidden rounded-[3rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#1E2733] bg-[#0A0E13]/30' : 'border-gray-50 bg-gray-50/50'}`}>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Faculty Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Professional ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Academic Domain</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Clearance</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {currentTeachers.map((teacher, idx) => (
                <tr 
                  key={teacher._id || teacher.id} 
                  className={`group transition-all duration-300 hover:bg-brand-primary/[0.02] ${idx % 2 === 0 ? '' : (isDark ? 'bg-white/[0.01]' : 'bg-gray-50/30')}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm shadow-inner overflow-hidden flex-shrink-0 transition-transform group-hover:rotate-2 ${isDark ? 'bg-[#0A0E13] text-amber-500 font-black' : 'bg-amber-50 text-amber-600'}`}>
                        {teacher.profileImage ? (
                          <img src={teacher.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-black italic">{teacher.firstName?.[0]}{teacher.lastName?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className={`font-black text-sm tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] mt-0.5 flex items-center gap-1.5">
                           <Mail size={10} className="text-brand-primary" strokeWidth={3} />
                           {teacher.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className={`text-[10px] font-black font-mono tracking-widest ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{teacher.employeeId || 'FAC-N-A'}</span>
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-0.5 px-2 py-0.5 rounded-md bg-gray-500/5 w-fit">Registry UID</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{teacher.department?.name || 'CENTRAL OVERSIGHT'}</span>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary">Full-Time Staff</span>
                          <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 italic">Senior Associate</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      teacher.status === 'active' || !teacher.status
                        ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                        : (isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-rose-50 border-rose-100 text-rose-600')
                    }`}>
                      <Shield size={12} strokeWidth={3} />
                      {teacher.status || 'Validated'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-brand-primary/5 text-brand-primary opacity-30 group-hover:opacity-100 transition-all group-hover:scale-110">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-10 py-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
             Faculty Ledger • Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => paginate(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-3 rounded-xl border transition-all disabled:opacity-30 ${isDark ? 'bg-[#121A22] border-[#1E2733] text-white hover:bg-brand-primary' : 'bg-white border-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
            >
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === i + 1 
                      ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100')
                      : (isDark ? 'text-gray-500 hover:bg-white/5' : 'text-gray-400 hover:bg-gray-100')
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => paginate(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-3 rounded-xl border transition-all disabled:opacity-30 ${isDark ? 'bg-[#121A22] border-[#1E2733] text-white hover:bg-brand-primary' : 'bg-white border-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersView;