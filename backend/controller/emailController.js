const User = require('../model/user');
const Attendance = require('../model/attendance');
const { sendMail, isMailerConfigured } = require('../utils/mailer');

const getDateRange = (range) => {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '180d':
    default:
      startDate.setDate(endDate.getDate() - 180);
      break;
  }

  return { startDate, endDate };
};

const buildAttendanceEmail = ({ student, stats, rangeLabel }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="color: #2563eb;">Attendance Report - ${student.firstName} ${student.lastName}</h2>
      <p>This is the ${rangeLabel} attendance summary for <strong>${student.firstName} ${student.lastName}</strong>.</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #d1d5db;">Total Classes</td>
          <td style="padding: 10px; border: 1px solid #d1d5db;">${stats.totalClasses}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d1d5db;">Present</td>
          <td style="padding: 10px; border: 1px solid #d1d5db;">${stats.presentCount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d1d5db;">Late</td>
          <td style="padding: 10px; border: 1px solid #d1d5db;">${stats.lateCount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d1d5db;">Absent</td>
          <td style="padding: 10px; border: 1px solid #d1d5db;">${stats.absentCount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">Attendance Percentage</td>
          <td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">${stats.attendancePercentage}%</td>
        </tr>
      </table>
      <p style="margin-top: 16px;">Regards,<br/>SmartAttend Admin Panel</p>
    </div>
  `;

  const text = [
    `Attendance Report - ${student.firstName} ${student.lastName}`,
    `${rangeLabel} summary`,
    `Total Classes: ${stats.totalClasses}`,
    `Present: ${stats.presentCount}`,
    `Late: ${stats.lateCount}`,
    `Absent: ${stats.absentCount}`,
    `Attendance Percentage: ${stats.attendancePercentage}%`,
  ].join('\n');

  return { html, text };
};

const buildStudentStats = async (studentId, dateFilter) => {
  const records = await Attendance.find({ student: studentId, markedAt: dateFilter });
  const totalClasses = records.length;
  const presentCount = records.filter((item) => item.status === 'present').length;
  const lateCount = records.filter((item) => item.status === 'late').length;
  const absentCount = records.filter((item) => item.status === 'absent').length;
  const attendancePercentage = totalClasses > 0
    ? (((presentCount + lateCount * 0.5) / totalClasses) * 100).toFixed(2)
    : '0.00';

  return {
    totalClasses,
    presentCount,
    lateCount,
    absentCount,
    attendancePercentage,
  };
};

const emailController = {
  getEmailConfigStatus: async (req, res) => {
    return res.status(200).json({
      success: true,
      data: {
        configured: isMailerConfigured(),
        smtpUser: process.env.SMTP_USER || '',
      },
    });
  },

  sendAttendanceReport: async (req, res) => {
    try {
      if (!isMailerConfigured()) {
        return res.status(400).json({ message: 'SMTP is not configured on the server.' });
      }

      const { studentId, recipientEmail, range = '180d' } = req.body;

      if (!studentId || !recipientEmail) {
        return res.status(400).json({ message: 'studentId and recipientEmail are required.' });
      }

      const student = await User.findById(studentId).select('firstName lastName email role');
      if (!student || student.role !== 'student') {
        return res.status(404).json({ message: 'Student not found.' });
      }

      const { startDate, endDate } = getDateRange(range);
      const stats = await buildStudentStats(studentId, { $gte: startDate, $lte: endDate });
      const rangeLabel = range === '30d' ? '30-day' : range === '90d' ? '90-day' : '6-month';
      const { html, text } = buildAttendanceEmail({ student, stats, rangeLabel });

      await sendMail({
        to: recipientEmail,
        subject: `${rangeLabel} attendance report for ${student.firstName} ${student.lastName}`,
        html,
        text,
      });

      return res.status(200).json({
        success: true,
        message: 'Attendance report email sent successfully.',
        data: {
          student: {
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
          },
          stats,
        },
      });
    } catch (error) {
      console.error('Error sending attendance email:', error);
      return res.status(500).json({ message: 'Failed to send attendance report email.', error: error.message });
    }
  },
};

module.exports = emailController;