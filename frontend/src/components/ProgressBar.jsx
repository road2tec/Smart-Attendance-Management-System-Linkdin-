import React from 'react';
import { useTheme } from '../context/ThemeProvider';

const ProgressBar = ({ step, totalSteps }) => {
  const { isDark } = useTheme();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-end mb-2">
        <div>
           <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Step {step + 1} of {totalSteps}
           </span>
           <h4 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {step === 0 ? 'Account Type' : step === 1 ? 'Personal Details' : step === 2 ? 'Location' : 'Credentials'}
           </h4>
        </div>
        <span className="text-2xl font-black text-brand-primary">
           {Math.round(((step + 1) / totalSteps) * 100)}%
        </span>
      </div>
      
      <div className={`h-3 w-full rounded-full overflow-hidden flex gap-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i}
            className={`h-full flex-1 transition-all duration-700 rounded-full ${
              i <= step 
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg shadow-brand-primary/20' 
                : isDark ? 'bg-white/5' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;