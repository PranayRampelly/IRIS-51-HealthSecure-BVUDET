import AmbulanceCall from '../models/AmbulanceCall.js';
import DispatchOperator from '../models/DispatchOperator.js';
import User from '../models/User.js';
import AmbulanceDriver from '../models/AmbulanceDriver.js';
import AmbulanceService from '../models/AmbulanceService.js';

// Get all dispatch calls (uses AmbulanceCall model)
export const getDispatchCalls = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, priority, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    // Map dispatch statuses to call statuses
    const statusMap = {
      'incoming': 'pending',
      'processing': 'pending',
      'dispatched': 'dispatched',
      'en-route': 'en-route',
      'arrived': 'arrived',
      'completed': 'completed'
    };

    if (status && status !== 'all') {
      query.status = statusMap[status] || status;
    }

    if (priority && priority !== 'all') {
      query['emergencyDetails.priority'] = priority;
    }

    if (type && type !== 'all') {
      query['emergencyDetails.type'] = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const calls = await AmbulanceCall.find(query)
      .populate('dispatch.ambulanceService', 'name type vehicleNumber')
      .populate('dispatch.driver', 'firstName lastName phone licenseNumber')
      .populate('medicalTeam.paramedic', 'firstName lastName')
      .populate('medicalTeam.nurse', 'firstName lastName')
      .populate('medicalTeam.doctor', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await AmbulanceCall.countDocuments(query);

    // Transform to dispatch call format
    const dispatchCalls = calls.map(call => ({
      id: call._id,
      callNumber: call.callId,
      callerName: call.caller?.name || 'Unknown',
      callerPhone: call.caller?.phone || '',
      emergencyType: call.emergencyDetails?.type || 'medical',
      severity: call.emergencyDetails?.estimatedSeverity || 'moderate',
      location: call.caller?.location?.address || call.destination?.address || '',
      coordinates: call.caller?.location?.coordinates || call.destination?.coordinates || { lat: 0, lng: 0 },
      status: call.status === 'pending' ? 'incoming' : 
              call.status === 'dispatched' ? 'dispatched' :
              call.status === 'en-route' ? 'en-route' :
              call.status === 'arrived' ? 'arrived' :
              call.status === 'completed' ? 'completed' : 'processing',
      priority: call.emergencyDetails?.priority || 'medium',
      assignedDriver: call.dispatch?.driver ? 
        `${call.dispatch.driver.firstName} ${call.dispatch.driver.lastName}` : undefined,
      assignedVehicle: call.dispatch?.ambulanceService?.vehicleNumber || call.dispatch?.ambulanceService?.name,
      callTime: call.createdAt,
      dispatchTime: call.timeline?.dispatchedAt,
      estimatedArrival: call.dispatch?.estimatedArrival,
      notes: call.notes || call.emergencyDetails?.description || '',
      symptoms: Array.isArray(call.emergencyDetails?.symptoms) 
        ? call.emergencyDetails.symptoms 
        : (call.emergencyDetails?.symptoms ? [call.emergencyDetails.symptoms] : []),
      dispatchNotes: call.dispatch?.notes || []
    }));

    res.json({
      success: true,
      data: dispatchCalls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching dispatch calls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispatch calls',
      error: error.message
    });
  }
};

// Get dispatch operators
export const getDispatchOperators = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status } = req.query;

    const query = { hospital: hospitalId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const operators = await DispatchOperator.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('currentCall', 'callId status')
      .sort({ status: 1, callsHandled: -1 })
      .lean();

    // Transform to frontend format
    const transformedOperators = operators.map(op => ({
      id: op._id,
      operatorId: op.operatorId,
      name: op.name || `${op.user?.firstName || ''} ${op.user?.lastName || ''}`.trim() || 'Unknown',
      status: op.status,
      currentCall: op.currentCall?.callId,
      callsHandled: op.callsHandled || 0,
      averageResponseTime: op.averageResponseTime || 0
    }));

    res.json({
      success: true,
      data: transformedOperators
    });
  } catch (error) {
    console.error('Error fetching dispatch operators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispatch operators',
      error: error.message
    });
  }
};

// Create or update dispatch operator
export const createDispatchOperator = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { userId, name, status, preferences } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if operator already exists
    let operator = await DispatchOperator.findOne({
      hospital: hospitalId,
      user: userId
    });

    if (operator) {
      // Update existing operator
      if (name) operator.name = name;
      if (status) operator.status = status;
      if (preferences) operator.preferences = { ...operator.preferences, ...preferences };
      operator.updatedBy = hospitalId;
      operator.lastActivity = new Date();
    } else {
      // Create new operator
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      operator = new DispatchOperator({
        hospital: hospitalId,
        user: userId,
        name: name || `${user.firstName} ${user.lastName}`,
        status: status || 'offline',
        preferences: preferences || {},
        createdBy: hospitalId,
        updatedBy: hospitalId
      });
    }

    await operator.save();

    const populatedOperator = await DispatchOperator.findById(operator._id)
      .populate('user', 'firstName lastName email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Dispatch operator created/updated successfully',
      data: populatedOperator
    });
  } catch (error) {
    console.error('Error creating dispatch operator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispatch operator',
      error: error.message
    });
  }
};

