import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeProvider';
import { getClassroomsByStudent } from '../../app/features/classroom/classroomThunks';
import { 
  Users, 
  User, 
  MapPin, 
  Mail, 
  Phone,
  Bookmark,
  Calendar,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';

const StudentGroupPage = () => {
  const { theme, themeConfig } = useTheme();
  const currentTheme = themeConfig[theme];
  const dispatch = useDispatch();
  
  const classrooms = useSelector(state => state.classrooms.studentClassrooms || []);
  const isLoading = useSelector(state => state.classrooms.isLoading);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user?._id) dispatch(getClassroomsByStudent(user._id));
  }, [dispatch, user?._id]);

  // Extract shared group/mentor info from enrolled classrooms
  const groupDetails = useMemo(() => {
    if (!classrooms || classrooms.length === 0) return null;
    
    // Find a sample classroom to get group/department/mentor info
    const sample = classrooms[0];
    return {
      groupName: sample.group?.name || 'TBA',
      departmentName: sample.department?.name || 'Computer Science',
      departmentCode: sample.department?.code || 'CS',
      mentorName: sample.group?.mentor ? (sample.group.mentor.firstName + ' ' + sample.group.mentor.lastName) : 'Prof. Punam Channe',
      mentorEmail: sample.group?.mentor?.email || 'mentor@mail.com',
      studentsCount: sample.group?.students?.length || 0,
      maxCapacity: sample.group?.maxCapacity || 60
    };
  }, [classrooms]);

  if (isLoading) {
    return (
      <div className={currentTheme.background + " min-h-screen p-8 flex items-center justify-center"}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className={currentTheme.background + " min-h-screen p-4 md:p-8 font-sans"}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Title */}
        <div>
          <h1 className={"text-4xl font-extrabold tracking-tight " + currentTheme.text + " mb-2"}>
            My Batch & Teachers
          </h1>
          <p className={currentTheme.secondaryText + " text-lg"}>
            Stay in touch with your teachers and Batchmates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Group & Dept Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* GROUP INFOGRAPHIC */}
            <div className={"relative overflow-hidden p-8 rounded-[2rem] border transition-all " + (
              theme === 'dark' 
                ? "bg-[#121A22]/80 border-[#1E2733] shadow-2xl" 
                : "bg-white border-slate-100 shadow-xl shadow-indigo-100/30"
            )}>
              {/* Background gradient blur */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className={"h-24 w-24 shrink-0 rounded-3xl flex items-center justify-center text-4xl font-black " + (
                  theme === 'dark' ? "bg-[#0F172A] text-brand-primary border border-white/5 shadow-2xl" : "bg-slate-50 text-indigo-600 border border-slate-100 shadow-md"
                )}>
                  {groupDetails?.groupName.charAt(0) || 'G'}
                </div>
                
                <div className="flex-1 space-y-6">
                  <div>
                    <span className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest " + (
                      theme === 'dark' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    )}>
                      <Layers size={14} /> My Batch
                    </span>
                    <h2 className={"text-3xl font-black mt-2 tracking-tight " + currentTheme.text}>Batch {groupDetails?.groupName}</h2>
                    <p className={"text-lg font-medium mt-1 " + currentTheme.secondaryText}>{groupDetails?.departmentName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className={"text-[10px] font-black uppercase tracking-widest " + (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>Department</p>
                      <p className={"text-base font-bold " + currentTheme.text}>{groupDetails?.departmentCode}</p>
                    </div>
                    <div className="space-y-1">
                      <p className={"text-[10px] font-black uppercase tracking-widest " + (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>Total Students</p>
                      <p className={"text-base font-bold " + currentTheme.text}>{groupDetails?.studentsCount} Students</p>
                    </div>
                    <div className="space-y-1">
                      <p className={"text-[10px] font-black uppercase tracking-widest " + (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>Session</p>
                      <p className={"text-base font-bold " + currentTheme.text}>2024-25</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CLASSROOMS AT A GLANCE */}
            <div className={"p-8 rounded-[2rem] border " + (
              theme === 'dark' ? "bg-[#121A22]/50 border-[#1E2733]/50" : "bg-white border-slate-100"
            )}>
              <h3 className={"text-xl font-bold mb-6 tracking-tight " + currentTheme.text + " flex items-center gap-2"}>
                <BookOpen size={22} className="text-brand-primary" />
                My Subjects
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classrooms?.map((cls, idx) => (
                  <div key={idx} className={"p-5 rounded-2xl border transition-all " + (
                    theme === 'dark' ? "bg-[#0F172A] border-white/5" : "bg-slate-50 border-slate-100"
                  )}>
                    <h4 className={"text-base font-bold truncate " + currentTheme.text}>{cls.course?.courseName}</h4>
                    <p className={"text-xs font-medium mt-1 " + currentTheme.secondaryText}>{cls.course?.courseCode}</p>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Mentor Details */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* MENTOR CARD */}
            <div className={"p-8 rounded-[2rem] border sticky top-8 transition-all " + (
              theme === 'dark' 
                ? "bg-gradient-to-br from-[#121A22] to-brand-primary/5 border-[#1E2733]" 
                : "bg-gradient-to-br from-white to-indigo-50/50 border-slate-100"
            )}>
              <h3 className={"text-sm font-black uppercase tracking-widest mb-8 " + (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>In-Charge Teacher</h3>
              
              <div className="text-center space-y-6">
                <div className="mx-auto h-28 w-28 rounded-full border-4 p-1 border-brand-primary/20">
                  <div className={"h-full w-full rounded-full flex items-center justify-center text-3xl font-black " + (
                    theme === 'dark' ? "bg-[#0F172A] text-slate-300" : "bg-white text-indigo-600 shadow-sm"
                  )}>
                    <User size={48} />
                  </div>
                </div>
                
                <div>
                  <h3 className={"text-2xl font-black tracking-tight " + currentTheme.text}>{groupDetails?.mentorName}</h3>
                  <p className={"text-sm font-bold tracking-wide mt-1 " + (theme === 'dark' ? "text-brand-light" : "text-brand-primary")}>
                    Batch Teacher
                  </p>
                </div>

                <div className={"space-y-4 pt-8 border-t " + (theme === 'dark' ? "border-[#1E2733]/50" : "border-slate-100")}>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={"p-2 rounded-lg " + (theme === 'dark' ? "bg-[#0F172A]" : "bg-white shadow-sm")}>
                      <Mail size={16} className={currentTheme.secondaryText} />
                    </div>
                    <span className={"font-semibold truncate " + currentTheme.text}>{groupDetails?.mentorEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={"p-2 rounded-lg " + (theme === 'dark' ? "bg-[#0F172A]" : "bg-white shadow-sm")}>
                      <MapPin size={16} className={currentTheme.secondaryText} />
                    </div>
                    <span className={"font-semibold " + currentTheme.text}>Teacher's Office (Room 402)</span>
                  </div>
                </div>

                <button className={"w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all " + (
                   theme === 'dark' 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 border border-white/10" 
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                )}>
                  Send Message
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentGroupPage;
