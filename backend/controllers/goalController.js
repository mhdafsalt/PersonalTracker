const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/goals
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ targetDate: 1 });

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'Completed' || g.progress === 100).length;
    const activeGoals = goals.filter(g => g.status === 'In Progress').length;
    const overdueGoals = goals.filter(g => g.status !== 'Completed' && new Date(g.targetDate) < new Date()).length;

    res.json({
      success: true,
      data: {
        goals,
        stats: {
          totalGoals,
          completedGoals,
          activeGoals,
          overdueGoals,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create goal
const createGoal = async (req, res, next) => {
  try {
    const { title, description, category, type, startDate, targetDate, milestones } = req.body;
    if (!title || !targetDate) {
      return res.status(400).json({ success: false, message: 'Goal title and target date are required' });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description: description || '',
      category: category || 'Personal',
      type: type || 'short-term',
      startDate: startDate || new Date(),
      targetDate,
      milestones: milestones || [],
      status: 'In Progress',
      progress: 0,
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    Object.assign(goal, req.body);

    // Auto-calculate progress if milestones exist
    if (goal.milestones && goal.milestones.length > 0) {
      const completedMilestones = goal.milestones.filter(m => m.completed).length;
      goal.progress = Math.round((completedMilestones / goal.milestones.length) * 100);
    }

    if (goal.progress >= 100) {
      goal.status = 'Completed';
    }

    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
const deleteGoal = async (req, res, next) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};

