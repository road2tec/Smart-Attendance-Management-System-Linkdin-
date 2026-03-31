import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  LineChart, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Zap, 
  Camera, 
  ArrowRight,
  Globe,
  Activity,
  Menu,
  X,
  Shield,
  Moon,
  Sun,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeProvider';

const SmartAttendLanding = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Statistics', href: '#stats' },
    { name: 'Security', href: '#security' },
  ];

  // Helper for mixed color gradients (Lavender to Blue)
  const premiumGradient = "bg-gradient-to-r from-purple-600 to-blue-600";
  const softLavenderWash = isDark ? "bg-[#020617]" : "bg-[#f5f3ff]";

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 font-sans neural-mesh ${isDark ? 'bg-[#020617] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isDark ? 'bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'bg-white/80 backdrop-blur-2xl border-b border-slate-200/40 shadow-sm'}`}>
        <div className="container mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className={`h-12 w-12 rounded-2xl ${premiumGradient} flex items-center justify-center shadow-2xl shadow-purple-500/40 group-hover:rotate-12 transition-transform duration-500`}>
              <Activity className="text-white animate-pulse" size={24} />
            </div>
            <span className="font-black text-3xl tracking-tighter text-gradient">SmartAttend</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`text-xs font-black uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em] ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-purple-600'}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-purple-600'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'text-white hover:text-purple-400' : 'text-slate-700 hover:text-purple-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="btn-premium shadow-2xl"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden absolute top-20 left-0 w-full p-8 animate-in slide-in-from-top-5 duration-300 ${isDark ? 'bg-[#0f172a] border-b border-white/10 shadow-2xl' : 'bg-white border-b border-slate-200 shadow-xl'}`}>
            <div className="flex flex-col gap-6 font-bold text-center">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl hover:text-purple-600"
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />
              <button onClick={() => navigate('/login')} className="w-full py-4 text-center text-xl">Log In</button>
              <button onClick={() => navigate('/signup')} className={`${premiumGradient} w-full py-5 rounded-3xl text-white text-xl`}>Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section (Neural Mesh + Glowing Blobs) */}
      <header className={`relative overflow-hidden pt-56 pb-32 px-8 ${isDark ? 'bg-transparent' : 'bg-brand-light/20'}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            {/* Animated Grid Overlay */}
            <div className="absolute inset-0 opacity-20 dark:opacity-40 neural-mesh"></div>
        </div>

        <div className="container mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 text-center lg:text-left space-y-12">
            <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase border animate-fade-in ${isDark ? 'bg-white/5 text-purple-400 border-white/10' : 'bg-white text-purple-600 border-purple-100 shadow-sm'}`}>
              <ShieldCheck size={14} className="animate-pulse" /> Modern Face Attendance
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] text-slate-900 dark:text-white">
              The Future of <br />
              <span className="text-gradient">Attendance</span> <br />
              is Biometric.
            </h1>
            
            <p className={`text-xl md:text-2xl max-w-2xl leading-relaxed font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              No more fake attendance or manual logs. Mark your presence easily with our high-precision face scan system.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-6">
              <button 
                onClick={() => navigate('/login')}
                className="btn-premium group"
              >
                Go to Dashboard <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="btn-outline-premium"
              >
                Create Account
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="flex flex-col gap-1">
                 <span className="text-2xl font-black">99.9%</span>
                 <span className="text-[9px] font-black uppercase tracking-widest">Accuracy</span>
               </div>
               <div className="w-px h-10 bg-slate-300 dark:bg-white/10"></div>
               <div className="flex flex-col gap-1">
                 <span className="text-2xl font-black">200ms</span>
                 <span className="text-[9px] font-black uppercase tracking-widest">Recognition</span>
               </div>
            </div>
          </div>

          {/* Interactive Elite Mockup */}
          <div className="flex-1 w-full max-w-xl relative group">
             <div className="absolute -inset-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-[60px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
             <div className="glass-card-elite p-3 rounded-[56px] relative overflow-hidden animate-float">
                <div className="bg-[#020617] rounded-[48px] overflow-hidden aspect-[4/5] relative">
                   <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                      alt="Neural Scan Face" 
                      className="w-full h-full object-cover opacity-60"
                   />
                   {/* AI Scanning Visuals */}
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"></div>
                   <div className="scan-line"></div>
                   
                   <div className="absolute top-10 left-10 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">ID Verified</span>
                      </div>
                   </div>

                   <div className="absolute bottom-10 left-10 right-10 p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-white/50 uppercase tracking-widest">
                         <span>Neural Match</span>
                         <span className="text-emerald-400">98.4%</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_#10b981]"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Statistics Section (Deep Space) */}
      <section id="stats" className={`py-40 px-6 relative z-10 border-t border-b ${isDark ? 'bg-[#020617] border-white/5' : 'bg-brand-light/20 border-purple-100/50'}`}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
            {[
              { label: 'Verified Campuses', val: '320+' },
              { label: 'Face Inferences', val: '4.5M+' },
              { label: 'Active Students', val: '150K+' },
              { label: 'System Precision', val: '99.9%' },
            ].map((s) => (
              <div key={s.label} className="group cursor-default">
                <p className="text-6xl lg:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br from-brand-primary to-brand-secondary tracking-tighter group-hover:scale-110 transition-transform duration-500">{s.val}</p>
                <p className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? 'text-slate-500 group-hover:text-purple-400' : 'text-slate-400 group-hover:text-brand-primary'} transition-colors duration-500`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid (Modern Clean White) */}
      <section id="features" className={`py-40 px-6 ${isDark ? 'bg-[#020617] neural-mesh' : 'bg-white neural-mesh'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-28 max-w-4xl mx-auto">
             <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-primary/10 text-brand-primary mb-8">
               <Zap size={24} />
             </div>
             <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Smart System.</h2>
             <p className={`text-xl md:text-2xl leading-relaxed font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Improving education through advanced technology. Experience a simple way to mark attendance safely.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <Camera size={32} className="text-brand-primary" />, 
                title: 'Face Scan Engine', 
                text: 'Fast face scan prevents fake attendance and ensures you are accounted for.' 
              },
              { 
                icon: <MapPin size={32} className="text-brand-secondary" />, 
                title: 'Location Check', 
                text: 'Smart tracking confirms you are physically in class when marking attendance.' 
              },
              { 
                icon: <LineChart size={32} className="text-brand-primary" />, 
                title: 'Easy Reports', 
                text: 'Generate professional records instantly. No more manual paperwork.' 
              },
              { 
                icon: <Users size={32} className="text-brand-secondary" />, 
                title: 'Role Management', 
                text: 'Custom portals for Administrators, Teachers, and Students with simple navigation.' 
              },
              { 
                icon: <ShieldCheck size={32} className="text-brand-primary" />, 
                title: 'Security Audits', 
                text: 'Every log is recorded safely. Protect your institutional data with end-to-end encryption.' 
              },
              { 
                icon: <Globe size={32} className="text-brand-secondary" />, 
                title: 'Anywhere Access', 
                text: 'Access your portal from any device, anywhere, anytime.' 
              },
            ].map((f) => (
              <div key={f.title} className="glass-card-elite p-12 rounded-[48px] group hover:scale-[1.02]">
                <div className={`h-16 w-16 rounded-2xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white shadow-xl border border-slate-100'}`}>
                  {f.icon}
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">{f.title}</h3>
                <p className={`text-lg leading-relaxed font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section (Professional Dark Section) */}
      <section id="security" className={`py-48 px-6 border-t border-b ${isDark ? 'bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#312e81] border-white/10' : 'bg-slate-950 border-white/10'}`}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-32 items-center">
            <div className="text-white">
              <div className={`h-20 w-20 rounded-3xl ${premiumGradient} flex items-center justify-center text-white mb-10 shadow-2xl shadow-purple-600/40`}>
                <Lock size={40} />
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tight leading-[1.1]">Advanced Campus Security.</h2>
              <p className="text-xl md:text-2xl mb-16 leading-relaxed text-slate-400 font-medium">
                Protecting student data is our priority. Our face authentication system uses encrypted neural signatures to ensure identity is never compromised.
              </p>
              <ul className="space-y-8 font-black">
                {[
                  'Secure Data Encryption',
                  'Enhanced Face Matching',
                  'Real-time Campus Guard',
                  'Zero Identity Leakage'
                ].map(item => (
                  <li key={item} className="flex items-center gap-6">
                    <CheckCircle2 className="text-purple-500 shrink-0" size={32} />
                    <span className="text-2xl">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
               <div className="p-16 rounded-[64px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-3xl">
                  <div className={`h-[450px] rounded-[48px] ${premiumGradient} flex items-center justify-center relative overflow-hidden shadow-2xl`}>
                     <ShieldCheck size={260} className="text-white/10 absolute -right-16 -bottom-16" />
                     <ShieldCheck size={160} className="text-white animate-pulse" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-32 px-6 ${isDark ? 'bg-[#020617]' : 'bg-white'}`}>
        <div className="container mx-auto text-center md:text-left">
          <div className="grid md:grid-cols-4 gap-20">
            <div className="col-span-2">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-10">
                <div className={`h-12 w-12 rounded-xl ${premiumGradient} flex items-center justify-center shadow-lg`}>
                  <Activity className="text-white" size={26} />
                </div>
                <span className="font-extrabold text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">SmartAttend</span>
              </div>
              <p className="max-w-md text-slate-400 text-xl leading-relaxed mb-12 font-bold mx-auto md:mx-0">
                 Leading the way in campus monitoring. We verify thousands of sessions every minute for modern universities.
              </p>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-sm mb-12 text-purple-600">Features</h4>
              <ul className="space-y-6 text-slate-400 font-black text-lg">
                <li><a href="#features" className="hover:text-purple-600 transition-colors">Face ID</a></li>
                <li><a href="#features" className="hover:text-purple-600 transition-colors">Campus Monitoring</a></li>
                <li><a href="#security" className="hover:text-purple-600 transition-colors">Security Guard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-sm mb-12 text-purple-600">Legal</h4>
              <ul className="space-y-6 text-slate-400 font-black text-lg">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-40 pt-16 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 text-slate-500 font-black">
             <p className="text-lg">© 2026 SmartAttend. Enhancing Education Safely.</p>
             <div className="flex gap-16 text-xl">
               <a href="#" className="hover:text-purple-600 transition-all underline decoration-2 underline-offset-8">Twitter</a>
               <a href="#" className="hover:text-purple-600 transition-all underline decoration-2 underline-offset-8">LinkedIn</a>
               <a href="#" className="hover:text-purple-600 transition-all underline decoration-2 underline-offset-8">GitHub</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartAttendLanding;