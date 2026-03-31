import React from 'react';
import CourseForm from '../CourseForm';
import { X, Edit3 } from 'lucide-react';

const EditCourseModal = ({ isOpen, course, onClose, onSubmit, formData, handleInputChange, isDark, departments, teachers }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
         className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 animate-in fade-in" 
         onClick={onClose}
      />
      
      <div className={`relative w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-8 ${
        isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-white border-gray-100'
      }`}>
        <div className={`px-10 py-8 border-b flex items-center justify-between ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                <Edit3 size={24} />
             </div>
             <div>
                <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Refine Architecture</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Modifying {course?.courseCode || 'Course'}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-3 rounded-2xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-500 hover:text-white' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-900'}`}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
          <CourseForm 
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={onSubmit}
            onCancel={onClose}
            isDark={isDark}
            isEditing={true}
            departments={departments}
            teachers={teachers}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;
