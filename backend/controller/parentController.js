const User = require('../model/user');
const Attendance = require('../model/attendance');
const Result = require('../model/result');
const Classroom = require('../model/classroom');

// GET /api/parent/dashboard
// Returns the linked student's full academic profile for the logged-in parent
const getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const parent = await User.findById(parentId).populate('linkedStudent', '_id firstName lastName email rollNumber department group');
    
    if (!parent) return res.status(404).json({ error: 'Parent account not found.' });
    if (!parent.linkedStudent) return res.status(404).json({ error: 'No student is linked to this parent account. Please contact the administrator.' });

    const student = parent.linkedStudent;
    const studentId = student._id;

    // --- Attendance (last 6 months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    const attendanceRecords = await Attendance.find({
      student: studentId,
      markedAt: { $gte: sixMonthsAgo }
    }).populate('class', 'title schedule').sort({ markedAt: -1 });

    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const attendancePercentage = totalClasses > 0
      ? (((presentCount + lateCount * 0.5) / totalClasses) * 100).toFixed(1)
      : '0.0';

    // --- Results ---
    const results = await Result.find({ student: studentId })
      .populate('classroom', 'course')
      .sort({ createdAt: -1 })
      .limit(10);

    // --- Enrolled Classrooms ---
    const classrooms = await Classroom.find({ assignedStudents: studentId })
      .populate('course', 'courseName courseCode')
      .populate('department', 'name')
      .select('course department group');

    res.status(200).json({
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        rollNumber: student.rollNumber,
      },
      attendance: {
        totalClasses,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage,
        recentRecords: attendanceRecords.slice(0, 20).map(r => ({
          _id: r._id,
          status: r.status,
          markedAt: r.markedAt,
          sessionName: r.class?.title || 'Session',
        }))
      },
      results: results.map(r => ({
        _id: r._id,
        testName: r.assessmentName,
        marksObtained: r.obtainedMarks,
        totalMarks: r.totalMarks,
        percentage: r.totalMarks > 0 ? ((r.obtainedMarks / r.totalMarks) * 100).toFixed(1) : '0',
        courseName: r.classroom?.course?.courseName || 'General',
        date: r.createdAt,
      })),
      courses: classrooms.map(c => ({
        _id: c._id,
        courseName: c.course?.courseName || 'N/A',
        courseCode: c.course?.courseCode || 'N/A',
        departmentName: c.department?.name || 'N/A',
      }))
    });
  } catch (err) {
    console.error('Parent dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getParentDashboard };
