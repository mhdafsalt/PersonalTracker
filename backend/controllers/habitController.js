const Habit = require('../models/Habit');

// Helper to calculate streaks
const updateStreaks = (habit) => {
  if (!habit.completedDates || habit.completedDates.length === 0) {
    habit.currentStreak = 0;
    return;
  }

  const sortedDates = [...new Set(habit.completedDates)].sort();
  let longest = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    const curr = new Date(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = curr - prevDate;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longest) {
      longest = tempStreak;
    }
    prevDate = curr;
  }

  // Current streak
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
    let checkDate = sortedDates.includes(todayStr) ? today : yesterday;
    while (true) {
      const str = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(str)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  habit.currentStreak = currentStreak;
  habit.longestStreak = Math.max(longest, habit.longestStreak || 0, currentStreak);
};

// @desc    Get all habits
// @route   GET /api/habits
const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: habits });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new habit
// @route   POST /api/habits
const createHabit = async (req, res, next) => {
  try {
    const { title, description, category, frequency, targetDays, color, icon } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Habit title is required' });
    }

    const habit = await Habit.create({
      user: req.user._id,
      title,
      description,
      category: category || 'General',
      frequency: frequency || 'daily',
      targetDays: targetDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      color: color || '#6B8F71',
      icon: icon || 'CheckCircle',
      completedDates: [],
    });

    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle completion for a specific date
// @route   POST /api/habits/:id/toggle
const toggleHabitDate = async (req, res, next) => {
  try {
    const { date } = req.body; // 'YYYY-MM-DD'
    const targetDate = date || new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const dateIndex = habit.completedDates.indexOf(targetDate);
    if (dateIndex > -1) {
      habit.completedDates.splice(dateIndex, 1);
    } else {
      habit.completedDates.push(targetDate);
    }

    updateStreaks(habit);
    await habit.save();

    res.json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    Object.assign(habit, req.body);
    updateStreaks(habit);
    await habit.save();

    res.json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHabits,
  createHabit,
  toggleHabitDate,
  updateHabit,
  deleteHabit,
};

