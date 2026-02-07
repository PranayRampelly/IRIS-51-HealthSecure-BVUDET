import QualityControl from '../models/QualityControl.js';
import { validateObjectId } from '../utils/validation.js';

// Get quality control summary
export const getQualitySummary = async (req, res) => {
  try {
    const { bloodBankId } = req.params;

    if (!validateObjectId(bloodBankId)) {
      return res.status(400).json({ error: 'Invalid blood bank ID' });
    }

    const summary = await QualityControl.getQualitySummary(bloodBankId);

    // Calculate additional metrics
    const totalUnits = Object.values(summary).reduce((sum, status) => sum + status.count, 0);
    const passedUnits = summary.passed?.count || 0;
    const failedUnits = summary.failed?.count || 0;
    const pendingUnits = summary.pending?.count || 0;
    const inProgressUnits = summary.in_progress?.count || 0;
    const quarantinedUnits = summary.quarantine?.count || 0;
    const disposedUnits = summary.disposed?.count || 0;

    const qualityRate = totalUnits > 0 ? ((passedUnits / totalUnits) * 100).toFixed(1) : 0;
    const failureRate = totalUnits > 0 ? ((failedUnits / totalUnits) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        summary,
        metrics: {
          totalUnits,
          passedUnits,
          failedUnits,
          pendingUnits,
          inProgressUnits,
          quarantinedUnits,
          disposedUnits,
          qualityRate: parseFloat(qualityRate),
          failureRate: parseFloat(failureRate)
        }
      }
    });
  } catch (error) {
    console.error('Error getting quality summary:', error);
    res.status(500).json({ error: 'Failed to get quality summary' });
  }
};

// Get all quality control records
export const getQualityControls = async (req, res) => {
  try {
    const { bloodBankId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      bloodType,
      componentType,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!validateObjectId(bloodBankId)) {
      return res.status(400).json({ error: 'Invalid blood bank ID' });
    }

    // Build filter
    const filter = { bloodBank: bloodBankId };

    if (status) filter.overallStatus = status;
    if (bloodType) filter.bloodType = bloodType;
    if (componentType) filter.componentType = componentType;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [qualityControls, total] = await Promise.all([
      QualityControl.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('donorId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName'),
      QualityControl.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        qualityControls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting quality controls:', error);
    res.status(500).json({ error: 'Failed to get quality controls' });
  }
};

// Get single quality control record
export const getQualityControl = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid quality control ID' });
    }

    const qualityControl = await QualityControl.findById(id)
      .populate('donorId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('bloodBank', 'name');

    if (!qualityControl) {
      return res.status(404).json({ error: 'Quality control record not found' });
    }

    res.json({
      success: true,
      data: qualityControl
    });
  } catch (error) {
    console.error('Error getting quality control:', error);
    res.status(500).json({ error: 'Failed to get quality control record' });
  }
};

// Create new quality control record
export const createQualityControl = async (req, res) => {
  try {
    const { bloodBankId } = req.params;
    const qualityControlData = req.body;

    if (!validateObjectId(bloodBankId)) {
      return res.status(400).json({ error: 'Invalid blood bank ID' });
    }

    // Validate required fields
    const requiredFields = ['unitId', 'bloodType', 'componentType', 'donorId', 'collectionDate', 'processingDate', 'expiryDate'];
    for (const field of requiredFields) {
      if (!qualityControlData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Check if unit already exists
    const existingUnit = await QualityControl.findOne({ unitId: qualityControlData.unitId });
    if (existingUnit) {
      return res.status(400).json({ error: 'Unit ID already exists' });
    }

    const qualityControl = new QualityControl({
      ...qualityControlData,
      bloodBank: bloodBankId,
      createdBy: req.user.id
    });

    await qualityControl.save();

    res.status(201).json({
      success: true,
      data: qualityControl,
      message: 'Quality control record created successfully'
    });
  } catch (error) {
    console.error('Error creating quality control:', error);
    res.status(500).json({ error: 'Failed to create quality control record' });
  }
};

// Update quality control record
export const updateQualityControl = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid quality control ID' });
    }

    const qualityControl = await QualityControl.findById(id);
    if (!qualityControl) {
      return res.status(404).json({ error: 'Quality control record not found' });
    }

    // Add to audit trail
    const auditEntry = {
      action: 'update',
      user: req.user.id,
      details: 'Quality control record updated',
      previousValue: qualityControl.toObject(),
      newValue: updateData
    };

    updateData.auditTrail = [...(qualityControl.auditTrail || []), auditEntry];
    updateData.updatedBy = req.user.id;

    const updatedQualityControl = await QualityControl.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('donorId', 'firstName lastName email');

    res.json({
      success: true,
      data: updatedQualityControl,
      message: 'Quality control record updated successfully'
    });
  } catch (error) {
    console.error('Error updating quality control:', error);
    res.status(500).json({ error: 'Failed to update quality control record' });
  }
};

