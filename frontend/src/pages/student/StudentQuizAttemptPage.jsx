import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { getClassroomById } from '../../app/features/classroom/classroomThunks';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, FileText, CheckCircle, Clock } from 'lucide-react';

const StudentQuizAttemptPage = () => {
  const { classroomId, assessmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  
  const { currentClassroom } = useSelector(state => state.classrooms);
  const { user, token } = useSelector(state => state.auth);
  
  const [assessment, setAssessment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerContent, setAnswerContent] = useState('');

  useEffect(() => {
    if (classroomId) {
      dispatch(getClassroomById(classroomId));
    }
  }, [dispatch, classroomId]);

  useEffect(() => {
    if (currentClassroom && currentClassroom.assessments) {
      const found = currentClassroom.assessments.find(a => a._id === assessmentId);
      if (found) {
        setAssessment(found);
      }
    }
  }, [currentClassroom, assessmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      toast.error('Please provide an answer before submitting.', { theme: theme === 'dark' ? 'dark' : 'light' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a result logic here
      if (!token) throw new Error('No authentication token found');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // We now send the actual answer content to the teacher for manual grading
      const resultData = {
        assessmentName: assessment.title,
        examType: assessment.type.toLowerCase(),
        totalMarks: assessment.totalMarks,
        obtainedMarks: 0, // 0 until teacher grades it
        remarks: answerContent || 'Awaiting Grading',
        classroomId: classroomId,
        student: user._id
      };
      
      // The backend route is for student submission
      await axios.post('http://localhost:5000/api/results/student/submit', resultData, config);
      
      toast.success('Assessment submitted successfully! Awaiting teacher grading.', { 
        theme: theme === 'dark' ? 'dark' : 'light',
        autoClose: 5000
      });
      setTimeout(() => {
        navigate('/student/assessments');
      }, 3000);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to submit assessment';
      // if already exists, it might throw unique constraint error for result. 
      if (msg.includes('E11000') || msg.includes('duplicate')) {
         toast.error('You have already submitted this assessment.', { theme: theme === 'dark' ? 'dark' : 'light' });
      } else {
         toast.error(msg, { theme: theme === 'dark' ? 'dark' : 'light' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assessment) {
    return (
      <div className={`${currentTheme.background} min-h-screen flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.background} min-h-screen p-4 md:p-8 font-sans`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto space-y-6">
        
        <button 
          onClick={() => navigate('/student/assessments')}
          className={`flex items-center gap-2 text-sm font-semibold transition-all mb-4 ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
          }`}
        >
          <ChevronLeft size={16} />
          Back to Assessments
        </button>

        <div className={`${currentTheme.card} p-6 md:p-8 rounded-3xl border ${theme === 'dark' ? 'border-[#1E2733]' : 'border-slate-100'} shadow-sm`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 ${
                  theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                } rounded-md`}>
                  {assessment.type}
                </span>
              </div>
              <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${currentTheme.text} mb-2`}>
                {assessment.title}
              </h1>
              <p className={currentTheme.secondaryText + " text-sm"}>
                {currentClassroom?.course?.courseName} • {assessment.date ? new Date(assessment.date).toLocaleDateString() : 'No date'}
              </p>
            </div>
            
            <div className={`p-4 rounded-2xl flex flex-col items-center ${
              theme === 'dark' ? 'bg-[#121A22] border-brand-primary/20' : 'bg-slate-50 border-slate-200'
            } border`}>
              <span className={`text-xs font-bold uppercase ${currentTheme.secondaryText} mb-1`}>Total Marks</span>
              <span className={`text-2xl font-black ${theme === 'dark' ? 'text-brand-light' : 'text-brand-primary'}`}>
                {assessment.totalMarks}
              </span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#121A22]/50 border-[#1E2733]/50' : 'bg-slate-50/50 border-slate-100'} mb-8`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${currentTheme.text} mb-2 flex items-center gap-2`}>
              <FileText size={16} /> Instructions
            </h3>
            <p className={`${currentTheme.secondaryText} text-sm leading-relaxed`}>
              {assessment.description || "Read the questions carefully and provide your answers in the space below. Once submitted, your answers cannot be modified."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-bold mb-3 ${currentTheme.text}`}>
                Your Answer / Submission Link
              </label>
              <textarea 
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                rows={10}
                required
                placeholder="Type your answer here or paste a link to your assignment document..."
                className={`w-full p-4 rounded-2xl border transition-all resize-none ${
                  theme === 'dark' 
                  ? 'bg-[#121A22] border-[#1E2733] text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20' 
                  : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                }`}
              ></textarea>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#121A22]/30 border-[#1E2733]' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center gap-3">
                 <Clock size={20} className={currentTheme.secondaryText} />
                 <span className={`text-sm font-semibold ${currentTheme.secondaryText}`}>Take your time, no timer active.</span>
               </div>
               
               <button 
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${
                  isSubmitting 
                  ? 'opacity-70 cursor-not-allowed bg-slate-400 text-white' 
                  : (theme === 'dark' ? 'bg-brand-primary text-white hover:bg-brand-light shadow-lg shadow-brand-primary/20' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200')
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Submit Final Work
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default StudentQuizAttemptPage;
