const Result = require('../model/result');
const Classroom = require('../model/classroom');
const User = require('../model/user');

const getUserId = (req) => req.user?.userId || req.user?.id || req.user?._id;

const buildSummary = (results) => {
  const totalResults = results.length;
  const totalMarks = results.reduce((sum, item) => sum + (item.totalMarks || 0), 0);
  const obtainedMarks = results.reduce((sum, item) => sum + (item.obtainedMarks || 0), 0);
  const averagePercentage = totalMarks > 0 ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2)) : 0;
  const highestPercentage = results.length > 0
    ? Math.max(...results.map((item) => item.totalMarks > 0 ? (item.obtainedMarks / item.totalMarks) * 100 : 0))
    : 0;

  return {
    totalResults,
    totalMarks,
    obtainedMarks,
    averagePercentage,
    highestPercentage: Number(highestPercentage.toFixed(2)),
  };
};

const resultController = {
  saveClassroomResults: async (req, res) => {
    try {
      const currentUserId = getUserId(req);
      const { classroomId } = req.params;
      const { assessmentName, examType, totalMarks, publishedAt, results } = req.body;

      if (!assessmentName || !totalMarks || !Array.isArray(results) || results.length === 0) {
        return res.status(400).json({ message: 'Assessment name, total marks and student results are required.' });
      }

      const classroom = await Classroom.findById(classroomId)
        .populate('course', 'courseName courseCode')
        .populate('group', 'name')
        .populate('assignedTeacher', 'firstName lastName email')
        .populate('assignedStudents', 'firstName lastName email rollNumber');

      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found.' });
      }

      if (req.user?.role === 'teacher' && classroom.assignedTeacher?._id?.toString() !== String(currentUserId)) {
        return res.status(403).json({ message: 'You can only upload results for your assigned classrooms.' });
      }

      const assignedStudentIds = new Set((classroom.assignedStudents || []).map((student) => String(student._id)));
      const upsertedResults = [];

      for (const item of results) {
        if (!item.studentId || !assignedStudentIds.has(String(item.studentId))) {
          continue;
        }

        const obtained = Number(item.obtainedMarks);
        const total = Number(totalMarks);
        const nextPublishedAt = publishedAt ? new Date(publishedAt) : new Date();

        if (Number.isNaN(obtained) || obtained < 0 || obtained > total) {
          return res.status(400).json({ message: 'Obtained marks must be between 0 and total marks.' });
        }

        const filter = {
          classroom: classroomId,
          student: item.studentId,
          assessmentName: assessmentName.trim(),
        };

        const existing = await Result.findOne(filter);
        let saved;

        if (!existing) {
          saved = await Result.create({
            assessmentName: assessmentName.trim(),
            examType: examType || 'internal',
            totalMarks: total,
            obtainedMarks: obtained,
            remarks: item.remarks || '',
            publishedAt: nextPublishedAt,
            classroom: classroom._id,
            course: classroom.course?._id,
            group: classroom.group?._id,
            teacher: classroom.assignedTeacher?._id || currentUserId,
            student: item.studentId,
          });
        } else {
          const changes = {};
          const nextExamType = examType || 'internal';
          const nextRemarks = item.remarks || '';

          if (existing.obtainedMarks !== obtained) {
            changes.obtainedMarks = { from: existing.obtainedMarks, to: obtained };
          }
          if (existing.totalMarks !== total) {
            changes.totalMarks = { from: existing.totalMarks, to: total };
          }
          if (existing.examType !== nextExamType) {
            changes.examType = { from: existing.examType, to: nextExamType };
          }
          if ((existing.remarks || '') !== nextRemarks) {
            changes.remarks = { from: existing.remarks || '', to: nextRemarks };
          }
          const oldPublishedAt = existing.publishedAt ? new Date(existing.publishedAt).getTime() : null;
          const newPublishedAt = nextPublishedAt ? new Date(nextPublishedAt).getTime() : null;
          if (oldPublishedAt !== newPublishedAt) {
            changes.publishedAt = {
              from: existing.publishedAt || null,
              to: nextPublishedAt || null,
            };
          }

          const updateDoc = {
            $set: {
              examType: nextExamType,
              totalMarks: total,
              obtainedMarks: obtained,
              remarks: nextRemarks,
              publishedAt: nextPublishedAt,
              teacher: classroom.assignedTeacher?._id || currentUserId,
            },
          };

          if (Object.keys(changes).length > 0) {
            updateDoc.$push = {
              updateHistory: {
                changedAt: new Date(),
                changedBy: currentUserId,
                changes,
              },
            };
          }

          saved = await Result.findOneAndUpdate(filter, updateDoc, {
            new: true,
            runValidators: true,
          });
        }

        saved = await Result.findById(saved._id)
          .populate('student', 'firstName lastName email rollNumber')
          .populate('course', 'courseName courseCode')
          .populate('group', 'name')
          .populate('teacher', 'firstName lastName')
          .populate('updateHistory.changedBy', 'firstName lastName email');

        upsertedResults.push(saved);
      }

      return res.status(200).json({
        success: true,
        message: 'Results saved successfully.',
        data: {
          results: upsertedResults,
          classroom: {
            _id: classroom._id,
            course: classroom.course,
            group: classroom.group,
          },
        },
      });
    } catch (error) {
      console.error('Error saving classroom results:', error);
      return res.status(500).json({ message: 'Failed to save results.', error: error.message });
    }
  },

  getTeacherResults: async (req, res) => {
    try {
      const teacherId = req.params.teacherId || getUserId(req);
      const { classroomId } = req.query;

      if (req.user?.role === 'teacher' && String(teacherId) !== String(getUserId(req))) {
        return res.status(403).json({ message: 'Unauthorized access.' });
      }

      const filter = { teacher: teacherId };
      if (classroomId) {
        filter.classroom = classroomId;
      }

      const results = await Result.find(filter)
        .populate('student', 'firstName lastName email rollNumber')
        .populate('course', 'courseName courseCode')
        .populate('group', 'name')
        .populate('classroom', '_id')
        .populate('updateHistory.changedBy', 'firstName lastName email')
        .sort({ publishedAt: -1, assessmentName: 1 });

      return res.status(200).json({
        success: true,
        data: {
          results,
          summary: buildSummary(results),
        },
      });
    } catch (error) {
      console.error('Error fetching teacher results:', error);
      return res.status(500).json({ message: 'Failed to fetch teacher results.', error: error.message });
    }
  },

  getStudentResults: async (req, res) => {
    try {
      const currentUserId = getUserId(req);
      const studentId = req.params.studentId || currentUserId;

      if (req.user?.role === 'student' && String(studentId) !== String(currentUserId)) {
        return res.status(403).json({ message: 'Unauthorized access.' });
      }

      const results = await Result.find({ student: studentId })
        .populate('student', 'firstName lastName email rollNumber')
        .populate('course', 'courseName courseCode')
        .populate('group', 'name')
        .populate('teacher', 'firstName lastName email')
        .populate('updateHistory.changedBy', 'firstName lastName email')
        .sort({ publishedAt: -1, assessmentName: 1 });

      return res.status(200).json({
        success: true,
        data: {
          results,
          summary: buildSummary(results),
        },
      });
    } catch (error) {
      console.error('Error fetching student results:', error);
      return res.status(500).json({ message: 'Failed to fetch student results.', error: error.message });
    }
  },

  adminGetAllResults: async (req, res) => {
    try {
      const { classroomId, courseId, examType, limit = 500 } = req.query;

      const filter = {};
      if (classroomId) filter.classroom = classroomId;
      if (courseId) filter.course = courseId;
      if (examType) filter.examType = examType;

      const results = await Result.find(filter)
        .populate('student', 'firstName lastName email rollNumber')
        .populate('course', 'courseName courseCode')
        .populate('group', 'name')
        .populate('classroom', '_id')
        .populate('teacher', 'firstName lastName')
        .populate('updateHistory.changedBy', 'firstName lastName email')
        .sort({ publishedAt: -1, assessmentName: 1 })
        .limit(Number(limit))
        .lean();

      const total = await Result.countDocuments(filter);

      return res.status(200).json({
        success: true,
        total,
        data: {
          results,
          summary: buildSummary(results),
        },
      });
    } catch (error) {
      console.error('Error fetching admin results:', error);
      return res.status(500).json({ message: 'Failed to fetch results.', error: error.message });
    }
  },
};

module.exports = resultController;