import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherResults } from '../../app/features/results/resultsThunks';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Award, AlertCircle, Users2 } from 'lucide-react';

export default function StudentProgressTab({ classroom, isDark }) {
  const dispatch = useDispatch();
  const { teacherResults, isLoading } = useSelector(state => state.results);

  useEffect(() => {
    if (classroom?.id) {
      dispatch(fetchTeacherResults(classroom.id));
    }
  }, [dispatch, classroom?.id]);

  // Filter results for this classroom
  const classroomResults = useMemo(() =>
    teacherResults.filter(r => r.classroom?._id === classroom?.id || r.classroom === classroom?.id),
    [teacherResults, classroom?.id]
  );

  // Get unique assessment names
  const assessments = useMemo(() =>
    [...new Set(classroomResults.map(r => r.assessmentName))],
    [classroomResults]
  );

  // Build student × assessment matrix
  const students = useMemo(() => {
    const map = {};
    classroomResults.forEach(r => {
      const sid = r.student?._id;
      if (!sid) return;
      if (!map[sid]) {
        map[sid] = {
          id: sid,
          name: `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim() || 'Student',
          rollNumber: r.student?.rollNumber || '—',
          scores: {},
          totalObtained: 0,
          totalMax: 0,
        };
      }
      map[sid].scores[r.assessmentName] = {
        obtained: r.obtainedMarks,
        total: r.totalMarks,
        pct: r.totalMarks > 0 ? Math.round((r.obtainedMarks / r.totalMarks) * 100) : 0,
      };
      map[sid].totalObtained += r.obtainedMarks;
      map[sid].totalMax += r.totalMarks;
    });
    return Object.values(map).map(s => ({
      ...s,
      overall: s.totalMax > 0 ? Math.round((s.totalObtained / s.totalMax) * 100) : 0,
    })).sort((a, b) => b.overall - a.overall);
  }, [classroomResults]);

  // Chart data: class average per assessment
  const chartData = useMemo(() => assessments.map(name => {
    const rs = classroomResults.filter(r => r.assessmentName === name);
    const avg = rs.length > 0
      ? Math.round(rs.reduce((s, r) => s + (r.totalMarks > 0 ? (r.obtainedMarks / r.totalMarks) * 100 : 0), 0) / rs.length)
      : 0;
    return { name, avg, count: rs.length };
  }), [assessments, classroomResults]);

  const gradeColor = (pct) => {
    if (pct >= 75) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const gradeBadge = (pct) => {
    if (pct >= 75) return isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700';
    if (pct >= 50) return isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700';
    return isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-700';
  };

  const atRisk = students.filter(s => s.overall < 40);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Loading Progress Data...</p>
      </div>
    );
  }

  if (classroomResults.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed ${isDark ? 'border-gray-800 text-gray-600' : 'border-gray-100 text-gray-400'}`}>
        <Users2 className="w-14 h-14 opacity-20 mb-4" />
        <h3 className={`text-lg font-black ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>No Results Published Yet</h3>
        <p className="text-sm mt-2 max-w-xs text-center">Use the "New Test" button to create a test and enter student marks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Students Tracked', val: students.length, icon: <Users2 size={20} />, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Assessments', val: assessments.length, icon: <Award size={20} />, color: 'text-purple-400 bg-purple-500/10' },
          { label: 'Class Avg', val: students.length > 0 ? `${Math.round(students.reduce((s, x) => s + x.overall, 0) / students.length)}%` : '—', icon: <TrendingUp size={20} />, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'At Risk (<40%)', val: atRisk.length, icon: <AlertCircle size={20} />, color: 'text-rose-400 bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Class Average Bar Chart */}
      {chartData.length > 0 && (
        <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className={`text-lg font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Class Average per Assessment</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E2733' : '#f1f5f9'} />
              <XAxis dataKey="name" tick={{ fill: isDark ? '#4b5563' : '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#4b5563' : '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(val) => [`${val}%`, 'Class Avg']}
              />
              <Bar dataKey="avg" radius={[8, 8, 8, 8]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={gradeColor(entry.avg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Student Progress Table */}
      <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className={`px-8 py-5 border-b ${isDark ? 'border-[#1E2733]' : 'border-gray-100'}`}>
          <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Scorecard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-[#0A0E13] text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                <th className="px-6 py-4 text-left">Student</th>
                {assessments.map(a => (
                  <th key={a} className="px-4 py-4 text-center">{a}</th>
                ))}
                <th className="px-6 py-4 text-center">Overall</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E2733]' : 'divide-gray-50'}`}>
              {students.map(student => (
                <tr key={student.id} className={`group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{student.rollNumber}</p>
                    </div>
                  </td>
                  {assessments.map(a => {
                    const score = student.scores[a];
                    return (
                      <td key={a} className="px-4 py-4 text-center">
                        {score ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-black ${score.pct >= 75 ? 'text-emerald-500' : score.pct >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {score.obtained}/{score.total}
                            </span>
                            <span className="text-[10px] text-gray-500">{score.pct}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black ${gradeBadge(student.overall)}`}>
                        {student.overall}%
                      </span>
                      <div className={`w-20 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${student.overall}%`, backgroundColor: gradeColor(student.overall) }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
