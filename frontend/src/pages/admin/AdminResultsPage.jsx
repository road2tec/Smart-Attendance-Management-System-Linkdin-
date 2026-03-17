import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, BarChart3, BookOpen, Download, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';
import { adminFetchAllResults } from '../../app/features/results/resultsThunks';

const EXAM_TYPES = ['', 'quiz', 'assignment', 'internal', 'midterm', 'final', 'practical', 'other'];

const AdminResultsPage = () => {
  const dispatch = useDispatch();
  const { themeConfig, theme, isDark } = useTheme();
  const { adminResults, adminResultsTotal, adminResultsSummary, isLoading } = useSelector((s) => s.results);

  const [examType, setExamType] = useState('');
  const [search, setSearch] = useState('');

  const loadData = (params = {}) => dispatch(adminFetchAllResults(params));

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadData({ examType: examType || undefined });
  };

  const filtered = search.trim()
    ? adminResults.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.assessmentName?.toLowerCase().includes(q) ||
          r.student?.firstName?.toLowerCase().includes(q) ||
          r.student?.lastName?.toLowerCase().includes(q) ||
          r.course?.courseName?.toLowerCase().includes(q) ||
          r.course?.courseCode?.toLowerCase().includes(q)
        );
      })
    : adminResults;

  const exportCsv = () => {
    if (!filtered.length) return;
    const headers = ['Assessment', 'Exam Type', 'Student Name', 'Email', 'Roll No', 'Course', 'Group', 'Teacher', 'Obtained', 'Total', 'Percentage', 'Remarks', 'Published At'];
    const rows = filtered.map((r) => {
      const pct = r.totalMarks > 0 ? ((r.obtainedMarks / r.totalMarks) * 100).toFixed(1) : '0.0';
      return [
        r.assessmentName, r.examType,
        `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
        r.student?.email || '', r.student?.rollNumber || '',
        r.course?.courseName || '', r.group?.name || '',
        `${r.teacher?.firstName || ''} ${r.teacher?.lastName || ''}`.trim(),
        r.obtainedMarks, r.totalMarks, `${pct}%`,
        r.remarks || '',
        r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : '',
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectClass = `rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`;
  const inputClass = `w-full rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white placeholder-gray-500' : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400'}`;

  return (
    <div className={`min-h-screen p-6 ${themeConfig[theme].gradientBackground}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${themeConfig[theme].text}`}>Results Overview</h1>
            <p className={themeConfig[theme].secondaryText}>View all published assessment results across all classrooms.</p>
          </div>
          <button
            onClick={() => loadData({ examType: examType || undefined })}
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
              <BookOpen size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={themeConfig[theme].secondaryText}>Total Results</span>
            </div>
            <p className={`text-3xl font-bold ${themeConfig[theme].text}`}>{adminResultsTotal}</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              <span className={themeConfig[theme].secondaryText}>Average Percentage</span>
            </div>
            <p className={`text-3xl font-bold ${themeConfig[theme].text}`}>{adminResultsSummary?.averagePercentage || 0}%</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Award size={18} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <span className={themeConfig[theme].secondaryText}>Highest Percentage</span>
            </div>
            <p className={`text-3xl font-bold ${themeConfig[theme].text}`}>{adminResultsSummary?.highestPercentage || 0}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`${themeConfig[theme].card} rounded-xl p-5`}>
          <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className={`block text-xs mb-1 ${themeConfig[theme].secondaryText}`}>Exam Type</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value)} className={selectClass}>
                {EXAM_TYPES.map((t) => (
                  <option key={t} value={t}>{t === '' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-[#506EE5] text-white hover:bg-[#425dc7]' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Filter
            </button>
            {examType && (
              <button
                type="button"
                onClick={() => { setExamType(''); loadData(); }}
                className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className={`text-lg font-semibold ${themeConfig[theme].text}`}>
              All Results
              {adminResultsTotal > 0 && (
                <span className={`ml-2 text-sm font-normal ${themeConfig[theme].secondaryText}`}>
                  ({adminResultsTotal} total{filtered.length !== adminResults.length ? `, ${filtered.length} shown` : ''})
                </span>
              )}
            </h2>
            <div className="flex gap-3 items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, course..."
                className={`${inputClass} w-56`}
              />
              {filtered.length > 0 && (
                <button
                  onClick={exportCsv}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <Download size={15} />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <p className={themeConfig[theme].secondaryText}>Loading results...</p>
          ) : filtered.length === 0 ? (
            <p className={themeConfig[theme].secondaryText}>No results found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Assessment</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Group</th>
                    <th className="px-4 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">%</th>
                    <th className="px-4 py-3 text-left">Published</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const pct = r.totalMarks > 0 ? ((r.obtainedMarks / r.totalMarks) * 100).toFixed(1) : '0.0';
                    const pctNum = parseFloat(pct);
                    const pctColor = pctNum >= 75
                      ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                      : pctNum >= 50
                      ? (isDark ? 'text-amber-400' : 'text-amber-600')
                      : (isDark ? 'text-red-400' : 'text-red-600');
                    return (
                      <tr key={r._id} className={isDark ? 'border-b border-[#1E2733] hover:bg-[#121A22]' : 'border-b border-slate-200 hover:bg-slate-50'}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.assessmentName}</div>
                          <div className={`text-xs ${themeConfig[theme].secondaryText}`}>{r.examType}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{r.student?.firstName} {r.student?.lastName}</div>
                          <div className={`text-xs ${themeConfig[theme].secondaryText}`}>{r.student?.rollNumber}</div>
                        </td>
                        <td className="px-4 py-3">{r.course?.courseName} <span className={`text-xs ${themeConfig[theme].secondaryText}`}>({r.course?.courseCode})</span></td>
                        <td className="px-4 py-3">{r.group?.name || '—'}</td>
                        <td className="px-4 py-3">{r.teacher?.firstName} {r.teacher?.lastName}</td>
                        <td className="px-4 py-3 font-medium">{r.obtainedMarks}/{r.totalMarks}</td>
                        <td className={`px-4 py-3 font-bold ${pctColor}`}>{pct}%</td>
                        <td className="px-4 py-3">{r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResultsPage;