// Delete quality control record
export const deleteQualityControl = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid quality control ID' });
    }

    const qualityControl = await QualityControl.findById(id);
    if (!qualityControl) {
      return res.status(404).json({ error: 'Quality control record not found' });
    }

    await QualityControl.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Quality control record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quality control:', error);
    res.status(500).json({ error: 'Failed to delete quality control record' });
  }
};

// Add quality test to a unit
export const addQualityTest = async (req, res) => {
  try {
    const { id } = req.params;
    const testData = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid quality control ID' });
    }

    // Validate test data
    const requiredFields = ['testType', 'testMethod', 'result', 'technician'];
    for (const field of requiredFields) {
      if (!testData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const qualityControl = await QualityControl.findById(id);
    if (!qualityControl) {
      return res.status(404).json({ error: 'Quality control record not found' });
    }

    await qualityControl.addQualityTest(testData);

    res.json({
      success: true,
      data: qualityControl,
      message: 'Quality test added successfully'
    });
  } catch (error) {
    console.error('Error adding quality test:', error);
    res.status(500).json({ error: 'Failed to add quality test' });
  }
};

// Quarantine a unit
export const quarantineUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid quality control ID' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Quarantine reason is required' });
    }

    const qualityControl = await QualityControl.findById(id);
    if (!qualityControl) {
      return res.status(404).json({ error: 'Quality control record not found' });
    }

    await qualityControl.quarantineUnit(reason);

    res.json({
      success: true,
      data: qualityControl,
      message: 'Unit quarantined successfully'
    });
  } catch (error) {
    console.error('Error quarantining unit:', error);
    res.status(500).json({ error: 'Failed to quarantine unit' });
  }
};

// Release unit from quarantine
export const releaseFromQuarantine = async (req, res) => {
  try {
    const { id } = req.params;
    const { releasedBy } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid quality control ID' });
    }

    const qualityControl = await QualityControl.findById(id);
    if (!qualityControl) {
      return res.status(404).json({ error: 'Quality control record not found' });
    }

    if (qualityControl.overallStatus !== 'quarantine') {
      return res.status(400).json({ error: 'Unit is not in quarantine' });
    }

    await qualityControl.releaseFromQuarantine(releasedBy || req.user.firstName + ' ' + req.user.lastName);

    res.json({
      success: true,
      data: qualityControl,
      message: 'Unit released from quarantine successfully'
    });
  } catch (error) {
    console.error('Error releasing unit from quarantine:', error);
    res.status(500).json({ error: 'Failed to release unit from quarantine' });
  }
};

// Dispose a unit
export const disposeUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, method } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid quality control ID' });
    }

    if (!reason || !method) {
      return res.status(400).json({ error: 'Disposal reason and method are required' });
    }

    const qualityControl = await QualityControl.findById(id);
    if (!qualityControl) {
      return res.status(404).json({ error: 'Quality control record not found' });
    }

    await qualityControl.disposeUnit(reason, method);

    res.json({
      success: true,
      data: qualityControl,
      message: 'Unit disposed successfully'
    });
  } catch (error) {
    console.error('Error disposing unit:', error);
    res.status(500).json({ error: 'Failed to dispose unit' });
  }
};

