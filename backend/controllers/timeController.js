const TimeEntry = require('../models/TimeEntry');

// @desc    Get all time entries & analytics
// @route   GET /api/time
const getTimeEntries = async (req, res, next) => {
  try {
    const entries = await TimeEntry.find({ user: req.user._id }).sort({ startTime: -1 });

    const totalMinutes = entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    const totalHours = +(totalMinutes / 60).toFixed(1);

    const productiveMinutes = entries
      .filter(e => ['Work', 'Study', 'Design'].includes(e.category))
      .reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    const productiveHours = +(productiveMinutes / 60).toFixed(1);

    const activeTimer = entries.find(e => e.isRunning) || null;

    // Category distribution
    const categoryTotals = {};
    entries.forEach(e => {
      const cat = e.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.durationMinutes || 0);
    });

    const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      minutes: categoryTotals[cat],
      hours: +(categoryTotals[cat] / 60).toFixed(1),
    }));

    res.json({
      success: true,
      data: {
        entries,
        activeTimer,
        categoryBreakdown,
        stats: {
          totalHours,
          productiveHours,
          entriesCount: entries.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start timer
const startTimer = async (req, res, next) => {
  try {
    const { title, category, billable, notes } = req.body;
    // Stop any existing running timer
    await TimeEntry.updateMany(
      { user: req.user._id, isRunning: true },
      {
        $set: {
          isRunning: false,
          endTime: new Date(),
        },
      }
    );

    const newEntry = await TimeEntry.create({
      user: req.user._id,
      title: title || 'Untitled Activity',
      category: category || 'Work',
      billable: !!billable,
      notes: notes || '',
      startTime: new Date(),
      isRunning: true,
      durationMinutes: 0,
    });

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop timer
const stopTimer = async (req, res, next) => {
  try {
    const entry = await TimeEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Time entry not found' });

    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round((endTime - new Date(entry.startTime)) / 60000));

    entry.endTime = endTime;
    entry.durationMinutes = durationMinutes;
    entry.isRunning = false;
    await entry.save();

    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Manual time entry
const createManualEntry = async (req, res, next) => {
  try {
    const { title, category, durationMinutes, startTime, billable, notes } = req.body;
    const entry = await TimeEntry.create({
      user: req.user._id,
      title: title || 'Manual Entry',
      category: category || 'Work',
      durationMinutes: Number(durationMinutes) || 30,
      startTime: startTime || new Date(),
      endTime: new Date(),
      isRunning: false,
      billable: !!billable,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete time entry
const deleteTimeEntry = async (req, res, next) => {
  try {
    await TimeEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Time entry deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimeEntries,
  startTimer,
  stopTimer,
  createManualEntry,
  deleteTimeEntry,
};

