const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Work', 'Study', 'Personal', 'Meeting', 'Design', 'Exercise', 'Other'],
      default: 'Work',
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
    billable: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model('TimeEntry', timeEntrySchema);

