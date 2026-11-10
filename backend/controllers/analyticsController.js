const Habit = require('../models/Habit');
const { Transaction } = require('../models/Transaction');
const { Task, FocusSession } = require('../models/Task');
const { Workout, FitnessRecord } = require('../models/Fitness');
const { Subject, StudySession } = require('../models/Study');
const { Book } = require('../models/Book');
const TimeEntry = require('../models/TimeEntry');
const Goal = require('../models/Goal');
const Trip = require('../models/Travel');
const CreativeProject = require('../models/CreativeProject');
const { DesignProject } = require('../models/DesignStudio');
const Event = require('../models/Event');

// @desc    Get master analytics report
// @route   GET /api/analytics
const getMasterAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { timeRange } = req.query; // 'today', 'week', 'month', 'year', 'all'

    let startDate = null;
    const now = new Date();

    if (timeRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const dateFilter = startDate ? { $gte: startDate } : null;

    // 1. Habits
    const habits = await Habit.find({ user: userId });
    const totalHabits = habits.length;
    const avgStreak = habits.length > 0 ? Math.round(habits.reduce((s, h) => s + (h.currentStreak || 0), 0) / habits.length) : 0;

    // 2. Financials
    const txnQuery = { user: userId };
    if (dateFilter) txnQuery.date = dateFilter;
    const transactions = await Transaction.find(txnQuery);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Expense categories
    const expenseByCategoryMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expenseByCategoryMap[t.category] = (expenseByCategoryMap[t.category] || 0) + t.amount;
    });
    const expenseByCategory = Object.keys(expenseByCategoryMap).map(cat => ({
      name: cat,
      value: expenseByCategoryMap[cat],
    }));

    // 3. Productivity Tasks
    const taskQuery = { user: userId };
    if (dateFilter) taskQuery.createdAt = dateFilter;
    const tasks = await Task.find(taskQuery);
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // 4. Fitness
    const workoutQuery = { user: userId };
    if (dateFilter) workoutQuery.date = dateFilter;
    const workouts = await Workout.find(workoutQuery);
    const totalWorkoutMinutes = workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);
    const totalCaloriesBurned = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);

    // 5. Study
    const studyQuery = { user: userId };
    if (dateFilter) studyQuery.date = dateFilter;
    const studySessions = await StudySession.find(studyQuery).populate('subject', 'name color');
    const totalStudyMinutes = studySessions.reduce((s, ss) => s + (ss.durationMinutes || 0), 0);
    const totalStudyHours = +(totalStudyMinutes / 60).toFixed(1);

    const studyBySubjectMap = {};
    studySessions.forEach(ss => {
      const subName = ss.subject?.name || 'General';
      studyBySubjectMap[subName] = (studyBySubjectMap[subName] || 0) + ss.durationMinutes;
    });
    const studyBySubject = Object.keys(studyBySubjectMap).map(name => ({
      name,
      hours: +(studyBySubjectMap[name] / 60).toFixed(1),
    }));

    // 6. Reading
    const books = await Book.find({ user: userId });
    const totalBooks = books.length;
    const completedBooks = books.filter(b => b.status === 'Completed').length;
    const totalPagesRead = books.reduce((s, b) => s + (b.currentPage || 0), 0);

    // 7. Time distribution
    const timeQuery = { user: userId };
    if (dateFilter) timeQuery.startTime = dateFilter;
    const timeEntries = await TimeEntry.find(timeQuery);
    const timeCategoryMap = {};
    timeEntries.forEach(te => {
      timeCategoryMap[te.category] = (timeCategoryMap[te.category] || 0) + (te.durationMinutes || 0);
    });
    const timeDistribution = Object.keys(timeCategoryMap).map(name => ({
      name,
      hours: +(timeCategoryMap[name] / 60).toFixed(1),
    }));

    // 8. Goals
    const goals = await Goal.find({ user: userId });
    const completedGoals = goals.filter(g => g.status === 'Completed').length;
    const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : 0;

    // 9. Travel & Creative
    const trips = await Trip.find({ user: userId });
    const creativeProjects = await CreativeProject.find({ user: userId });
    const designProjects = await DesignProject.find({ user: userId });
    const designBilled = designProjects.reduce((s, p) => s + (p.pricing || 0), 0);

    res.json({
      success: true,
      data: {
        financials: {
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          expenseByCategory,
        },
        habits: {
          totalHabits,
          avgStreak,
        },
        productivity: {
          totalTasks: tasks.length,
          completedTasks,
          completionRate,
        },
        fitness: {
          totalWorkouts: workouts.length,
          totalWorkoutMinutes,
          totalCaloriesBurned,
        },
        study: {
          totalStudyHours,
          studyBySubject,
        },
        reading: {
          totalBooks,
          completedBooks,
          totalPagesRead,
        },
        time: {
          totalTrackedHours: +(timeEntries.reduce((s, t) => s + (t.durationMinutes || 0), 0) / 60).toFixed(1),
          timeDistribution,
        },
        goals: {
          totalGoals: goals.length,
          completedGoals,
          avgGoalProgress,
        },
        creative: {
          totalProjects: creativeProjects.length,
          completedCreative: creativeProjects.filter(p => p.status === 'Completed').length,
          totalDesignProjects: designProjects.length,
          designBilled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMasterAnalytics,
};

