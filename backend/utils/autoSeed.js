const User = require('../models/User');
const Habit = require('../models/Habit');
const { Task } = require('../models/Task');
const Goal = require('../models/Goal');

/**
 * Ensures a preloaded demo user exists in the database for instant out-of-the-box usage.
 */
const autoSeedDemoUser = async () => {
  try {
    const existing = await User.findOne({ email: 'demo@personaltracker.com' });
    if (existing) {
      return existing;
    }

    console.log('[AutoSeed] Creating default demo user in MongoDB Atlas...');
    const user = await User.create({
      name: 'Alex Rivera',
      email: 'demo@personaltracker.com',
      password: 'password123',
      bio: 'Senior Full-Stack Engineer & SaaS Creator',
      currency: 'INR',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Seed a few initial habits
    await Habit.create([
      {
        user: user._id,
        title: 'Morning Deep Meditation',
        description: '15 minutes of mindfulness and breathwork',
        category: 'Mindfulness',
        frequency: 'daily',
        color: '#6B8F71',
        icon: 'Sparkles',
        currentStreak: 5,
        longestStreak: 14,
        completedDates: [yesterday, todayStr],
      },
      {
        user: user._id,
        title: 'Daily Technical Reading',
        description: 'Read 20 pages of architecture documentation',
        category: 'Learning',
        frequency: 'daily',
        color: '#A7B99B',
        icon: 'BookOpen',
        currentStreak: 3,
        longestStreak: 12,
        completedDates: [yesterday, todayStr],
      },
    ]);

    // Seed initial task
    await Task.create({
      user: user._id,
      title: 'Review System Architecture & Deployments',
      description: 'Verify cloud functions, database connections, and CI/CD pipelines',
      priority: 'High',
      status: 'In Progress',
      category: 'Engineering',
      dueDate: new Date(Date.now() + 86400000),
    });

    // Seed initial goal
    await Goal.create({
      user: user._id,
      title: 'Launch Personal Tracker v2.0',
      description: 'Full production launch of personal SaaS operating system',
      category: 'Career',
      type: 'Long Term',
      targetDate: new Date(Date.now() + 30 * 86400000),
      progress: 75,
      status: 'In Progress',
    });

    console.log('[AutoSeed] Demo user created successfully: demo@personaltracker.com');
    return user;
  } catch (err) {
    console.warn('[AutoSeed Warning]:', err.message);
    return null;
  }
};

module.exports = { autoSeedDemoUser };

