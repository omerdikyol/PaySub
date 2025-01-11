import { Router } from 'express';
import { check } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  updatePaymentStatus,
} from '../controllers/expense.controller';

const router = Router();

// Get all expenses
router.get('/', authMiddleware, getExpenses);

// Get single expense
router.get('/:id', authMiddleware, getExpense);

// Create expense
router.post(
  '/',
  [
    authMiddleware,
    check('amount', 'Amount is required').isNumeric(),
    check('currency', 'Currency is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('color', 'Color is required').not().isEmpty(),
    check('recurrence.type', 'Recurrence type is required').isIn([
      'once',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'custom',
    ]),
  ],
  createExpense
);

// Update expense
router.put(
  '/:id',
  [
    authMiddleware,
    check('amount', 'Amount must be numeric').optional().isNumeric(),
    check('currency', 'Currency is required').optional().not().isEmpty(),
    check('name', 'Name is required').optional().not().isEmpty(),
    check('startDate', 'Start date must be valid').optional().isISO8601(),
    check('color', 'Color is required').optional().not().isEmpty(),
    check('recurrence.type', 'Invalid recurrence type')
      .optional()
      .isIn(['once', 'daily', 'weekly', 'monthly', 'yearly', 'custom']),
  ],
  updateExpense
);

// Delete expense
router.delete('/:id', authMiddleware, deleteExpense);

// Update payment status
router.patch(
  '/:id/payment',
  [
    authMiddleware,
    check('date', 'Date is required').isISO8601(),
    check('isPaid', 'isPaid must be a boolean').isBoolean(),
  ],
  updatePaymentStatus
);

export default router; 