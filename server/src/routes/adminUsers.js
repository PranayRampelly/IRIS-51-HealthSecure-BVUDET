import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  getUserStats,
  bulkUserOperations,
  getUserActivity,
  exportUsers,
  getUserSuggestions
} from '../controllers/adminUserController.js';
import { auth } from '../middleware/auth.js';
import { uploadCloud } from '../middleware/cloudinary.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateListUsers,
  validateUserId,
  validateFileUpload
} from '../middleware/adminUserValidation.js';

const router = express.Router();

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Apply auth and admin middleware to all routes
router.use(auth, requireAdmin);

// Get user statistics
router.get('/stats', getUserStats);

// Get user search suggestions
router.get('/suggestions', getUserSuggestions);

// Export users data
router.get('/export', exportUsers);

// Get all users with pagination, filtering, and search
router.get('/', validateListUsers, getAllUsers);

// Get single user by ID
router.get('/:id', validateUserId, getUserById);

// Get user activity and login history
router.get('/:id/activity', validateUserId, getUserActivity);

// Create new user (with optional profile image)
router.post('/', uploadCloud.single('profileImage'), validateFileUpload, validateCreateUser, createUser);

// Bulk operations on users
router.post('/bulk', bulkUserOperations);

// Update user (with optional profile image)
router.put('/:id', uploadCloud.single('profileImage'), validateFileUpload, validateUpdateUser, updateUser);

// Delete user (soft delete)
router.delete('/:id', validateUserId, deleteUser);

// Reactivate user
router.patch('/:id/reactivate', validateUserId, reactivateUser);

export default router; 