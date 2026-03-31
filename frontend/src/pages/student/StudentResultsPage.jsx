import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, BookOpen, Download, TrendingUp, Calendar, ChevronRight, FileText, Star, LoaderCircle } from 'lucide-react';
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
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const StudentResultsPage = () => {
  const dispatch = useDispatch();
  const { themeConfig, theme, isDark } = useTheme();
  const { studentResults, studentSummary, isLoading } = useSelector((state) => state.results);
  const socket = useSocket();

  useEffect(() => {
    dispatch(fetchMyResults());

    if (socket) {
      socket.on('new-result', (data) => {
        dispatch(fetchMyResults());
        toast.success(`Result Published: ${data.assessmentName}`, {
          icon: <Award className="text-brand-primary" />
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('new-result');
      }
    };
  }, [dispatch, socket]);

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

  const lineColors = ['#506EE5', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

  const downloadReportCardPdf = async () => {
    if (!studentResults.length) return;

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const doc = new jsPDF();
    const now = new Date();
    const reportTitle = 'SmartAttend - Academic Report Card';

    doc.setFontSize(22);
    doc.setTextColor(80, 110, 229);
    doc.text(reportTitle, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${now.toLocaleString()}`, 14, 28);
    
    // Stats Banner
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 32, 182, 15, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(`Mean GPA: ${((studentSummary?.averagePercentage || 0) / 10 / 2).toFixed(2)}`, 20, 41);
    doc.text(`Avg Score: ${studentSummary?.averagePercentage || 0}%`, 70, 41);
    doc.text(`Assessments: ${studentSummary?.totalResults || studentResults.length}`, 130, 41);

    const tableRows = studentResults.map((result) => {
      const percentage = result.totalMarks > 0
        ? ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)
        : '0.0';
      return [
        result.assessmentName || '-',
        `${result.course?.courseCode || ''}`.trim() || '-',
        `${result.obtainedMarks}/${result.totalMarks}`,
        `${percentage}%`,
        result.teacher ? `${result.teacher.firstName || ''} ${result.teacher.lastName || ''}`.trim() : '-',
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [['Test Name', 'Subject Code', 'Score', 'Result', 'Teacher']],
      body: tableRows,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [80, 110, 229], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      theme: 'grid',
    });

    doc.save(`report-card-${now.getTime()}.pdf`);
  };

  const barColor = (pct) => {
    if (pct >= 75) return isDark ? '#10b981' : '#059669';
    if (pct >= 50) return isDark ? '#fbbf24' : '#d97706';
    return isDark ? '#f87171' : '#dc2626';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className={`rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md border ${isDark ? 'bg-[#121A22]/90 border-[#1E2733] text-gray-200' : 'bg-white/90 border-gray-100 text-slate-700'}`}>
        <p className="font-bold text-sm mb-1">{label}</p>
        {d.course && <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{d.course}</p>}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }}></div>
          <p className="text-xs">Grade: <span className="font-bold">{payload[0].value}%</span></p>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 sm:p-8 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header section with glass background */}
        <div className={`relative p-8 rounded-[2rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full opacity-10 -mr-20 -mt-20 ${isDark ? 'bg-brand-primary' : 'bg-indigo-300'}`}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}>
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>My Result Center</h1>
                <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Track all your test and exam scores in one place.</p>
              </div>
            </div>
            
            {studentResults.length > 0 && (
              <button
                onClick={downloadReportCardPdf}
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                  isDark 
                    ? 'bg-[#1E2733] text-gray-200 hover:bg-brand-primary hover:text-white border border-[#2E3B4D]' 
                    : 'bg-white text-gray-700 hover:bg-indigo-600 hover:text-white border border-gray-200 shadow-sm hover:shadow-indigo-200'
                }`}
              >
                <Download size={18} className="group-hover:bounce" />
                Export Report Card
              </button>
            )}
          </div>
        </div>

        {/* Global Performance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`group p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <TrendingUp size={24} />
             </div>
             <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Overall Avg</p>
             <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{studentSummary?.averagePercentage || 0}%</h3>
          </div>
          
          <div className={`group p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <Star size={24} />
             </div>
             <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Highest Score</p>
             <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{studentSummary?.highestPercentage || 0}%</h3>
          </div>

          <div className={`group p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <FileText size={24} />
             </div>
             <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Credits Secured</p>
             <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{studentResults.length * 3}</h3>
          </div>

          <div className={`group p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                <BookOpen size={24} />
             </div>
             <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Tests Completed</p>
             <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{studentResults.length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Performance Bar Chart */}
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Subject Analysis</h2>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>Live Data</div>
            </div>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E2733' : '#f1f5f9'} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: isDark ? '#4b5563' : '#94a3b8', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: isDark ? '#4b5563' : '#94a3b8', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip cursor={{ fill: isDark ? '#1E2733' : '#f8fafc' }} content={<CustomTooltip />} />
                    <Bar dataKey="percentage" radius={[8, 8, 8, 8]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColor(entry.percentage)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 italic">No assessment data found.</div>
            )}
          </div>

          {/* Line Chart Trend */}
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h2 className={`text-xl font-black tracking-tight mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>Progress Timeline</h2>
            {courseTrend.data.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={courseTrend.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E2733' : '#f1f5f9'} />
                    <XAxis dataKey="point" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip content={<CustomTooltip />} />
                    {courseTrend.courseKeys.map((key, index) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={lineColors[index % lineColors.length]}
                        strokeWidth={4}
                        dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0A0E13' : 'white' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 italic text-sm">Waiting for more results to plot trend...</div>
            )}
            <div className={`mt-6 p-4 rounded-xl text-[11px] font-medium leading-relaxed ${isDark ? 'bg-blue-500/5 text-gray-500' : 'bg-blue-50 text-blue-800'}`}>
               <TrendingUp className="inline-block w-4 h-4 mr-2 mb-0.5" />
               Timeline shows your consistency across all active courses this semester.
            </div>
          </div>
        </div>

        {/* Assessment Records Grid-style Table */}
        <div className={`relative overflow-hidden p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
             <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Detailed Logs</h2>
             <div className="flex gap-2">
                <div className={`w-3 h-3 rounded-full bg-emerald-500`}></div>
                <div className={`w-3 h-3 rounded-full bg-amber-500`}></div>
                <div className={`w-3 h-3 rounded-full bg-rose-500`}></div>
             </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center"><LoaderCircle className="w-10 h-10 animate-spin mx-auto text-indigo-600" /></div>
          ) : studentResults.length === 0 ? (
            <div className={`p-10 rounded-2xl text-center border-2 border-dashed ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
               <p className={isDark ? 'text-gray-600' : 'text-gray-400'}>Your wall is empty! No results published yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <th className="pb-6 pl-4">Test / Exam Name</th>
                    <th className="pb-6">Subject</th>
                    <th className="pb-6">My Score</th>
                    <th className="pb-6">Final Result</th>
                    <th className="pb-6 sr-only">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2733]/40">
                  {studentResults.map((result) => {
                    const percentage = result.totalMarks > 0 ? ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1) : '0.0';
                    const pct = parseFloat(percentage);
                    return (
                      <tr key={result._id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                        <td className="py-5 pl-4">
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                                 <FileText size={18} />
                              </div>
                              <div>
                                <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{result.assessmentName}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Exam Score</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-5">
                           <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {result.course?.courseCode}
                              <span className="block text-[11px] opacity-60 font-medium">{result.course?.courseName}</span>
                           </p>
                        </td>
                        <td className="py-5">
                           <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              {result.obtainedMarks}/{result.totalMarks}
                           </div>
                        </td>
                        <td className="py-5">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                              <span className={`text-sm font-black ${pct >= 75 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                 {percentage}%
                              </span>
                           </div>
                        </td>
                        <td className="py-5 text-right pr-4">
                           <button className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                              <ChevronRight size={16} />
                           </button>
                        </td>
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