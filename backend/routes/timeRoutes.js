const express = require('express');
const router = express.Router();
const {
  getTimeEntries,
  startTimer,
  stopTimer,
  createManualEntry,
  deleteTimeEntry,
} = require('../controllers/timeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTimeEntries);
router.post('/start', startTimer);
router.put('/:id/stop', stopTimer);
router.post('/manual', createManualEntry);
router.delete('/:id', deleteTimeEntry);

module.exports = router;

