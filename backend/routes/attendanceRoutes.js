const express = require('express');
const router = express.Router();
const attendanceController = require('../controller/attendanceController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// ====== New Routes for Face Embedding and Location Verification ======
router.post('/verify-face', attendanceController.verifyUserEmbedding);
router.post('/verify-location', attendanceController.checkLocationValidity);

// ====== Teacher Routes ======
router.post('/window/open', authorizeRoles(['teacher']), attendanceController.openAttendanceWindow);
router.post('/window/close', authorizeRoles(['teacher']), attendanceController.closeAttendanceWindow);
router.get('/class/:classId', authorizeRoles(['teacher']), attendanceController.getClassAttendance);
router.post('/mark/manual', authorizeRoles(['teacher']), attendanceController.markAttendanceManually);
router.post('/mark/bulk', authorizeRoles(['teacher']), attendanceController.bulkMarkAttendance);

// ====== Analytics Routes ======
router.get('/defaulters/:courseId', authorizeRoles(['teacher', 'admin']), attendanceController.getDefaultersList);
router.get('/student/trends/:courseId', authorizeRoles(['student']), attendanceController.getStudentTrends);

// ====== Student Routes ======
router.post('/mark', authorizeRoles(['student']), attendanceController.markAttendanceByFaceAndLocation);
router.get('/student/course/:courseId', authorizeRoles(['student']), attendanceController.getStudentAttendance);

// ====== Common Routes ======
router.get('/window-status/:classId', attendanceController.getAttendanceWindowStatus);

module.exports = router;