// Get failed tests
export const getFailedTests = async (req, res) => {
  try {
    const { bloodBankId } = req.params;
    const { days = 30 } = req.query;

    if (!validateObjectId(bloodBankId)) {
      return res.status(400).json({ error: 'Invalid blood bank ID' });
    }

    const failedTests = await QualityControl.getFailedTests(bloodBankId, parseInt(days));

    res.json({
      success: true,
      data: failedTests
    });
  } catch (error) {
    console.error('Error getting failed tests:', error);
    res.status(500).json({ error: 'Failed to get failed tests' });
  }
};

// Get expiring quality tests
export const getExpiringQualityTests = async (req, res) => {
  try {
    const { bloodBankId } = req.params;
    const { days = 7 } = req.query;

    if (!validateObjectId(bloodBankId)) {
      return res.status(400).json({ error: 'Invalid blood bank ID' });
    }

    const expiringTests = await QualityControl.getExpiringQualityTests(bloodBankId, parseInt(days));

    res.json({
      success: true,
      data: expiringTests
    });
  } catch (error) {
    console.error('Error getting expiring quality tests:', error);
    res.status(500).json({ error: 'Failed to get expiring quality tests' });
  }
};

// Get quality analytics
export const getQualityAnalytics = async (req, res) => {
  try {
    const { bloodBankId } = req.params;
    const { startDate, endDate } = req.query;

    if (!validateObjectId(bloodBankId)) {
      return res.status(400).json({ error: 'Invalid blood bank ID' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const analytics = await QualityControl.getQualityAnalytics(bloodBankId, startDate, endDate);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting quality analytics:', error);
    res.status(500).json({ error: 'Failed to get quality analytics' });
  }
};

// Get compliance report
export const getComplianceReport = async (req, res) => {
  try {
    const { bloodBankId } = req.params;
    const { startDate, endDate } = req.query;

    if (!validateObjectId(bloodBankId)) {
      return res.status(400).json({ error: 'Invalid blood bank ID' });
    }

    const filter = { bloodBank: bloodBankId };
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const complianceData = await QualityControl.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$complianceStatus',
          count: { $sum: 1 },
          avgQualityScore: { $avg: '$qualityScore' }
        }
      }
    ]);

    const totalUnits = await QualityControl.countDocuments(filter);
    const compliantUnits = complianceData.find(item => item._id === 'compliant')?.count || 0;
    const nonCompliantUnits = complianceData.find(item => item._id === 'non_compliant')?.count || 0;
    const pendingReviewUnits = complianceData.find(item => item._id === 'pending_review')?.count || 0;

    const complianceRate = totalUnits > 0 ? ((compliantUnits / totalUnits) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        complianceData,
        summary: {
          totalUnits,
          compliantUnits,
          nonCompliantUnits,
          pendingReviewUnits,
          complianceRate: parseFloat(complianceRate)
        }
      }
    });
  } catch (error) {
    console.error('Error getting compliance report:', error);
    res.status(500).json({ error: 'Failed to get compliance report' });
  }
};

