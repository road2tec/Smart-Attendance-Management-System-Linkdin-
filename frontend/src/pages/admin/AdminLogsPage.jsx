import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Download, RefreshCw, ShieldAlert, ShieldOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';
import { fetchFailedFaceAttempts, fetchLogsSummary, fetchRecognitionAttempts } from '../../app/features/logs/logsThunks';

const AdminLogsPage = () => {
  const dispatch = useDispatch();
  const { themeConfig, theme, isDark } = useTheme();
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

  const inputClass = `w-full rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`;

  return (
    <div className={`min-h-screen p-6 ${themeConfig[theme].gradientBackground}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${themeConfig[theme].text}`}>Security Logs</h1>
            <p className={themeConfig[theme].secondaryText}>
              Attendance attempts where facial recognition failed or the person was not recognised.
            </p>
          </div>
          <button
            onClick={loadData}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <ShieldOff size={18} className={isDark ? 'text-red-400' : 'text-red-600'} />
              <span className={themeConfig[theme].secondaryText}>Total Failed Attempts (All Time)</span>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{summary.totalFailed}</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert size={18} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <span className={themeConfig[theme].secondaryText}>Failed Attempts Today</span>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{summary.todayFailed}</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <ShieldOff size={18} className={isDark ? 'text-fuchsia-400' : 'text-fuchsia-600'} />
              <span className={themeConfig[theme].secondaryText}>Unknown Face Matches (All Time)</span>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-fuchsia-400' : 'text-fuchsia-600'}`}>{summary.totalUnknownRecognition || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`${themeConfig[theme].card} rounded-xl p-5`}>
          <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className={`block text-xs mb-1 ${themeConfig[theme].secondaryText}`}>From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className={`block text-xs mb-1 ${themeConfig[theme].secondaryText}`}>To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-[#506EE5] text-white hover:bg-[#425dc7]' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Apply Filter
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setTimeout(() => {
                    dispatch(fetchFailedFaceAttempts({}));
                    dispatch(fetchRecognitionAttempts({ resultType: 'unknown' }));
                  }, 0);
                  dispatch(fetchLogsSummary());
                }}
                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Logs table */}
        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${themeConfig[theme].text}`}>
              Failed Face Attempts
              {total > 0 && (
                <span className={`ml-2 text-sm font-normal ${themeConfig[theme].secondaryText}`}>
                  ({total} total{attempts.length < total ? `, showing ${attempts.length}` : ''})
                </span>
              )}
            </h2>
            {attempts.length > 0 && (
              <button
                onClick={exportCsv}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Download size={15} />
                Export CSV
              </button>
            )}
          </div>

          {isLoading ? (
            <p className={themeConfig[theme].secondaryText}>Loading logs...</p>
          ) : isError ? (
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle size={16} />
              <span>{message}</span>
            </div>
          ) : attempts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-12 gap-3 ${themeConfig[theme].secondaryText}`}>
              <ShieldOff size={40} className="opacity-30" />
              <p>No failed face attempts found{(startDate || endDate) ? ' for the selected date range' : ''}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Date & Time</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Group</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Marked By</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a._id} className={isDark ? 'border-b border-[#1E2733] hover:bg-[#121A22]' : 'border-b border-slate-200 hover:bg-slate-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {a.markedAt ? new Date(a.markedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {a.student ? `${a.student.firstName} ${a.student.lastName}` : <span className="italic opacity-60">Unknown</span>}
                        </div>
                        {a.student?.rollNumber && (
                          <div className={`text-xs ${themeConfig[theme].secondaryText}`}>{a.student.rollNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">{a.classroom?.course?.courseName || '—'}</td>
                      <td className="px-4 py-3">{a.classroom?.group?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          a.status === 'absent'
                            ? isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'
                            : a.status === 'late'
                            ? isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'
                            : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize">{a.markedBy}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{a.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${themeConfig[theme].text}`}>
              Unknown Person Recognition Attempts
              {recognitionTotal > 0 && (
                <span className={`ml-2 text-sm font-normal ${themeConfig[theme].secondaryText}`}>
                  ({recognitionTotal} total{recognitionAttempts.length < recognitionTotal ? `, showing ${recognitionAttempts.length}` : ''})
                </span>
              )}
            </h2>
          </div>

          {recognitionAttempts.length === 0 ? (
            <p className={themeConfig[theme].secondaryText}>No unknown recognition attempts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Date & Time</th>
                    <th className="px-4 py-3 text-left">Similarity</th>
                    <th className="px-4 py-3 text-left">Threshold</th>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {recognitionAttempts.map((item) => (
                    <tr key={item._id} className={isDark ? 'border-b border-[#1E2733] hover:bg-[#121A22]' : 'border-b border-slate-200 hover:bg-slate-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3">{typeof item.similarity === 'number' ? item.similarity.toFixed(4) : '—'}</td>
                      <td className="px-4 py-3">{typeof item.threshold === 'number' ? item.threshold.toFixed(2) : '—'}</td>
                      <td className="px-4 py-3">{item.class?.title || '—'}</td>
                      <td className="px-4 py-3">{item.classroom?.course?.courseName || '—'}</td>
                      <td className="px-4 py-3">{item.source || 'web-client'}</td>
                      <td className="px-4 py-3 max-w-[260px] truncate">{item.note || '—'}</td>
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
