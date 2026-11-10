const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  role: { type: String, default: 'Attendee' }, // Organizer, Speaker, Attendee, Volunteer
  status: { type: String, enum: ['Registered', 'Confirmed', 'Attended', 'Cancelled'], default: 'Registered' },
  registeredAt: { type: Date, default: Date.now },
});

const eventScheduleItemSchema = new mongoose.Schema({
  time: String,
  title: String,
  speaker: String,
  location: String,
  notes: String,
});

const eventTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assignee: String,
  completed: { type: Boolean, default: false },
  dueDate: Date,
});

const eventExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'Logistics' },
});

const eventSchema = new mongoose.Schema(
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
    banner: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Workshop', 'Conference', 'Webinar', 'Meetup', 'Cultural', 'Sports', 'Hackathon', 'Personal', 'Other'],
      default: 'Workshop',
    },
    location: {
      type: String,
      default: 'Online / In-Person',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    budget: {
      type: Number,
      default: 0,
    },
    expenses: [eventExpenseSchema],
    schedule: [eventScheduleItemSchema],
    participants: [participantSchema],
    tasks: [eventTaskSchema],
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    gallery: [String],
    completionReport: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);

