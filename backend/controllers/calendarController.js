const { Task } = require('../models/Task');
const Habit = require('../models/Habit');
const Goal = require('../models/Goal');
const Trip = require('../models/Travel');
const Event = require('../models/Event');
const { CallLog } = require('../models/Contact');
const { DesignProject } = require('../models/DesignStudio');
const { StudySession } = require('../models/Study');

// @desc    Get aggregated calendar events for a date range or current month
// @route   GET /api/calendar
const getCalendarEvents = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all items with dates
    const [tasks, habits, goals, trips, events, calls, designProjects, studySessions] = await Promise.all([
      Task.find({ user: userId, dueDate: { $ne: null } }),
      Habit.find({ user: userId, active: true }),
      Goal.find({ user: userId }),
      Trip.find({ user: userId }),
      Event.find({ user: userId }),
      CallLog.find({ user: userId, followUpDate: { $ne: null } }).populate('contact', 'name phone'),
      DesignProject.find({ user: userId, deadline: { $ne: null } }).populate('client', 'name'),
      StudySession.find({ user: userId }).populate('subject', 'name color'),
    ]);

    const calendarItems = [];

    // 1. Tasks
    tasks.forEach(t => {
      calendarItems.push({
        id: `task-${t._id}`,
        title: `Task: ${t.title}`,
        date: new Date(t.dueDate).toISOString().split('T')[0],
        type: 'task',
        status: t.status,
        priority: t.priority,
        color: t.priority === 'Urgent' ? '#D96C6C' : t.priority === 'High' ? '#D6A24A' : '#6B8F71',
        link: '/productivity',
      });
    });

    // 2. Habits (completed days)
    habits.forEach(h => {
      (h.completedDates || []).forEach(dateStr => {
        calendarItems.push({
          id: `habit-${h._id}-${dateStr}`,
          title: `Habit: ${h.title} Completed`,
          date: dateStr,
          type: 'habit',
          status: 'Completed',
          color: h.color || '#6B8F71',
          link: '/habits',
        });
      });
    });

    // 3. Goals
    goals.forEach(g => {
      if (g.targetDate) {
        calendarItems.push({
          id: `goal-${g._id}`,
          title: `Goal Deadline: ${g.title}`,
          date: new Date(g.targetDate).toISOString().split('T')[0],
          type: 'goal',
          status: g.status,
          color: '#A7B99B',
          link: '/goals',
        });
      }
    });

    // 4. Trips
    trips.forEach(tr => {
      calendarItems.push({
        id: `trip-${tr._id}`,
        title: `Trip: ${tr.destination} (${tr.title})`,
        date: new Date(tr.startDate).toISOString().split('T')[0],
        endDate: new Date(tr.endDate).toISOString().split('T')[0],
        type: 'travel',
        status: tr.status,
        color: '#4F9B72',
        link: '/travel',
      });
    });

    // 5. Events
    events.forEach(ev => {
      calendarItems.push({
        id: `event-${ev._id}`,
        title: `Event: ${ev.title}`,
        date: new Date(ev.startDate).toISOString().split('T')[0],
        endDate: new Date(ev.endDate).toISOString().split('T')[0],
        type: 'event',
        status: ev.status,
        color: '#547359',
        link: '/events',
      });
    });

    // 6. Contact follow-up calls
    calls.forEach(c => {
      if (c.followUpDate) {
        calendarItems.push({
          id: `call-${c._id}`,
          title: `Call: Follow-up with ${c.contact ? c.contact.name : 'Contact'}`,
          date: new Date(c.followUpDate).toISOString().split('T')[0],
          type: 'call',
          status: c.followUpStatus,
          color: '#D6A24A',
          link: '/orbit',
        });
      }
    });

    // 7. Design project deadlines
    designProjects.forEach(dp => {
      calendarItems.push({
        id: `design-${dp._id}`,
        title: `Design Due: ${dp.title} (${dp.client ? dp.client.name : 'Client'})`,
        date: new Date(dp.deadline).toISOString().split('T')[0],
        type: 'design',
        status: dp.status,
        color: '#6B8F71',
        link: '/graphic-design/projects',
      });
    });

    // 8. Study sessions
    studySessions.forEach(ss => {
      calendarItems.push({
        id: `study-${ss._id}`,
        title: `Study: ${ss.subject ? ss.subject.name : 'Subject'} (${ss.durationMinutes}m)`,
        date: new Date(ss.date).toISOString().split('T')[0],
        type: 'study',
        status: 'Completed',
        color: ss.subject?.color || '#8DA382',
        link: '/study',
      });
    });

    res.json({
      success: true,
      data: calendarItems,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCalendarEvents,
};

