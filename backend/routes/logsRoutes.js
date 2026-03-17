const express = require('express');
const router = express.Router();
const { getFailedFaceAttempts, getLogsSummary, getRecognitionAttempts, checkUnknownAttemptAlert, getLiveMonitoring } = require('../controller/logsController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(authorizeRoles(['admin']));

router.get('/failed-face', getFailedFaceAttempts);
router.get('/summary', getLogsSummary);
router.get('/recognition-attempts', getRecognitionAttempts);
router.get('/alerts/check', checkUnknownAttemptAlert);
router.get('/live', getLiveMonitoring);

module.exports = router;
