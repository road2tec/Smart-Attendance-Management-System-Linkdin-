import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, Download, FileSpreadsheet, Save, Upload } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import * as XLSX from 'xlsx';
import { useTheme } from '../../context/ThemeProvider';
import { getClassroomsByTeacher } from '../../app/features/classroom/classroomThunks';
import { fetchTeacherResults, saveTeacherResults } from '../../app/features/results/resultsThunks';
import { resetResultsStatus } from '../../app/features/results/resultsSlice';

const normalizeKey = (key) => String(key || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const TeacherResultsPage = () => {
  const dispatch = useDispatch();
  const { themeConfig, theme, isDark } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { teacherClassrooms = [] } = useSelector((state) => state.classrooms);
  const { teacherResults, teacherSummary, isLoading, isError, isSuccess, message } = useSelector((state) => state.results);

  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [examType, setExamType] = useState('internal');
  const [totalMarks, setTotalMarks] = useState(100);
  const [publishedAt, setPublishedAt] = useState('');
  const [studentInputs, setStudentInputs] = useState({});
  const [importStatus, setImportStatus] = useState('');
  const [selectedAnalyticsAssessment, setSelectedAnalyticsAssessment] = useState('');
  const [historyResultId, setHistoryResultId] = useState('');

  useEffect(() => {
    if (user?._id) {
      dispatch(getClassroomsByTeacher(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (!selectedClassroomId && teacherClassrooms.length > 0) {
      setSelectedClassroomId(teacherClassrooms[0]._id);
    }
  }, [teacherClassrooms, selectedClassroomId]);

  useEffect(() => {
    if (selectedClassroomId) {
      dispatch(fetchTeacherResults(selectedClassroomId));
    }
  }, [dispatch, selectedClassroomId]);

  const selectedClassroom = useMemo(
    () => teacherClassrooms.find((item) => item._id === selectedClassroomId),
    [teacherClassrooms, selectedClassroomId]
  );

  useEffect(() => {
    const nextInputs = {};
    (selectedClassroom?.assignedStudents || []).forEach((student) => {
      const existing = teacherResults.find(
        (result) =>
          result.student?._id === student._id &&
          result.assessmentName?.trim().toLowerCase() === assessmentName.trim().toLowerCase()
      );

      nextInputs[student._id] = {
        obtainedMarks: existing?.obtainedMarks ?? '',
        remarks: existing?.remarks ?? '',
      };
    });
    setStudentInputs(nextInputs);
  }, [selectedClassroom, teacherResults, assessmentName]);

  useEffect(() => {
    if (!isSuccess && !isError) return;
    const timer = setTimeout(() => dispatch(resetResultsStatus()), 2500);
    return () => clearTimeout(timer);
  }, [dispatch, isSuccess, isError]);

  const updateStudentInput = (studentId, field, value) => {
    setStudentInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedClassroomId || !assessmentName.trim()) return;

    const results = Object.entries(studentInputs)
      .filter(([, value]) => value.obtainedMarks !== '' && value.obtainedMarks !== null)
      .map(([studentId, value]) => ({
        studentId,
        obtainedMarks: Number(value.obtainedMarks),
        remarks: value.remarks || '',
      }));

    if (results.length === 0) return;

    await dispatch(
      saveTeacherResults({
        classroomId: selectedClassroomId,
        payload: {
          assessmentName,
          examType,
          totalMarks: Number(totalMarks),
          publishedAt: publishedAt || undefined,
          results,
        },
      })
    ).unwrap();

    dispatch(fetchTeacherResults(selectedClassroomId));
  };

  const exportResultsCsv = () => {
    if (!teacherResults.length) return;
    const headers = ['Assessment', 'Exam Type', 'Student Name', 'Email', 'Roll No', 'Obtained Marks', 'Total Marks', 'Percentage', 'Remarks', 'Published At'];
    const rows = teacherResults.map((r) => {
      const pct = r.totalMarks > 0 ? ((r.obtainedMarks / r.totalMarks) * 100).toFixed(1) : '0.0';
      return [
        r.assessmentName,
        r.examType,
        `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
        r.student?.email || '',
        r.student?.rollNumber || '',
        r.obtainedMarks,
        r.totalMarks,
        `${pct}%`,
        r.remarks || '',
        r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : '',
      ];
    });
    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${selectedClassroom?.course?.courseCode || 'classroom'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const splitCsvRow = (line) => {
      const cells = [];
      let current = '';
      let inQuotes = false;
      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const next = line[index + 1];
        if (char === '"' && inQuotes && next === '"') {
          current += '"';
          index += 1;
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      return cells;
    };

    const headers = splitCsvRow(lines[0]).map((header) => normalizeKey(header));
    return lines.slice(1).map((line) => {
      const cols = splitCsvRow(line);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = cols[idx] ?? '';
      });
      return row;
    });
  };

  const getParsedRows = async (file) => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      return parseCsv(text);
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) return [];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });
      return rows.map((row) => {
        const normalized = {};
        Object.keys(row || {}).forEach((key) => {
          normalized[normalizeKey(key)] = row[key];
        });
        return normalized;
      });
    }

    throw new Error('Unsupported file format. Please upload CSV or Excel file.');
  };

  const mapRowToStudentId = (row, students) => {
    const studentId = row.studentid || row.id || row.userid;
    if (studentId) {
      const byId = students.find((student) => String(student._id) === String(studentId));
      if (byId) return byId._id;
    }

    const roll = String(row.rollno || row.rollnumber || row.roll || '').trim().toLowerCase();
    if (roll) {
      const byRoll = students.find((student) => String(student.rollNumber || '').trim().toLowerCase() === roll);
      if (byRoll) return byRoll._id;
    }

    const email = String(row.email || '').trim().toLowerCase();
    if (email) {
      const byEmail = students.find((student) => String(student.email || '').trim().toLowerCase() === email);
      if (byEmail) return byEmail._id;
    }

    const name = String(row.studentname || row.name || '').trim().toLowerCase();
    if (name) {
      const byName = students.find(
        (student) => `${student.firstName || ''} ${student.lastName || ''}`.trim().toLowerCase() === name
      );
      if (byName) return byName._id;
    }

    return null;
  };

  const handleBulkImport = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      const students = selectedClassroom?.assignedStudents || [];
      if (!students.length) {
        setImportStatus('No assigned students found for this classroom.');
        return;
      }

      const rows = await getParsedRows(file);
      if (!rows.length) {
        setImportStatus('No rows found in file.');
        return;
      }

      let matched = 0;
      let skipped = 0;
      const updatedInputs = { ...studentInputs };

      rows.forEach((row) => {
        const sid = mapRowToStudentId(row, students);
        const marksRaw = row.obtainedmarks ?? row.marks ?? row.score ?? row.mark;
        const remarks = row.remarks ?? row.remark ?? '';
        const obtained = Number(marksRaw);

        if (!sid || Number.isNaN(obtained)) {
          skipped += 1;
          return;
        }

        const boundedMarks = Math.max(0, Math.min(Number(totalMarks), obtained));
        updatedInputs[sid] = {
          obtainedMarks: boundedMarks,
          remarks: String(remarks || ''),
        };
        matched += 1;
      });

      setStudentInputs(updatedInputs);
      setImportStatus(`Imported ${matched} rows successfully. Skipped ${skipped} unmatched/invalid rows.`);
    } catch (error) {
      setImportStatus(error.message || 'Failed to import file.');
    } finally {
      event.target.value = '';
    }
  };

  const assessmentOptions = useMemo(
    () => [...new Set(teacherResults.map((result) => result.assessmentName).filter(Boolean))],
    [teacherResults]
  );

  useEffect(() => {
    if (!selectedAnalyticsAssessment && assessmentOptions.length > 0) {
      setSelectedAnalyticsAssessment(assessmentOptions[0]);
    }
  }, [assessmentOptions, selectedAnalyticsAssessment]);

  const selectedAssessmentResults = useMemo(
    () => teacherResults.filter((result) => result.assessmentName === selectedAnalyticsAssessment),
    [teacherResults, selectedAnalyticsAssessment]
  );

  const analyticsSummary = useMemo(() => {
    if (!selectedAssessmentResults.length) {
      return {
        passCount: 0,
        failCount: 0,
        passRate: 0,
        average: 0,
      };
    }

    const percentages = selectedAssessmentResults.map((result) =>
      result.totalMarks > 0 ? (result.obtainedMarks / result.totalMarks) * 100 : 0
    );
    const passCount = percentages.filter((pct) => pct >= 40).length;
    const failCount = percentages.length - passCount;
    const average = percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length;

    return {
      passCount,
      failCount,
      passRate: Number(((passCount / percentages.length) * 100).toFixed(1)),
      average: Number(average.toFixed(1)),
    };
  }, [selectedAssessmentResults]);

  const distributionData = useMemo(() => {
    const buckets = [
      { range: '0-39', min: 0, max: 39.99, count: 0 },
      { range: '40-59', min: 40, max: 59.99, count: 0 },
      { range: '60-74', min: 60, max: 74.99, count: 0 },
      { range: '75-89', min: 75, max: 89.99, count: 0 },
      { range: '90-100', min: 90, max: 100, count: 0 },
    ];

    selectedAssessmentResults.forEach((result) => {
      const pct = result.totalMarks > 0 ? (result.obtainedMarks / result.totalMarks) * 100 : 0;
      const bucket = buckets.find((item) => pct >= item.min && pct <= item.max);
      if (bucket) bucket.count += 1;
    });

    return buckets.map((item) => ({ range: item.range, students: item.count }));
  }, [selectedAssessmentResults]);

  const selectedHistoryResult = useMemo(
    () => teacherResults.find((result) => result._id === historyResultId) || null,
    [teacherResults, historyResultId]
  );

  return (
    <div className={`min-h-screen p-6 ${themeConfig[theme].gradientBackground}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${themeConfig[theme].text}`}>Results Management</h1>
          <p className={themeConfig[theme].secondaryText}>Upload, bulk import, analyze and audit assessment marks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={themeConfig[theme].secondaryText}>Average Score</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{teacherSummary?.averagePercentage || 0}%</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              <span className={themeConfig[theme].secondaryText}>Published Results</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{teacherSummary?.totalResults || 0}</p>
          </div>
          <div className={`${themeConfig[theme].card} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Save size={18} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <span className={themeConfig[theme].secondaryText}>Highest Score</span>
            </div>
            <p className={`text-2xl font-bold ${themeConfig[theme].text}`}>{teacherSummary?.highestPercentage || 0}%</p>
          </div>
        </div>

        <div className={`${themeConfig[theme].card} rounded-xl p-6 space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm mb-2 ${themeConfig[theme].secondaryText}`}>Classroom</label>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
              >
                <option value="">Select classroom</option>
                {teacherClassrooms.map((classroom) => (
                  <option key={classroom._id} value={classroom._id}>
                    {classroom.course?.courseName} - {classroom.group?.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm mb-2 ${themeConfig[theme].secondaryText}`}>Assessment Name</label>
              <input
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                placeholder="Midterm 1"
                className={`w-full rounded-lg px-3 py-2 ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
              />
            </div>
            <div>
              <label className={`block text-sm mb-2 ${themeConfig[theme].secondaryText}`}>Exam Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
              >
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
                <option value="internal">Internal</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="practical">Practical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm mb-2 ${themeConfig[theme].secondaryText}`}>Total Marks</label>
              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${isDark ? 'text-gray-300' : 'text-slate-600'} text-sm`}>
              {selectedClassroom
                ? `Course: ${selectedClassroom.course?.courseName || '-'} • Group: ${selectedClassroom.group?.name || '-'}`
                : 'Select a classroom to start entering results.'}
            </div>
            <div>
              <label className={`block text-sm mb-2 ${themeConfig[theme].secondaryText}`}>Publish Date</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              <Upload size={14} />
              Bulk Import CSV/Excel
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleBulkImport}
                className="hidden"
              />
            </label>
            <span className={`text-xs ${themeConfig[theme].secondaryText}`}>
              Required columns: `rollNumber`/`email`/`studentName` and `obtainedMarks` (optional `remarks`).
            </span>
          </div>
          {importStatus && (
            <div className={`text-sm ${importStatus.toLowerCase().includes('failed') ? 'text-red-500' : isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {importStatus}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Roll No</th>
                    <th className="px-4 py-3 text-left">Obtained Marks</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedClassroom?.assignedStudents || []).map((student) => (
                    <tr key={student._id} className={isDark ? 'border-b border-[#1E2733]' : 'border-b border-slate-200'}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className={themeConfig[theme].secondaryText}>{student.email}</div>
                      </td>
                      <td className="px-4 py-3">{student.rollNumber || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={totalMarks}
                          value={studentInputs[student._id]?.obtainedMarks ?? ''}
                          onChange={(e) => updateStudentInput(student._id, 'obtainedMarks', e.target.value)}
                          className={`w-28 rounded-lg px-3 py-2 ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={studentInputs[student._id]?.remarks ?? ''}
                          onChange={(e) => updateStudentInput(student._id, 'remarks', e.target.value)}
                          placeholder="Optional remarks"
                          className={`w-full rounded-lg px-3 py-2 ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <div className={`text-sm ${isError ? 'text-red-500' : isSuccess ? 'text-green-500' : themeConfig[theme].secondaryText}`}>
                {message || 'Use same assessment name to update published marks. Changes are tracked in audit history.'}
              </div>
              <button
                type="submit"
                disabled={isLoading || !selectedClassroomId || !assessmentName.trim()}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-[#506EE5] text-white hover:bg-[#425dc7]' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-50`}
              >
                {isLoading ? 'Saving...' : 'Save Results'}
              </button>
            </div>
          </form>
        </div>

        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className={`text-lg font-semibold ${themeConfig[theme].text}`}>Assessment Analytics</h2>
            <select
              value={selectedAnalyticsAssessment}
              onChange={(e) => setSelectedAnalyticsAssessment(e.target.value)}
              className={`rounded-lg px-3 py-2 text-sm ${isDark ? 'bg-[#121A22] border border-[#1E2733] text-white' : 'bg-white border border-slate-300 text-slate-800'}`}
            >
              {assessmentOptions.length === 0 && <option value="">No assessments</option>}
              {assessmentOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedAssessmentResults.length === 0 ? (
            <p className={themeConfig[theme].secondaryText}>Publish results to view analytics.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className={`${isDark ? 'bg-[#121A22]' : 'bg-slate-100'} rounded-lg p-3`}>
                  <div className={`text-xs ${themeConfig[theme].secondaryText}`}>Pass / Fail (≥ 40%)</div>
                  <div className={`font-semibold ${themeConfig[theme].text}`}>{analyticsSummary.passCount} / {analyticsSummary.failCount}</div>
                </div>
                <div className={`${isDark ? 'bg-[#121A22]' : 'bg-slate-100'} rounded-lg p-3`}>
                  <div className={`text-xs ${themeConfig[theme].secondaryText}`}>Pass Rate</div>
                  <div className={`font-semibold ${themeConfig[theme].text}`}>{analyticsSummary.passRate}%</div>
                </div>
                <div className={`${isDark ? 'bg-[#121A22]' : 'bg-slate-100'} rounded-lg p-3`}>
                  <div className={`text-xs ${themeConfig[theme].secondaryText}`}>Average Percentage</div>
                  <div className={`font-semibold ${themeConfig[theme].text}`}>{analyticsSummary.average}%</div>
                </div>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={distributionData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2733' : '#e2e8f0'} />
                    <XAxis dataKey="range" tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill={isDark ? '#506EE5' : '#4f46e5'} radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${themeConfig[theme].text}`}>Recent Published Results</h2>
            {teacherResults.length > 0 && (
              <button
                onClick={exportResultsCsv}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Download size={15} />
                Export CSV
              </button>
            )}
          </div>
          {teacherResults.length === 0 ? (
            <p className={themeConfig[theme].secondaryText}>No results published yet for this classroom.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full text-sm ${themeConfig[theme].text}`}>
                <thead className={isDark ? 'bg-[#121A22] text-gray-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Assessment</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Edits</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherResults.map((result) => (
                    <tr key={result._id} className={isDark ? 'border-b border-[#1E2733]' : 'border-b border-slate-200'}>
                      <td className="px-4 py-3">{result.assessmentName} <span className={themeConfig[theme].secondaryText}>({result.examType})</span></td>
                      <td className="px-4 py-3">{result.student?.firstName} {result.student?.lastName}</td>
                      <td className="px-4 py-3">{result.course?.courseName}</td>
                      <td className="px-4 py-3 font-medium">{result.obtainedMarks}/{result.totalMarks}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setHistoryResultId(result._id === historyResultId ? '' : result._id)}
                          className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-[#1E2733] text-gray-300 hover:bg-[#263040]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {(result.updateHistory?.length || 0)} edit(s)
                        </button>
                      </td>
                      <td className="px-4 py-3">{result.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedHistoryResult && (
          <div className={`${themeConfig[theme].card} rounded-xl p-6`}>
            <h3 className={`text-base font-semibold mb-3 ${themeConfig[theme].text}`}>
              Audit Trail: {selectedHistoryResult.assessmentName} — {selectedHistoryResult.student?.firstName} {selectedHistoryResult.student?.lastName}
            </h3>
            {(selectedHistoryResult.updateHistory || []).length === 0 ? (
              <p className={themeConfig[theme].secondaryText}>No edits recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {[...(selectedHistoryResult.updateHistory || [])].reverse().map((entry, idx) => (
                  <div key={idx} className={`rounded-lg p-3 ${isDark ? 'bg-[#121A22]' : 'bg-slate-100'}`}>
                    <div className="text-sm font-medium">
                      {entry.changedBy ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}` : 'Unknown user'}
                      <span className={`ml-2 text-xs ${themeConfig[theme].secondaryText}`}>
                        {entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <ul className="text-xs mt-1 space-y-1">
                      {Object.entries(entry.changes || {}).map(([field, value]) => (
                        <li key={field} className={themeConfig[theme].secondaryText}>
                          {field}: {String(value?.from ?? '')} → {String(value?.to ?? '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherResultsPage;
