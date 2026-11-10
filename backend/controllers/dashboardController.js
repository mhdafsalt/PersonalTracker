const Habit = require('../models/Habit');
const { Transaction } = require('../models/Transaction');
const { Task } = require('../models/Task');
const Goal = require('../models/Goal');
const { StudySession } = require('../models/Study');
const CreativeProject = require('../models/CreativeProject');
const { DesignProject } = require('../models/DesignStudio');
const Trip = require('../models/Travel');
const Event = require('../models/Event');
const { CallLog } = require('../models/Contact');

// Format date helper YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayStr();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // 1. Habits
    const habits = await Habit.find({ user: userId, active: true }).sort({ createdAt: -1 });
    const totalHabits = habits.length;
    const completedTodayHabits = habits.filter(h => h.completedDates && h.completedDates.includes(todayStr)).length;

    // 2. Tasks
    const allTasks = await Task.find({ user: userId });
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = allTasks.filter(t => t.status !== 'Completed').length;
    const todayTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate).toISOString().split('T')[0];
      return d === todayStr;
    });

    // 3. Expenses & Income for current month
    const monthlyTransactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const netSavings = monthlyIncome - monthlyExpenses;

    // Recent 5 transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    // 4. Goals
    const activeGoals = await Goal.find({ user: userId, status: { $ne: 'Completed' } }).sort({ targetDate: 1 });

    // 5. Study hours
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const studySessions = await StudySession.find({
      user: userId,
      date: { $gte: startOfWeek },
    });
    const weeklyStudyMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const weeklyStudyHours = +(weeklyStudyMinutes / 60).toFixed(1);

    // 6. Active Projects (Creative + Design)
    const activeCreativeProjects = await CreativeProject.countDocuments({
      user: userId,
      status: { $in: ['Planning', 'In Progress', 'Review'] },
    });
    const activeDesignProjects = await DesignProject.countDocuments({
      user: userId,
      status: { $in: ['New', 'Brief Received', 'In Progress', 'Review', 'Revision'] },
    });
    const totalActiveProjects = activeCreativeProjects + activeDesignProjects;

    // 7. Upcoming Trips
    const upcomingTrips = await Trip.find({
      user: userId,
      endDate: { $gte: new Date() },
    }).sort({ startDate: 1 }).limit(3);

    // 8. Upcoming Events
    const upcomingEvents = await Event.find({
      user: userId,
      endDate: { $gte: new Date() },
    }).sort({ startDate: 1 }).limit(5);

    // 9. Upcoming Follow-ups (Orbit Call Manager)
    const upcomingFollowUps = await CallLog.find({
      user: userId,
      followUpStatus: 'Pending',
      followUpDate: { $gte: new Date() },
    }).populate('contact', 'name phone email avatar category').sort({ followUpDate: 1 }).limit(5);

    // 10. Last 7 Days Activity Trend for Chart
    const weeklyActivityChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Completed habits on this day
      const habitsDone = habits.filter(h => h.completedDates && h.completedDates.includes(dateString)).length;

      // Completed tasks on this day
      const tasksDone = allTasks.filter(t => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt).toISOString().split('T')[0] === dateString;
      }).length;

      weeklyActivityChart.push({
        day: dayName,
        date: dateString,
        habits: habitsDone,
        tasks: tasksDone,
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalHabits,
          completedTodayHabits,
          totalTasks,
          completedTasks,
          pendingTasks,
          monthlyIncome,
          monthlyExpenses,
          netSavings,
          activeGoalsCount: activeGoals.length,
          weeklyStudyHours,
          totalActiveProjects,
          upcomingTripsCount: upcomingTrips.length,
          upcomingEventsCount: upcomingEvents.length,
        },
        widgets: {
          habits: habits.slice(0, 6),
          todayTasks: (todayTasks.length > 0 ? todayTasks : allTasks.filter(t => t.status !== 'Completed')).slice(0, 6),
          recentTransactions,
          activeGoals: activeGoals.slice(0, 4),
          upcomingTrips,
          upcomingEvents,
          upcomingFollowUps,
          weeklyActivityChart,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
};

