
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express
const app = express();

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================

connectDB();

// ==========================================
// 2. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://personal-tracker-ebon-delta.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    // (e.g. server-to-server requests)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept'
  ]
};

app.use(cors(corsOptions));

// ==========================================
// 3. BODY PARSER
// ==========================================

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// ==========================================
// 4. STATIC UPLOADS
// ==========================================

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ==========================================
// 5. ROOT ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Personal Tracker API is running',
    health: '/api/health'
  });
});

// ==========================================
// 6. HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Personal Tracker SaaS API',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 7. API ROUTES
// ==========================================

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use('/api/habits', require('./routes/habitRoutes'));

app.use('/api/expenses', require('./routes/expenseRoutes'));

app.use('/api/productivity', require('./routes/productivityRoutes'));

app.use('/api/fitness', require('./routes/fitnessRoutes'));

app.use('/api/study', require('./routes/studyRoutes'));

app.use('/api/reading', require('./routes/readingRoutes'));

app.use('/api/time', require('./routes/timeRoutes'));

app.use('/api/goals', require('./routes/goalRoutes'));

app.use('/api/travel', require('./routes/travelRoutes'));

app.use('/api/orbit', require('./routes/orbitRoutes'));

app.use('/api/creative', require('./routes/creativeRoutes'));

app.use('/api/design', require('./routes/designRoutes'));

app.use('/api/events', require('./routes/eventRoutes'));

app.use('/api/calendar', require('./routes/calendarRoutes'));

app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ==========================================
// 8. 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// 9. ERROR HANDLER
// ==========================================

app.use(errorHandler);

// ==========================================
// 10. SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `[Personal Tracker Server] running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});

module.exports = app;
