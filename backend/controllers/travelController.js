const Trip = require('../models/Travel');

// @desc    Get all trips
// @route   GET /api/travel
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ startDate: 1 });

    const upcomingTrips = trips.filter(t => t.status === 'Upcoming' || (t.status === 'Planning' && new Date(t.startDate) >= new Date()));
    const completedTrips = trips.filter(t => t.status === 'Completed');
    const wishlistTrips = trips.filter(t => t.isWishlist);

    const totalExpenseAllTrips = trips.reduce((sum, t) => {
      const tripExp = (t.expenses || []).reduce((eSum, e) => eSum + (e.amount || 0), 0);
      return sum + tripExp;
    }, 0);

    res.json({
      success: true,
      data: {
        trips,
        stats: {
          totalTrips: trips.length,
          upcomingCount: upcomingTrips.length,
          completedCount: completedTrips.length,
          wishlistCount: wishlistTrips.length,
          totalExpense: totalExpenseAllTrips,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create trip
const createTrip = async (req, res, next) => {
  try {
    const { title, destination, description, coverImage, startDate, endDate, status, budget, isWishlist } = req.body;
    if (!title || !destination) {
      return res.status(400).json({ success: false, message: 'Title and destination are required' });
    }

    const trip = await Trip.create({
      user: req.user._id,
      title,
      destination,
      description: description || '',
      coverImage: coverImage || '',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      status: status || 'Planning',
      budget: Number(budget) || 0,
      isWishlist: !!isWishlist,
      expenses: [],
      packingList: [],
      itinerary: [],
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip details
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
const deleteTrip = async (req, res, next) => {
  try {
    await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add expense to trip
const addTripExpense = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    trip.expenses.push(req.body);
    await trip.save();
    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Add / toggle packing item
const togglePackingItem = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const item = trip.packingList.id(req.params.itemId);
    if (item) {
      item.packed = !item.packed;
      await trip.save();
    }
    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  addTripExpense,
  togglePackingItem,
};

