require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { autoSeedDemoUser } = require('./utils/autoSeed');

// Initialize Express
const app = express();

// ==========================================
// 1. INITIALIZE DATABASE
// ==========================================

connectDB()
  .then(() => autoSeedDemoUser())
  .catch((err) => {
    console.warn('[MongoDB Initialization Warning]:', err.message);
  });

// ==========================================
// 2. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://personal-tracker-ebon-delta.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean).map((url) => url.replace(/\/+$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (health checks, server-to-server, curl)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Allow explicitly listed origins
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployment URLs for this app (including preview branches)
    if (/^https:\/\/personal-tracker-[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // Reject gracefully without throwing unhandled Error
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ==========================================
// 3. BODY PARSER
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 4. STATIC UPLOADS (Safe for serverless)
// ==========================================

const uploadsPath = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem in some serverless environments
}
app.use('/uploads', express.static(uploadsPath));

// ==========================================
// 5. DATABASE MIDDLEWARE (Serverless Readiness)
// ==========================================

app.use(async (req, res, next) => {
  // Bypass DB check for health check and root info
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection currently unavailable. Please verify MongoDB Atlas connection.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// ==========================================
// 6. ROOT ROUTE & HEALTH CHECK
// ==========================================

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Personal Tracker API is running',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'online',
    app: 'Personal Tracker SaaS API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
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
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// 9. ERROR HANDLER
// ==========================================

app.use(errorHandler);

// ==========================================
// 10. SERVER START (Conditional for Vercel)
// ==========================================

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(
      `[Personal Tracker Server] running in ${
        process.env.NODE_ENV || 'development'
      } mode on port ${PORT}`
    );
  });
}

module.exports = app;
