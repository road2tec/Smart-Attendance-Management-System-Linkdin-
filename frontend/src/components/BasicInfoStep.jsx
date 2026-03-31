import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Mail, Lock, Phone, Calendar, Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

const BasicInfoStep = ({ 
  formData, 
  handleChange, 
  errors, 
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
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label className={labelClasses}>First Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={inputClasses}
              placeholder="John"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className={labelClasses}>Last Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div className="md:col-span-2 space-y-2">
          <label className={labelClasses}>Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              placeholder="university@email.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className={labelClasses}>Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className={labelClasses}>Confirm Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClasses}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-2">
          <label className={labelClasses}>Mobile Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className={inputClasses}
              placeholder="+91 00000 00000"
            />
          </div>
        </div>

        {/* DOB */}
        <div className="space-y-2">
          <label className={labelClasses}>Date of Birth</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </div>
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

export default BasicInfoStep;