import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Globe, Compass, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

const AddressInfoStep = ({ 
  formData, 
  handleChange, 
  handleSameAddressCheck,
  prevStep, 
  nextStep 
}) => {
  const { isDark } = useTheme();

  const inputClasses = `w-full pl-12 pr-4 py-4 rounded-2xl font-bold transition-all outline-none border focus:ring-4 focus:ring-brand-primary/10 ${isDark 
    ? 'bg-white/5 border-white/5 text-white focus:border-brand-primary' 
    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand-primary focus:bg-white'
  }`;

  const labelClasses = `block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Permanent Address */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-white/5">
           <Home size={20} className="text-brand-primary" />
           <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Permanent Address</h3>
        </div>

        <div className="space-y-2">
          <label className={labelClasses}>Street Address</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="text"
              name="permanentAddress.street"
              value={formData.permanentAddress.street}
              onChange={handleChange}
              className={inputClasses}
              placeholder="123 University Ave"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className={labelClasses}>City</label>
             <input
               type="text"
               name="permanentAddress.city"
               value={formData.permanentAddress.city}
               onChange={handleChange}
               className={inputClasses.replace('pl-12', 'pl-6')}
               placeholder="Mumbai"
             />
           </div>
           <div className="space-y-2">
             <label className={labelClasses}>Pincode</label>
             <input
               type="text"
               name="permanentAddress.pincode"
               value={formData.permanentAddress.pincode}
               onChange={handleChange}
               className={inputClasses.replace('pl-12', 'pl-6')}
               placeholder="400001"
             />
           </div>
        </div>
      </div>

      {/* Checkbox for current address */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
         <input 
            type="checkbox" 
            id="sameAddress" 
            onChange={handleSameAddressCheck}
            className="h-5 w-5 rounded-md accent-brand-primary"
         />
         <label htmlFor="sameAddress" className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Same as Permanent Address
         </label>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-white/5">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="btn-premium px-10 py-4 flex items-center gap-2 text-base font-black tracking-tight shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all group"
        >
          Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default AddressInfoStep;