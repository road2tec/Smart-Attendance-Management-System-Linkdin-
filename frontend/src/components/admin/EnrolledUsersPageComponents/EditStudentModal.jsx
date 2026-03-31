import React, { useState, useEffect } from 'react';
import { X, User, Mail, Hash, ShieldCheck, Save, ArrowLeft } from 'lucide-react';

const EditStudentModal = ({ isOpen, onClose, student, onSave, isDark }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        rollNumber: student.rollNumber || '',
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(student._id || student.id, formData);
  };

  const inputClass = `w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${
    isDark 
      ? 'bg-[#0A0E13] border-transparent focus:border-brand-primary text-white placeholder-gray-700' 
      : 'bg-gray-50 border-transparent focus:border-indigo-600 text-gray-900 placeholder-gray-300'
  }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-[#0A0E13]/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      
      {/* Premium Glassmorphic Modal */}
      <div className={`relative w-full max-w-lg rounded-[3rem] overflow-hidden border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ${isDark ? 'bg-[#121A22] border-[#1E2733] shadow-black/60' : 'bg-white border-gray-100 shadow-indigo-100'}`}>
        
        {/* Decorative Gradient Pulse */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-10 -mr-20 -mt-20 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>

        {/* Header Section */}
        <div className={`relative z-10 p-10 border-b flex items-center justify-between ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
          <div className="flex items-center gap-5">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${isDark ? 'bg-brand-primary/20 text-brand-primary' : 'bg-indigo-50 text-indigo-600'}`}>
                <ShieldCheck size={28} />
             </div>
             <div>
                <h2 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>Adjust Identity</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Registry Correction Protocol</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="relative z-10 p-10 space-y-8">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <User size={12} /> Forename
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Entry Forename"
              />
            </div>
            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <User size={12} /> Surname
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Entry Surname"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Mail size={12} /> Digital Signature (Email)
            </label>
            <div className="relative">
               <input
                type="email"
                value={formData.email}
                disabled
                className={`${inputClass} opacity-50 cursor-not-allowed cursor-not-allowed`}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                 <ShieldCheck size={14} className="text-gray-600" />
              </div>
            </div>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter italic">Signature locked to primary authentication node.</p>
          </div>

          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Hash size={12} /> Academic Registry ID
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Format: CS-2024-XXX"
            />
          </div>

          {/* Institutional Footer */}
          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <ArrowLeft size={16} /> Discard
            </button>
            <button
              type="submit"
              className={`flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-white shadow-2xl ${isDark ? 'bg-brand-primary hover:bg-brand-secondary shadow-brand-primary/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
            >
              <Save size={16} /> Synchronize
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
