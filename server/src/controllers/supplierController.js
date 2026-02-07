import PharmacySupplier from '../models/PharmacySupplier.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Get all suppliers for a pharmacy
export const getSuppliers = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const {
      page = 1,
      limit = 20,
      search,
      businessType,
      isActive,
      isPreferred,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { pharmacy: pharmacyId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    if (businessType) {
      query.businessType = businessType;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (isPreferred !== undefined) {
      query.isPreferred = isPreferred === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const suppliers = await PharmacySupplier.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await PharmacySupplier.countDocuments(query);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
};

// Get supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    const supplier = await PharmacySupplier.findOne({
      _id: id,
      pharmacy: pharmacyId
    }).lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
};

// Create new supplier
export const createSupplier = async (req, res) => {
  try {
    const pharmacyId = req.user._id;
    const supplierData = { ...req.body, pharmacy: pharmacyId };

    // Handle logo upload
    if (req.file) {
      supplierData.logo = {
        cloudinaryUrl: req.file.path || req.file.url,
        cloudinaryId: req.file.filename || req.file.public_id
      };
    }

    // Handle document uploads
    if (req.files && req.files.documents) {
      supplierData.documents = [];
      for (const file of req.files.documents) {
        supplierData.documents.push({
          type: file.fieldname || 'other',
          name: file.originalname,
          cloudinaryUrl: file.path || file.url,
          cloudinaryId: file.filename || file.public_id,
          uploadedAt: new Date()
        });
      }
    }

    const supplier = new PharmacySupplier(supplierData);
    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    
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
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    // Handle logo upload
    if (req.file) {
      updateData.logo = {
        cloudinaryUrl: req.file.path || req.file.url,
        cloudinaryId: req.file.filename || req.file.public_id
      };
    }

    // Handle document uploads
    if (req.files && req.files.documents) {
      updateData.documents = updateData.documents || [];
      for (const file of req.files.documents) {
        updateData.documents.push({
          type: file.fieldname || 'other',
          name: file.originalname,
          cloudinaryUrl: file.path || file.url,
          cloudinaryId: file.filename || file.public_id,
          uploadedAt: new Date()
        });
      }
    }

    const supplier = await PharmacySupplier.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    
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
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    const supplier = await PharmacySupplier.findOne({
      _id: id,
      pharmacy: pharmacyId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Delete logo from Cloudinary
    if (supplier.logo && supplier.logo.cloudinaryId) {
      try {
        await deleteFromCloudinary(supplier.logo.cloudinaryId);
      } catch (cloudinaryError) {
        console.warn('Failed to delete logo from Cloudinary:', cloudinaryError);
      }
    }

    // Delete documents from Cloudinary
    if (supplier.documents && supplier.documents.length > 0) {
      for (const doc of supplier.documents) {
        try {
          await deleteFromCloudinary(doc.cloudinaryId);
        } catch (cloudinaryError) {
          console.warn('Failed to delete document from Cloudinary:', cloudinaryError);
        }
      }
    }

    await PharmacySupplier.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};

// Toggle supplier status
export const toggleSupplierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    const supplier = await PharmacySupplier.findOne({
      _id: id,
      pharmacy: pharmacyId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    supplier.isActive = !supplier.isActive;
    await supplier.save();

    res.json({
      success: true,
      message: `Supplier ${supplier.isActive ? 'activated' : 'deactivated'} successfully`,
      data: supplier
    });
  } catch (error) {
    console.error('Toggle supplier status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle supplier status',
      error: error.message
    });
  }
};

// Toggle preferred status
export const togglePreferredStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    const supplier = await PharmacySupplier.findOne({
      _id: id,
      pharmacy: pharmacyId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    supplier.isPreferred = !supplier.isPreferred;
    await supplier.save();

    res.json({
      success: true,
      message: `Supplier ${supplier.isPreferred ? 'marked as preferred' : 'removed from preferred'} successfully`,
      data: supplier
    });
  } catch (error) {
    console.error('Toggle preferred status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle preferred status',
      error: error.message
    });
  }
};

// Get suppliers by location
export const getSuppliersByLocation = async (req, res) => {
  try {
    const { city, state } = req.query;
    const pharmacyId = req.user._id;

    if (!city && !state) {
      return res.status(400).json({
        success: false,
        message: 'City or state is required'
      });
    }

    const suppliers = await PharmacySupplier.findByLocation(city, state)
      .where('pharmacy', pharmacyId)
      .lean();

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Get suppliers by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers by location',
      error: error.message
    });
  }
};

// Get preferred suppliers
export const getPreferredSuppliers = async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    const suppliers = await PharmacySupplier.findPreferred(pharmacyId);

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Get preferred suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferred suppliers',
      error: error.message
    });
  }
};

// Upload supplier document
export const uploadSupplierDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;
    const { documentType = 'other' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const supplier = await PharmacySupplier.findOne({
      _id: id,
      pharmacy: pharmacyId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const document = {
      type: documentType,
      name: req.file.originalname,
      cloudinaryUrl: req.file.path || req.file.url,
      cloudinaryId: req.file.filename || req.file.public_id,
      uploadedAt: new Date()
    };

    supplier.documents.push(document);
    await supplier.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Upload supplier document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Delete supplier document
export const deleteSupplierDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const supplier = await PharmacySupplier.findOne({
      _id: id,
      pharmacy: pharmacyId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const document = supplier.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(document.cloudinaryId);
    } catch (cloudinaryError) {
      console.warn('Failed to delete document from Cloudinary:', cloudinaryError);
    }

    // Remove from array
    supplier.documents.pull(documentId);
    await supplier.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Get supplier statistics
export const getSupplierStats = async (req, res) => {
  try {
    const pharmacyId = req.user._id;

    const stats = await PharmacySupplier.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId) } },
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          activeSuppliers: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          preferredSuppliers: {
            $sum: { $cond: ['$isPreferred', 1, 0] }
          },
          verifiedSuppliers: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          averageRating: { $avg: '$rating' },
          businessTypes: { $addToSet: '$businessType' }
        }
      }
    ]);

    const businessTypeStats = await PharmacySupplier.aggregate([
      { $match: { pharmacy: new mongoose.Types.ObjectId(pharmacyId) } },
      {
        $group: {
          _id: '$businessType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...stats[0],
        businessTypeBreakdown: businessTypeStats
      }
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier statistics',
      error: error.message
    });
  }
};

// Search suppliers
export const searchSuppliers = async (req, res) => {
  try {
    const { q } = req.query;
    const pharmacyId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const suppliers = await PharmacySupplier.find({
      pharmacy: pharmacyId,
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { contactName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { state: { $regex: q, $options: 'i' } },
        { businessType: { $regex: q, $options: 'i' } }
      ]
    })
      .select('name contactName email phone city state businessType isPreferred rating')
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Search suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search suppliers',
      error: error.message
    });
  }
};

