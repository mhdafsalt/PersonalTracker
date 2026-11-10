const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  createWorkout,
  deleteWorkout,
  logDailyRecord,
} = require('../controllers/fitnessController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/workouts').get(getWorkouts).post(createWorkout);
router.route('/workouts/:id').delete(deleteWorkout);
router.route('/records').post(logDailyRecord);

module.exports = router;

