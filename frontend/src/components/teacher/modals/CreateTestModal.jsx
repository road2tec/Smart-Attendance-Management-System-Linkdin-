import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Save, Users, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { saveTeacherResults } from '../../../app/features/results/resultsThunks';
import { resetResultsStatus } from '../../../app/features/results/resultsSlice';

const EXAM_TYPES = ['internal', 'external', 'quiz', 'assignment', 'practical'];

export default function CreateTestModal({ classroom, isDark, onClose, onSaved }) {
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(state => state.results);

  const [mode, setMode] = useState('record'); // 'record' or 'interactive'
  const [assessmentName, setAssessmentName] = useState('');
  const [examType, setExamType] = useState('quiz');
  const [totalMarks, setTotalMarks] = useState(100);
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [studentMarks, setStudentMarks] = useState({});
  const [questions, setQuestions] = useState([{ id: 'q-' + Date.now(), text: '', type: 'subjective', marks: 10 }]);
  const [errors, setErrors] = useState({});

  const students = useMemo(() => {
    const list = classroom?.assignedStudents || classroom?.enrolledStudents || classroom?.students || [];
    return Array.isArray(list) ? list : [];
  }, [classroom]);

  useEffect(() => {
    const initial = {};
    students.forEach(s => {
      initial[s._id] = { obtained: '', remarks: '' };
    });
    setStudentMarks(initial);
  }, [students]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetResultsStatus());
        onSaved?.();
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, dispatch, onClose, onSaved]);

  const validate = () => {
    const e = {};
    if (!assessmentName.trim()) e.assessmentName = 'Title is required';
    if (!totalMarks || Number(totalMarks) <= 0) e.totalMarks = 'Total marks must be > 0';

    if (mode === 'record') {
        const total = Number(totalMarks);
        let hasAtLeastOne = false;
        Object.values(studentMarks).forEach(m => {
          if (m.obtained !== '') {
            hasAtLeastOne = true;
            const obtained = Number(m.obtained);
            if (Number.isNaN(obtained) || obtained < 0 || obtained > total) {
              e.marks = `Marks must be between 0 and ${total}`;
            }
          }
        });
        if (!hasAtLeastOne) e.marks = 'Please enter marks for at least one student';
    } else {
        if (questions.length === 0) e.submit = 'Add at least one question';
        else if (questions.some(q => !q.text.trim())) e.submit = 'All questions must have text';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    if (mode === 'record') {
        const results = Object.entries(studentMarks)
          .filter(([, m]) => m.obtained !== '')
          .map(([studentId, m]) => ({
            studentId,
            obtainedMarks: Number(m.obtained),
            remarks: m.remarks,
          }));

        dispatch(saveTeacherResults({
          classroomId: classroom._id,
          payload: {
            assessmentName: assessmentName.trim(),
            examType,
            totalMarks: Number(totalMarks),
            publishedAt,
            results,
          },
        }));
    } else {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/assessments/classroom/${classroom._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: assessmentName.trim(),
                    type: examType.charAt(0).toUpperCase() + examType.slice(1),
                    dueDate,
                    description,
                    instructions,
                    totalMarks: Number(totalMarks),
                    questions
                })
            });
            
            if (response.ok) {
                onSaved?.();
                onClose();
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || 'Failed to create assessment' });
            }
        } catch (err) {
            setErrors({ submit: 'Network error occurred. Try again.' });
        }
    }
  };

  const addQuestion = (e) => {
    if (e) e.stopPropagation();
    setQuestions(prev => [...prev, { 
      id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000), 
      text: '', 
      type: 'subjective', 
      marks: 10 
    }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
        setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleMarksChange = (studentId, field, value) => {
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
    if (errors.marks) setErrors(prev => ({ ...prev, marks: undefined }));
  };

  const inp = `w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none ${
    isDark
      ? 'bg-[#0A0E13] border border-[#1E2733] text-white placeholder:text-gray-700'
      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
  }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className={`w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] ${isDark ? 'bg-[#121A22] border border-[#1E2733]' : 'bg-white border border-gray-100'}`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-8 py-6 border-b ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
          <div>
            <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Test / Assessment</h2>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Interactive Assessment Manager
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
          
          {/* Mode Switcher */}
          <div className={`p-1 rounded-2xl flex gap-1 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-100'}`}>
            <button 
              type="button"
              onClick={() => setMode('record')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'record' ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-indigo-600 shadow-sm') : 'text-gray-500 hover:text-gray-700'}`}
            >
              Manual Mark Entry
            </button>
            <button 
              type="button"
              onClick={() => setMode('interactive')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'interactive' ? (isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white text-indigo-600 shadow-sm') : 'text-gray-500 hover:text-gray-700'}`}
            >
              Interactive Test Builder
            </button>
          </div>

          {errors.submit && (
              <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                  {errors.submit}
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 text-center py-2 px-4 rounded-lg bg-brand-primary/5 border border-brand-primary/10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                    Assessment Configuration
                </span>
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Assessment Title *</label>
              <input
                className={inp}
                placeholder="e.g. Unit 1 Quiz"
                value={assessmentName}
                onChange={e => { setAssessmentName(e.target.value); setErrors(prev => ({ ...prev, assessmentName: undefined })); }}
              />
              {errors.assessmentName && <p className="text-rose-500 text-[10px] uppercase font-black mt-1 ml-1">{errors.assessmentName}</p>}
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Exam Type</label>
              <select className={inp} value={examType} onChange={e => setExamType(e.target.value)}>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Marks</label>
              <input
                className={inp}
                type="number"
                min="1"
                value={totalMarks}
                onChange={e => { setTotalMarks(e.target.value); setErrors(prev => ({ ...prev, totalMarks: undefined })); }}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{mode === 'interactive' ? 'Due Date' : 'Published Date'}</label>
              <input
                className={inp}
                type="date"
                value={mode === 'interactive' ? dueDate : publishedAt}
                onChange={e => mode === 'interactive' ? setDueDate(e.target.value) : setPublishedAt(e.target.value)}
              />
            </div>

            {mode === 'interactive' && (
                <div className="md:col-span-2 space-y-4">
                     <textarea 
                        className={`${inp} min-h-[80px] py-3 text-xs`}
                        placeholder="Description (Optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                     <textarea 
                        className={`${inp} min-h-[60px] py-3 text-xs`}
                        placeholder="Special Instructions (e.g. Time limits)"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
            )}
          </div>

          <div className={`w-full h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

          {/* Dynamic Builder Area */}
          {mode === 'record' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Grade Students ({students.length})</label>
                </div>
                {errors.marks && (
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] uppercase font-black border border-rose-500/20">{errors.marks}</div>
                )}
                <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
                  <table className="w-full">
                    <thead className={isDark ? 'bg-black/20' : 'bg-gray-50'}>
                      <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <th className="px-5 py-3 text-left">Student</th>
                        <th className="px-5 py-3 text-center">Marks</th>
                        <th className="px-5 py-3 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#1E2733]' : 'divide-gray-50'}`}>
                      {students.map(student => (
                        <tr key={student._id}>
                          <td className="px-5 py-3">
                            <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.firstName} {student.lastName}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{student.rollNumber || 'NO_ROLL'}</p>
                          </td>
                          <td className="px-5 py-3">
                            <input
                              className={`w-16 text-center ${inp} !py-2 !px-1`}
                              type="number"
                              value={studentMarks[student._id]?.obtained || ''}
                              onChange={e => handleMarksChange(student._id, 'obtained', e.target.value)}
                            />
                          </td>
                          <td className="px-5 py-3">
                            <input
                              className={`${inp} !py-2 text-[10px]`}
                              value={studentMarks[student._id]?.remarks || ''}
                              onChange={e => handleMarksChange(student._id, 'remarks', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          ) : (
              <div className="space-y-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <BookOpen size={16} className="text-brand-primary" />
                       <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Interactive Question Builder</label>
                    </div>
                    <button 
                        type="button"
                        onClick={addQuestion}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-indigo-600 text-white'}`}
                    >
                        + Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                      {questions.map((q, idx) => (
                          <div key={idx} className={`p-6 rounded-[2rem] border relative group ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                              <button 
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              >
                                  <X size={12} />
                              </button>
                              
                              <div className="flex items-center gap-4 mb-4">
                                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-xs">{idx + 1}</div>
                                  <select 
                                    className={`${inp} !w-auto !py-2 !px-3 text-[10px]`}
                                    value={q.type}
                                    onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                                  >
                                      <option value="subjective">SUBJECTIVE (WRITING)</option>
                                      <option value="MCQ">MULTIPLE CHOICE (MCQ)</option>
                                  </select>
                                  <div className="flex-1" />
                                  <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-gray-500 uppercase">Points</span>
                                      <input 
                                        type="number"
                                        className={`${inp} !w-16 !py-2 !px-3 text-center`}
                                        value={q.marks}
                                        onChange={(e) => handleQuestionChange(q.id, 'marks', e.target.value)}
                                      />
                                  </div>
                              </div>

                              <textarea 
                                className={`${inp} min-h-[100px] py-4 bg-transparent border-dashed focus:border-solid text-xs`}
                                placeholder="Enter question statement here..."
                                value={q.text}
                                onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                              />
                          </div>
                      ))}
                  </div>
              </div>
          )}
        </div>

        {/* Action Footer */}
        <div className={`px-8 py-5 border-t flex items-center justify-between gap-4 ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
          <div className="max-w-[200px]">
            {isSuccess ? (
              <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><CheckCircle size={14} /> Done!</p>
            ) : isError ? (
              <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest">{message || 'Export error'}</p>
            ) : (
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{mode === 'interactive' ? 'Interactive Build' : 'Manual Ledger'}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-500'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isSuccess}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isLoading || isSuccess
                  ? 'bg-gray-400 text-white'
                  : isDark
                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-105'
                    : 'bg-indigo-600 text-white hover:scale-105'
              }`}
            >
              {isLoading ? 'WORKING...' : (mode === 'interactive' ? 'DEPLOY ASSESSMENT' : 'SAVE MARKS')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
