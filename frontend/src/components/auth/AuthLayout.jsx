import React from 'react';
import { Activity, ShieldCheck, Zap, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeProvider';

const AuthLayout = ({ children, title, subtitle, icon: Icon = Activity }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-500 overflow-hidden ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      
      {/* Left Column: Premium Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative overflow-hidden bg-[#020617] neural-mesh">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-[30%] -left-[30%] w-[80%] h-[80%] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[30%] -right-[30%] w-[80%] h-[80%] bg-brand-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

        {/* Branding Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col p-16 justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.3)] group cursor-pointer hover:border-brand-primary/50 transition-colors duration-500">
              <Activity className="text-white group-hover:animate-pulse" size={24} />
            </div>
            <span className="font-black text-3xl tracking-tighter text-gradient">SmartAttend</span>
          </div>

          <div className="max-w-md relative">
            <h2 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-12 animate-in slide-in-from-left duration-700">
              THE <br />
              <span className="text-gradient">INTELLIGENT</span> <br />
              VERIFICATION.
            </h2>
            
            <div className="space-y-8 glass-card-elite p-8 rounded-[32px] border-white/5 bg-white/5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center flex-shrink-0 animate-float">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-black text-[11px] uppercase tracking-widest mb-1 text-slate-200">State-of-the-Art Security</h4>
                  <p className="text-sm font-semibold text-slate-400 leading-relaxed">Advanced biometric verification with world-class face recognition technology.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-secondary/20 text-brand-secondary flex items-center justify-center flex-shrink-0 animate-float" style={{ animationDelay: '1s' }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-black text-[11px] uppercase tracking-widest mb-1 text-slate-200">Real-time Efficiency</h4>
                  <p className="text-sm font-semibold text-slate-400 leading-relaxed">Automated attendance management providing instant insights for faculty and students.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 opacity-40 text-[9px] font-black uppercase tracking-[0.4em]">
            <span>Secure.</span>
            <span>Intelligent.</span>
            <span>Fast.</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative neural-mesh">
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate('/')} 
          className={`absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-x-2 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-brand-primary'}`}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        
        {/* Subtle Background Wash for mobile/fallback */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 overflow-hidden">
          <div className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-brand-primary rounded-full blur-[150px] opacity-20"></div>
          <div className="absolute -bottom-24 -right-20 w-[500px] h-[500px] bg-brand-secondary rounded-full blur-[150px] opacity-20"></div>
        </div>

        <div className="w-full max-w-xl z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-10">
            <div className={`inline-flex items-center justify-center h-16 w-16 rounded-3xl mb-6 shadow-2xl transition-transform hover:scale-110 ${
              isDark ? 'bg-white/5 border border-white/10 text-brand-primary' : 'bg-white border border-slate-100 text-brand-primary hover:shadow-brand-primary/20'
            }`}>
              <Icon size={32} />
            </div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h1>
            <p className={`text-lg font-bold leading-relaxed max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          </div>

          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
