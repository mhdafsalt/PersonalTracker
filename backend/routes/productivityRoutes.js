const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  logFocusSession,
  getFocusSessions,
} = require('../controllers/productivityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/tasks').get(getTasks).post(createTask);
router.route('/tasks/:id').put(updateTask).delete(deleteTask);

router.route('/focus').get(getFocusSessions).post(logFocusSession);

module.exports = router;

