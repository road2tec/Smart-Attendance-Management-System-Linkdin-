import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Send, ShieldCheck } from 'lucide-react';
import { fetchStudents } from '../../../app/features/users/userThunks';
import { fetchEmailStatus, sendAttendanceReportEmail } from '../../../app/features/email/emailThunks';
import { resetEmailStatus } from '../../../app/features/email/emailSlice';

export default function EmailManagementSettings({ colors, theme }) {
  const dispatch = useDispatch();
  const { students = [], loading } = useSelector((state) => state.users);
  const { status, isLoading, isSuccess, isError, message, lastSentReport } = useSelector((state) => state.email);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [range, setRange] = useState('180d');

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchEmailStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const student = students.find((item) => item._id === selectedStudentId);
    setRecipientEmail(student?.email || '');
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (!isSuccess && !isError) return;
    const timer = setTimeout(() => dispatch(resetEmailStatus()), 3000);
    return () => clearTimeout(timer);
  }, [dispatch, isSuccess, isError]);

  const selectedStudent = useMemo(
    () => students.find((item) => item._id === selectedStudentId),
    [students, selectedStudentId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedStudentId || !recipientEmail) return;

    await dispatch(sendAttendanceReportEmail({
      studentId: selectedStudentId,
      recipientEmail,
      range,
    }));
  };

  return (
    <div className={`${colors.card} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-semibold ${colors.text}`}>Email Management</h2>
          <p className={`mt-1 text-sm ${colors.secondaryText}`}>Configure SMTP status and send attendance reports manually.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-[#1A2520]/40 text-[#2F955A]' : 'bg-green-50 text-green-700'}`}>
          <ShieldCheck size={16} />
          <span className="text-sm font-medium">{status?.configured ? 'SMTP Ready' : 'SMTP Missing'}</span>
        </div>
      </div>

      <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'border-[#1E2733] bg-[#0A0E13]/40' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Mail size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
          <span className={`font-medium ${colors.text}`}>Current SMTP Sender</span>
        </div>
        <p className={colors.secondaryText}>{status?.smtpUser || 'Not configured'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'border-[#1E2733] bg-[#0A0E13]/80 text-white' : 'border-gray-300 bg-white text-slate-800'}`}
            >
              <option value="">Select student</option>
              {(students || []).map((student) => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} ({student.rollNumber || 'No Roll'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'border-[#1E2733] bg-[#0A0E13]/80 text-white' : 'border-gray-300 bg-white text-slate-800'}`}
              placeholder="parent-or-student@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Report Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className={`w-full p-2 rounded-md border ${theme === 'dark' ? 'border-[#1E2733] bg-[#0A0E13]/80 text-white' : 'border-gray-300 bg-white text-slate-800'}`}
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="180d">Last 6 Months</option>
            </select>
          </div>

          <div className={`flex items-end ${colors.secondaryText} text-sm`}>
            {selectedStudent
              ? `Selected: ${selectedStudent.firstName} ${selectedStudent.lastName}`
              : 'Choose a student to prepare the attendance report email.'}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className={`text-sm ${isError ? 'text-red-500' : isSuccess ? 'text-green-600' : colors.secondaryText}`}>
            {message || 'This sends a generated attendance summary by email.'}
          </div>
          <button
            type="submit"
            disabled={isLoading || !status?.configured || !selectedStudentId || !recipientEmail}
            className={`${colors.button.primary} px-4 py-2 rounded-md inline-flex items-center gap-2 disabled:opacity-50`}
          >
            <Send size={16} />
            {isLoading ? 'Sending...' : 'Send Report'}
          </button>
        </div>
      </form>

      {lastSentReport && (
        <div className={`mt-6 p-4 rounded-lg border ${theme === 'dark' ? 'border-[#1E2733] bg-[#0A0E13]/40' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`font-medium mb-2 ${colors.text}`}>Last Sent Report</h3>
          <p className={colors.secondaryText}>{lastSentReport.student?.name} → {lastSentReport.student?.email}</p>
          <p className={colors.secondaryText}>Attendance: {lastSentReport.stats?.attendancePercentage}%</p>
        </div>
      )}
    </div>
  );
}