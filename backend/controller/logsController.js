const Attendance = require('../model/attendance');
const mongoose = require('mongoose');
const Classroom = require('../model/classroom');
const ClassModel = require('../model/class');
const RecognitionAttempt = require('../model/recognitionAttempt');
const User = require('../model/user');
const AlertNotification = require('../model/alertNotification');
const { sendMail, isMailerConfigured } = require('../utils/mailer');

/**
 * GET /api/logs/failed-face
 * Returns attendance records where faceRecognized === false (failed / unknown face attempts).
 * Admin-only. Supports optional query params: startDate, endDate, classroomId, limit.
 */
const getFailedFaceAttempts = async (req, res) => {
  try {
    const { startDate, endDate, classroomId, limit = 200 } = req.query;

    const match = { faceRecognized: false };

    if (classroomId && mongoose.Types.ObjectId.isValid(classroomId)) {
      match.classroom = new mongoose.Types.ObjectId(classroomId);
    }

    if (startDate || endDate) {
      match.markedAt = {};
      if (startDate) match.markedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.markedAt.$lte = end;
      }
    }

    const records = await Attendance.find(match)
      .sort({ markedAt: -1 })
      .limit(Number(limit))
      .populate('student', 'firstName lastName email rollNumber profileImage')
      .populate('classroom', 'course group')
      .populate({ path: 'classroom', populate: [{ path: 'course', select: 'courseName courseCode' }, { path: 'group', select: 'name' }] })
      .lean();

    const total = await Attendance.countDocuments(match);

    return res.json({ success: true, total, data: records });
  } catch (err) {
    console.error('getFailedFaceAttempts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch logs', error: err.message });
  }
};

/**
 * GET /api/logs/summary
 * Quick counts: total failed, today failed, total suspicious (failed + not present).
 * Admin-only.
 */
const getLogsSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalFailed, todayFailed, totalUnknownRecognition, todayUnknownRecognition] = await Promise.all([
      Attendance.countDocuments({ faceRecognized: false }),
      Attendance.countDocuments({ faceRecognized: false, markedAt: { $gte: todayStart } }),
      RecognitionAttempt.countDocuments({ resultType: 'unknown' }),
      RecognitionAttempt.countDocuments({ resultType: 'unknown', createdAt: { $gte: todayStart } }),
    ]);

    return res.json({
      success: true,
      data: {
        totalFailed,
        todayFailed,
        totalUnknownRecognition,
        todayUnknownRecognition,
      },
    });
  } catch (err) {
    console.error('getLogsSummary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch summary', error: err.message });
  }
};

/**
 * GET /api/logs/recognition-attempts
 * Returns dedicated recognition attempts (unknown/matched/error) for auditing.
 */
const getRecognitionAttempts = async (req, res) => {
  try {
    const { startDate, endDate, resultType = 'unknown', limit = 200 } = req.query;
    const filter = {};

    if (resultType && resultType !== 'all') {
      filter.resultType = resultType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const records = await RecognitionAttempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('matchedUser', 'firstName lastName email rollNumber')
      .populate('classroom', 'course group')
      .populate({
        path: 'classroom',
        populate: [
          { path: 'course', select: 'courseName courseCode' },
          { path: 'group', select: 'name' },
        ],
      })
      .populate('class', 'title')
      .lean();

    const total = await RecognitionAttempt.countDocuments(filter);
    return res.json({ success: true, total, data: records });
  } catch (err) {
    console.error('getRecognitionAttempts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch recognition attempts', error: err.message });
  }
};

/**
 * GET /api/logs/alerts/check
 * Checks unknown face recognition attempts against threshold.
 * Query params:
 * - windowMinutes (default 30)
 * - threshold (default 5)
 * - sendEmail (true|false, default false)
 * - recipients (comma-separated optional emails)
 */
