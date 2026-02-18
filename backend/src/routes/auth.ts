import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const verifyEmailValidation = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

// Public routes
router.post(
  '/register',
  authLimiter,
  registerValidation,
  validateRequest,
  register
);

router.post('/login', authLimiter, loginValidation, validateRequest, login);

router.post('/logout', logout);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidation,
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  resetPasswordValidation,
  validateRequest,
  resetPassword
);

router.post('/verify-email', verifyEmailValidation, validateRequest, verifyEmail);

router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authenticate, getProfile);

router.put(
  '/profile',
  authenticate,
  updateProfileValidation,
  validateRequest,
  updateProfile
);

router.post(
  '/change-password',
  authenticate,
  changePasswordValidation,
  validateRequest,
  changePassword
);

export default router;
