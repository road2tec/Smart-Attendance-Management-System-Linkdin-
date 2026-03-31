const express = require('express');
const router = express.Router();
const { getParentDashboard } = require('../controller/parentController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(authorizeRoles(['parent']));

router.get('/dashboard', getParentDashboard);

module.exports = router;
