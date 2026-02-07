import BloodInventory from '../models/BloodInventory.js';
import BloodDonor from '../models/BloodDonor.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { validateObjectId } from '../utils/validation.js';

// Get all inventory items for a blood bank
export const getInventory = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const {
      page = 1,
      limit = 10,
      bloodType,
      componentType,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build query
    const query = { bloodBankId, isActive: true };

    if (bloodType) query.bloodType = bloodType;
    if (componentType) query.componentType = componentType;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.collectionDate = {};
      if (startDate) query.collectionDate.$gte = new Date(startDate);
      if (endDate) query.collectionDate.$lte = new Date(endDate);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { donorName: { $regex: search, $options: 'i' } },
        { 'storageLocation.refrigerator': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const inventory = await BloodInventory.find(query)
      .populate('donorId', 'donorId personalInfo.firstName personalInfo.lastName personalInfo.bloodType')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BloodInventory.countDocuments(query);

    res.json({
      success: true,
      data: inventory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

// Get inventory summary
export const getInventorySummary = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const summary = await BloodInventory.getInventorySummary(bloodBankId);

    // Get expiring inventory
    const expiringInventory = await BloodInventory.getExpiringInventory(bloodBankId, 7);

    // Get low stock alerts
    const lowStockThreshold = 10; // Configure as needed
    const lowStockItems = await BloodInventory.aggregate([
      { $match: { bloodBankId, isActive: true, status: 'Available' } },
      {
        $group: {
          _id: {
            bloodType: '$bloodType',
            componentType: '$componentType'
          },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $match: { totalQuantity: { $lt: lowStockThreshold } } }
    ]);

    res.json({
      success: true,
      data: {
        summary,
        expiringInventory: expiringInventory.length,
        lowStockItems: lowStockItems.length,
        totalInventory: await BloodInventory.countDocuments({ bloodBankId, isActive: true })
      }
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory summary',
      error: error.message
    });
  }
};

// Get single inventory item
export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const inventory = await BloodInventory.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    }).populate('donorId', 'donorId personalInfo.firstName personalInfo.lastName personalInfo.bloodType contactInfo.phone');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item',
      error: error.message
    });
  }
};

// Create new inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const inventoryData = {
      ...req.body,
      bloodBankId,
      createdBy: req.user._id
    };

    // Validate donor exists
    if (inventoryData.donorId) {
      const donor = await BloodDonor.findOne({
        _id: inventoryData.donorId,
        bloodBankId,
        isActive: true
      });

      if (!donor) {
        return res.status(400).json({
          success: false,
          message: 'Donor not found'
        });
      }

      // Set donor information
      inventoryData.donorName = `${donor.personalInfo.firstName} ${donor.personalInfo.lastName}`;
      inventoryData.donorBloodType = donor.personalInfo.bloodType;
    }

    // Calculate expiry date based on component type
    const collectionDate = new Date(inventoryData.collectionDate);
    let expiryDays = 42; // Default for whole blood

    switch (inventoryData.componentType) {
      case 'Whole Blood':
      case 'Red Blood Cells':
        expiryDays = 42;
        break;
      case 'Platelets':
        expiryDays = 5;
        break;
      case 'Plasma':
        expiryDays = 365;
        break;
      case 'Cryoprecipitate':
        expiryDays = 365;
        break;
      case 'Granulocytes':
        expiryDays = 1;
        break;
    }

    const expiryDate = new Date(collectionDate);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    inventoryData.expiryDate = expiryDate;

    const inventory = new BloodInventory(inventoryData);
    await inventory.save();

    // Add audit trail entry
    inventory.addAuditTrail(
      'Created',
      req.user._id,
      `${req.user.firstName} ${req.user.lastName}`,
      'New inventory item created'
    );

    await inventory.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
};

// Update inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const updateData = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const inventory = await BloodInventory.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'bloodBankId' && key !== 'createdBy') {
        inventory[key] = updateData[key];
      }
    });

    inventory.updatedBy = req.user._id;

    // Add audit trail entry
    inventory.addAuditTrail(
      'Updated',
      req.user._id,
      `${req.user.firstName} ${req.user.lastName}`,
      'Inventory item updated'
    );

    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
};

// Update inventory quantity
export const updateInventoryQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { newQuantity, action, details } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const inventory = await BloodInventory.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Update quantity with audit trail
    inventory.updateQuantity(
      newQuantity,
      action,
      req.user._id,
      `${req.user.firstName} ${req.user.lastName}`,
      details
    );

    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory quantity updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory quantity',
      error: error.message
    });
  }
};

