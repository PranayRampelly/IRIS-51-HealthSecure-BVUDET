import PharmacyCustomer from '../models/PharmacyCustomer.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Get all customers for a pharmacy
export const getCustomers = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      customerType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { pharmacy: pharmacyId, status: { $ne: 'deleted' } };

    if (status) {
      query.status = status;
    }

    if (customerType) {
      query.customerType = customerType;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { 'address.city': regex },
        { 'address.state': regex }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const customers = await PharmacyCustomer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('pharmacy', 'name email phone')
      .lean();

    const total = await PharmacyCustomer.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCustomers: total,
          hasNext: skip + customers.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await PharmacyCustomer.findOne({
      _id: id,
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    }).populate('pharmacy', 'name email phone');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const customerData = { ...req.body, pharmacy: pharmacyId };

    // Handle profile image upload
    if (req.file) {
      customerData.profileImage = {
        cloudinaryUrl: req.file.path || req.file.url,
        cloudinaryId: req.file.filename || req.file.public_id
      };
    }

    // Check if customer with same email already exists
    const existingCustomer = await PharmacyCustomer.findOne({
      email: customerData.email,
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    const customer = new PharmacyCustomer(customerData);
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = {
        cloudinaryUrl: req.file.path || req.file.url,
        cloudinaryId: req.file.filename || req.file.public_id
      };
    }

    const customer = await PharmacyCustomer.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId, status: { $ne: 'deleted' } },
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

// Delete customer (soft delete)
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await PharmacyCustomer.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId, status: { $ne: 'deleted' } },
      { status: 'deleted' },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

// Toggle customer status
export const toggleCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await PharmacyCustomer.findOne({
      _id: id,
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    customer.status = newStatus;
    await customer.save();

    res.json({
      success: true,
      message: `Customer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: customer
    });
  } catch (error) {
    console.error('Toggle customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle customer status',
      error: error.message
    });
  }
};

// Get customers by location
export const getCustomersByLocation = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { city, state, pincode } = req.query;

    const query = { pharmacy: pharmacyId, status: { $ne: 'deleted' } };

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }
    if (state) {
      query['address.state'] = new RegExp(state, 'i');
    }
    if (pincode) {
      query['address.pincode'] = pincode;
    }

    const customers = await PharmacyCustomer.find(query)
      .select('firstName lastName email phone address orderStats')
      .sort({ 'orderStats.lastOrderDate': -1 });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Get customers by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers by location',
      error: error.message
    });
  }
};

// Get premium/VIP customers
export const getPremiumCustomers = async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    const customers = await PharmacyCustomer.find({
      pharmacy: pharmacyId,
      customerType: { $in: ['premium', 'vip'] },
      status: { $ne: 'deleted' }
    })
    .sort({ 'orderStats.totalSpent': -1 })
    .populate('pharmacy', 'name');

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Get premium customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch premium customers',
      error: error.message
    });
  }
};

// Upload customer document
export const uploadCustomerDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;
    const { type, name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const customer = await PharmacyCustomer.findOne({
      _id: id,
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const document = {
      type,
      name: name || req.file.originalname,
      cloudinaryUrl: req.file.path || req.file.url,
      cloudinaryId: req.file.filename || req.file.public_id,
      description: description || ''
    };

    customer.documents.push(document);
    await customer.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Upload customer document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Delete customer document
export const deleteCustomerDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer or document ID'
      });
    }

    const customer = await PharmacyCustomer.findOne({
      _id: id,
      pharmacy: pharmacyId,
      status: { $ne: 'deleted' }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const document = customer.documents.id(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId);
    }

    // Remove document from array
    customer.documents.pull(docId);
    await customer.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    const stats = await PharmacyCustomer.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId), status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          premiumCustomers: {
            $sum: { $cond: [{ $eq: ['$customerType', 'premium'] }, 1, 0] }
          },
          vipCustomers: {
            $sum: { $cond: [{ $eq: ['$customerType', 'vip'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$orderStats.totalSpent' },
          averageOrderValue: { $avg: '$orderStats.averageOrderValue' }
        }
      }
    ]);

    const customerTypeStats = await PharmacyCustomer.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId), status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$customerType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0,
          premiumCustomers: 0,
          vipCustomers: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        },
        customerTypeBreakdown: customerTypeStats
      }
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message
    });
  }
};

// Search customers
export const searchCustomers = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const customers = await PharmacyCustomer.searchCustomers(pharmacyId, q.trim())
      .limit(parseInt(limit))
      .select('firstName lastName email phone address orderStats customerType status');

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search customers',
      error: error.message
    });
  }
};

