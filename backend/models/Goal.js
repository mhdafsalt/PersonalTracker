const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
  },
});

const goalSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Career', 'Health', 'Finance', 'Learning', 'Personal', 'Creative', 'Other'],
      default: 'Personal',
    },
    type: {
      type: String,
      enum: ['short-term', 'long-term'],
      default: 'short-term',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
      default: 'In Progress',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);

