const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#6B8F71',
    },
    targetHours: {
      type: Number,
      default: 50,
    },
    examDate: {
      type: Date,
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

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      default: '',
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

const Subject = mongoose.model('Subject', subjectSchema);
const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = {
  Subject,
  StudySession,
};

