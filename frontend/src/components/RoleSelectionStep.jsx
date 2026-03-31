import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

const RoleSelectionStep = ({ handleRoleSelect }) => {
  const { isDark } = useTheme();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access your coursework and track your attendance.',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Manage your classes and verify student presence.',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {roles.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ y: -5, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect(item.id)}
            className={`group relative flex flex-col p-8 rounded-[32px] border-2 transition-all text-left ${
              isDark 
                ? 'bg-white/5 border-white/5 hover:border-brand-primary/40' 
                : 'bg-slate-50 border-slate-100 hover:border-brand-primary/20 hover:bg-white shadow-sm'
            }`}
          >
            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
              <item.icon size={32} />
            </div>
            
            <h3 className={`text-2xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {item.title}
            </h3>
            <p className={`text-sm font-bold leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.description}
            </p>

            <div className="mt-auto flex items-center gap-2 text-brand-primary font-black uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
              Select Role <ArrowRight size={14} />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default RoleSelectionStep;