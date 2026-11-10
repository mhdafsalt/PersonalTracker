const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
    },
    category: {
      type: String,
      default: 'Work',
    },
    tags: [String],
    pomodorosEstimated: {
      type: Number,
      default: 1,
    },
    pomodorosCompleted: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 25,
    },
    sessionType: {
      type: String,
      enum: ['pomodoro', 'short_break', 'long_break'],
      default: 'pomodoro',
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

const Task = mongoose.model('Task', taskSchema);
const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

module.exports = {
  Task,
  FocusSession,
};

