const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
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
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    organization: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Personal', 'Client', 'Professional', 'Family', 'VIP', 'Mentor', 'Other'],
      default: 'Professional',
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    lastContactedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const callLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['Incoming', 'Outgoing', 'Missed'],
      default: 'Outgoing',
    },
    purpose: {
      type: String,
      default: 'General Catchup',
    },
    notes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
    followUpStatus: {
      type: String,
      enum: ['None', 'Pending', 'Completed', 'Cancelled'],
      default: 'None',
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);
const CallLog = mongoose.model('CallLog', callLogSchema);

module.exports = {
  Contact,
  CallLog,
};

