const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
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
    author: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    totalPages: {
      type: Number,
      required: true,
      default: 100,
    },
    currentPage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Want to Read', 'Reading', 'Completed', 'Paused'],
      default: 'Want to Read',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    genre: {
      type: String,
      default: 'Non-Fiction',
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

const readingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    pagesRead: {
      type: Number,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 20,
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

const Book = mongoose.model('Book', bookSchema);
const ReadingSession = mongoose.model('ReadingSession', readingSessionSchema);

module.exports = {
  Book,
  ReadingSession,
};

