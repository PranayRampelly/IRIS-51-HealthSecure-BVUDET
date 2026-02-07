import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import BloodDonor from '../models/BloodDonor.js';

// Get request summary statistics
export const getRequestSummary = async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      processingRequests,
      completedRequests,
      todayRequests,
      urgentRequests
    ] = await Promise.all([
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ 'status.current': 'pending' }),
      BloodRequest.countDocuments({ 'status.current': 'processing' }),
      BloodRequest.countDocuments({ 'status.current': 'delivered' }),
      BloodRequest.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      BloodRequest.countDocuments({
        'urgency.level': { $in: ['urgent', 'emergency', 'critical'] },
        'status.current': { $in: ['pending', 'approved', 'processing'] }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalRequests,
        pending: pendingRequests,
        processing: processingRequests,
        completed: completedRequests,
        today: todayRequests,
        urgent: urgentRequests
      }
    });
  } catch (error) {
    console.error('Error getting request summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get request summary',
      error: error.message
    });
  }
};

// Get all blood requests with filtering and pagination
export const getBloodRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      urgency = '',
      bloodType = '',
      hospitalId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};

    if (search) {
      filter.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { 'hospital.name': { $regex: search, $options: 'i' } },
        { 'patient.name': { $regex: search, $options: 'i' } },
        { 'requestDetails.reason': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter['status.current'] = status;
    }

    if (urgency) {
      filter['urgency.level'] = urgency;
    }

    if (bloodType) {
      filter['bloodRequirements.bloodType'] = bloodType;
    }

    if (hospitalId) {
      filter['hospital.hospitalId'] = hospitalId;
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('hospital', 'name city state')
        .populate('patient', 'name bloodType'),
      BloodRequest.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting blood requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blood requests',
      error: error.message
    });
  }
};

// Get specific blood request by ID
export const getBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BloodRequest.findOne({ requestId })
      .populate('hospital', 'name city state')
      .populate('patient', 'name bloodType');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error getting blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blood request',
      error: error.message
    });
  }
};

// Create new blood request
export const createBloodRequest = async (req, res) => {
  try {
    const requestData = req.body;

    // Generate unique request ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    requestData.requestId = `REQ-${timestamp}-${random}`;

    // Set default values
    requestData.status = {
      current: 'pending',
      updatedAt: new Date(),
      updatedBy: req.user?.id || 'system',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        updatedBy: req.user?.id || 'system',
        notes: 'Request created'
      }]
    };

    requestData.audit = {
      createdBy: req.user?.id || 'system',
      lastModified: new Date()
    };

    const newRequest = new BloodRequest(requestData);
    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: newRequest
    });
  } catch (error) {
    console.error('Error creating blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blood request',
      error: error.message
    });
  }
};

// Update blood request
export const updateBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updateData = req.body;

    const request = await BloodRequest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Update status history if status changed
    if (updateData.status?.current && updateData.status.current !== request.status.current) {
      updateData.status.statusHistory = [
        ...request.status.statusHistory,
        {
          status: updateData.status.current,
          timestamp: new Date(),
          updatedBy: req.user?.id || 'system',
          notes: updateData.status.notes || ''
        }
      ];
      updateData.status.updatedAt = new Date();
      updateData.status.updatedBy = req.user?.id || 'system';
    }

    updateData.audit = {
      ...request.audit,
      lastModified: new Date()
    };

    const updatedRequest = await BloodRequest.findOneAndUpdate(
      { requestId },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Blood request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood request',
      error: error.message
    });
  }
};

// Delete blood request
export const deleteBloodRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BloodRequest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check if request can be deleted
    if (['processing', 'ready', 'dispatched'].includes(request.status.current)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete request that is being processed'
      });
    }

    await BloodRequest.findOneAndDelete({ requestId });

    res.json({
      success: true,
      message: 'Blood request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blood request',
      error: error.message
    });
  }
};

// Get urgent requests
export const getUrgentRequests = async (req, res) => {
  try {
    const urgentRequests = await BloodRequest.getUrgentRequests()
      .populate('hospital', 'name city state')
      .populate('patient', 'name bloodType')
      .limit(20);

    res.json({
      success: true,
      data: urgentRequests
    });
  } catch (error) {
    console.error('Error getting urgent requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get urgent requests',
      error: error.message
    });
  }
};

