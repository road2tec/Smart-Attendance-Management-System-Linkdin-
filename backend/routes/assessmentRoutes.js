const express = require('express');
const router = express.Router();
const assessmentController = require('../controller/assessmentController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Teacher routes: Create assessment, Get all submissions, Evaluate individual submission
router.post('/classroom/:classroomId', authMiddleware, authorizeRoles(['teacher']), assessmentController.createAssessment);
router.get('/submissions/:assessmentId', authMiddleware, authorizeRoles(['teacher']), assessmentController.getSubmissions);
router.patch('/submission/:submissionId/evaluate', authMiddleware, authorizeRoles(['teacher']), assessmentController.evaluateSubmission);

// Student route: Submit its own assessment
router.post('/classroom/:classroomId/assessment/:assessmentId/submit', authMiddleware, authorizeRoles(['student']), assessmentController.submitAssessment);

module.exports = router;
