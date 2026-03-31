const express = require('express');
const router = express.Router();
const emailController = require('../controller/emailController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(authorizeRoles(['admin']));

router.get('/status', emailController.getEmailConfigStatus);
router.post('/attendance-report', emailController.sendAttendanceReport);
router.post('/parent-report', emailController.sendParentReport);
router.post('/bulk-6-month-report', emailController.sendBulk6MonthReports);

module.exports = router;