// Delete inventory item (soft delete)
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const inventory = await BloodInventory.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Soft delete
    inventory.isActive = false;
    inventory.updatedBy = req.user._id;

    // Add audit trail entry
    inventory.addAuditTrail(
      'Deleted',
      req.user._id,
      `${req.user.firstName} ${req.user.lastName}`,
      'Inventory item deleted'
    );

    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message
    });
  }
};

// Upload inventory document
export const uploadInventoryDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { documentType, title } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const inventory = await BloodInventory.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, 'bloodbank/inventory');

    // Add document to inventory
    inventory.documents.push({
      type: documentType,
      title,
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      uploadDate: new Date(),
      uploadedBy: req.user._id
    });

    await inventory.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fileUrl: uploadResult.secure_url,
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Error uploading inventory document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Get inventory alerts
export const getInventoryAlerts = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const { severity, isActive = true } = req.query;

    const query = { bloodBankId, isActive: true };
    if (severity) query['alerts.severity'] = severity;
    if (isActive !== undefined) query['alerts.isActive'] = isActive === 'true';

    const alerts = await BloodInventory.find(query)
      .select('_id bloodType componentType quantity status alerts expiryDate')
      .populate('donorId', 'donorId personalInfo.firstName personalInfo.lastName');

    const allAlerts = [];
    alerts.forEach(inventory => {
      inventory.alerts.forEach(alert => {
        if (isActive === undefined || alert.isActive === (isActive === 'true')) {
          allAlerts.push({
            inventoryId: inventory._id,
            bloodType: inventory.bloodType,
            componentType: inventory.componentType,
            quantity: inventory.quantity,
            status: inventory.status,
            expiryDate: inventory.expiryDate,
            donor: inventory.donorId,
            alert: alert
          });
        }
      });
    });

    res.json({
      success: true,
      data: allAlerts
    });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory alerts',
      error: error.message
    });
  }
};

// Add alert to inventory item
export const addInventoryAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { type, message, severity = 'Medium' } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const inventory = await BloodInventory.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Add alert
    inventory.addAlert(type, message, severity);

    await inventory.save();

    res.json({
      success: true,
      message: 'Alert added successfully',
      data: inventory.alerts[inventory.alerts.length - 1]
    });
  } catch (error) {
    console.error('Error adding inventory alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add alert',
      error: error.message
    });
  }
};

// Get inventory audit trail
export const getInventoryAuditTrail = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodBankId } = req.user;
    const { page = 1, limit = 20 } = req.query;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }

    const inventory = await BloodInventory.findOne({
      _id: id,
      bloodBankId,
      isActive: true
    }).select('auditTrail');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Paginate audit trail
    const skip = (page - 1) * limit;
    const auditTrail = inventory.auditTrail
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: auditTrail,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(inventory.auditTrail.length / limit),
        totalItems: inventory.auditTrail.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory audit trail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit trail',
      error: error.message
    });
  }
};

// Get inventory statistics
export const getInventoryStatistics = async (req, res) => {
  try {
    const { bloodBankId } = req.user;
    const { startDate, endDate } = req.query;

    const matchStage = { bloodBankId, isActive: true };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const statistics = await BloodInventory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            bloodType: '$bloodType',
            componentType: '$componentType',
            status: '$status'
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgQuantity: { $avg: '$quantity' }
        }
      },
      {
        $group: {
          _id: {
            bloodType: '$_id.bloodType',
            componentType: '$_id.componentType'
          },
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalQuantity: '$totalQuantity',
              avgQuantity: '$avgQuantity'
            }
          }
        }
      }
    ]);

    // Get additional statistics
    const totalInventory = await BloodInventory.countDocuments({ bloodBankId, isActive: true });
    const expiringSoon = await BloodInventory.getExpiringInventory(bloodBankId, 7);
    const lowStock = await BloodInventory.aggregate([
      { $match: { bloodBankId, isActive: true, status: 'Available' } },
      {
        $group: {
          _id: {
            bloodType: '$bloodType',
            componentType: '$componentType'
          },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $match: { totalQuantity: { $lt: 10 } } }
    ]);

    res.json({
      success: true,
      data: {
        summary: statistics,
        totalInventory,
        expiringSoon: expiringSoon.length,
        lowStock: lowStock.length
      }
    });
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory statistics',
      error: error.message
    });
  }
};
