import React, { useState } from 'react';
import { FaUserCheck, FaMapMarkerAlt, FaChartLine, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaMoon, FaSun } from 'react-icons/fa';
import { MdFace, MdLogin, MdPersonAddAlt1 } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const SmartAttendLanding = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((current) => !current);

  const theme = isDark
    ? {
        bg: 'bg-slate-950 text-slate-100',
        surface: 'bg-slate-900/80 border border-slate-800',
        muted: 'text-slate-400',
        accent: 'from-emerald-500 via-cyan-500 to-blue-500',
        chip: 'bg-slate-900 text-emerald-300 border border-emerald-500/30',
        outline: 'border-slate-800',
        hero: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
        buttonPrimary: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
        buttonSecondary: 'bg-transparent text-emerald-300 border border-emerald-500/40 hover:border-emerald-300',
      }
    : {
        bg: 'bg-white text-slate-900',
        surface: 'bg-white/90 border border-slate-200',
        muted: 'text-slate-500',
        accent: 'from-emerald-500 via-cyan-500 to-blue-500',
        chip: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        outline: 'border-slate-200',
        hero: 'bg-gradient-to-br from-emerald-50 via-white to-cyan-50',
        buttonPrimary: 'bg-slate-900 text-white hover:bg-slate-800',
        buttonSecondary: 'bg-white text-slate-900 border border-slate-200 hover:border-slate-400',
      };

  return (
    <div className={`min-h-screen w-full ${theme.bg} font-sans`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4 { font-family: 'Manrope', sans-serif; }
      `}</style>

      <header className={`${theme.hero} border-b ${theme.outline}`}>
        <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${theme.accent}`}>
              <FaUserCheck className="text-white text-xl" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Smart Attend</p>
              <p className="text-lg font-semibold">Campus Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`h-10 w-10 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900 text-amber-300' : 'bg-white text-slate-900'} border ${theme.outline}`}
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${theme.buttonSecondary}`}
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${theme.buttonPrimary}`}
            >
              Start Free
            </button>
          </div>
        </nav>

        <div className="container mx-auto px-4 pb-20 pt-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <p className={`text-xs uppercase tracking-[0.4em] ${theme.muted}`}>Unified attendance stack</p>
              <h1 className="text-4xl md:text-6xl font-semibold leading-tight mt-4">
                See every class, every student, in real time.
              </h1>
              <p className={`text-lg mt-6 max-w-xl ${theme.muted}`}>
                Smart Attend turns check-ins into verified presence. Use face matching, GPS boundaries, and live analytics to automate every session.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <span className={`px-4 py-2 rounded-full text-xs font-semibold ${theme.chip}`}>Face ID validation</span>
                <span className={`px-4 py-2 rounded-full text-xs font-semibold ${theme.chip}`}>Geo-fenced sessions</span>
                <span className={`px-4 py-2 rounded-full text-xs font-semibold ${theme.chip}`}>Instant alerts</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-10">
                <button
                  onClick={() => navigate('/login')}
                  className={`px-6 py-3 rounded-full font-semibold ${theme.buttonPrimary}`}
                >
                  Launch Dashboard
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className={`px-6 py-3 rounded-full font-semibold ${theme.buttonSecondary}`}
                >
                  Book a Demo
                </button>
              </div>
            </div>
            <div className={`rounded-3xl p-6 ${theme.surface}`}>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-dashed border-slate-300/40 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live room</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold">CS-101</p>
                      <p className={theme.muted}>72 / 75 present</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-emerald-400/20 flex items-center justify-center">
                      <FaChartLine className="text-emerald-400 text-2xl" />
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Today’s insights</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-slate-400">Late arrivals</p>
                      <p className="text-2xl font-semibold">4</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Auto approvals</p>
                      <p className="text-2xl font-semibold">98%</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="/smart-attend-features.svg"
                    alt="Smart Attend features"
                    className="w-full h-52 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <div className={`rounded-3xl p-8 ${theme.surface}`}>
              <h2 className="text-3xl md:text-4xl font-semibold">How it works</h2>
              <div className="mt-8 space-y-6">
                {[
                  { title: 'Create classes', text: 'Build schedules, add rosters, and define attendance rules.' },
                  { title: 'Verify instantly', text: 'Face match + GPS confirm the right student in the right room.' },
                  { title: 'Act on insights', text: 'Real-time dashboards highlight trends, risks, and action items.' },
                ].map((item, index) => (
                  <div key={item.title} className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${theme.chip}`}>
                      0{index + 1}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{item.title}</p>
                      <p className={theme.muted}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-[0.4em] ${theme.muted}`}>Why teams switch</p>
              <h2 className="text-3xl md:text-4xl font-semibold mt-3">Everything your attendance workflow needs.</h2>
              <div className="grid sm:grid-cols-2 gap-5 mt-8">
                {[
                  { icon: <MdFace />, title: 'Face Verification', text: 'Eliminate proxies with secure recognition.' },
                  { icon: <FaMapMarkerAlt />, title: 'Geo Attendance', text: 'Only confirm students inside boundaries.' },
                  { icon: <FaUserShield />, title: 'Role Control', text: 'Granular permissions for each role.' },
                  { icon: <FaChartLine />, title: 'Smart Analytics', text: 'Spot trends, not just totals.' },
                ].map((item) => (
                  <div key={item.title} className={`rounded-2xl p-5 ${theme.surface}`}>
                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 text-xl">
                      {item.icon}
                    </div>
                    <p className="mt-4 text-lg font-semibold">{item.title}</p>
                    <p className={theme.muted}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`py-20 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { icon: <FaChalkboardTeacher />, title: 'Teachers', text: 'Start classes in seconds and focus on teaching.' },
                { icon: <FaUserGraduate />, title: 'Students', text: 'One tap check-ins with instant confirmations.' },
                { icon: <FaUserShield />, title: 'Admins', text: 'Audit-ready logs and campus-wide compliance.' },
              ].map((item) => (
                <div key={item.title} className={`rounded-3xl p-8 ${theme.surface}`}>
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">{item.title}</h3>
                  <p className={`mt-3 ${theme.muted}`}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className={`rounded-[32px] p-10 md:p-14 ${theme.surface}`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div>
                <p className={`text-xs uppercase tracking-[0.4em] ${theme.muted}`}>Launch faster</p>
                <h2 className="text-3xl md:text-4xl font-semibold mt-3">Ready to run attendance on autopilot?</h2>
                <p className={`mt-4 text-lg ${theme.muted}`}>
                  Move from manual sheets to verified sessions in a single week.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className={`px-8 py-4 rounded-full font-semibold ${theme.buttonPrimary}`}>Start now</button>
                <button className={`px-8 py-4 rounded-full font-semibold ${theme.buttonSecondary}`}>Talk to sales</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={`${isDark ? 'bg-slate-950' : 'bg-white'} border-t ${theme.outline}`}>
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${theme.accent}`}>
                <FaUserCheck className="text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold">Smart Attend</p>
                <p className={`text-sm ${theme.muted}`}>© 2025 All rights reserved</p>
              </div>
            </div>
            <p className={`mt-4 ${theme.muted}`}>Attendance intelligence for modern campuses.</p>
          </div>
          <div className={`text-sm ${theme.muted}`}>
            <p className="font-semibold text-slate-400">Product</p>
            <p className="mt-3">Face matching</p>
            <p>Geo attendance</p>
            <p>Analytics</p>
          </div>
          <div className={`text-sm ${theme.muted}`}>
            <p className="font-semibold text-slate-400">Company</p>
            <p className="mt-3">About</p>
            <p>Contact</p>
            <p>Security</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartAttendLanding;