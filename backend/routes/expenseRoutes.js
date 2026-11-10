const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/transactions').get(getTransactions).post(createTransaction);
router.route('/transactions/:id').put(updateTransaction).delete(deleteTransaction);

router.route('/budgets').get(getBudgets).post(saveBudget);

router.route('/savings-goals').get(getSavingsGoals).post(createSavingsGoal);
router.route('/savings-goals/:id').put(updateSavingsGoal).delete(deleteSavingsGoal);

module.exports = router;

