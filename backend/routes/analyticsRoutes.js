const express = require('express');
const router = express.Router();
const { getMasterAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMasterAnalytics);

module.exports = router;