const checkUnknownAttemptAlert = async (req, res) => {
  try {
    const windowMinutes = Math.max(1, Number(req.query.windowMinutes || 30));
    const threshold = Math.max(1, Number(req.query.threshold || 5));
    const cooldownMinutes = Math.max(1, Number(req.query.cooldownMinutes || 10));
    const sendEmailFlag = String(req.query.sendEmail || 'false').toLowerCase() === 'true';
    const now = new Date();
    const since = new Date(now.getTime() - windowMinutes * 60 * 1000);

    const unknownCount = await RecognitionAttempt.countDocuments({
      resultType: 'unknown',
      createdAt: { $gte: since },
    });

    const triggered = unknownCount >= threshold;
    const cooldownWindowStart = new Date(now.getTime() - cooldownMinutes * 60 * 1000);
    const alertType = `unknown-face-threshold-${windowMinutes}m-${threshold}`;
    const lastEmailNotification = await AlertNotification.findOne({
      alertType,
      channel: 'email',
    })
      .sort({ sentAt: -1 })
      .lean();

    const isInCooldown = Boolean(
      lastEmailNotification?.sentAt && new Date(lastEmailNotification.sentAt) >= cooldownWindowStart
    );

    const nextAllowedAt = isInCooldown
      ? new Date(new Date(lastEmailNotification.sentAt).getTime() + cooldownMinutes * 60 * 1000)
      : now;

    let emailResult = {
      attempted: false,
      sent: false,
      skippedByCooldown: false,
      cooldownMinutes,
      nextAllowedAt,
      recipients: [],
      message: '',
    };

    if (triggered && sendEmailFlag) {
      emailResult.attempted = true;

      if (isInCooldown) {
        emailResult.skippedByCooldown = true;
        emailResult.message = `Cooldown active. Next alert email allowed after ${nextAllowedAt.toLocaleString()}.`;
      } else if (!isMailerConfigured()) {
        emailResult.message = 'SMTP not configured.';
      } else {
        const manualRecipients = String(req.query.recipients || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

        const adminUsers = await User.find({ role: 'admin' }).select('email').lean();
        const adminEmails = adminUsers.map((item) => item.email).filter(Boolean);
        const recipients = [...new Set([...manualRecipients, ...adminEmails])];

        if (recipients.length === 0) {
          emailResult.message = 'No admin recipients found.';
        } else {
          const subject = `SmartAttend Alert: ${unknownCount} unknown face attempts in ${windowMinutes} minutes`;
          const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
              <h2 style="color: #b91c1c;">Security Alert: Unknown Face Attempts</h2>
              <p><strong>${unknownCount}</strong> unknown face recognition attempts were recorded in the last <strong>${windowMinutes} minutes</strong>.</p>
              <p>Alert threshold: <strong>${threshold}</strong></p>
              <p>Triggered at: <strong>${now.toLocaleString()}</strong></p>
              <p>Please review the admin <strong>Security Logs</strong> and <strong>Live Monitoring</strong> panels.</p>
            </div>
          `;
          const text = [
            'Security Alert: Unknown Face Attempts',
            `${unknownCount} unknown attempts in last ${windowMinutes} minutes`,
            `Threshold: ${threshold}`,
            `Triggered at: ${now.toISOString()}`,
            'Review Security Logs and Live Monitoring in admin panel.',
          ].join('\n');

          await sendMail({
            to: recipients.join(','),
            subject,
            html,
            text,
          });

          await AlertNotification.create({
            alertType,
            channel: 'email',
            recipients,
            triggeredCount: unknownCount,
            threshold,
            windowMinutes,
            sentAt: now,
          });

          emailResult.sent = true;
          emailResult.recipients = recipients;
          emailResult.message = 'Alert email sent.';
        }
      }
    }

    return res.json({
      success: true,
      data: {
        triggered,
        unknownCount,
        threshold,
        windowMinutes,
        cooldownMinutes,
        cooldownActive: isInCooldown,
        cooldownNextAllowedAt: nextAllowedAt,
        checkedAt: now,
        email: emailResult,
      },
    });
  } catch (err) {
    console.error('checkUnknownAttemptAlert error:', err);
    return res.status(500).json({ success: false, message: 'Failed to check unknown-attempt alert', error: err.message });
  }
};

/**
 * GET /api/logs/live
 * Returns live monitoring payload for admin dashboard.
 * Query params: eventMinutes (default 30), limit (default 100)
 */
const getLiveMonitoring = async (req, res) => {
  try {
    const eventMinutes = Number(req.query.eventMinutes || 30);
    const limit = Number(req.query.limit || 100);
    const now = new Date();

    const classrooms = await Classroom.find({})
      .populate('course', 'courseName courseCode')
      .populate('group', 'name')
      .populate('assignedTeacher', 'firstName lastName email')
      .lean();

    const activeWindows = [];
    const activeClassIds = [];

    for (const classroom of classrooms) {
      for (const classEntry of classroom.classes || []) {
        const window = classEntry.attendanceWindow;
        if (!window?.isOpen || !window.openedAt) {
          continue;
        }

        const closesAt = window.closesAt ? new Date(window.closesAt) : null;
        const isStillOpen = !closesAt || closesAt >= now;
        if (!isStillOpen) {
          continue;
        }

        const classId = classEntry.class;
        if (classId) {
          activeClassIds.push(classId);
        }

        activeWindows.push({
          classroomId: classroom._id,
          classId,
          status: classEntry.status,
          openedAt: window.openedAt,
          closesAt: window.closesAt || null,
          course: classroom.course || null,
          group: classroom.group || null,
          teacher: classroom.assignedTeacher || null,
          totalAssignedStudents: (classroom.assignedStudents || []).length,
        });
      }
    }

    const uniqueClassIds = [...new Set(activeClassIds.map((id) => String(id)))].map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    let classTitleMap = {};
    if (uniqueClassIds.length > 0) {
      const classes = await ClassModel.find({ _id: { $in: uniqueClassIds } })
        .select('title')
        .lean();
      classTitleMap = classes.reduce((acc, item) => {
        acc[String(item._id)] = item.title;
        return acc;
      }, {});
    }

    const attendanceCounts = uniqueClassIds.length
      ? await Attendance.aggregate([
          { $match: { class: { $in: uniqueClassIds } } },
          {
            $group: {
              _id: '$class',
              total: { $sum: 1 },
              present: {
                $sum: {
                  $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0],
                },
              },
              failedFace: {
                $sum: {
                  $cond: [{ $eq: ['$faceRecognized', false] }, 1, 0],
                },
              },
            },
          },
        ])
      : [];

    const countMap = attendanceCounts.reduce((acc, item) => {
      acc[String(item._id)] = item;
      return acc;
    }, {});

    const windowsWithStats = activeWindows.map((windowItem) => {
      const classKey = windowItem.classId ? String(windowItem.classId) : '';
      const stats = countMap[classKey] || { total: 0, present: 0, failedFace: 0 };
      return {
        ...windowItem,
        classTitle: classTitleMap[classKey] || 'Untitled Class',
        attendanceMarked: stats.total,
        presentOrLate: stats.present,
        failedFaceAttempts: stats.failedFace,
      };
    });

    const since = new Date(now.getTime() - Math.max(1, eventMinutes) * 60 * 1000);
    const recentEvents = await Attendance.find({ markedAt: { $gte: since } })
      .sort({ markedAt: -1 })
      .limit(Math.max(1, limit))
      .populate('student', 'firstName lastName email rollNumber')
      .populate({
        path: 'classroom',
        select: 'course group',
        populate: [
          { path: 'course', select: 'courseName courseCode' },
          { path: 'group', select: 'name' },
        ],
      })
      .populate('class', 'title')
      .lean();

    const failedEvents = recentEvents.filter((item) => item.faceRecognized === false).length;
    const recentUnknownRecognition = await RecognitionAttempt.countDocuments({
      resultType: 'unknown',
      createdAt: { $gte: since },
    });

    return res.json({
      success: true,
      data: {
        serverTime: now,
        eventWindowMinutes: Math.max(1, eventMinutes),
        activeWindowCount: windowsWithStats.length,
        activeWindows: windowsWithStats,
        recentEvents,
        summary: {
          recentEventCount: recentEvents.length,
          recentFailedFaceCount: failedEvents,
          recentUnknownRecognition,
        },
      },
    });
  } catch (err) {
    console.error('getLiveMonitoring error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch live monitoring data',
      error: err.message,
    });
  }
};

module.exports = { getFailedFaceAttempts, getLogsSummary, getRecognitionAttempts, checkUnknownAttemptAlert, getLiveMonitoring };
