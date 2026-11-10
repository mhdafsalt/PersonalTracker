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
const TimeEntry = require('../models/TimeEntry');
const { Workout } = require('../models/Fitness');

// Format date helper YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayStr();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    // 1. Habits
    const habits = await Habit.find({ user: userId, active: true }).sort({ createdAt: -1 });
    const totalHabits = habits.length;
    const completedTodayHabits = habits.filter(h => h.completedDates && h.completedDates.includes(todayStr)).length;
    const habitStreakMax = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);

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

    // 5. Study & Focus Sessions
    const studySessions = await StudySession.find({
      user: userId,
      date: { $gte: startOfWeek },
    });
    const weeklyStudyMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const weeklyStudyHours = +(weeklyStudyMinutes / 60).toFixed(1);

    // 6. Time Tracking (Focus Sessions)
    const todayTimeEntries = await TimeEntry.find({
      user: userId,
      startTime: { $gte: todayStart },
    });
    const todayFocusMinutes = todayTimeEntries.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
    const todayFocusHours = +(todayFocusMinutes / 60).toFixed(1);

    // 7. Workouts (Fitness)
    const workoutsThisWeek = await Workout.countDocuments({
      user: userId,
      date: { $gte: startOfWeek },
    });
    const todayWorkouts = await Workout.find({
      user: userId,
      date: { $gte: todayStart },
    });
    const todayWorkoutMinutes = todayWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

    // 8. Active Projects (Creative + Design)
    const activeCreativeProjects = await CreativeProject.countDocuments({
      user: userId,
      status: { $in: ['Planning', 'In Progress', 'Review'] },
    });
    const activeDesignProjects = await DesignProject.countDocuments({
      user: userId,
      status: { $in: ['New', 'Brief Received', 'In Progress', 'Review', 'Revision'] },
    });
    const totalActiveProjects = activeCreativeProjects + activeDesignProjects;

    // 9. Upcoming Trips
    const upcomingTrips = await Trip.find({
      user: userId,
      endDate: { $gte: new Date() },
    }).sort({ startDate: 1 }).limit(3);

    // 10. Upcoming Events
    const upcomingEvents = await Event.find({
      user: userId,
      endDate: { $gte: new Date() },
    }).sort({ startDate: 1 }).limit(5);

    // 11. Upcoming Follow-ups (Orbit Call Manager)
    const upcomingFollowUps = await CallLog.find({
      user: userId,
      followUpStatus: 'Pending',
      followUpDate: { $gte: new Date() },
    }).populate('contact', 'name phone email avatar category').sort({ followUpDate: 1 }).limit(5);

    // 12. Dynamic 7 Days Momentum Calculation (Monday through Sunday)
    const weeklyActivityChart = [];
    const daysOfWeek = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayInitial = d.toLocaleDateString('en-US', { weekday: 'narrow' });

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

      // Daily dynamic momentum calculation from real DB records
      const dayHabitRate = totalHabits > 0 ? (habitsDone / totalHabits) : 0;
      const dayTaskRate = totalTasks > 0 ? (tasksDone / totalTasks) : 0;
      const dayCalculatedScore = (totalHabits > 0 && totalTasks > 0)
        ? Math.round((dayHabitRate * 60) + (dayTaskRate * 40))
        : totalHabits > 0
        ? Math.round(dayHabitRate * 100)
        : totalTasks > 0
        ? Math.round(dayTaskRate * 100)
        : 0;

      daysOfWeek.push({
        day: dayInitial,
        date: dateString,
        score: dayCalculatedScore,
        active: i === 0, // Today is active
      });
    }

    // 13. Dynamic Momentum Score (Today) - 100% computed from real DB metrics
    const habitCompletionRatio = totalHabits > 0 ? (completedTodayHabits / totalHabits) : 0;
    const taskCompletionRatio = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    const dynamicMomentumScore = (totalHabits > 0 && totalTasks > 0)
      ? Math.round((habitCompletionRatio * 60) + (taskCompletionRatio * 40))
      : totalHabits > 0
      ? Math.round(habitCompletionRatio * 100)
      : totalTasks > 0
      ? Math.round(taskCompletionRatio * 100)
      : (todayFocusMinutes > 0 ? Math.min(100, Math.round((todayFocusMinutes / 120) * 100)) : 0);

    // 14. Dynamic Stage Flow Distribution Percentages
    const effectiveFocusM = todayFocusMinutes;
    const effectiveHabitM = completedTodayHabits * 15;
    const effectiveTaskM = completedTasks * 20;
    const totalActivityM = effectiveFocusM + effectiveHabitM + effectiveTaskM;

    let focusPct = 0;
    let habitPct = 0;
    let taskPct = 0;
    let restPct = 100;

    if (totalActivityM > 0) {
      focusPct = Math.round((effectiveFocusM / totalActivityM) * 60);
      habitPct = Math.round((effectiveHabitM / totalActivityM) * 25);
      taskPct = Math.round((effectiveTaskM / totalActivityM) * 15);
      restPct = Math.max(0, 100 - (focusPct + habitPct + taskPct));
    }

    res.json({
      success: true,
      data: {
        stats: {
          momentumScore: dynamicMomentumScore,
          totalHabits,
          completedTodayHabits,
          habitStreakMax,
          totalTasks,
          completedTasks,
          pendingTasks,
          monthlyIncome,
          monthlyExpenses,
          netSavings,
          activeGoalsCount: activeGoals.length,
          weeklyStudyHours,
          todayFocusHours,
          todayFocusMinutes,
          workoutsThisWeek,
          todayWorkoutMinutes,
          totalActiveProjects,
          upcomingTripsCount: upcomingTrips.length,
          upcomingEventsCount: upcomingEvents.length,
          focusPct,
          habitPct,
          taskPct,
          restPct,
        },
        widgets: {
          daysOfWeek,
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
