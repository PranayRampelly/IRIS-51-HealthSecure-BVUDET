import AmbulanceService from '../models/AmbulanceService.js';
import AmbulanceBooking from '../models/AmbulanceBooking.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

// Get all available ambulance services
export const getAmbulanceServices = async (req, res) => {
  try {
    const { type, available, search, sortBy = 'rating', sortOrder = 'desc' } = req.query;
    
    let query = { status: 'active' };
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filter by availability
    if (available !== undefined) {
      query.available = available === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { 'driver.name': { $regex: search, $options: 'i' } },
        { baseLocation: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort.rating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'price':
        sort['price.base'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'eta':
        sort.responseTime = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sort.rating = -1;
    }
    
    const services = await AmbulanceService.find(query)
      .sort(sort)
      .select('-__v');
    
    // Calculate stats
    const stats = {
      total: services.length,
      available: services.filter(s => s.available).length,
      avgRating: services.length > 0 
        ? (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)
        : 0
    };
    
    res.json({
      success: true,
      data: services,
      stats
    });
  } catch (error) {
    console.error('Error fetching ambulance services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance services',
      error: error.message
    });
  }
};

// Get ambulance service by ID
export const getAmbulanceServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await AmbulanceService.findById(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance service not found'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching ambulance service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance service',
      error: error.message
    });
  }
};

// Create ambulance booking
export const createAmbulanceBooking = async (req, res) => {
  try {
    const {
      ambulanceServiceId,
      patientDetails,
      addresses,
      emergencyDetails,
      medicalNeeds,
      scheduling,
      options,
      insurance,
      payment
    } = req.body;
    
    // Validate required fields
    if (!ambulanceServiceId || !patientDetails || !addresses || !emergencyDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if ambulance service exists and is available
    const ambulanceService = await AmbulanceService.findById(ambulanceServiceId);
    if (!ambulanceService) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance service not found'
      });
    }

    // Validate user exists and has required fields
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    if (!ambulanceService.available || ambulanceService.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ambulance service is not available'
      });
    }
    
    // Calculate estimated cost
    const estimatedCost = ambulanceService.calculateCost(
      scheduling.estimatedDistance || 5,
      emergencyDetails.urgency,
      medicalNeeds
    );
    
    // Create booking
    const booking = new AmbulanceBooking({
      patient: req.user._id || req.user.id,
      ambulanceService: ambulanceServiceId,
      patientDetails,
      addresses,
      emergencyDetails,
      medicalNeeds,
      scheduling,
      options,
      insurance,
      payment: {
        ...payment,
        estimatedCost
      },
      tracking: {
        estimatedArrival: new Date(Date.now() + (scheduling.estimatedDistance || 5) * 2 * 60000) // 2 minutes per km
      }
    });
    
    await booking.save();
    
    // Populate service details for response
    await booking.populate('ambulanceService', 'name type contact vehicleNumber driver');
    
    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Ambulance Booking Confirmation',
        template: 'ambulance-booking-confirmation',
        context: {
          bookingId: booking.bookingId,
          patientName: patientDetails.name,
          ambulanceService: ambulanceService.name,
          estimatedCost,
          pickupAddress: addresses.pickup,
          dropoffAddress: addresses.dropoff
        }
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Ambulance booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating ambulance booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ambulance booking',
      error: error.message
    });
  }
};

// Get user's ambulance bookings
export const getUserBookings = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { patient: req.user._id || req.user.id };
    
    if (status) {
      query['status.current'] = status;
    }
    
    const bookings = await AmbulanceBooking.find(query)
      .populate('ambulanceService', 'name type contact vehicleNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await AmbulanceBooking.countDocuments(query);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await AmbulanceBooking.findById(id)
      .populate('patient', 'firstName lastName email phone')
      .populate('ambulanceService', 'name type contact vehicleNumber driver');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking or is admin
    if (booking.patient._id.toString() !== (req.user._id || req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    const booking = await AmbulanceBooking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Update status
    await booking.updateStatus(status, note);
    
    // Populate for response
    await booking.populate('patient', 'firstName lastName email phone');
    await booking.populate('ambulanceService', 'name type contact vehicleNumber');
    
    // Send status update notification
    try {
      await sendEmail({
        to: booking.patient.email,
        subject: `Ambulance Booking Status Update - ${status.toUpperCase()}`,
        template: 'ambulance-status-update',
        context: {
          bookingId: booking.bookingId,
          status,
          note
        }
      });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Find booking that belongs to the current user (owner check in query)
    const booking = await AmbulanceBooking.findOne({ _id: id, patient: req.user._id || req.user.id });
    
    if (!booking) {
      // Not found under this user (treat as 404 to avoid leaking existence)
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if booking can be cancelled
    if (['completed', 'cancelled', 'in_transit'].includes(booking.status.current)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled at this stage'
      });
    }
    
    // Cancel booking
    await booking.updateStatus('cancelled', reason || 'Cancelled by patient');
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await AmbulanceBooking.aggregate([
      { $match: { patient: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status.current', 'pending'] }, 1, 0] }
          },
          active: {
            $sum: {
              $cond: [
                { $in: ['$status.current', ['confirmed', 'dispatched', 'en_route', 'arrived']] },
                1,
                0
              ]
            }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status.current', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status.current', 'cancelled'] }, 1, 0] }
          },
          totalSpent: { $sum: '$payment.finalCost' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        pending: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0
      }
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
};

// Calculate estimated cost
export const calculateEstimatedCost = async (req, res) => {
  try {
    const { ambulanceServiceId, distance, urgency, medicalNeeds } = req.body;
    
    const ambulanceService = await AmbulanceService.findById(ambulanceServiceId);
    
    if (!ambulanceService) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance service not found'
      });
    }
    
    const estimatedCost = ambulanceService.calculateCost(distance, urgency, medicalNeeds);
    
    res.json({
      success: true,
      data: {
        estimatedCost,
        breakdown: {
          base: ambulanceService.price.base,
          distance: ambulanceService.price.perKm * distance,
          emergency: urgency === 'critical' ? ambulanceService.price.emergency : 0,
          needs: Object.values(medicalNeeds || {}).filter(Boolean).length * 25 // Rough estimate
        }
      }
    });
  } catch (error) {
    console.error('Error calculating estimated cost:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate estimated cost',
      error: error.message
    });
  }
};
