import User from '../models/User.js';
import { logAccess } from '../utils/logger.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/cloudinary.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users with pagination, filtering, and search
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      verified,
      dateFrom,
      dateTo,
      lastLoginFrom,
      lastLoginTo
    } = req.query;

    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    if (verified !== undefined) {
      query.isEmailVerified = verified === 'true';
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Last login range filtering
    if (lastLoginFrom || lastLoginTo) {
      query.lastLoginAt = {};
      if (lastLoginFrom) query.lastLoginAt.$gte = new Date(lastLoginFrom);
      if (lastLoginTo) query.lastLoginAt.$lte = new Date(lastLoginTo);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password -twoFactorSecret -webauthnCredentials')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Transform users data for frontend
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      status: user.isActive ? 'active' : 'suspended',
      avatar: user.profileImage?.url || '/placeholder.svg',
      lastLogin: user.lastLoginAt ? formatTimeAgo(user.lastLoginAt) : 'Never',
      joinDate: formatDate(user.createdAt),
      phone: user.phone || 'N/A',
      verified: user.isEmailVerified,
      // Role-specific data
      ...(user.role === 'doctor' && {
        specialization: user.specialization,
        hospital: user.hospital,
        licenseNumber: user.licenseNumber
      }),
      ...(user.role === 'patient' && {
        bloodType: user.bloodType,
        age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : null
      }),
      ...(user.role === 'insurance' && {
        organization: user.organization
      })
    }));

    // Log the action
    await logAccess(req.user._id, 'VIEW', 'User', null, null, req, 
      `Viewed users list. Filters: ${JSON.stringify({ role, search, status, page, limit })}`);

    res.json({
      users: transformedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNextPage: skip + users.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorSecret -webauthnCredentials');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logAccess(req.user._id, 'VIEW', 'User', req.params.id, null, req, 
      `Viewed user details for ${user.email}`);

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      address,
      // Doctor specific fields
      licenseNumber,
      specialization,
      hospital,
      department,
      yearsOfExperience,
      bio,
      organization,
      experience,
      languages,
      consultationFees,
      availability,
      location,
      specialties,
      emergencyAvailable,
      // Patient specific fields
      bloodType,
      height,
      weight,
      allergies,
      currentMedications,
      medicalConditions,
      surgeries,
      emergencyContacts,
      // Insurance specific fields
      insurance
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare user data
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      address,
      isEmailVerified: true, // Admin created users are pre-verified
      isActive: true,
      createdBy: req.user._id
    };

    // Add role-specific fields
    if (role === 'doctor') {
      Object.assign(userData, {
        licenseNumber,
        specialization,
        hospital,
        department,
        yearsOfExperience,
        bio,
        organization,
        experience,
        languages: languages ? languages.split(',').map(lang => lang.trim()) : [],
        consultationFees,
        availability,
        location,
        specialties: specialties ? specialties.split(',').map(spec => spec.trim()) : [],
        emergencyAvailable
      });
    } else if (role === 'patient') {
      Object.assign(userData, {
        dateOfBirth,
        bloodType,
        height,
        weight,
        allergies,
        currentMedications,
        medicalConditions,
        surgeries,
        emergencyContacts: emergencyContacts ? JSON.parse(emergencyContacts) : []
      });
    } else if (role === 'insurance') {
      Object.assign(userData, {
        insurance
      });
    }

    // Handle profile image upload
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.path, 'user_profiles');
        userData.profileImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          uploadedAt: new Date()
        };
      } catch (uploadError) {
        console.error('Profile image upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile image' });
      }
    }

    // Create user
    const newUser = await User.create(userData);
    const userResponse = await User.findById(newUser._id)
      .select('-password -twoFactorSecret -webauthnCredentials');

    await logAccess(req.user._id, 'CREATE', 'User', newUser._id, null, req, 
      `Created new user: ${email} with role: ${role}`);

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      address,
      isActive,
      isEmailVerified,
      // Doctor specific fields
      licenseNumber,
      specialization,
      hospital,
      department,
      yearsOfExperience,
      bio,
      organization,
      experience,
      languages,
      consultationFees,
      availability,
      location,
      specialties,
      emergencyAvailable,
      // Patient specific fields
      bloodType,
      height,
      weight,
      allergies,
      currentMedications,
      medicalConditions,
      surgeries,
      emergencyContacts,
      // Insurance specific fields
      insurance
    } = req.body;

    // Update basic fields
    const updateData = {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      address,
      isActive,
      isEmailVerified,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };

    // Update role-specific fields
    if (user.role === 'doctor') {
      Object.assign(updateData, {
        licenseNumber,
        specialization,
        hospital,
        department,
        yearsOfExperience,
        bio,
        organization,
        experience,
        languages: languages ? languages.split(',').map(lang => lang.trim()) : user.languages,
        consultationFees,
        availability,
        location,
        specialties: specialties ? specialties.split(',').map(spec => spec.trim()) : user.specialties,
        emergencyAvailable
      });
    } else if (user.role === 'patient') {
      Object.assign(updateData, {
        dateOfBirth,
        bloodType,
        height,
        weight,
        allergies,
        currentMedications,
        medicalConditions,
        surgeries,
        emergencyContacts: emergencyContacts ? JSON.parse(emergencyContacts) : user.emergencyContacts
      });
    } else if (user.role === 'insurance') {
      Object.assign(updateData, {
        insurance
      });
    }

    // Handle profile image update
    if (req.file) {
      try {
        // Delete old image if exists
        if (user.profileImage && user.profileImage.publicId) {
          await deleteFromCloudinary(user.profileImage.publicId);
        }

        // Upload new image
        const uploadResult = await uploadToCloudinary(req.file.path, 'user_profiles');
        updateData.profileImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          uploadedAt: new Date()
        };
      } catch (uploadError) {
        console.error('Profile image upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile image' });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -webauthnCredentials');

    await logAccess(req.user._id, 'UPDATE', 'User', req.params.id, null, req, 
      `Updated user: ${user.email}`);

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (soft delete by deactivating)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete by deactivating
    user.isActive = false;
    user.deletedAt = new Date();
    user.deletedBy = req.user._id;
    await user.save();

    await logAccess(req.user._id, 'DELETE', 'User', req.params.id, null, req, 
      `Deactivated user: ${user.email}`);

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reactivate user
// @route   PATCH /api/admin/users/:id/reactivate
// @access  Private (Admin only)
export const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    user.deletedAt = undefined;
    user.deletedBy = undefined;
    user.reactivatedAt = new Date();
    user.reactivatedBy = req.user._id;
    await user.save();

    await logAccess(req.user._id, 'REACTIVATE', 'User', req.params.id, null, req, 
      `Reactivated user: ${user.email}`);

    res.json({ message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Admin only)
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          verifiedCount: {
            $sum: { $cond: ['$isEmailVerified', 1, 0] }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const pendingUsers = await User.countDocuments({ isEmailVerified: false });
    const suspendedUsers = await User.countDocuments({ isActive: false });

    // Get recent activity stats
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: last30Days }
    });

    const activeUsersThisMonth = await User.countDocuments({
      lastLoginAt: { $gte: last30Days }
    });

    // Get role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: {
            $multiply: [
              { $divide: ['$count', totalUsers] },
              100
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    await logAccess(req.user._id, 'VIEW', 'User', null, null, req, 
      'Viewed user statistics');

    res.json({
      roleStats: stats,
      totalUsers,
      activeUsers,
      verifiedUsers,
      inactiveUsers: totalUsers - activeUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      pendingUsers,
      suspendedUsers,
      newUsersThisMonth,
      activeUsersThisMonth,
      roleDistribution,
      summary: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        suspended: suspendedUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk operations on users
// @route   POST /api/admin/users/bulk
// @access  Private (Admin only)
export const bulkUserOperations = async (req, res) => {
  try {
    const { operation, userIds, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    let result;
    let operationLog = '';

    switch (operation) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            isActive: true, 
            reactivatedAt: new Date(),
            reactivatedBy: req.user._id,
            deletedAt: undefined,
            deletedBy: undefined
          }
        );
        operationLog = `Bulk activated ${result.modifiedCount} users`;
        break;

      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            isActive: false, 
            deletedAt: new Date(),
            deletedBy: req.user._id
          }
        );
        operationLog = `Bulk deactivated ${result.modifiedCount} users`;
        break;

      case 'verify':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            isEmailVerified: true,
            emailVerifiedAt: new Date()
          }
        );
        operationLog = `Bulk verified ${result.modifiedCount} users`;
        break;

      case 'update_role':
        if (!data || !data.role) {
          return res.status(400).json({ message: 'Role is required for role update' });
        }
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            role: data.role,
            updatedAt: new Date(),
            updatedBy: req.user._id
          }
        );
        operationLog = `Bulk updated role to ${data.role} for ${result.modifiedCount} users`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    await logAccess(req.user._id, 'BULK_UPDATE', 'User', null, null, req, operationLog);

    res.json({
      message: 'Bulk operation completed successfully',
      modifiedCount: result.modifiedCount,
      operation
    });
  } catch (error) {
    console.error('Bulk user operations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user activity and login history
// @route   GET /api/admin/users/:id/activity
// @access  Private (Admin only)
export const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('lastLoginAt loginHistory createdAt updatedAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's access logs
    const AccessLog = (await import('../models/AccessLog.js')).default;
    const accessLogs = await AccessLog.find({ userId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'firstName lastName email');

    await logAccess(req.user._id, 'VIEW', 'UserActivity', req.params.id, null, req, 
      `Viewed activity for user: ${user.email}`);

    res.json({
      user: {
        lastLoginAt: user.lastLoginAt,
        loginHistory: user.loginHistory || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessLogs
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export users data
// @route   GET /api/admin/users/export
// @access  Private (Admin only)
export const exportUsers = async (req, res) => {
  try {
    const { format = 'json', role, status } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (status !== undefined) query.isActive = status === 'active';

    const users = await User.find(query)
      .select('-password -twoFactorSecret -webauthnCredentials')
      .sort({ createdAt: -1 })
      .lean();

    await logAccess(req.user._id, 'EXPORT', 'User', null, null, req, 
      `Exported ${users.length} users in ${format} format`);

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = users.map(user => ({
        'Full Name': `${user.firstName} ${user.lastName}`,
        'Email': user.email,
        'Role': user.role,
        'Status': user.isActive ? 'Active' : 'Inactive',
        'Phone': user.phone || '',
        'Verified': user.isEmailVerified ? 'Yes' : 'No',
        'Created Date': new Date(user.createdAt).toLocaleDateString(),
        'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users-${Date.now()}.csv`);
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json({
        users,
        exportDate: new Date(),
        totalUsers: users.length
      });
    }
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user search suggestions
// @route   GET /api/admin/users/suggestions
// @access  Private (Admin only)
export const getUserSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('firstName lastName email role isActive')
    .limit(10)
    .lean();

    const formattedSuggestions = suggestions.map(user => ({
      id: user._id,
      label: `${user.firstName} ${user.lastName} (${user.email})`,
      value: user._id,
      role: user.role,
      status: user.isActive ? 'active' : 'inactive'
    }));

    res.json({ suggestions: formattedSuggestions });
  } catch (error) {
    console.error('Get user suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility functions
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}; 