// Get requests by blood type
export const getRequestsByBloodType = async (req, res) => {
  try {
    const { bloodType, status } = req.query;

    if (!bloodType) {
      return res.status(400).json({
        success: false,
        message: 'Blood type is required'
      });
    }

    const requests = await BloodRequest.getRequestsByBloodType(bloodType, status)
      .populate('hospital', 'name city state')
      .populate('patient', 'name bloodType');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error getting requests by blood type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests by blood type',
      error: error.message
    });
  }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const request = await BloodRequest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['approved', 'rejected'],
      'approved': ['processing', 'cancelled'],
      'processing': ['ready', 'cancelled'],
      'ready': ['dispatched', 'cancelled'],
      'dispatched': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': [],
      'rejected': []
    };

    if (!validTransitions[request.status.current].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${request.status.current} to ${status}`
      });
    }

    const updateData = {
      'status.current': status,
      'status.updatedAt': new Date(),
      'status.updatedBy': req.user?.id || 'system',
      'status.notes': notes || ''
    };

    // Add to status history
    updateData['status.statusHistory'] = [
      ...request.status.statusHistory,
      {
        status,
        timestamp: new Date(),
        updatedBy: req.user?.id || 'system',
        notes: notes || ''
      }
    ];

    const updatedRequest = await BloodRequest.findOneAndUpdate(
      { requestId },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status',
      error: error.message
    });
  }
};

// Allocate blood units to request
export const allocateBloodUnits = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { bloodUnitIds, notes } = req.body;

    const request = await BloodRequest.findOne({ requestId });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (request.status.current !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Request must be approved before allocating units'
      });
    }

    // Verify blood units exist and are available
    const bloodUnits = await BloodInventory.find({
      unitId: { $in: bloodUnitIds },
      status: 'available'
    });

    if (bloodUnits.length !== bloodUnitIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some blood units are not available'
      });
    }

    // Check blood type compatibility
    const incompatibleUnits = bloodUnits.filter(
      unit => unit.bloodType !== request.bloodRequirements.bloodType
    );

    if (incompatibleUnits.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some blood units are not compatible with the requested blood type'
      });
    }

    // Allocate units
    const allocatedUnits = bloodUnits.map(unit => ({
      bloodUnitId: unit.unitId,
      bloodType: unit.bloodType,
      componentType: unit.componentType,
      allocatedAt: new Date(),
      allocatedBy: req.user?.id || 'system'
    }));

    const updateData = {
      'inventory.allocatedUnits': allocatedUnits,
      'inventory.totalAllocated': allocatedUnits.length,
      'inventory.allocationNotes': notes || '',
      'status.current': 'processing',
      'status.updatedAt': new Date(),
      'status.updatedBy': req.user?.id || 'system'
    };

    // Add to status history
    updateData['status.statusHistory'] = [
      ...request.status.statusHistory,
      {
        status: 'processing',
        timestamp: new Date(),
        updatedBy: req.user?.id || 'system',
        notes: `Blood units allocated: ${allocatedUnits.length} units`
      }
    ];

    const updatedRequest = await BloodRequest.findOneAndUpdate(
      { requestId },
      updateData,
      { new: true, runValidators: true }
    );

    // Update blood unit status to reserved
    await BloodInventory.updateMany(
      { unitId: { $in: bloodUnitIds } },
      {
        status: 'reserved',
        'reservation.requestId': requestId,
        'reservation.reservedAt': new Date(),
        'reservation.reservedBy': req.user?.id || 'system'
      }
    );

    res.json({
      success: true,
      message: 'Blood units allocated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error allocating blood units:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to allocate blood units',
      error: error.message
    });
  }
};

// Get request analytics
export const getRequestAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month', hospitalId } = req.query;

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

    const matchStage = {
      createdAt: { $gte: startDate }
    };

    if (hospitalId) {
      matchStage['hospital.hospitalId'] = hospitalId;
    }

    const [
      statusDistribution,
      urgencyDistribution,
      bloodTypeDistribution,
      hospitalStats,
      trendData
    ] = await Promise.all([
      // Status distribution
      BloodRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status.current',
            count: { $sum: 1 }
          }
        }
      ]),

      // Urgency distribution
      BloodRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$urgency.level',
            count: { $sum: 1 }
          }
        }
      ]),

      // Blood type distribution
      BloodRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$bloodRequirements.bloodType',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$bloodRequirements.quantity' }
          }
        }
      ]),

      // Hospital statistics
      BloodRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$hospital.hospitalId',
            hospitalName: { $first: '$hospital.name' },
            requestCount: { $sum: 1 },
            totalQuantity: { $sum: '$bloodRequirements.quantity' },
            avgProcessingTime: { $avg: { $subtract: ['$status.updatedAt', '$createdAt'] } }
          }
        },
        { $sort: { requestCount: -1 } },
        { $limit: 10 }
      ]),

      // Trend data
      BloodRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution,
        urgencyDistribution,
        bloodTypeDistribution,
        hospitalStats,
        trendData,
        timeframe
      }
    });
  } catch (error) {
    console.error('Error getting request analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get request analytics',
      error: error.message
    });
  }
};

// Export requests
export const exportRequests = async (req, res) => {
  try {
    const { format = 'json', status, urgency, bloodType, startDate, endDate } = req.query;

    const filter = {};

    if (status) filter['status.current'] = status;
    if (urgency) filter['urgency.level'] = urgency;
    if (bloodType) filter['bloodRequirements.bloodType'] = bloodType;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const requests = await BloodRequest.find(filter)
      .populate('hospital', 'name city state')
      .populate('patient', 'name bloodType')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = requests.map(request => ({
        'Request ID': request.requestId,
        'Hospital': request.hospital.name,
        'Patient': request.patient.name,
        'Blood Type': request.bloodRequirements.bloodType,
        'Quantity': request.bloodRequirements.quantity,
        'Urgency': request.urgency.level,
        'Status': request.status.current,
        'Created Date': request.createdAt.toISOString().split('T')[0],
        'Required By': request.urgency.requiredBy.toISOString().split('T')[0]
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=blood-requests.csv');

      // Simple CSV conversion
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json({
        success: true,
        data: requests
      });
    }
  } catch (error) {
    console.error('Error exporting requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export requests',
      error: error.message
    });
  }
};

// Fulfill blood request
export const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (request.status.current !== 'dispatched') {
      return res.status(400).json({
        success: false,
        message: 'Request must be dispatched before it can be fulfilled'
      });
    }

    const updateData = {
      'status.current': 'delivered',
      'status.updatedAt': new Date(),
      'status.updatedBy': req.user?.id || 'system',
      'status.notes': notes || 'Request fulfilled'
    };

    updateData['status.statusHistory'] = [
      ...request.status.statusHistory,
      {
        status: 'delivered',
        timestamp: new Date(),
        updatedBy: req.user?.id || 'system',
        notes: notes || 'Request fulfilled'
      }
    ];

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Request fulfilled successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error fulfilling request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fulfill request',
      error: error.message
    });
  }
};

// Upload request document
export const uploadRequestDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }

    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
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

    request.documents = request.documents || [];
    request.documents.push(document);
    await request.save();

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

// Get overdue requests
export const getOverdueRequests = async (req, res) => {
  try {
    const now = new Date();

    const overdueRequests = await BloodRequest.find({
      'urgency.requiredBy': { $lt: now },
      'status.current': { $in: ['pending', 'approved', 'processing'] }
    })
      .populate('hospital', 'name city state')
      .populate('patient', 'name bloodType')
      .sort({ 'urgency.requiredBy': 1 })
      .limit(50);

    res.json({
      success: true,
      data: overdueRequests,
      count: overdueRequests.length
    });
  } catch (error) {
    console.error('Error getting overdue requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overdue requests',
      error: error.message
    });
  }
};

// Add note to request
export const addRequestNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    const newNote = {
      content: note,
      addedBy: req.user?.id || 'system',
      addedAt: new Date()
    };

    request.notes = request.notes || [];
    request.notes.push(newNote);
    await request.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: newNote
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

// Get request timeline
export const getRequestTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    const timeline = request.status.statusHistory.map(entry => ({
      status: entry.status,
      timestamp: entry.timestamp,
      updatedBy: entry.updatedBy,
      notes: entry.notes
    }));

    res.json({
      success: true,
      data: {
        requestId: request._id,
        timeline
      }
    });
  } catch (error) {
    console.error('Error getting request timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get request timeline',
      error: error.message
    });
  }
};

// Get request statistics
export const getRequestStatistics = async (req, res) => {
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
      totalRequests,
      completedRequests,
      pendingRequests,
      urgentRequests,
      overdueRequests,
      avgProcessingTime
    ] = await Promise.all([
      BloodRequest.countDocuments({ createdAt: { $gte: startDate } }),
      BloodRequest.countDocuments({
        createdAt: { $gte: startDate },
        'status.current': 'delivered'
      }),
      BloodRequest.countDocuments({
        createdAt: { $gte: startDate },
        'status.current': { $in: ['pending', 'approved', 'processing'] }
      }),
      BloodRequest.countDocuments({
        createdAt: { $gte: startDate },
        'urgency.level': { $in: ['urgent', 'emergency', 'critical'] }
      }),
      BloodRequest.countDocuments({
        'urgency.requiredBy': { $lt: new Date() },
        'status.current': { $in: ['pending', 'approved', 'processing'] }
      }),
      BloodRequest.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            'status.current': 'delivered'
          }
        },
        {
          $project: {
            processingTime: { $subtract: ['$status.updatedAt', '$createdAt'] }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$processingTime' }
          }
        }
      ])
    ]);

    const avgTimeInHours = avgProcessingTime.length > 0
      ? Math.round(avgProcessingTime[0].avgTime / (1000 * 60 * 60))
      : 0;

    res.json({
      success: true,
      data: {
        timeframe,
        totalRequests,
        completedRequests,
        pendingRequests,
        urgentRequests,
        overdueRequests,
        avgProcessingTimeHours: avgTimeInHours,
        completionRate: totalRequests > 0
          ? Math.round((completedRequests / totalRequests) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error getting request statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get request statistics',
      error: error.message
    });
  }
};
