import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSettings,
  updateSettings,
  exportAllData,
  deleteAccount,
  syncSettings,
} from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// Validation rules
const updateSettingsValidation = [
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('language').optional().isIn(['en', 'es', 'fr', 'de']).withMessage('Invalid language'),
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
  body('study').optional().isObject().withMessage('Study preferences must be an object'),
  body('privacy').optional().isObject().withMessage('Privacy settings must be an object'),
];

// Get user settings
router.get('/', authenticate, getSettings);

// Update user settings
router.put(
  '/',
  authenticate,
  updateSettingsValidation,
  validateRequest,
  updateSettings
);

// Sync settings (same as update but explicitly named for clarity)
router.post(
  '/sync',
  authenticate,
  updateSettingsValidation,
  validateRequest,
  syncSettings
);

// Export all user data
router.get('/export-all', authenticate, exportAllData);

// Delete user account
router.delete('/delete-account', authenticate, deleteAccount);

export default router;
