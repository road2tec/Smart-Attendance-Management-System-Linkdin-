import { useState } from 'react';
import { X, Send, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function SolveTestModal({ assessment, classroomId, isDark, onClose, onSubmitted }) {
    const [answers, setAnswers] = useState(assessment.questions.map(q => ({ questionId: q.id, content: '' })));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleAnswerChange = (idx, value) => {
        const newAnswers = [...answers];
        newAnswers[idx].content = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.some(a => !a.content.trim())) {
            setError('Please answer all questions before submitting.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/assessments/classroom/${classroomId}/assessment/${assessment._id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answers })
            });

            if (response.ok) {
                onSubmitted?.();
                onClose();
            } else {
                const data = await response.json();
                setError(data.message || 'Submission failed');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inp = `w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all outline-none ${
        isDark
            ? 'bg-[#0A0E13] border border-[#1E2733] text-white placeholder:text-gray-700 focus:border-brand-primary/50'
            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white'
    }`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] ${isDark ? 'bg-[#121A22] border border-[#1E2733]' : 'bg-white border border-gray-100'}`}>
                
                {/* Header */}
                <div className={`px-8 py-6 border-b flex items-center justify-between ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                                {assessment.type}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Clock size={10} /> Due: {new Date(assessment.dueDate).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{assessment.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Instructions */}
                {assessment.instructions && (
                    <div className={`px-8 py-4 ${isDark ? 'bg-white/5' : 'bg-indigo-50/50'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-1">Instructions:</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{assessment.instructions}</p>
                    </div>
                )}

                {/* Questions Body */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20 flex items-center gap-2">
                             <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {assessment.questions.map((q, idx) => (
                        <div key={q.id} className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-black shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {q.text}
                                    </p>
                                    <span className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest mt-1 block">
                                        {q.marks} Points
                                    </span>
                                </div>
                            </div>

                            <textarea 
                                className={`${inp} min-h-[120px] resize-none overflow-hidden`}
                                placeholder="Type your answer here..."
                                value={answers[idx].content}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className={`px-8 py-6 border-t flex items-center justify-between ${isDark ? 'border-[#1E2733]' : 'border-gray-50'}`}>
                    <p className="text-[10px] font-bold text-gray-500">
                        {answers.filter(a => a.content.trim()).length} of {assessment.questions.length} Questions Answered
                    </p>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-premium px-8 py-3 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                             <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                        ) : (
                            <><Send size={16} /> Submit Test</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
