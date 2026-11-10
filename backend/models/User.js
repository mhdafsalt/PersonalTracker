const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Full-Stack Developer & Creator',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    theme: {
      type: String,
      default: 'light',
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      habitReminders: { type: Boolean, default: true },
      taskDueAlerts: { type: Boolean, default: true },
      dailySummary: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

