const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
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
    company: {
      type: String,
      default: '',
    },
    brandName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    socialLinks: {
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    requirements: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Lead', 'Past Client', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const revisionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: String,
  feedback: String,
  fileUrl: String,
});

const designProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
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
      enum: [
        'Logo Design',
        'Brand Identity',
        'Social Media Design',
        'Poster Design',
        'Banner Design',
        'Business Card',
        'UI/UX Design',
        'Packaging Design',
        'Other',
      ],
      default: 'Brand Identity',
    },
    status: {
      type: String,
      enum: [
        'New',
        'Brief Received',
        'In Progress',
        'Review',
        'Revision',
        'Approved',
        'Completed',
        'Cancelled',
      ],
      default: 'New',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    brief: {
      type: String,
      default: '',
    },
    pricing: {
      type: Number,
      default: 0,
    },
    advancePayment: {
      type: Number,
      default: 0,
    },
    remainingPayment: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending',
    },
    referenceImages: [String],
    designAttachments: [String],
    finalFiles: [String],
    revisions: [revisionSchema],
    internalNotes: {
      type: String,
      default: '',
    },
    clientFeedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model('Client', clientSchema);
const DesignProject = mongoose.model('DesignProject', designProjectSchema);

module.exports = {
  Client,
  DesignProject,
};

