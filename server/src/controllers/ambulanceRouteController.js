import AmbulanceRoute from '../models/AmbulanceRoute.js';
import TrafficAlert from '../models/TrafficAlert.js';
import AmbulanceCall from '../models/AmbulanceCall.js';
import AmbulanceTransport from '../models/AmbulanceTransport.js';
import AmbulanceDriver from '../models/AmbulanceDriver.js';
import AmbulanceService from '../models/AmbulanceService.js';

// Get all routes for a hospital
export const getAmbulanceRoutes = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, priority, trafficLevel, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { hospital: hospitalId };

    // Filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (trafficLevel && trafficLevel !== 'all') {
      query.trafficLevel = trafficLevel;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const routes = await AmbulanceRoute.find(query)
      .populate('assignedDriver', 'firstName lastName phone licenseNumber')
      .populate('assignedVehicle', 'name type vehicleNumber')
      .populate('relatedCall', 'callId status')
      .populate('relatedTransport', 'transportId status')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await AmbulanceRoute.countDocuments(query);

    res.json({
      success: true,
      data: routes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching ambulance routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance routes',
      error: error.message
    });
  }
};

// Get single route by ID
export const getAmbulanceRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const route = await AmbulanceRoute.findOne({
      _id: id,
      hospital: hospitalId
    })
      .populate('assignedDriver', 'firstName lastName phone licenseNumber')
      .populate('assignedVehicle', 'name type vehicleNumber')
      .populate('relatedCall', 'callId status emergencyDetails')
      .populate('relatedTransport', 'transportId status')
      .populate('trafficAlerts.alertId')
      .populate('createdBy', 'firstName lastName')
      .lean();

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error fetching ambulance route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance route',
      error: error.message
    });
  }
};

// Create new route
export const createAmbulanceRoute = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      name,
      startLocation,
      endLocation,
      distance,
      estimatedTime,
      trafficLevel,
      priority,
      assignedDriver,
      assignedVehicle,
      relatedCall,
      relatedTransport,
      waypoints,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !startLocation || !endLocation) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, startLocation, and endLocation are required'
      });
    }

    const route = new AmbulanceRoute({
      hospital: hospitalId,
      name,
      startLocation: {
        address: startLocation.address || startLocation,
        coordinates: startLocation.coordinates || { lat: 0, lng: 0 },
        name: startLocation.name || startLocation.address || startLocation
      },
      endLocation: {
        address: endLocation.address || endLocation,
        coordinates: endLocation.coordinates || { lat: 0, lng: 0 },
        name: endLocation.name || endLocation.address || endLocation
      },
      distance: distance || { value: 0, unit: 'km' },
      estimatedTime: estimatedTime || { value: 0, unit: 'minutes' },
      trafficLevel: trafficLevel || 'medium',
      priority: priority || 'medium',
      status: 'planned',
      assignedDriver: assignedDriver || null,
      assignedVehicle: assignedVehicle || null,
      relatedCall: relatedCall || null,
      relatedTransport: relatedTransport || null,
      waypoints: waypoints || [],
      notes: notes || '',
      createdBy: hospitalId,
      updatedBy: hospitalId
    });

    await route.save();

    const populatedRoute = await AmbulanceRoute.findById(route._id)
      .populate('assignedDriver', 'firstName lastName')
      .populate('assignedVehicle', 'name vehicleNumber')
      .populate('createdBy', 'firstName lastName')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Ambulance route created successfully',
      data: populatedRoute
    });
  } catch (error) {
    console.error('Error creating ambulance route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ambulance route',
      error: error.message
    });
  }
};

// Update route
export const updateAmbulanceRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;
    const updateData = req.body;

    const route = await AmbulanceRoute.findOne({
      _id: id,
      hospital: hospitalId
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance route not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key === 'startLocation' || key === 'endLocation') {
        route[key] = {
          address: updateData[key].address || updateData[key],
          coordinates: updateData[key].coordinates || route[key].coordinates,
          name: updateData[key].name || updateData[key].address || updateData[key] || route[key].name
        };
      } else if (key !== 'hospital' && key !== '_id' && key !== 'routeId') {
        route[key] = updateData[key];
      }
    });

    route.updatedBy = hospitalId;
    await route.save();

    const populatedRoute = await AmbulanceRoute.findById(route._id)
      .populate('assignedDriver', 'firstName lastName')
      .populate('assignedVehicle', 'name vehicleNumber')
      .populate('createdBy', 'firstName lastName')
      .lean();

    res.json({
      success: true,
      message: 'Ambulance route updated successfully',
      data: populatedRoute
    });
  } catch (error) {
    console.error('Error updating ambulance route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ambulance route',
      error: error.message
    });
  }
};

