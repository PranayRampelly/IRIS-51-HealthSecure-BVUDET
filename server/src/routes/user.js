import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// @desc    Update user's online status
// @route   PUT /api/user/online-status
// @access  Private
router.put('/online-status', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isOnline must be a boolean value'
      });
    }

    // Update user's online status
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        isOnline,
        lastOnlineAt: isOnline ? new Date() : new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Emit real-time update if user is a doctor
    if (user.role === 'doctor' && global.io) {
      global.io.to(`doctor:${user._id}`).emit('doctor:status:updated', {
        doctorId: user._id,
        isOnline: user.isOnline,
        lastOnlineAt: user.lastOnlineAt,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `User is now ${isOnline ? 'online' : 'offline'}`,
      user: {
        _id: user._id,
        isOnline: user.isOnline,
        lastOnlineAt: user.lastOnlineAt
      }
    });

  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update online status',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

export default router;



