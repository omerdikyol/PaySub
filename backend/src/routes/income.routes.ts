import { Router } from 'express';
import { check } from 'express-validator';
import { auth } from '../middleware/auth';
import {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/income.controller';

const router = Router();

// Get all incomes
router.get('/', auth, getIncomes);

// Get single income
router.get('/:id', auth, getIncome);

// Create income
router.post(
  '/',
  [
    auth,
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
  createIncome
);

// Update income
router.put(
  '/:id',
  [
    auth,
    check('amount', 'Amount must be numeric').optional().isNumeric(),
    check('currency', 'Currency is required').optional().not().isEmpty(),
    check('name', 'Name is required').optional().not().isEmpty(),
    check('startDate', 'Start date must be valid').optional().isISO8601(),
    check('color', 'Color is required').optional().not().isEmpty(),
    check('recurrence.type', 'Invalid recurrence type')
      .optional()
      .isIn(['once', 'daily', 'weekly', 'monthly', 'yearly', 'custom']),
  ],
  updateIncome
);

// Delete income
router.delete('/:id', auth, deleteIncome);

export default router; 