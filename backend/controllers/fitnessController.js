const { Workout, FitnessRecord } = require('../models/Fitness');

// @desc    Get workouts
// @route   GET /api/fitness/workouts
const getWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 });

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // Records
    const records = await FitnessRecord.find({ user: req.user._id }).sort({ date: -1 }).limit(14);
    const latestRecord = records[0] || null;

    res.json({
      success: true,
      data: {
        workouts,
        records,
        stats: {
          totalWorkouts,
          totalDurationMinutes: totalDuration,
          totalCalories,
          currentWeight: latestRecord ? latestRecord.weight : 0,
          todaySteps: latestRecord ? latestRecord.steps : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create workout
// @route   POST /api/fitness/workouts
const createWorkout = async (req, res, next) => {
  try {
    const { exerciseName, category, durationMinutes, sets, reps, weightKg, caloriesBurned, date, notes } = req.body;
    if (!exerciseName) {
      return res.status(400).json({ success: false, message: 'Exercise name is required' });
    }

    const workout = await Workout.create({
      user: req.user._id,
      exerciseName,
      category: category || 'Strength',
      durationMinutes: Number(durationMinutes) || 30,
      sets: Number(sets) || 0,
      reps: Number(reps) || 0,
      weightKg: Number(weightKg) || 0,
      caloriesBurned: Number(caloriesBurned) || 0,
      date: date || new Date(),
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: workout });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/fitness/workouts/:id
const deleteWorkout = async (req, res, next) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Workout deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Log daily metric (weight, steps, water)
// @route   POST /api/fitness/records
const logDailyRecord = async (req, res, next) => {
  try {
    const { date, weight, steps, waterLiters, sleepHours, notes } = req.body;
    const dateStr = date || new Date().toISOString().split('T')[0];

    const record = await FitnessRecord.findOneAndUpdate(
      { user: req.user._id, date: dateStr },
      {
        weight: weight !== undefined ? Number(weight) : undefined,
        steps: steps !== undefined ? Number(steps) : undefined,
        waterLiters: waterLiters !== undefined ? Number(waterLiters) : undefined,
        sleepHours: sleepHours !== undefined ? Number(sleepHours) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  deleteWorkout,
  logDailyRecord,
};

