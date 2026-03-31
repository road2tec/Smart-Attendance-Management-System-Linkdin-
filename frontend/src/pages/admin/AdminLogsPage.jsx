import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  ShieldOff, 
  Calendar, 
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';
import { fetchFailedFaceAttempts, fetchLogsSummary, fetchRecognitionAttempts } from '../../app/features/logs/logsThunks';

const AdminLogsPage = () => {
  const dispatch = useDispatch();
  const { theme, themeConfig, isDark } = useTheme();
  const { attempts, total, recognitionAttempts, recognitionTotal, summary, isLoading, isError, message } = useSelector((s) => s.logs);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    dispatch(fetchFailedFaceAttempts(params));
    dispatch(fetchRecognitionAttempts({ ...params, resultType: 'unknown' }));
    dispatch(fetchLogsSummary());
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadData();
  };

  const exportCsv = () => {
    if (!attempts.length) return;
    const headers = ['Date & Time', 'Student Name', 'Email', 'Roll No', 'Course', 'Group', 'Status', 'Marked By', 'Notes'];
    const rows = attempts.map((a) => [
      a.markedAt ? new Date(a.markedAt).toLocaleString() : '',
      `${a.student?.firstName || ''} ${a.student?.lastName || ''}`.trim(),
      a.student?.email || '',
      a.student?.rollNumber || '',
      a.classroom?.course?.courseName || '',
      a.classroom?.group?.name || '',
      a.status,
      a.markedBy,
      a.notes || '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-face-attempts-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 ${isDark 
    ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:ring-2 focus:ring-brand-primary/20' 
    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-primary/20'}`;

  return (
    <div className={`min-h-screen p-8 transition-colors duration-500 ${isDark ? 'bg-dark-bg text-slate-100' : 'bg-light-bg text-slate-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Security & Monitoring Logs</h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Audit facial recognition attempts and security violations across campus.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Re-sync Logs
            </button>
            <button
              onClick={exportCsv}
              disabled={attempts.length === 0}
              className="btn-premium flex items-center gap-2"
            >
              <Download size={16} />
              Export Dataset
            </button>
          </div>
        </div>

        {/* Summary Info-cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-l-4 border-l-red-500 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <ShieldOff size={22} />
              </div>
              <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Failed Matches</span>
            </div>
            <p className="text-4xl font-bold tracking-tight">{summary.totalFailed || 0}</p>
            <p className="text-xs mt-2 text-slate-500">Total lifetime verified violations</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-l-amber-500 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={22} />
              </div>
              <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Violations Today</span>
            </div>
            <p className="text-4xl font-bold tracking-tight">{summary.todayFailed || 0}</p>
            <p className="text-xs mt-2 text-slate-500">Recorded in the last 24 hours</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-l-brand-primary rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <CheckCircle2 size={22} />
              </div>
              <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Unknown Entities</span>
            </div>
            <p className="text-4xl font-bold tracking-tight">{summary.totalUnknownRecognition || 0}</p>
            <p className="text-xs mt-2 text-slate-500">Faces not found in existing registries</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="glass-card p-6 rounded-2xl">
          <form onSubmit={handleFilter} className="flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">
                <Calendar size={12} className="inline mr-1" /> Start Date
              </label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">
                <Calendar size={12} className="inline mr-1" /> End Date
              </label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
            <button type="submit" className="btn-premium px-8 flex items-center gap-2">
              <Filter size={18} /> Apply Filters
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  dispatch(fetchFailedFaceAttempts({}));
                }}
                className={`px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Table View */}
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">Failed Recognition Events</h2>
            {total > 0 && <span className="text-xs py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary font-bold">Total: {total} Records</span>}
          </div>

          {isLoading ? (
            <div className="p-20 text-center"><RefreshCw size={40} className="animate-spin mx-auto text-brand-primary mb-4" /><p className="text-slate-500">Parsing biometric data...</p></div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500"><AlertTriangle size={48} className="mx-auto mb-4" /><p>{message}</p></div>
          ) : attempts.length === 0 ? (
            <div className="p-20 text-center text-slate-500"><ShieldOff size={48} className="mx-auto mb-4 opacity-20" /><p>No security violations found in this range.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className={`uppercase tracking-widest text-[10px] font-bold ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Candidate / Student</th>
                    <th className="px-6 py-4">Academic Group</th>
                    <th className="px-6 py-4">Incident Status</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attempts.map((a) => (
                    <tr key={a._id} className={`transition-colors duration-200 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 font-mono text-xs opacity-60">
                         {a.markedAt ? new Date(a.markedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                              {a.student?.firstName?.[0] || 'U'}
                           </div>
                           <div>
                              <p className="font-bold">{a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown Entity'}</p>
                              <p className="text-[10px] opacity-50 uppercase tracking-tighter">{a.student?.rollNumber || 'GUEST'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{a.classroom?.course?.courseName || 'N/A'}</p>
                        <p className="text-[10px] opacity-40 italic">{a.classroom?.group?.name || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          a.status === 'absent' ? 'bg-red-500/10 text-red-400' : 
                          a.status === 'late' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 opacity-70">
                        {a.markedBy}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-brand-primary hover:underline text-xs font-bold">View Image</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogsPage;
