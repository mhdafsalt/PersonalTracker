const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'General',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Bank Transfer', 'Other'],
      default: 'UPI',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'none'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    month: {
      type: String, // 'YYYY-MM'
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    targetDate: {
      type: Date,
    },
    category: {
      type: String,
      default: 'General',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

module.exports = {
  Transaction,
  Budget,
  SavingsGoal,
};