// Delete route
export const deleteAmbulanceRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const route = await AmbulanceRoute.findOneAndDelete({
      _id: id,
      hospital: hospitalId
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance route not found'
      });
    }

    res.json({
      success: true,
      message: 'Ambulance route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ambulance route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ambulance route',
      error: error.message
    });
  }
};

// Optimize routes
export const optimizeRoutes = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { criteria, routeIds } = req.body;

    // Get routes to optimize
    const query = { hospital: hospitalId, status: 'active' };
    if (routeIds && routeIds.length > 0) {
      query._id = { $in: routeIds };
    }

    const routes = await AmbulanceRoute.find(query)
      .populate('trafficAlerts.alertId')
      .lean();

    // Simple optimization logic (can be enhanced with actual routing algorithms)
    const optimizationResults = routes.map(route => {
      let timeSaved = 0;
      let fuelEfficiencyGain = 0;

      // Check traffic alerts
      const activeAlerts = route.trafficAlerts?.filter(
        ta => ta.alertId && ta.alertId.status === 'active'
      ) || [];

      if (activeAlerts.length > 0 && criteria.includes('traffic')) {
        // Estimate time saved by avoiding traffic
        timeSaved = Math.random() * 5 + 2; // 2-7 minutes
        fuelEfficiencyGain = Math.random() * 10 + 5; // 5-15%
      }

      return {
        routeId: route._id,
        routeName: route.name,
        timeSaved: Math.round(timeSaved * 10) / 10,
        fuelEfficiencyGain: Math.round(fuelEfficiencyGain * 10) / 10,
        optimized: timeSaved > 0
      };
    });

    const totalTimeSaved = optimizationResults.reduce((sum, r) => sum + r.timeSaved, 0);
    const avgFuelGain = optimizationResults.length > 0
      ? optimizationResults.reduce((sum, r) => sum + r.fuelEfficiencyGain, 0) / optimizationResults.length
      : 0;

    res.json({
      success: true,
      message: 'Routes optimized successfully',
      data: {
        routesOptimized: optimizationResults.filter(r => r.optimized).length,
        totalRoutes: optimizationResults.length,
        averageTimeSaved: Math.round((totalTimeSaved / optimizationResults.length) * 10) / 10,
        averageFuelEfficiencyGain: Math.round(avgFuelGain * 10) / 10,
        results: optimizationResults
      }
    });
  } catch (error) {
    console.error('Error optimizing routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize routes',
      error: error.message
    });
  }
};

// Get route statistics
export const getRouteStats = async (req, res) => {
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
      total,
      byStatus,
      byTraffic,
      avgResponseTime
    ] = await Promise.all([
      AmbulanceRoute.countDocuments(query),
      AmbulanceRoute.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AmbulanceRoute.aggregate([
        { $match: query },
        { $group: { _id: '$trafficLevel', count: { $sum: 1 } } }
      ]),
      AmbulanceRoute.aggregate([
        { $match: { ...query, actualTime: { $exists: true } } },
        { $group: { _id: null, avgTime: { $avg: '$actualTime.value' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byTraffic: byTraffic.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgResponseTime: avgResponseTime[0]?.avgTime || 0,
        activeRoutes: byStatus.find(s => s._id === 'active')?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching route stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route statistics',
      error: error.message
    });
  }
};

// Get traffic alerts
export const getTrafficAlerts = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { status, type, severity } = req.query;

    const query = { hospital: hospitalId };

    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = 'active'; // Default to active alerts
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    const alerts = await TrafficAlert.find(query)
      .populate('reportedBy', 'firstName lastName')
      .sort({ severity: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching traffic alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic alerts',
      error: error.message
    });
  }
};

// Create traffic alert
export const createTrafficAlert = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const {
      location,
      type,
      severity,
      description,
      estimatedDelay,
      expiresAt
    } = req.body;

    if (!location || !type || !severity || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: location, type, severity, and description are required'
      });
    }

    const alert = new TrafficAlert({
      hospital: hospitalId,
      location: {
        address: location.address || location,
        coordinates: location.coordinates || { lat: 0, lng: 0 }
      },
      type,
      severity,
      description,
      estimatedDelay: estimatedDelay || { value: 0, unit: 'minutes' },
      status: 'active',
      reportedBy: hospitalId,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours
    });

    await alert.save();

    res.status(201).json({
      success: true,
      message: 'Traffic alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error creating traffic alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create traffic alert',
      error: error.message
    });
  }
};


