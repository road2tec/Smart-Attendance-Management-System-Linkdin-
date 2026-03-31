import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingUsers, updateUserStatus } from '../../app/features/users/userThunks';
import { useTheme } from '../../context/ThemeProvider';
import { UserCheck, UserX, Clock, Mail, Shield, Building, Search, Filter, ChevronRight, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ApprovalsPage = () => {
    const { isDark } = useTheme();
    const dispatch = useDispatch();
    const { pendingUsers = [], loading } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);
    const isTeacher = currentUser?.role === 'teacher';

    useEffect(() => {
        dispatch(fetchPendingUsers());
    }, [dispatch]);

    const handleAction = async (userId, status) => {
        try {
            const result = await dispatch(updateUserStatus({ userId, status })).unwrap();
            toast.success(result.message || `Registry ${status === 'active' ? 'validated' : 'rejected'} successfully`);
        } catch (error) {
            toast.error(error.message || 'Validation failed');
        }
    };

    if (loading.pending && pendingUsers.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Synchronizing Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 sm:p-10 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
                
                {/* Institutional Header */}
                <div className={`relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className={`absolute top-0 right-0 w-80 h-80 blur-[100px] rounded-full opacity-10 -mr-20 -mt-20 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl ${isDark ? 'bg-brand-primary text-white shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
                                <UserCheck size={32} />
                            </div>
                            <div>
                                <h1 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {isTeacher ? 'Student Admissions' : 'Personnel Approvals'}
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">
                                    {isTeacher ? 'Pending Student Clearance' : 'Registry Verification Bureau'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                              {pendingUsers.length} Pending
                           </div>
                        </div>
                    </div>
                </div>

                {pendingUsers.length === 0 ? (
                    <div className={`p-20 text-center rounded-[3.5rem] border backdrop-blur-md ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className={`inline-flex items-center justify-center h-24 w-24 rounded-[2rem] mb-8 ${isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
                            <Shield size={48} />
                        </div>
                        <h2 className={`text-2xl font-black mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Clearance Initialized</h2>
                        <p className={`text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            All credentials have been successfully processed. No pending dossiers detected in the current cycle.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-8 duration-700">
                        {pendingUsers.map((user) => (
                            <div 
                                key={user._id}
                                className={`group relative p-8 rounded-[3rem] border transition-all duration-500 hover:scale-[1.01] ${
                                    isDark ? 'bg-[#121A22] border-[#1E2733] hover:bg-[#1A242F]' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className={`h-20 w-20 rounded-[1.75rem] flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 transition-transform group-hover:rotate-3 ${
                                            isDark ? 'bg-[#0A0E13] text-brand-primary' : 'bg-gray-50 text-indigo-600'
                                        }`}>
                                            {user.profileImage ? (
                                              <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <span className="text-2xl font-black">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                              <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                  {user.firstName} {user.lastName}
                                              </h3>
                                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.role === 'teacher' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {user.role}
                                              </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    <Mail size={12} className="text-brand-primary" strokeWidth={3} />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    <Building size={12} className="text-brand-primary" strokeWidth={3} />
                                                    {user.department?.name || 'Central Unit'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    <Clock size={12} className="text-brand-primary" strokeWidth={3} />
                                                    Dossier Age: {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                                {user.mobile && (
                                                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                      <Shield size={12} className="text-brand-primary" strokeWidth={3} />
                                                      Verified Contact
                                                  </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleAction(user._id, 'rejected')}
                                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                isDark 
                                                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white shadow-xl shadow-rose-500/5' 
                                                : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-lg shadow-rose-100'
                                            }`}
                                        >
                                            <UserX size={16} strokeWidth={3} />
                                            Deny
                                        </button>
                                        <button
                                            onClick={() => handleAction(user._id, 'active')}
                                            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                                              isDark 
                                              ? 'bg-brand-primary text-white shadow-2xl shadow-brand-primary/30' 
                                              : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 hover:bg-indigo-700'
                                            }`}
                                        >
                                            <UserCheck size={16} strokeWidth={3} />
                                            Certify Access
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalsPage;
