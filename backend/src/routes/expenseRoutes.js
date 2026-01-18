import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js';

const router = express.Router();

router.post('/groups/:groupId/expenses', authMiddleware, createExpense);
router.get('/groups/:groupId/expenses', authMiddleware, getGroupExpenses);
router.get('/expenses/:expenseId', authMiddleware, getExpenseById);
router.put('/expenses/:expenseId', authMiddleware, updateExpense);
router.delete('/expenses/:expenseId', authMiddleware, deleteExpense);

export default router;
