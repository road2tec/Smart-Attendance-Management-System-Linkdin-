import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, ChevronRight, Download, FileSpreadsheet, Save, Upload, Shield, Building, Eye, AlertCircle } from 'lucide-react';
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
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const normalizeKey = (key) => String(key || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const TeacherResultsPage = () => {
  const dispatch = useDispatch();
  const { themeConfig, theme, isDark } = useTheme();
  const currentTheme = themeConfig ? themeConfig[theme] : null;
  const { user } = useSelector((state) => state.auth);
  const { teacherClassrooms = [] } = useSelector((state) => state.classrooms);
  const { teacherResults, teacherSummary, isLoading, isError, isSuccess, message } = useSelector((state) => state.results);
  const socket = useSocket();

  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  
  // Moved up to prevent "Cannot access before initialization" error in hooks
  const selectedClassroom = useMemo(
    () => teacherClassrooms.find((item) => item._id === selectedClassroomId),
    [teacherClassrooms, selectedClassroomId]
  );

  const [assessmentName, setAssessmentName] = useState('');
  const [examType, setExamType] = useState('internal');
  const [totalMarks, setTotalMarks] = useState(100);
  const [publishedAt, setPublishedAt] = useState('');
  const [studentInputs, setStudentInputs] = useState({});
  const [importStatus, setImportStatus] = useState('');
  const [selectedAnalyticsAssessment, setSelectedAnalyticsAssessment] = useState('');
  const [historyResultId, setHistoryResultId] = useState('');
  const [reviewingStudentId, setReviewingStudentId] = useState(null); // Keep for backwards compatibility or fallback
  const [filterAwaiting, setFilterAwaiting] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (studentId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };



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

  const [interactiveSubmissions, setInteractiveSubmissions] = useState([]);
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);

  useEffect(() => {
    if (selectedClassroom?.assessments?.length > 0) {
        setAssessmentName(selectedClassroom.assessments[0].title);
        setTotalMarks(selectedClassroom.assessments[0].totalMarks);
        setExamType(selectedClassroom.assessments[0].type.toLowerCase());
        setActiveAssessmentId(selectedClassroom.assessments[0]._id);
    }
  }, [selectedClassroom]);

  const fetchSubmissions = async (assessmentId) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/assessments/submissions/${assessmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            setInteractiveSubmissions(data.data);
            
            // Map submissions to studentInputs for the table
            const inputs = { ...studentInputs };
            data.data.forEach(sub => {
                inputs[sub.student._id] = {
                    obtainedMarks: sub.obtainedMarks || '',
                    remarks: sub.teacherRemarks || '',
                    submissionId: sub._id,
                    studentAnswers: sub.answers // Store for display
                };
            });
            setStudentInputs(inputs);
        }
    } catch (err) {
        console.error('Error fetching submissions:', err);
    }
  };

  useEffect(() => {
    if (activeAssessmentId) {
        fetchSubmissions(activeAssessmentId);
    }
  }, [activeAssessmentId]);

  useEffect(() => {
    if (selectedClassroomId) {
      dispatch(fetchTeacherResults(selectedClassroomId));
      
      if (socket) {
        socket.emit('join-classroom', selectedClassroomId);

        socket.on('student-submission', (data) => {
          if (data.classroomId === selectedClassroomId) {
            dispatch(fetchTeacherResults(selectedClassroomId));
            if (activeAssessmentId === data.assessmentId) {
                fetchSubmissions(activeAssessmentId);
            }
            toast.info('New student submission received!', {
              icon: <Eye className="text-brand-primary" />
            });
          }
        });
      }
    }

    return () => {
      if (socket) {
        socket.off('student-submission');
      }
    };
  }, [dispatch, selectedClassroomId, socket, activeAssessmentId]);

  useEffect(() => {
    if (filterAwaiting && selectedClassroom?.assignedStudents) {
      const needsGradingIds = selectedClassroom.assignedStudents.filter(student => {
        const val = studentInputs[student._id]?.obtainedMarks;
        const remark = studentInputs[student._id]?.remarks;
        return (!val || Number(val) === 0) && remark;
      }).map(s => s._id);
      
      setExpandedRows(new Set(needsGradingIds));
    }
  }, [filterAwaiting, selectedClassroom, studentInputs]);

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

    const isInteractive = !!activeAssessmentId;

    if (isInteractive) {
        // Evaluate each submission individually
        const promises = Object.entries(studentInputs)
            .filter(([, value]) => value.submissionId && value.obtainedMarks !== '')
            .map(([studentId, value]) => {
                const token = localStorage.getItem('authToken');
                return fetch(`${import.meta.env.VITE_API_URL}/assessments/submission/${value.submissionId}/evaluate`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        obtainedMarks: Number(value.obtainedMarks),
                        teacherRemarks: value.remarks
                    })
                });
            });

        await Promise.all(promises);
        toast.success("Submissions evaluated successfully!");
        fetchSubmissions(activeAssessmentId);
    } else {
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
    }

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
    <div className={`min-h-screen p-4 sm:p-8 animate-in fade-in duration-700 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Modern Header */}
        <div className={`relative p-8 sm:p-12 rounded-[3.5rem] overflow-hidden border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full opacity-10 -mr-32 -mt-32 ${isDark ? 'bg-brand-primary' : 'bg-indigo-400'}`}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-brand-primary/20 text-brand-light' : 'bg-indigo-600 text-white shadow-lg'}`}>
                     Results Summary
                   </div>
                   <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                      Status: Active
                   </div>
                </div>
                <h1 className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Exam <span className="text-brand-primary">Results</span>
                </h1>
                <p className={`mt-4 text-lg font-medium max-w-xl leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Track and manage student marks and performance records.
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Average', value: `${teacherSummary?.averagePercentage || 0}%`, icon: BarChart3, color: 'text-blue-500', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
            { label: 'Total Reports', value: teacherSummary?.totalResults || 0, icon: FileSpreadsheet, color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
            { label: 'Top Score', value: `${teacherSummary?.highestPercentage || 0}%`, icon: Save, color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' }
          ].map((stat, idx) => (
            <div key={idx} className={`p-8 rounded-[2.5rem] border flex items-center gap-6 ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h2 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className={`p-8 sm:p-12 rounded-[3.5rem] border backdrop-blur-md transition-all duration-500 ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>Select Classroom</label>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className={`w-full rounded-2xl px-5 py-3 font-bold text-xs appearance-none transition-all border ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 shadow-inner'}`}
              >
                <option value="">Choose Class</option>
                {teacherClassrooms.map((classroom) => (
                  <option key={classroom._id} value={classroom._id}>
                    {classroom.course?.courseName} - {classroom.group?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>Exam Name</label>
              <input
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                placeholder="e.g. Unit Test 1"
                className={`w-full rounded-2xl px-5 py-3 font-bold text-xs transition-all border ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 shadow-inner'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>Test Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className={`w-full rounded-2xl px-5 py-3 font-bold text-xs appearance-none transition-all border ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 shadow-inner'}`}
              >
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
                <option value="internal">Internal Exam</option>
                <option value="midterm">Mid Sem</option>
                <option value="final">Final Exam</option>
                <option value="practical">Practical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>Total Marks</label>
              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className={`w-full rounded-2xl px-5 py-3 font-bold text-xs transition-all border ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 shadow-inner'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-inherit">
             <div className={`p-6 rounded-[2rem] border flex items-center gap-4 ${isDark ? 'bg-gray-900/50 border-[#1E2733] text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'} text-[10px] font-black uppercase tracking-widest`}>
                <Building size={16} className="text-brand-primary" />
                {selectedClassroom
                  ? `${selectedClassroom.course?.courseName || '-'} • ${selectedClassroom.group?.name || '-'}`
                  : 'Select a classroom first...'}
             </div>
             <div className="space-y-2">
               <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>Result Date</label>
               <input
                 type="date"
                 value={publishedAt}
                 onChange={(e) => setPublishedAt(e.target.value)}
                 className={`w-full rounded-2xl px-5 py-3 font-bold text-xs transition-all border ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 shadow-inner'}`}
               />
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <label className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:scale-105' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:scale-105'}`}>
              <Upload size={14} strokeWidth={3} />
              Upload Marks (CSV/Excel)
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleBulkImport}
                className="hidden"
              />
            </label>
            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Supported: `rollNumber`, `email`, `obtainedMarks`
            </span>
          </div>

          {importStatus && (
            <div className={`p-4 rounded-xl border mb-6 text-[10px] font-black uppercase tracking-widest animate-pulse ${importStatus.toLowerCase().includes('failed') ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
              {importStatus}
            </div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterAwaiting}
                onChange={(e) => setFilterAwaiting(e.target.checked)}
                className={`w-4 h-4 rounded appearance-none border transition-all checked:bg-brand-primary checked:border-brand-primary flex items-center justify-center relative after:content-[''] after:absolute after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:mb-0.5 after:opacity-0 checked:after:opacity-100 ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733]' : 'bg-white border-gray-300'}`}
              />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Show only "Pending"
              </span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className={`rounded-[2.5rem] border overflow-x-auto w-full ${isDark ? 'border-[#1E2733] bg-[#0A0E13]/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="min-w-[800px]">
                <table className="min-w-full">
                  <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'}>
                    <tr>
                      {['Student Name', 'ID/Roll No', 'Marks', 'Status', 'Answer'].map((header) => (
                        <th key={header} className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {(selectedClassroom?.assignedStudents || []).filter(student => {
                      if (!filterAwaiting) return true;
                      const val = studentInputs[student._id]?.obtainedMarks;
                      const remark = studentInputs[student._id]?.remarks;
                      return (!val || Number(val) === 0) && remark;
                    }).map((student) => {
                      const hasSubmission = !!studentInputs[student._id]?.remarks;
                      const hasMarks = studentInputs[student._id]?.obtainedMarks !== '' && Number(studentInputs[student._id]?.obtainedMarks) > 0;
                      const isAwaiting = hasSubmission && !hasMarks;
                      const isExpanded = expandedRows.has(student._id);

                    return (
                      <React.Fragment key={student._id}>
                        <tr className={`transition-colors cursor-pointer ${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50/50'}`} onClick={() => toggleRow(student._id)}>
                          <td className="px-6 py-5">
                            <div className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.firstName} {student.lastName}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{student.email}</div>
                          </td>
                          <td className="px-6 py-5 text-[10px] font-bold text-gray-500 tracking-widest">{student.rollNumber || 'N/A'}</td>
                          <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={totalMarks}
                                value={studentInputs[student._id]?.obtainedMarks ?? ''}
                                onChange={(e) => updateStudentInput(student._id, 'obtainedMarks', e.target.value)}
                                className={`w-20 rounded-xl px-4 py-2 font-black text-sm transition-all border ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary' : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600 shadow-sm'}`}
                              />
                              <span className={`text-[10px] font-black ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/ {totalMarks}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center">
                              {isAwaiting ? (
                                <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                                  <AlertCircle size={12} /> Pending
                                </span>
                              ) : hasMarks ? (
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-lg bg-gray-500/10 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                                  Not Submitted
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right w-16">
                            <button 
                              type="button" 
                              className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-brand-primary text-white' : (isDark ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black')}`}
                            >
                              <ChevronRight size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="5" className={`p-0 border-0 ${isDark ? 'bg-[#0A0E13]' : 'bg-gray-50 border-t border-gray-100'}`}>
                              <div className="p-6 md:p-8 animate-in slide-in-from-top-2 duration-300">
                                <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-white border-gray-200 shadow-sm'}`}>
                                  {studentInputs[student._id]?.studentAnswers ? (
                                      <div className="space-y-6">
                                          <div className="flex items-center gap-2 mb-4">
                                              <BookOpen size={16} className="text-brand-primary" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Student Submission Data</span>
                                          </div>
                                          {studentInputs[student._id].studentAnswers.map((ans, aIdx) => {
                                              const question = selectedClassroom?.assessments?.find(a => a._id === activeAssessmentId)?.questions?.find(q => q.id === ans.questionId);
                                              return (
                                                  <div key={ans.questionId} className={`p-5 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                                                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Question {aIdx + 1}: {question?.text || 'Deleted Question'}</p>
                                                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} leading-relaxed`}>
                                                          {ans.content}
                                                      </p>
                                                  </div>
                                              );
                                          })}
                                          <div className="mt-8">
                                              <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Teacher Feedback / Remarks</label>
                                              <textarea 
                                                className={`w-full rounded-2xl px-5 py-4 font-bold text-xs transition-all border ${isDark ? 'bg-[#1E2733]/50 border-[#1E2733] text-white focus:border-brand-primary placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 shadow-inner'}`}
                                                placeholder="Enter feedback for student..."
                                                value={studentInputs[student._id]?.remarks || ''}
                                                onChange={(e) => updateStudentInput(student._id, 'remarks', e.target.value)}
                                              />
                                          </div>
                                      </div>
                                  ) : (
                                      <p className={`text-sm font-medium leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {studentInputs[student._id]?.remarks || <span className="italic text-gray-500">Student has not submitted any answer yet.</span>}
                                      </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className={`text-[10px] font-black uppercase tracking-widest max-w-md ${isError ? 'text-rose-500' : isSuccess ? 'text-emerald-500' : 'text-gray-500'}`}>
                {message || 'Results are saved securely.'}
              </div>
              <button
                type="submit"
                disabled={isLoading || !selectedClassroomId || !assessmentName.trim()}
                className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-30 ${isDark ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}
              >
                {isLoading ? 'SAVING...' : 'SAVE MARKS'}
              </button>
            </div>
          </form>
        </div>

        <div className={`p-8 sm:p-12 rounded-[3.5rem] border backdrop-blur-md transition-all duration-500 ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Results Analytics</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">View student performance statistics.</p>
            </div>
            <select
              value={selectedAnalyticsAssessment}
              onChange={(e) => setSelectedAnalyticsAssessment(e.target.value)}
              className={`rounded-xl px-5 py-3 font-black text-[10px] uppercase tracking-widest appearance-none transition-all border ${isDark ? 'bg-gray-800 border-gray-700 text-white shadow-xl shadow-black/20' : 'bg-gray-100 border-gray-200 text-gray-900 shadow-sm'}`}
            >
              {assessmentOptions.length === 0 && <option value="">No Data Available</option>}
              {assessmentOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {selectedAssessmentResults.length === 0 ? (
            <div className="py-12 text-center">
               <div className={`inline-flex p-4 rounded-3xl mb-4 ${isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                 <BarChart3 size={32} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Waiting for results data...</p>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Pass vs Fail', value: `${analyticsSummary.passCount} / ${analyticsSummary.failCount}`, color: 'text-brand-primary' },
                  { label: 'Pass Percentage', value: `${analyticsSummary.passRate}%`, color: 'text-emerald-500' },
                  { label: 'Class Average', value: `${analyticsSummary.average}%`, color: 'text-amber-500' }
                ].map((stat, idx) => (
                  <div key={idx} className={`p-6 rounded-[2rem] border ${isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="h-72 w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart id="distribution-bar-chart" data={distributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E2733' : '#eee'} />
                    <XAxis 
                       dataKey="range" 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      cursor={{ fill: isDark ? '#1E2733' : '#f8fafc', radius: 12 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-[#0A0E13]/90 border-[#1E2733]' : 'bg-white/90 border-gray-100'}`}>
                              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{payload[0].payload.range}% Range</p>
                              <p className="text-[10px] font-bold text-brand-primary uppercase">{payload[0].value} Students</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="students" fill="#2E67FF" radius={[6, 6, 0, 0]} barSize={40} isAnimationActive={false} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className={`rounded-[3rem] border overflow-hidden backdrop-blur-md transition-all duration-500 ${isDark ? 'bg-[#121A22]/50 border-[#1E2733]' : 'bg-white/80 border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between px-10 py-8 border-b border-inherit">
            <div>
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Results History</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">View previously saved marks and exams</p>
            </div>
            {teacherResults.length > 0 && (
              <button
                onClick={exportResultsCsv}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-gray-800 text-gray-400 hover:text-brand-primary' : 'bg-gray-100 text-gray-500 hover:text-black'}`}
              >
                <Download size={15} strokeWidth={3} />
                Download Report
              </button>
            )}
          </div>
          {teacherResults.length === 0 ? (
            <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 opacity-50">
               No saved results found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'}>
                  <tr>
                    {['Assessment', 'Student Name', 'Course', 'Marks', 'Action', 'Date'].map((header) => (
                      <th key={header} className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {teacherResults.map((result) => (
                    <tr key={result._id} className={`transition-colors ${isDark ? 'hover:bg-brand-primary/5 divide-[#1E2733]' : 'hover:bg-indigo-50/30 divide-gray-100'}`}>
                      <td className="px-8 py-6">
                        <div className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.assessmentName}</div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{result.examType}</div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.student?.firstName} {result.student?.lastName}</div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{result.course?.courseName}</div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`text-sm font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.obtainedMarks} <span className="text-gray-500 text-xs">/ {result.totalMarks}</span></div>
                      </td>
                      <td className="px-8 py-6">
                        <button
                          type="button"
                          onClick={() => setHistoryResultId(result._id === historyResultId ? '' : result._id)}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black'}`}
                        >
                          {(result.updateHistory?.length || 0)} REVISIONS
                        </button>
                      </td>
                      <td className="px-8 py-6">
                         <div className="text-[10px] font-bold text-gray-500 italic">"{result.remarks || 'No notes persisted'}"</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedHistoryResult && (
          <div className={`p-8 sm:p-12 rounded-[3.5rem] border backdrop-blur-md animate-in slide-in-from-bottom-8 duration-700 ${isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-white border-gray-100 shadow-2xl'}`}>
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-inherit">
               <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
                 <Shield size={24} />
               </div>
               <div>
                 <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                   Ledger Audit Trail
                 </h3>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                   {selectedHistoryResult.assessmentName} — {selectedHistoryResult.student?.firstName} {selectedHistoryResult.student?.lastName}
                 </p>
               </div>
            </div>
            
            {(selectedHistoryResult.updateHistory || []).length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 opacity-50">
                No historical discrepancies detected.
              </div>
            ) : (
              <div className="space-y-4">
                {[...(selectedHistoryResult.updateHistory || [])].reverse().map((entry, idx) => (
                  <div key={idx} className={`relative p-6 rounded-3xl border ${isDark ? 'bg-[#121A22] border-[#1E2733]' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${isDark ? 'bg-brand-primary text-white' : 'bg-indigo-600 text-white'}`}>
                            {entry.changedBy?.firstName?.[0] || '?'}
                         </div>
                         <div>
                           <p className={`text-xs font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                             {entry.changedBy ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}` : 'System Protocol'}
                           </p>
                           <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                             {entry.changedAt ? new Date(entry.changedAt).toLocaleString() : 'TIMESTR_ERR'}
                           </p>
                         </div>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                        Validated
                      </div>
                    </div>
                    <div className="ml-11 space-y-2">
                      {Object.entries(entry.changes || {}).map(([field, value]) => (
                        <div key={field} className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest w-16">{field}:</span>
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-rose-500 line-through opacity-50">{String(value?.from ?? 'NULL')}</span>
                              <ChevronRight size={12} className="text-gray-400" />
                              <span className="text-[10px] font-black text-emerald-500">{String(value?.to ?? 'NULL')}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {reviewingStudentId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setReviewingStudentId(null)}></div>
             <div className={`relative w-full max-w-2xl rounded-[3rem] border shadow-2xl p-8 sm:p-12 animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#0A0E13] border-[#1E2733]' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                         <Eye size={24} />
                      </div>
                      <div>
                         <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Review Student Submission</h3>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                           {(selectedClassroom?.assignedStudents || []).find(s => s._id === reviewingStudentId)?.firstName} - {assessmentName}
                         </p>
                      </div>
                   </div>
                </div>

                 <div className={`p-6 rounded-3xl border mb-8 max-h-[40vh] overflow-y-auto ${isDark ? 'bg-[#121A22] border-[#1E2733] text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                   <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {studentInputs[reviewingStudentId]?.remarks || 'No submission content found.'}
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <div className="flex-1 space-y-2">
                     <label className={`block text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>Assign Marks (Out of {totalMarks})</label>
                     <input
                        type="number"
                        min="0"
                        max={totalMarks}
                        value={studentInputs[reviewingStudentId]?.obtainedMarks ?? ''}
                        onChange={(e) => updateStudentInput(reviewingStudentId, 'obtainedMarks', e.target.value)}
                        className={`w-full rounded-2xl px-5 py-3 font-bold text-xs transition-all border ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-brand-primary' : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600 shadow-inner'}`}
                        placeholder={`Out of ${totalMarks}`}
                     />
                   </div>
                   <div className="flex-1 flex items-end">
                      <button 
                         onClick={() => setReviewingStudentId(null)}
                         className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:scale-105' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:scale-105'}`}
                      >
                         Apply Grade & Close
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherResultsPage;
