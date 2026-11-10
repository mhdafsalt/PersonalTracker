const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ user: req.user._id }).sort({ startDate: 1 });

    const upcoming = events.filter(e => e.status === 'Upcoming' || (e.status !== 'Completed' && new Date(e.startDate) >= new Date()));
    const ongoing = events.filter(e => e.status === 'Ongoing');
    const completed = events.filter(e => e.status === 'Completed');

    const totalParticipants = events.reduce((sum, e) => sum + (e.participants ? e.participants.length : 0), 0);

    res.json({
      success: true,
      data: {
        events,
        stats: {
          totalEvents: events.length,
          upcomingCount: upcoming.length,
          ongoingCount: ongoing.length,
          completedCount: completed.length,
          totalParticipants,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, location, startDate, endDate, budget, banner } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Title, start date, and end date are required' });
    }

    const event = await Event.create({
      user: req.user._id,
      title,
      description: description || '',
      category: category || 'Workshop',
      location: location || 'Online',
      startDate,
      endDate,
      budget: Number(budget) || 0,
      banner: banner || '',
      status: 'Upcoming',
      participants: [],
      schedule: [],
      tasks: [],
      expenses: [],
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, user: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
const deleteEvent = async (req, res, next) => {
  try {
    await Event.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add participant
const addParticipant = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, user: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.participants.push(req.body);
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  addParticipant,
};

