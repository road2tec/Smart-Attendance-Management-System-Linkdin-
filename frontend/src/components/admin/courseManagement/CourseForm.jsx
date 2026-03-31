import React from 'react';
import { Book, Code, FileText, User, Building, Calendar, Hash, Target, CheckCircle, XCircle, Users } from 'lucide-react';

const InputWrapper = ({ label, icon: Icon, children, isDark }) => (
  <div className="space-y-2">
    <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
      <Icon size={12} /> {label}
    </label>
    {children}
  </div>
);

const CourseForm = ({ formData, handleInputChange, onSubmit, onCancel, isDark, isEditing, departments, teachers }) => {

  const inputClass = `w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${
    isDark 
      ? 'bg-[#121A22]/50 border-transparent focus:border-brand-primary text-white placeholder-gray-700' 
      : 'bg-gray-50 border-transparent focus:border-indigo-600 text-gray-900 placeholder-gray-300'
  }`;

  return (
    <form onSubmit={onSubmit} className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <InputWrapper label="Course Identity" icon={Book} isDark={isDark}>
          <input
            type="text"
            name="courseName"
            placeholder="e.g. Advanced Neural Engineering"
            value={formData.courseName}
            onChange={handleInputChange}
            className={inputClass}
            required
          />
        </InputWrapper>
        
        <InputWrapper label="Catalogue Code" icon={Code} isDark={isDark}>
          <input
            type="text"
            name="courseCode"
            placeholder="e.g. CS-402"
            value={formData.courseCode}
            onChange={handleInputChange}
            className={inputClass}
            required
          />
        </InputWrapper>
        
        <div className="md:col-span-2">
          <InputWrapper label="Academic Abstract" icon={FileText} isDark={isDark}>
            <textarea
              name="courseDescription"
              placeholder="Provide a comprehensive summary of course objectives..."
              value={formData.courseDescription}
              onChange={handleInputChange}
              className={`${inputClass} min-h-[120px] resize-none`}
              required
            />
          </InputWrapper>
        </div>
        

        
        <InputWrapper label="Academic Domain" icon={Building} isDark={isDark}>
          <select
            name="department"
            value={formData.department || ''}
            onChange={handleInputChange}
            className={`${inputClass} appearance-none cursor-pointer`}
            required
          >
            <option value="">Select Domain / Department</option>
            {departments && departments.map(dept => (
              <option key={dept._id} value={dept._id} className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
                {dept.name}
              </option>
            ))}
          </select>
        </InputWrapper>
        
        <InputWrapper label="Session Year" icon={Calendar} isDark={isDark}>
          <input
            type="text"
            name="academicYear"
            placeholder="2024 - 2025"
            value={formData.academicYear}
            onChange={handleInputChange}
            className={inputClass}
            required
          />
        </InputWrapper>
        
        <InputWrapper label="Term / Semester" icon={Target} isDark={isDark}>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleInputChange}
            className={`${inputClass} appearance-none cursor-pointer`}
            required
          >
            <option value="">Select Phase</option>
            <option value="Fall" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>Autumn / Fall</option>
            <option value="Spring" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>Spring / Vernal</option>
            <option value="Summer" className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>Summer / Estival</option>
          </select>
        </InputWrapper>
        
        <InputWrapper label="Credit Weight" icon={Hash} isDark={isDark}>
          <input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleInputChange}
            className={inputClass}
            min="1"
            required
          />
        </InputWrapper>
        
        <InputWrapper label="Student Capacity" icon={Users} isDark={isDark}>
          <input
            type="number"
            name="maxCapacity"
            value={formData.maxCapacity}
            onChange={handleInputChange}
            className={inputClass}
            min="1"
            required
          />
        </InputWrapper>
        
        <div className="flex items-center gap-4 py-2">
           <button
             type="button"
             onClick={() => handleInputChange({ target: { name: 'isActive', type: 'checkbox', checked: !formData.isActive } })}
             className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${
               formData.isActive 
                 ? (isDark ? 'bg-brand-primary/10 border-brand-primary text-white' : 'bg-indigo-50 border-indigo-600 text-indigo-700')
                 : (isDark ? 'bg-gray-800/20 border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400')
             }`}
           >
             {formData.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
             {formData.isActive ? 'Active Status' : 'Draft / Archived'}
           </button>
        </div>
      </div>
      
      {/* Action Footer */}
      <div className={`mt-10 pt-8 border-t flex flex-col sm:flex-row justify-end gap-4 ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
        <button
          type="button"
          onClick={onCancel}
          className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Dismiss
        </button>
        <button
          type="submit"
          className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
            isDark 
              ? 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-secondary' 
              : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {isEditing ? 'Sync Changes' : 'Initialize Program'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;