// Update quality control status
export const updateQualityControlStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const qualityControl = await QualityControl.findByIdAndUpdate(
      id,
      {
        overallStatus: status,
        $push: {
          auditTrail: {
            action: 'status_update',
            user: req.user?.id || 'system',
            details: notes || `Status updated to ${status}`,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!qualityControl) {
      return res.status(404).json({
        success: false,
        message: 'Quality control record not found'
      });
    }

    res.json({
      success: true,
      data: qualityControl,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Error updating quality control status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Upload quality control document
export const uploadQualityControlDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }

    const qualityControl = await QualityControl.findById(id);

    if (!qualityControl) {
      return res.status(404).json({
        success: false,
        message: 'Quality control record not found'
      });
    }

    const document = {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date(),
      uploadedBy: req.user?.id || 'system'
    };

    qualityControl.documents = qualityControl.documents || [];
    qualityControl.documents.push(document);
    await qualityControl.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Add quality control alert
export const addQualityControlAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { alertType, severity, message } = req.body;

    const qualityControl = await QualityControl.findById(id);

    if (!qualityControl) {
      return res.status(404).json({
        success: false,
        message: 'Quality control record not found'
      });
    }

    const alert = {
      type: alertType,
      severity,
      message,
      createdAt: new Date(),
      createdBy: req.user?.id || 'system'
    };

    qualityControl.alerts = qualityControl.alerts || [];
    qualityControl.alerts.push(alert);
    await qualityControl.save();

    res.json({
      success: true,
      message: 'Alert added successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error adding alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add alert',
      error: error.message
    });
  }
};

// Add corrective action
export const addCorrectiveAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, description, assignedTo } = req.body;

    const qualityControl = await QualityControl.findById(id);

    if (!qualityControl) {
      return res.status(404).json({
        success: false,
        message: 'Quality control record not found'
      });
    }

    const correctiveAction = {
      action,
      description,
      assignedTo,
      status: 'pending',
      createdAt: new Date(),
      createdBy: req.user?.id || 'system'
    };

    qualityControl.correctiveActions = qualityControl.correctiveActions || [];
    qualityControl.correctiveActions.push(correctiveAction);
    await qualityControl.save();

    res.json({
      success: true,
      message: 'Corrective action added successfully',
      data: correctiveAction
    });
  } catch (error) {
    console.error('Error adding corrective action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add corrective action',
      error: error.message
    });
  }
};

// Get overdue quality controls
export const getOverdueQualityControls = async (req, res) => {
  try {
    const now = new Date();

    const overdueControls = await QualityControl.find({
      expiryDate: { $lt: now },
      overallStatus: { $in: ['pending', 'in_progress'] }
    })
      .populate('donorId', 'firstName lastName')
      .sort({ expiryDate: 1 })
      .limit(50);

    res.json({
      success: true,
      data: overdueControls,
      count: overdueControls.length
    });
  } catch (error) {
    console.error('Error getting overdue quality controls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overdue quality controls',
      error: error.message
    });
  }
};

// Get quality controls by status
export const getQualityControlsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const qualityControls = await QualityControl.find({ overallStatus: status })
      .populate('donorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: qualityControls,
      count: qualityControls.length
    });
  } catch (error) {
    console.error('Error getting quality controls by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quality controls',
      error: error.message
    });
  }
};

// Get quality control audit trail
export const getQualityControlAuditTrail = async (req, res) => {
  try {
    const { id } = req.params;

    const qualityControl = await QualityControl.findById(id);

    if (!qualityControl) {
      return res.status(404).json({
        success: false,
        message: 'Quality control record not found'
      });
    }

    res.json({
      success: true,
      data: {
        unitId: qualityControl.unitId,
        auditTrail: qualityControl.auditTrail || []
      }
    });
  } catch (error) {
    console.error('Error getting audit trail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit trail',
      error: error.message
    });
  }
};

// Get quality control statistics
export const getQualityControlStatistics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;

    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const [
      totalTests,
      passedTests,
      failedTests,
      pendingTests,
      quarantinedUnits
    ] = await Promise.all([
      QualityControl.countDocuments({ createdAt: { $gte: startDate } }),
      QualityControl.countDocuments({
        createdAt: { $gte: startDate },
        overallStatus: 'passed'
      }),
      QualityControl.countDocuments({
        createdAt: { $gte: startDate },
        overallStatus: 'failed'
      }),
      QualityControl.countDocuments({
        createdAt: { $gte: startDate },
        overallStatus: 'pending'
      }),
      QualityControl.countDocuments({
        createdAt: { $gte: startDate },
        overallStatus: 'quarantine'
      })
    ]);

    const passRate = totalTests > 0
      ? Math.round((passedTests / totalTests) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        timeframe,
        totalTests,
        passedTests,
        failedTests,
        pendingTests,
        quarantinedUnits,
        passRate
      }
    });
  } catch (error) {
    console.error('Error getting quality control statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};
