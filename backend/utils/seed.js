require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Habit = require('../models/Habit');
const { Transaction, Budget, SavingsGoal } = require('../models/Transaction');
const { Task, FocusSession } = require('../models/Task');
const { Workout, FitnessRecord } = require('../models/Fitness');
const { Subject, StudySession } = require('../models/Study');
const { Book, ReadingSession } = require('../models/Book');
const TimeEntry = require('../models/TimeEntry');
const Goal = require('../models/Goal');
const Trip = require('../models/Travel');
const { Contact, CallLog } = require('../models/Contact');
const CreativeProject = require('../models/CreativeProject');
const { Client, DesignProject } = require('../models/DesignStudio');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal_tracker');
    console.log('[Seeder] Connected to MongoDB');

    // Clear existing sample user if exists
    let user = await User.findOne({ email: 'demo@personaltracker.com' });
    if (user) {
      console.log('[Seeder] User already exists, refreshing seed records...');
      await Promise.all([
        Habit.deleteMany({ user: user._id }),
        Transaction.deleteMany({ user: user._id }),
        Budget.deleteMany({ user: user._id }),
        SavingsGoal.deleteMany({ user: user._id }),
        Task.deleteMany({ user: user._id }),
        FocusSession.deleteMany({ user: user._id }),
        Workout.deleteMany({ user: user._id }),
        FitnessRecord.deleteMany({ user: user._id }),
        Subject.deleteMany({ user: user._id }),
        StudySession.deleteMany({ user: user._id }),
        Book.deleteMany({ user: user._id }),
        ReadingSession.deleteMany({ user: user._id }),
        TimeEntry.deleteMany({ user: user._id }),
        Goal.deleteMany({ user: user._id }),
        Trip.deleteMany({ user: user._id }),
        Contact.deleteMany({ user: user._id }),
        CallLog.deleteMany({ user: user._id }),
        CreativeProject.deleteMany({ user: user._id }),
        Client.deleteMany({ user: user._id }),
        DesignProject.deleteMany({ user: user._id }),
        Event.deleteMany({ user: user._id }),
        Notification.deleteMany({ user: user._id }),
      ]);
    } else {
      user = await User.create({
        name: 'Alex Rivera',
        email: 'demo@personaltracker.com',
        password: 'password123',
        bio: 'Senior Full-Stack Engineer & Creative Director',
        currency: 'INR',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      });
      console.log('[Seeder] Demo user created: demo@personaltracker.com / password123');
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

    // 1. Habits
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
        completedDates: [twoDaysAgo, yesterday, todayStr],
      },
      {
        user: user._id,
        title: 'Read 20 Pages',
        description: 'Read technical or philosophy literature',
        category: 'Learning',
        frequency: 'daily',
        color: '#A7B99B',
        icon: 'BookOpen',
        currentStreak: 3,
        longestStreak: 12,
        completedDates: [yesterday, todayStr],
      },
      {
        user: user._id,
        title: 'Hydration (3 Liters)',
        description: 'Drink adequate water throughout the workday',
        category: 'Health',
        frequency: 'daily',
        color: '#4F9B72',
        icon: 'Droplet',
        currentStreak: 4,
        longestStreak: 10,
        completedDates: [yesterday],
      },
      {
        user: user._id,
        title: 'Strength Training',
        description: 'Gym or calisthenics workout session',
        category: 'Fitness',
        frequency: 'selected_days',
        color: '#D6A24A',
        icon: 'Dumbbell',
        currentStreak: 2,
        longestStreak: 8,
        completedDates: [twoDaysAgo, yesterday],
      },
    ]);

    // 2. Transactions & Budgets
    await Transaction.create([
      {
        user: user._id,
        title: 'Client Retainer — Helix Studio',
        amount: 85000,
        type: 'income',
        category: 'Design Retainer',
        paymentMethod: 'Bank Transfer',
        date: new Date(),
        description: 'Monthly UI/UX and brand maintenance retainer',
      },
      {
        user: user._id,
        title: 'Freelance Frontend Consulting',
        amount: 45000,
        type: 'income',
        category: 'Development',
        paymentMethod: 'UPI',
        date: new Date(Date.now() - 3 * 86400000),
      },
      {
        user: user._id,
        title: 'Workspace Coworking Desk',
        amount: 9500,
        type: 'expense',
        category: 'Office & Workspace',
        paymentMethod: 'Credit Card',
        date: new Date(),
      },
      {
        user: user._id,
        title: 'Cloud Servers & Domain Renewals',
        amount: 4200,
        type: 'expense',
        category: 'Software & Tools',
        paymentMethod: 'Credit Card',
        date: new Date(Date.now() - 2 * 86400000),
      },
      {
        user: user._id,
        title: 'Organic Groceries & Supplements',
        amount: 6800,
        type: 'expense',
        category: 'Health & Groceries',
        paymentMethod: 'UPI',
        date: new Date(Date.now() - 1 * 86400000),
      },
    ]);

    await Budget.create([
      { user: user._id, category: 'Software & Tools', month: todayStr.slice(0, 7), limit: 12000 },
      { user: user._id, category: 'Office & Workspace', month: todayStr.slice(0, 7), limit: 15000 },
      { user: user._id, category: 'Health & Groceries', month: todayStr.slice(0, 7), limit: 20000 },
    ]);

    await SavingsGoal.create([
      {
        user: user._id,
        title: 'Emergency Fund (6 Months)',
        targetAmount: 300000,
        currentAmount: 195000,
        targetDate: new Date(Date.now() + 120 * 86400000),
        category: 'Emergency',
      },
      {
        user: user._id,
        title: 'New High-End Workstation Laptop',
        targetAmount: 180000,
        currentAmount: 110000,
        targetDate: new Date(Date.now() + 60 * 86400000),
        category: 'Hardware',
      },
    ]);

    // 3. Tasks & Focus
    const task1 = await Task.create({
      user: user._id,
      title: 'Review System Design Architecture for Q3 Product',
      description: 'Prepare microservices diagram and REST specifications',
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date(Date.now() + 86400000),
      category: 'Work',
      pomodorosEstimated: 4,
      pomodorosCompleted: 2,
    });

    await Task.create([
      {
        user: user._id,
        title: 'Deploy Personal Tracker Next.js Frontend & API',
        description: 'Verify all CRUD routes and responsive layout integrity',
        priority: 'Urgent',
        status: 'Completed',
        dueDate: new Date(),
        completedAt: new Date(),
        category: 'Development',
        pomodorosEstimated: 2,
        pomodorosCompleted: 2,
      },
      {
        user: user._id,
        title: 'Finalize Branding Assets for Nordic Woodcraft',
        description: 'Export SVG vector pack, typography guides and color tokens',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(Date.now() + 2 * 86400000),
        category: 'Design',
        pomodorosEstimated: 3,
        pomodorosCompleted: 0,
      },
    ]);

    await FocusSession.create({
      user: user._id,
      task: task1._id,
      durationMinutes: 25,
      sessionType: 'pomodoro',
      notes: 'Completed database models and express route wiring',
    });

    // 4. Fitness
    await Workout.create([
      {
        user: user._id,
        exerciseName: 'Upper Body Hypertrophy',
        category: 'Strength',
        durationMinutes: 55,
        sets: 18,
        reps: 180,
        caloriesBurned: 420,
        date: new Date(),
        notes: 'Incline bench press, weighted dips, barbell rows',
      },
      {
        user: user._id,
        exerciseName: '5K Sunset Trail Run',
        category: 'Cardio',
        durationMinutes: 28,
        caloriesBurned: 310,
        date: new Date(Date.now() - 86400000),
      },
    ]);

    await FitnessRecord.create({
      user: user._id,
      date: todayStr,
      weight: 73.5,
      steps: 8420,
      waterLiters: 2.8,
      sleepHours: 7.5,
    });

    // 5. Study & Courses
    const sub1 = await Subject.create({
      user: user._id,
      name: 'Distributed Systems & Cloud Architecture',
      code: 'CS-801',
      color: '#6B8F71',
      targetHours: 60,
      examDate: new Date(Date.now() + 45 * 86400000),
    });

    const sub2 = await Subject.create({
      user: user._id,
      name: 'UI/UX Typography & Design Systems',
      code: 'DS-204',
      color: '#A7B99B',
      targetHours: 40,
    });

    await StudySession.create([
      {
        user: user._id,
        subject: sub1._id,
        durationMinutes: 90,
        topic: 'Event Sourcing & CQRS Patterns with Kafka',
        notes: 'Studied write models vs read models separation',
      },
      {
        user: user._id,
        subject: sub2._id,
        durationMinutes: 60,
        topic: 'Fluid Modular Scale and Leading Ratios in Web Design',
      },
    ]);

    // 6. Reading
    const book1 = await Book.create({
      user: user._id,
      title: 'Atomic Habits',
      author: 'James Clear',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      totalPages: 320,
      currentPage: 245,
      status: 'Reading',
      rating: 5,
      genre: 'Self Improvement',
    });

    await ReadingSession.create({
      user: user._id,
      book: book1._id,
      pagesRead: 25,
      durationMinutes: 30,
      notes: 'Chapter on Habit Stacking and Environment Design',
    });

    // 7. Time Tracker
    await TimeEntry.create([
      {
        user: user._id,
        title: 'Core Architecture Coding',
        category: 'Work',
        startTime: new Date(Date.now() - 120 * 60000),
        endTime: new Date(),
        durationMinutes: 120,
        billable: true,
      },
      {
        user: user._id,
        title: 'Client Sprint Retrospective',
        category: 'Meeting',
        startTime: new Date(Date.now() - 200 * 60000),
        endTime: new Date(Date.now() - 150 * 60000),
        durationMinutes: 50,
      },
    ]);

    // 8. Goals
    await Goal.create([
      {
        user: user._id,
        title: 'Ship Personal Tracker SaaS MVP to Production',
        description: 'Complete all 18 modules, responsive design and data integrity',
        category: 'Career',
        type: 'short-term',
        targetDate: new Date(Date.now() + 14 * 86400000),
        status: 'In Progress',
        progress: 75,
        milestones: [
          { title: 'Setup full-stack REST architecture and auth', completed: true },
          { title: 'Build modern cream-and-sage UI dashboard', completed: true },
          { title: 'Integrate MongoDB for all modules', completed: true },
          { title: 'Final deployment and user onboarding', completed: false },
        ],
      },
      {
        user: user._id,
        title: 'Run a Half Marathon (21.1 km)',
        description: 'Build cardio endurance to run sub-2 hours',
        category: 'Health',
        type: 'long-term',
        targetDate: new Date(Date.now() + 90 * 86400000),
        status: 'In Progress',
        progress: 40,
      },
    ]);

    // 9. Travel
    await Trip.create([
      {
        user: user._id,
        title: 'Autumn Retreat & Highland Trails',
        destination: 'Manali & Spiti Valley, India',
        description: 'Workation with mountain hiking and photography',
        coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
        startDate: new Date(Date.now() + 20 * 86400000),
        endDate: new Date(Date.now() + 27 * 86400000),
        status: 'Upcoming',
        budget: 45000,
        packingList: [
          { item: 'Thermal layers & trekking boots', packed: true, category: 'Clothing' },
          { item: 'Sony Alpha Camera & 24-70mm lens', packed: true, category: 'Electronics' },
          { item: 'Portable power bank 20,000mAh', packed: false, category: 'Electronics' },
          { item: 'First aid & altitude medication', packed: false, category: 'Health' },
        ],
        expenses: [
          { title: 'Eco Resort Advance Deposit', amount: 15000, category: 'Stay', date: new Date() },
          { title: 'Train & Cab Transfers', amount: 6500, category: 'Transport', date: new Date() },
        ],
      },
    ]);

    // 10. ORBIT Contacts & Calls
    const contact1 = await Contact.create({
      user: user._id,
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      email: 'priya.sharma@zenithventures.io',
      organization: 'Zenith Ventures',
      jobTitle: 'Managing Partner',
      category: 'VIP',
      isImportant: true,
      notes: 'Interested in partnering on new SaaS acceleration program',
      lastContactedDate: new Date(),
    });

    const contact2 = await Contact.create({
      user: user._id,
      name: 'Rohan Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98123 45678',
      email: 'rohan@nordiccraft.com',
      organization: 'Nordic Craft Co.',
      jobTitle: 'CEO & Founder',
      category: 'Client',
      isImportant: true,
      lastContactedDate: new Date(Date.now() - 2 * 86400000),
    });

    await CallLog.create([
      {
        user: user._id,
        contact: contact1._id,
        durationMinutes: 18,
        type: 'Outgoing',
        purpose: 'Q3 Partnership Discussion',
        notes: 'Discussed investment advisory timeline. Need to send deck.',
        followUpDate: new Date(Date.now() + 3 * 86400000),
        followUpStatus: 'Pending',
      },
      {
        user: user._id,
        contact: contact2._id,
        durationMinutes: 25,
        type: 'Incoming',
        purpose: 'Design Brief Clarifications',
        notes: 'Approved packaging prototype colors.',
        followUpStatus: 'Completed',
      },
    ]);

    // 11. Creative Projects
    await CreativeProject.create([
      {
        user: user._id,
        title: 'Minimalist Modular Iconography Kit',
        description: 'A 240+ vector icon system built with 24px grid for SaaS dashboards',
        category: 'Design',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        startDate: new Date(Date.now() - 15 * 86400000),
        deadline: new Date(Date.now() + 10 * 86400000),
        status: 'In Progress',
        progress: 80,
        skills: ['Figma', 'Vector Geometry', 'Design Systems', 'SVG Optimization'],
        portfolioWorthy: true,
        achievements: ['Featured in Community Weekly Showcase'],
      },
    ]);

    // 12. Graphic Design Studio: Clients & Design Projects
    const clientA = await Client.create({
      user: user._id,
      name: 'Nordic Woodcraft Ltd.',
      brandName: 'Nordic Woodcraft',
      company: 'Nordic Woodcraft Ltd.',
      email: 'hello@nordicwoodcraft.com',
      phone: '+91 98123 45678',
      status: 'Active',
      requirements: 'Sustainable luxury Scandinavian home aesthetics and bespoke packaging',
      notes: 'Very detail-oriented, prefers natural cream and forest green palettes',
    });

    await DesignProject.create([
      {
        user: user._id,
        client: clientA._id,
        title: 'Complete Brand Identity & Styleguide',
        category: 'Brand Identity',
        status: 'In Progress',
        pricing: 75000,
        advancePayment: 37500,
        remainingPayment: 37500,
        paymentStatus: 'Partial',
        deadline: new Date(Date.now() + 7 * 86400000),
        brief: 'Craft minimal emblem, wordmark, font hierarchy, and packaging guidelines.',
        revisions: [
          { version: 1, notes: 'Initial logo concepts delivered' },
          { version: 2, notes: 'Selected concept B with customized serif letterforms' },
        ],
      },
      {
        user: user._id,
        client: clientA._id,
        title: 'Social Media Campaign & Launch Banners',
        category: 'Social Media Design',
        status: 'Brief Received',
        pricing: 28000,
        advancePayment: 14000,
        remainingPayment: 14000,
        paymentStatus: 'Partial',
        deadline: new Date(Date.now() + 16 * 86400000),
      },
    ]);

    // 13. Programs & Events
    await Event.create([
      {
        user: user._id,
        title: 'Full-Stack SaaS Architecture Masterclass 2026',
        description: 'Interactive 2-day live workshop on scaling modern Node.js & Next.js applications',
        category: 'Workshop',
        location: 'Bengaluru Tech Hub & Live Zoom Stream',
        startDate: new Date(Date.now() + 12 * 86400000),
        endDate: new Date(Date.now() + 14 * 86400000),
        status: 'Upcoming',
        budget: 65000,
        participants: [
          { name: 'Kavita Nair', email: 'kavita@tech.in', role: 'Speaker', status: 'Confirmed' },
          { name: 'Amitabh Sen', email: 'amit@codecraft.org', role: 'Attendee', status: 'Registered' },
          { name: 'David Miller', email: 'david@studio.co', role: 'Attendee', status: 'Registered' },
        ],
        schedule: [
          { time: '10:00 AM', title: 'System Architecture Fundamentals', speaker: 'Alex Rivera' },
          { time: '02:00 PM', title: 'High-Performance MongoDB Schema Design', speaker: 'Kavita Nair' },
        ],
      },
    ]);

    // 14. Notifications
    await Notification.create([
      {
        user: user._id,
        title: 'Welcome to Personal Tracker',
        message: 'Your unified SaaS dashboard is active. Explore your habits, productivity, and studio workspace.',
        type: 'system',
        link: '/dashboard',
        isRead: false,
      },
      {
        user: user._id,
        title: 'Upcoming Trip in 20 Days',
        message: 'Autumn Retreat & Highland Trails to Manali is coming up soon!',
        type: 'trip',
        link: '/travel',
        isRead: false,
      },
      {
        user: user._id,
        title: 'Call Follow-up Reminder',
        message: 'Follow up with Priya Sharma (Zenith Ventures) regarding Q3 partnership.',
        type: 'call',
        link: '/orbit',
        isRead: false,
      },
    ]);

    console.log('[Seeder] Successfully seeded all 14 modules with realistic data!');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  }
};

seedData();

