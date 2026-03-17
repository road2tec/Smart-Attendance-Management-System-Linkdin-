const express = require('express');
const router = express.Router();
const resultController = require('../controller/resultController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post(
  '/classroom/:classroomId',
  authorizeRoles(['teacher', 'admin']),
  resultController.saveClassroomResults
);

router.get(
  '/teacher/me',
  authorizeRoles(['teacher', 'admin']),
  resultController.getTeacherResults
);

router.get(
  '/teacher/:teacherId',
  authorizeRoles(['admin']),
  resultController.getTeacherResults
);

router.get(
  '/student/me',
  authorizeRoles(['student', 'admin']),
  resultController.getStudentResults
);

router.get(
  '/student/:studentId',
  authorizeRoles(['teacher', 'admin']),
  resultController.getStudentResults
);

router.get(
  '/admin/all',
  authorizeRoles(['admin']),
  resultController.adminGetAllResults
);

module.exports = router;