// Update operator status
export const updateOperatorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const { status, currentCall } = req.body;

    const operator = await DispatchOperator.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch operator not found'
      });
    }

    if (status) operator.status = status;
    if (currentCall !== undefined) operator.currentCall = currentCall || null;
    operator.lastActivity = new Date();
    operator.updatedBy = hospitalId;

    await operator.save();

    const populatedOperator = await DispatchOperator.findById(operator._id)
      .populate('user', 'firstName lastName')
      .populate('currentCall', 'callId status')
      .lean();

    res.json({
      success: true,
      message: 'Operator status updated successfully',
      data: populatedOperator
    });
  } catch (error) {
    console.error('Error updating operator status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update operator status',
      error: error.message
    });
  }
};

// Dispatch ambulance for a call
export const dispatchAmbulance = async (req, res) => {
  try {
    const { callId } = req.params;
    const hospitalId = req.user._id;
    const { driverId, vehicleId, operatorId, estimatedArrival, notes } = req.body;

    const call = await AmbulanceCall.findOne({
      _id: callId,
      hospital: hospitalId
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance call not found'
      });
    }

    // Validate driver and vehicle
    if (driverId) {
      const driver = await AmbulanceDriver.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }
    }

    if (vehicleId) {
      const vehicle = await AmbulanceService.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }
    }

    // Update call dispatch info
    call.dispatch = {
      ambulanceService: vehicleId || call.dispatch?.ambulanceService,
      driver: driverId || call.dispatch?.driver,
      dispatchedAt: new Date(),
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      notes: notes || call.dispatch?.notes || []
    };

    call.status = 'dispatched';
    call.updatedBy = hospitalId;

    // Update timeline
    if (!call.timeline) call.timeline = [];
    call.timeline.push({
      status: 'dispatched',
      timestamp: new Date(),
      updatedBy: hospitalId
    });

    await call.save();

    // Update operator if provided
    if (operatorId) {
      const operator = await DispatchOperator.findOne({
        _id: operatorId,
        hospital: hospitalId
      });
      if (operator) {
        operator.currentCall = call._id;
        operator.status = 'busy';
        operator.callsHandled = (operator.callsHandled || 0) + 1;
        operator.lastActivity = new Date();
        await operator.save();
      }
    }

    const populatedCall = await AmbulanceCall.findById(call._id)
      .populate('dispatch.ambulanceService', 'name type vehicleNumber')
      .populate('dispatch.driver', 'firstName lastName phone')
      .populate('createdBy', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      message: 'Ambulance dispatched successfully',
      data: populatedCall
    });
  } catch (error) {
    console.error('Error dispatching ambulance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispatch ambulance',
      error: error.message
    });
  }
};

// Get dispatch statistics
export const getDispatchStats = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { startDate, endDate } = req.query;

    const query = { hospital: hospitalId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalCalls,
      byStatus,
      byPriority,
      operators,
      avgResponseTime
    ] = await Promise.all([
      AmbulanceCall.countDocuments(query),
      AmbulanceCall.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AmbulanceCall.aggregate([
        { $match: query },
        { $group: { _id: '$emergencyDetails.priority', count: { $sum: 1 } } }
      ]),
      DispatchOperator.find({ hospital: hospitalId }),
      AmbulanceCall.aggregate([
        {
          $match: {
            ...query,
            'timeline.dispatchedAt': { $exists: true },
            'timeline.receivedAt': { $exists: true }
          }
        },
        {
          $project: {
            responseTime: {
              $subtract: [
                { $arrayElemAt: ['$timeline.dispatchedAt', -1] },
                { $arrayElemAt: ['$timeline.receivedAt', 0] }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ])
    ]);

    const incomingCalls = byStatus.find(s => s._id === 'pending')?.count || 0;
    const processingCalls = byStatus.find(s => s._id === 'pending')?.count || 0;
    const dispatchedCalls = (byStatus.find(s => s._id === 'dispatched')?.count || 0) +
                           (byStatus.find(s => s._id === 'en-route')?.count || 0);
    const availableOperators = operators.filter(o => o.status === 'available').length;
    const avgResponseTimeMinutes = avgResponseTime[0]?.avgResponseTime 
      ? Math.round((avgResponseTime[0].avgResponseTime / 1000 / 60) * 10) / 10
      : 0;

    res.json({
      success: true,
      data: {
        totalCalls,
        incomingCalls,
        processingCalls,
        dispatchedCalls,
        availableOperators,
        averageResponseTime: avgResponseTimeMinutes,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching dispatch stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispatch statistics',
      error: error.message
    });
  }
};


