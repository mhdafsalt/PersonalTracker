const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal_tracker', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.log(`[MongoDB Notice]: Make sure local MongoDB daemon is running on mongodb://localhost:27017/personal_tracker or set MONGODB_URI in backend/.env`);
    return null;
  }
};

module.exports = connectDB;

