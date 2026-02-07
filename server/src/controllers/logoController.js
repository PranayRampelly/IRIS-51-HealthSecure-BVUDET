import PharmacySupplier from '../models/PharmacySupplier.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Upload supplier logo
export const uploadSupplierLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided'
      });
    }

    // Find the supplier
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

    // Delete old logo if exists
    if (supplier.logo && supplier.logo.cloudinaryId) {
      try {
        await deleteFromCloudinary(supplier.logo.cloudinaryId);
      } catch (error) {
        console.warn('Failed to delete old logo:', error.message);
      }
    }

    // Update supplier with new logo
    const logoData = {
      cloudinaryUrl: req.file.path || req.file.url,
      cloudinaryId: req.file.filename || req.file.public_id
    };

    supplier.logo = logoData;
    await supplier.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logo: logoData,
        supplier: {
          id: supplier._id,
          name: supplier.name
        }
      }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
};

// Delete supplier logo
export const deleteSupplierLogo = async (req, res) => {
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

    if (!supplier.logo || !supplier.logo.cloudinaryId) {
      return res.status(404).json({
        success: false,
        message: 'No logo found for this supplier'
      });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(supplier.logo.cloudinaryId);
    } catch (error) {
      console.warn('Failed to delete logo from Cloudinary:', error.message);
    }

    // Remove logo from supplier
    supplier.logo = undefined;
    await supplier.save();

    res.json({
      success: true,
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo',
      error: error.message
    });
  }
};

// Get supplier logo
export const getSupplierLogo = async (req, res) => {
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
    }).select('logo name');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    if (!supplier.logo || !supplier.logo.cloudinaryUrl) {
      return res.status(404).json({
        success: false,
        message: 'No logo found for this supplier'
      });
    }

    res.json({
      success: true,
      data: {
        logo: supplier.logo,
        supplier: {
          id: supplier._id,
          name: supplier.name
        }
      }
    });
  } catch (error) {
    console.error('Get logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get logo',
      error: error.message
    });
  }
};

// Update supplier logo (replace existing)
export const updateSupplierLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided'
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

    // Delete old logo if exists
    if (supplier.logo && supplier.logo.cloudinaryId) {
      try {
        await deleteFromCloudinary(supplier.logo.cloudinaryId);
      } catch (error) {
        console.warn('Failed to delete old logo:', error.message);
      }
    }

    // Update with new logo
    const logoData = {
      cloudinaryUrl: req.file.path || req.file.url,
      cloudinaryId: req.file.filename || req.file.public_id
    };

    const updatedSupplier = await PharmacySupplier.findByIdAndUpdate(
      id,
      { logo: logoData },
      { new: true }
    ).select('name logo');

    res.json({
      success: true,
      message: 'Logo updated successfully',
      data: {
        logo: logoData,
        supplier: {
          id: updatedSupplier._id,
          name: updatedSupplier.name
        }
      }
    });
  } catch (error) {
    console.error('Update logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update logo',
      error: error.message
    });
  }
};

