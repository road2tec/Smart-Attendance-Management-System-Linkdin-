import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { fetchMyResults } from '../../app/features/results/resultsThunks';
import { getClassroomsByStudent } from '../../app/features/classroom/classroomThunks';
import { 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  FileText,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentAssessmentsPage = () => {
  const { theme, themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector(state => state.auth);
  const { studentResults, loading: resultsLoading } = useSelector(state => state.results || {});
  const classrooms = useSelector(state => state.classrooms.studentClassrooms || []);
  const classroomsLoading = useSelector(state => state.classrooms.isLoading);

  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (user?._id) {
        dispatch(fetchMyResults());
        dispatch(getClassroomsByStudent(user._id));
    }
  }, [dispatch, user?._id]);

  // Fetch real assessments from classrooms
  const upcomingTests = useMemo(() => {
    if (!classrooms || !Array.isArray(classrooms)) return [];
    
    let tests = [];
    classrooms.forEach(cls => {
      if (cls.assessments && cls.assessments.length > 0) {
        cls.assessments.forEach(ass => {
          const testDate = new Date(ass.date);
          const today = new Date();
          const isTodayOrFuture = new Date(testDate).setHours(0,0,0,0) >= today.setHours(0,0,0,0);

          if (isTodayOrFuture) {
            const diffTime = Math.abs(testDate - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Check if already submitted
            const isSubmitted = studentResults?.some(res => 
              String(res.classroom?._id || res.classroom) === String(cls._id) && 
              res.assessmentName?.trim() === ass.title?.trim()
            );

            tests.push({
              id: ass._id,
              classroomId: cls._id,
              title: ass.title,
              type: ass.type,
              courseName: cls.course?.courseName || 'General',
              courseCode: cls.course?.courseCode || 'N/A',
              departmentName: cls.department?.name || 'General Department',
              date: testDate.toLocaleDateString(),
              remaining: "In " + diffDays + " days",
              isSubmitted
            });
          }
        });
      }
    });

    return tests.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [classrooms, studentResults]);

  if (resultsLoading || classroomsLoading) {
    return (
      <div className={currentTheme.background + " min-h-screen p-8 flex items-center justify-center"}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className={currentTheme.background + " min-h-screen p-4 md:p-8 font-sans"}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className={"text-3xl md:text-4xl font-extrabold tracking-tight " + currentTheme.text + " mb-2"}>
              My Upcoming Tests
            </h1>
            <p className={currentTheme.secondaryText + " text-lg"}>
              Stay on top of your upcoming exams and quizzes.
            </p>
          </div>
          
          <div className={"flex p-1 rounded-2xl " + (theme === 'dark' ? "bg-[#121A22]" : "bg-slate-100 shadow-inner")}>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={"px-6 py-2 rounded-xl text-sm font-bold transition-all " + (
                activeTab === 'upcoming' 
                ? (theme === 'dark' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-indigo-600 text-white shadow-md shadow-indigo-200")
                : (theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-900")
              )}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={"px-6 py-2 rounded-xl text-sm font-bold transition-all " + (
                activeTab === 'history' 
                ? (theme === 'dark' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-indigo-600 text-white shadow-md shadow-indigo-200")
                : (theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-900")
              )}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'upcoming' ? (
          /* UPCOMING TESTS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTests.length > 0 ? (
              upcomingTests.map(test => (
                <div 
                  key={test.id}
                  className={"group p-6 rounded-3xl border transition-all " + (
                    theme === 'dark' ? "bg-[#121A22]/80 border-[#1E2733] hover:border-brand-primary/50" : "bg-white border-slate-100 hover:border-indigo-200 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={"p-4 rounded-2xl " + (
                      theme === 'dark' ? "bg-brand-primary/10 text-brand-primary" : "bg-indigo-50 text-indigo-600"
                    )}>
                      <ClipboardCheck size={24} />
                    </div>
                    <span className={"text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md " + (
                      theme === 'dark' ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {test.type}
                    </span>
                  </div>
                  
                  <h3 className={"text-lg font-bold mb-1 truncate " + currentTheme.text + " group-hover:text-brand-primary transition-colors"}>
                    {test.title}
                  </h3>
                  <p className={"text-xs font-semibold mb-6 " + currentTheme.secondaryText}>
                    [{test.departmentName}] • {test.courseName}
                  </p>
                  
                  <div className={"space-y-3 pt-4 border-t border-slate-200 " + (theme === 'dark' ? "dark:border-[#1E2733]/50" : "")}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className={currentTheme.secondaryText} />
                          <span className={"font-medium " + currentTheme.text}>{test.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className={currentTheme.secondaryText} />
                          <span className={"font-bold " + (theme === 'dark' ? "text-brand-light" : "text-brand-primary")}>{test.remaining}</span>
                        </div>
                      </div>
                      {test.isSubmitted ? (
                        <div className={"px-4 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 " + (
                          theme === 'dark' ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                        )}>
                          <CheckCircle size={16} />
                          Completed
                        </div>
                      ) : (
                        <button 
                          onClick={() => navigate(`/student/quiz/${test.classroomId}/${test.id}`)}
                          className={"px-4 py-2 rounded-xl text-sm font-bold transition-all " + (
                            theme === 'dark' 
                            ? "bg-brand-primary text-white hover:bg-brand-light shadow-md shadow-brand-primary/20" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
                          )}
                        >
                          Attempt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
                <div className={"col-span-full py-20 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed " + (
                  theme === 'dark' ? "border-[#1E2733] bg-[#121A22]/30" : "border-slate-200 bg-slate-50/30"
                )}>
                   <Calendar className={"h-16 w-16 mb-4 opacity-20 " + currentTheme.text} />
                   <h3 className={"text-xl font-bold " + currentTheme.text}>No tests coming up</h3>
                   <p className={"text-sm mt-1 " + currentTheme.secondaryText}>Enjoy the free time! Check back later for updates.</p>
                </div>
            )}
          </div>
        ) : (
          /* COMPLETED TESTS LIST */
          <div className="space-y-6">
            {studentResults && studentResults.length > 0 ? (
              <div className={"overflow-hidden rounded-3xl border " + (theme === 'dark' ? "border-[#1E2733]/50 bg-[#121A22]/50" : "border-slate-100 bg-white shadow-sm")}>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className={"border-b " + (theme === 'dark' ? "border-[#1E2733]" : "border-slate-200") + " text-xs uppercase tracking-wider " + currentTheme.secondaryText}>
                      <tr>
                        <th className="px-8 py-5">Test Name</th>
                        <th className="px-8 py-5">Subject</th>
                        <th className="px-8 py-5">My Score</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-[#1E2733]/50">
                      {studentResults.map((result, idx) => {
                        const scorePercentage = result.totalMarks > 0 ? ((result.obtainedMarks ?? result.marksObtained ?? 0) / result.totalMarks) * 100 : 0;
                        const isPass = scorePercentage >= 40;
                        return (
                          <tr key={result._id || idx} className={"group transition-all " + (theme === 'dark' ? "hover:bg-[#121A22]" : "hover:bg-slate-50")}>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={"p-3 rounded-xl " + (
                                  isPass 
                                    ? (theme === 'dark' ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                                    : (theme === 'dark' ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600")
                                )}>
                                  <FileText size={20} />
                                </div>
                                <div>
                                  <h4 className={"text-base font-bold " + currentTheme.text}>{result.assessmentName || result.testName || 'Assessment'}</h4>
                                  <p className={"text-xs mt-0.5 " + currentTheme.secondaryText}>{new Date(result.publishedAt || result.date || result.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </td>
                            <td className={"px-8 py-6 text-sm font-medium " + currentTheme.secondaryText}>
                                {result.classroom?.course?.courseName || 'General'}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <span className={"text-lg font-black " + currentTheme.text}>{result.obtainedMarks ?? result.marksObtained ?? 0}<span className="text-sm font-medium opacity-50">/{result.totalMarks}</span></span>
                                <span className={"text-xs font-bold px-2 py-0.5 rounded-md " + (
                                  theme === 'dark' ? "bg-[#1E2733] shadow-sm" : "bg-slate-100"
                                ) + " " + currentTheme.text}>
                                  {Math.round(scorePercentage)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => navigate('/student/results')}
                                className={"inline-flex items-center gap-1.5 text-sm font-bold transition-all " + (
                                  theme === 'dark' ? "text-brand-light hover:text-white" : "text-indigo-600 hover:text-indigo-800"
                                )}
                              >
                                View Results <ChevronRight size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
                <div className={"py-20 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed " + (
                  theme === 'dark' ? "border-[#1E2733] bg-[#121A22]/30" : "border-slate-200 bg-slate-50/30"
                )}>
                   <Award className={"h-16 w-16 mb-4 opacity-20 " + currentTheme.text} />
                   <h3 className={"text-xl font-bold " + currentTheme.text}>No tests completed yet</h3>
                   <p className={"text-sm mt-1 " + currentTheme.secondaryText}>Once you finish a test, your scores will appear here.</p>
                </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentAssessmentsPage;
