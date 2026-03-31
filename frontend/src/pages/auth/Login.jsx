import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../app/features/auth/authThunks';
import { reset } from '../../app/features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Activity, LogIn, Loader, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';
import AuthLayout from '../../components/auth/AuthLayout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  
  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user) {
      toast.success('Welcome back!');
      setTimeout(() => {
        const role = user.role;
        navigate(`/${role}/dashboard`);
        dispatch(reset());
      }, 1000);
    }
    
    if (isError) {
      toast.error(message || 'Login failed');
      dispatch(reset());
    }
  }, [isSuccess, isError, user, message, navigate, dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter all credentials');
      return;
    }
    dispatch(login({ email, password }));
  };

  const inputClass = `w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-500 outline-none font-bold text-sm ${
    isDark 
      ? 'bg-white/5 border-white/10 text-white focus:border-brand-primary/50 focus:bg-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.02)]' 
      : 'bg-white border-slate-200 text-slate-900 focus:border-brand-primary/40 focus:bg-slate-50 shadow-sm'
  }`;

  const labelClass = `block text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1 ${
    isDark ? 'text-slate-500' : 'text-slate-400'
  }`;

  return (
    <AuthLayout 
      title="Login to Portal" 
      subtitle="Welcome! Sign in to check your attendance and results."
      icon={LogIn}
    >
      <form onSubmit={handleLogin} className="space-y-8">
        <div className="space-y-6">
          <div className="relative group">
            <label className={labelClass}>Email Address</label>
            <div className="absolute top-[38px] left-0 pl-4 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className={inputClass}
            />
          </div>

          <div className="relative group">
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <a href="#" className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] hover:underline">Forgot?</a>
            </div>
            <div className="absolute top-[38px] left-0 pl-4 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              className="absolute top-[38px] right-4 text-slate-400 hover:text-brand-primary transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-premium w-full flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          {isLoading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <>
              <ShieldCheck size={20} className="group-hover:scale-125 transition-transform duration-500" />
              Login Now
            </>
          )}
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>

        <div className="text-center mt-10 p-8 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <p className={`text-sm font-bold mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            New here? Create an account
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 text-brand-primary font-black uppercase tracking-widest hover:underline text-xs"
          >
            Create Account <Activity size={16} />
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;