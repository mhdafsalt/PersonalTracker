const mongoose = require('mongoose');

const creativeProjectSchema = new mongoose.Schema(
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
      enum: ['Design', 'Writing', 'Music', 'Coding', 'Art', 'Video', 'Podcast', 'Photography', 'Other'],
      default: 'Design',
    },
    coverImage: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'],
      default: 'Planning',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    skills: [String],
    portfolioWorthy: {
      type: Boolean,
      default: false,
    },
    achievements: [String],
    links: [
      {
        title: String,
        url: String,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CreativeProject', creativeProjectSchema);

