import React from 'react';
import { Briefcase, Building, ShieldCheck, Users } from 'lucide-react';

const SummaryCard = ({ teachers = [], students = [], isDark }) => {
  const teacherCount = teachers.length;
  const studentCount = students.length;
  const uniqueDepts = new Set([...teachers.map(t => t.department?.name), ...students.map(s => s.department?.name)].filter(Boolean)).size;

  const stats = [
    { label: 'Faculty Ledger', value: teacherCount, icon: <Briefcase size={18} />, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Student Cohort', value: studentCount, icon: <Users size={18} />, color: 'bg-brand-primary/10 text-brand-primary' },
    { label: 'Academic Units', value: uniqueDepts, icon: <Building size={18} />, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Clearance Rate', value: '100%', icon: <ShieldCheck size={18} />, color: 'bg-brand-secondary/10 text-brand-secondary' },
  ];

  return (
    <div className={`p-8 sm:p-10 rounded-[3rem] border shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 ${isDark ? 'bg-[#121A22] border-[#1E2733] shadow-black/40' : 'bg-white border-gray-100 shadow-indigo-100/50'}`}>
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
             <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                </div>
                <div>
                   <p className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default SummaryCard;