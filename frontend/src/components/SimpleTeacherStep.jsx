import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Loader, User, Mail, Lock, MapPin, Building, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const SimpleTeacherStep = ({ 
  formData, 
  handleChange, 
  prevStep, 
  handleSubmit, 
  isSubmitting, 
  theme, 
  departments,
  errors 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getThemedClass = (darkClass, lightClass) => {
    return theme === 'dark' ? darkClass : lightClass;
  };

  const passwordRequirements = [
    { label: '8+ Characters', met: formData.password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
    { label: 'Number', met: /\d/.test(formData.password) },
    { label: 'Special Symbol', met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Name Column */}
        <div className="space-y-4 col-span-2 md:col-span-1">
          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${getThemedClass('text-slate-400', 'text-slate-500')}`}>
              First Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
                <User size={18} />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={`input-premium w-full pl-12 py-4 rounded-2xl ${errors?.firstName ? 'border-red-500/50' : ''}`}
              />
            </div>
            {errors?.firstName && <p className="text-red-500 text-[10px] mt-1 font-bold italic">Required</p>}
          </div>

          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${getThemedClass('text-slate-400', 'text-slate-500')}`}>
              Last Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
                <User size={18} />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={`input-premium w-full pl-12 py-4 rounded-2xl ${errors?.lastName ? 'border-red-500/50' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-4 col-span-2 md:col-span-1">
          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${getThemedClass('text-slate-400', 'text-slate-500')}`}>
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@university.edu"
                className={`input-premium w-full pl-12 py-4 rounded-2xl ${errors?.email ? 'border-red-500/50' : ''}`}
              />
            </div>
            {errors?.email && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.email}</p>}
          </div>

          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${getThemedClass('text-slate-400', 'text-slate-500')}`}>
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input-premium w-full pl-12 pr-12 py-4 rounded-2xl ${errors?.password ? 'border-red-500/50' : ''}`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password Strength Indicators */}
            <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full transition-colors ${req.met ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${req.met ? getThemedClass('text-green-400', 'text-green-600') : 'text-slate-400'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Width Rows */}
        <div className="col-span-2 space-y-4">
          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${getThemedClass('text-slate-400', 'text-slate-500')}`}>
              Department
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
                <Building size={18} />
              </div>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-premium w-full pl-12 py-4 rounded-2xl appearance-none cursor-pointer"
              >
                <option value="">Select your department</option>
                {departments?.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${getThemedClass('text-slate-400', 'text-slate-500')}`}>
              Campus Location / Address
            </label>
            <div className="relative group">
              <div className="absolute top-4 left-4 text-brand-primary group-focus-within:scale-110 transition-transform">
                <MapPin size={18} />
              </div>
              <textarea
                name="permanentAddress.street"
                value={formData.permanentAddress.street}
                onChange={handleChange}
                placeholder="Enter your campus address or office location..."
                rows={2}
                className="input-premium w-full pl-12 py-4 rounded-2xl resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-[2] btn-premium py-4 rounded-2xl !bg-none bg-brand-primary text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 group overflow-hidden relative"
        >
          {isSubmitting ? (
            <Loader className="animate-spin" size={18} />
          ) : (
            <>
              <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
              Complete Registration
            </>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
        </button>
      </div>
    </motion.div>
  );
};

export default SimpleTeacherStep;
