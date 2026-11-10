const mongoose = require('mongoose');

const itineraryActivitySchema = new mongoose.Schema({
  time: String,
  title: { type: String, required: true },
  description: String,
  location: String,
  cost: { type: Number, default: 0 },
});

const itineraryDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  date: Date,
  title: String,
  activities: [itineraryActivitySchema],
});

const packingItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  packed: { type: Boolean, default: false },
  category: { type: String, default: 'General' },
});

const travelExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'Transport' },
  date: { type: Date, default: Date.now },
});

const tripSchema = new mongoose.Schema(
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
    destination: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
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
      enum: ['Planning', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    budget: {
      type: Number,
      default: 0,
    },
    expenses: [travelExpenseSchema],
    packingList: [packingItemSchema],
    itinerary: [itineraryDaySchema],
    hotelDetails: {
      name: String,
      bookingRef: String,
      checkIn: Date,
      checkOut: Date,
      address: String,
    },
    transportDetails: {
      type: String, // Flight, Train, Car
      bookingRef: String,
      departureTime: Date,
      arrivalTime: Date,
      notes: String,
    },
    notes: {
      type: String,
      default: '',
    },
    isWishlist: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);

