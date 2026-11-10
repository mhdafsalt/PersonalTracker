const { Task, FocusSession } = require('../models/Task');

// @desc    Get all tasks with optional filters
// @route   GET /api/productivity/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;
    let query = { user: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });

    const allTasks = await Task.find({ user: req.user._id });
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = allTasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
    const overdueTasks = allTasks.filter(t => {
      if (t.status === 'Completed' || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const productivityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      data: {
        tasks,
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          overdueTasks,
          productivityRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/productivity/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, category, tags, pomodorosEstimated } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate: dueDate || null,
      category: category || 'Work',
      tags: tags || [],
      pomodorosEstimated: pomodorosEstimated || 1,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/productivity/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    if (req.body.status === 'Completed' && !req.body.completedAt) {
      req.body.completedAt = new Date();
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/productivity/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Log focus session (Pomodoro)
// @route   POST /api/productivity/focus
const logFocusSession = async (req, res, next) => {
  try {
    const { taskId, durationMinutes, sessionType, notes } = req.body;
    const session = await FocusSession.create({
      user: req.user._id,
      task: taskId || null,
      durationMinutes: durationMinutes || 25,
      sessionType: sessionType || 'pomodoro',
      notes: notes || '',
    });

    if (taskId) {
      await Task.findOneAndUpdate(
        { _id: taskId, user: req.user._id },
        { $inc: { pomodorosCompleted: 1 } }
      );
    }

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get focus session history
const getFocusSessions = async (req, res, next) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id })
      .populate('task', 'title priority')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  logFocusSession,
  getFocusSessions,
};

