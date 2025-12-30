// Expense Routes
// Person 2 - Backend Team

const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  approveExpense
} = require('../controllers/expenseController');
const { auth, authorize } = require('../middleware/auth');

router.route('/')
  .get(auth, getExpenses)
  .post(auth, createExpense);

router.route('/summary/:projectId')
  .get(auth, getExpenseSummary);

router.route('/:id')
  .get(auth, getExpense)
  .put(auth, updateExpense)
  .delete(auth, deleteExpense);

router.route('/:id/approve')
  .put(auth, authorize('admin', 'project_manager'), approveExpense);

module.exports = router;

