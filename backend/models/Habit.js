const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
      enum: ['Health', 'Productivity', 'Mindfulness', 'Learning', 'Fitness', 'Finance', 'General'],
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'selected_days'],
      default: 'daily',
    },
    targetDays: {
      type: [String], // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    color: {
      type: String,
      default: '#6B8F71',
    },
    icon: {
      type: String,
      default: 'CheckCircle',
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    completedDates: [{
      type: String, // Store formatted dates: 'YYYY-MM-DD'
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Habit', habitSchema);

