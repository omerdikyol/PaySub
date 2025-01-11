import { Router } from 'express';
import { check } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Register user
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('name', 'Name is required').not().isEmpty(),
  ],
  register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login
);

// Get user profile
router.get('/profile', authMiddleware, getProfile);

// Update user profile
router.put(
  '/profile',
  [
    authMiddleware,
    check('name', 'Name is required').optional(),
    check('defaultCurrency', 'Default currency is required').optional(),
    check('language', 'Language must be either en or tr').optional().isIn(['en', 'tr']),
  ],
  updateProfile
);

export default router; 