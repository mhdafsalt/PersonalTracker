const Notification = require('../models/Notification');
const { Task } = require('../models/Task');
const Trip = require('../models/Travel');
const Goal = require('../models/Goal');
const { DesignProject } = require('../models/DesignStudio');
const { CallLog } = require('../models/Contact');
const Event = require('../models/Event');

// @desc    Get user notifications (auto-refreshes alerts)
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check overdue tasks to ensure alerts exist
    const overdueTasks = await Task.find({
      user: userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() },
    }).limit(3);

    for (const t of overdueTasks) {
      const exists = await Notification.findOne({
        user: userId,
        type: 'task',
        link: '/productivity',
        title: `Overdue Task: ${t.title}`,
      });
      if (!exists) {
        await Notification.create({
          user: userId,
          title: `Overdue Task: ${t.title}`,
          message: `Task was due on ${new Date(t.dueDate).toLocaleDateString()}. Please complete or reschedule.`,
          type: 'task',
          link: '/productivity',
        });
      }
    }

    // Check upcoming trips
    const upcomingTrips = await Trip.find({
      user: userId,
      status: { $in: ['Upcoming', 'Planning'] },
      startDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Within 7 days
      },
    });

    for (const tr of upcomingTrips) {
      const exists = await Notification.findOne({
        user: userId,
        type: 'trip',
        link: '/travel',
        title: `Upcoming Trip: ${tr.destination}`,
      });
      if (!exists) {
        await Notification.create({
          user: userId,
          title: `Upcoming Trip: ${tr.destination}`,
          message: `Your trip to ${tr.destination} starts in a few days (${new Date(tr.startDate).toLocaleDateString()}). Check your packing checklist!`,
          type: 'trip',
          link: '/travel',
        });
      }
    }

    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Notification removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

