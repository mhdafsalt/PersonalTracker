const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Flexibility', 'Sports', 'Other'],
      default: 'Strength',
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30,
    },
    sets: {
      type: Number,
      default: 0,
    },
    reps: {
      type: Number,
      default: 0,
    },
    weightKg: {
      type: Number,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const fitnessRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    weight: {
      type: Number, // in kg
    },
    steps: {
      type: Number,
      default: 0,
    },
    waterLiters: {
      type: Number,
      default: 0,
    },
    sleepHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model('Workout', workoutSchema);
const FitnessRecord = mongoose.model('FitnessRecord', fitnessRecordSchema);

module.exports = {
  Workout,
  FitnessRecord,
};

