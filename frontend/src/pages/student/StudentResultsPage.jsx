import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, BookOpen, Download, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeProvider';
import { fetchMyResults } from '../../app/features/results/resultsThunks';

const StudentResultsPage = () => {
  const dispatch = useDispatch();
  const { themeConfig, theme, isDark } = useTheme();
  const { studentResults, studentSummary, isLoading } = useSelector((state) => state.results);

  useEffect(() => {
    dispatch(fetchMyResults());
  }, [dispatch]);

  // Build chart data: one bar per result, newest last
  const chartData = useMemo(() => {
    if (!studentResults.length) return [];
    return [...studentResults]
      .sort((a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt))
      .map((r) => ({
        name: r.assessmentName,
        percentage: r.totalMarks > 0 ? parseFloat(((r.obtainedMarks / r.totalMarks) * 100).toFixed(1)) : 0,
        course: r.course?.courseCode || '',
      }));
  }, [studentResults]);

  const courseTrend = useMemo(() => {
    if (!studentResults.length) return { data: [], courseKeys: [] };

    const sorted = [...studentResults].sort(
      (a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt)
    );

    const keys = [
      ...new Set(
        sorted.map((item) => item.course?.courseCode || item.course?.courseName || 'Unknown Course')
      ),
    ];

    const rows = sorted.map((item, index) => {
      const key = item.course?.courseCode || item.course?.courseName || 'Unknown Course';
      const percentage = item.totalMarks > 0
        ? Number(((item.obtainedMarks / item.totalMarks) * 100).toFixed(1))
        : 0;

      return {
        point: `A${index + 1}`,
        assessment: item.assessmentName,
        date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-',
        [key]: percentage,
      };
    });

    return { data: rows, courseKeys: keys };
  }, [studentResults]);

  const lineColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

  const downloadReportCardPdf = async () => {
    if (!studentResults.length) return;

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF();
    const now = new Date();
    const reportTitle = 'SmartAttend - Personal Report Card';

    doc.setFontSize(16);
    doc.text(reportTitle, 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${now.toLocaleString()}`, 14, 23);
    doc.text(`Average: ${studentSummary?.averagePercentage || 0}%`, 14, 29);
    doc.text(`Top: ${studentSummary?.highestPercentage || 0}%`, 74, 29);
    doc.text(`Assessments: ${studentSummary?.totalResults || studentResults.length}`, 120, 29);

    const tableRows = studentResults.map((result) => {
      const percentage = result.totalMarks > 0
        ? ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)
        : '0.0';
      return [
        result.assessmentName || '-',
        `${result.course?.courseCode || ''} ${result.course?.courseName ? `(${result.course.courseName})` : ''}`.trim() || '-',
        `${result.obtainedMarks}/${result.totalMarks}`,
        `${percentage}%`,
        result.teacher ? `${result.teacher.firstName || ''} ${result.teacher.lastName || ''}`.trim() : '-',
        result.remarks || '-',
      ];
    });

    autoTable(doc, {
      startY: 36,
      head: [['Assessment', 'Course', 'Marks', 'Percentage', 'Teacher', 'Remarks']],
      body: tableRows,
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [59, 130, 246] },
      theme: 'striped',
    });

    doc.save(`my-report-card-${now.getTime()}.pdf`);
  };

  const barColor = (pct) => {
    if (pct >= 75) return isDark ? '#34d399' : '#10b981';
    if (pct >= 50) return isDark ? '#fbbf24' : '#f59e0b';
    return isDark ? '#f87171' : '#ef4444';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className={`rounded-lg px-3 py-2 text-xs shadow-lg ${isDark ? 'bg-[#1A2332] text-gray-200 border border-[#1E2733]' : 'bg-white text-slate-700 border border-slate-200'}`}>
        <p className="font-semibold">{label}</p>
        {d.course && <p className={themeConfig[theme].secondaryText}>{d.course}</p>}
        <p>Score: <span className="font-bold">{payload[0].value}%</span></p>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${themeConfig[theme].gradientBackground}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${themeConfig[theme].text}`}>My Results</h1>
            <p className={themeConfig[theme].secondaryText}>Track your published assessment scores and performance trends.</p>
          </div>
          {studentResults.length > 0 && (
            <button
              onClick={downloadReportCardPdf}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Download size={15} />
              Download Report Card (PDF)
            </button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={themeConfig[theme].secondaryText}>Average Percentage</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{studentSummary?.averagePercentage || 0}%</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Award size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              <span className={themeConfig[theme].secondaryText}>Top Percentage</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{studentSummary?.highestPercentage || 0}%</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={18} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <span className={themeConfig[theme].secondaryText}>Published Assessments</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{studentSummary?.totalResults || 0}</p>
          </div>
        </div>

        {/* Performance bar chart */}
        {chartData.length > 0 && (
          <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${themeConfig[theme].text}`}>Performance Chart</h2>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2733' : '#e2e8f0'} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColor(entry.percentage)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded-sm ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span><span className={themeConfig[theme].secondaryText}>≥75% Pass</span></span>
              <span className="flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded-sm ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`}></span><span className={themeConfig[theme].secondaryText}>50–74% Average</span></span>
              <span className="flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded-sm ${isDark ? 'bg-red-400' : 'bg-red-500'}`}></span><span className={themeConfig[theme].secondaryText}>&lt;50% Below</span></span>
            </div>
          </div>
        )}

        {courseTrend.data.length > 0 && courseTrend.courseKeys.length > 0 && (
          <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${themeConfig[theme].text}`}>Course-wise Trend</h2>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={courseTrend.data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2733' : '#e2e8f0'} />
                  <XAxis
                    dataKey="point"
                    tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Score']}
                    labelFormatter={(label, payload) => {
                      const row = payload?.[0]?.payload;
                      return `${label} • ${row?.assessment || ''} ${row?.date ? `(${row.date})` : ''}`.trim();
                    }}
                  />
                  <Legend />
                  {courseTrend.courseKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={lineColors[index % lineColors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={`text-xs mt-2 ${themeConfig[theme].secondaryText}`}>
              X-axis points (A1, A2...) follow assessment timeline. Each line represents one course.
            </p>
          </div>
        )}

        {/* Assessment records table */}
        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeConfig[theme].text}`}>Assessment Records</h2>
          {isLoading ? (
            <p className={themeConfig[theme].secondaryText}>Loading results...</p>
          ) : studentResults.length === 0 ? (
            <p className={themeConfig[theme].secondaryText}>No results have been published for you yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Assessment</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">Marks</th>
                    <th className="px-4 py-3 text-left">Percentage</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentResults.map((result) => {
                    const percentage = result.totalMarks > 0
                      ? ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)
                      : '0.0';
                    const pct = parseFloat(percentage);
                    const pctColor = pct >= 75
                      ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                      : pct >= 50
                      ? (isDark ? 'text-amber-400' : 'text-amber-600')
                      : (isDark ? 'text-red-400' : 'text-red-600');

                    return (
                      <tr key={result._id} className={isDark ? 'border-b border-[#1E2733]' : 'border-b border-slate-200'}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{result.assessmentName}</div>
                          <div className={`text-xs ${themeConfig[theme].secondaryText}`}>{result.examType}</div>
                        </td>
                        <td className="px-4 py-3">{result.course?.courseName} ({result.course?.courseCode})</td>
                        <td className="px-4 py-3">{result.teacher?.firstName} {result.teacher?.lastName}</td>
                        <td className="px-4 py-3 font-medium">{result.obtainedMarks}/{result.totalMarks}</td>
                        <td className={`px-4 py-3 font-bold ${pctColor}`}>{percentage}%</td>
                        <td className="px-4 py-3">{result.remarks || '-'}</td>
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

export default StudentResultsPage;