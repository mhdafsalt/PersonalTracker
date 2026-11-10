require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
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

// Health check root
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Personal Tracker SaaS API',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Personal Tracker Server] running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

