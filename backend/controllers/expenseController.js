const { Transaction, Budget, SavingsGoal } = require('../models/Transaction');

// @desc    Get all transactions with optional filters
// @route   GET /api/expenses/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, month, search } = req.query;
    let query = { user: req.user._id };

    if (type) query.type = type;
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (month) {
      const [year, m] = month.split('-');
      const startDate = new Date(year, parseInt(m) - 1, 1);
      const endDate = new Date(year, parseInt(m), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Calculate totals
    const allUserTxns = await Transaction.find({ user: req.user._id });
    const totalIncome = allUserTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = allUserTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    res.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalBalance,
          totalIncome,
          totalExpenses,
          totalSavings: Math.max(0, totalBalance),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a transaction
// @route   POST /api/expenses/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, paymentMethod, date, description, isRecurring, recurringInterval } = req.body;
    if (!title || !amount || !type) {
      return res.status(400).json({ success: false, message: 'Title, amount, and type are required' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category: category || 'General',
      paymentMethod: paymentMethod || 'UPI',
      date: date || new Date(),
      description: description || '',
      isRecurring: !!isRecurring,
      recurringInterval: recurringInterval || 'none',
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/expenses/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/expenses/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get & set budgets
const getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query;
    const query = { user: req.user._id };
    if (month) query.month = month;
    const budgets = await Budget.find(query);
    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

const saveBudget = async (req, res, next) => {
  try {
    const { category, month, limit } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month },
      { limit: Number(limit) },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Savings goals
const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

const createSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, targetDate, category } = req.body;
    const goal = await SavingsGoal.create({
      user: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate,
      category: category || 'General',
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const updateSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const deleteSavingsGoal = async (req, res, next) => {
  try {
    await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Savings goal deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgets,
  saveBudget,
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
};

