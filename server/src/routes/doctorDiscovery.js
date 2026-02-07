import express from 'express';
import doctorDiscoveryService from '../services/doctorDiscoveryService.js';
import { auth } from '../middleware/auth.js';
import { validateLocation, validatePincode } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route GET /api/doctors/nearby
 * @desc Find doctors near a location within 5km radius
 * @access Private
 */
router.get('/nearby', auth, validateLocation, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const filters = {
      specialization: req.query.specialization,
      languages: req.query.languages ? req.query.languages.split(',') : undefined,
      consultationType: req.query.consultationType
    };

    const doctors = await doctorDiscoveryService.findNearbyDoctors(
      parseFloat(latitude),
      parseFloat(longitude),
      5, // 5km radius
      filters
    );

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error finding nearby doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby doctors',
      error: error.message
    });
  }
});

/**
 * @route GET /api/doctors/by-pincode/:pincode
 * @desc Find doctors by pincode
 * @access Private
 */
router.get('/by-pincode/:pincode', auth, validatePincode, async (req, res) => {
  try {
    const { pincode } = req.params;
    const filters = {
      specialization: req.query.specialization,
      languages: req.query.languages ? req.query.languages.split(',') : undefined,
      consultationType: req.query.consultationType
    };

    const doctors = await doctorDiscoveryService.findDoctorsByPincode(pincode, filters);

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error finding doctors by pincode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find doctors by pincode',
      error: error.message
    });
  }
});

/**
 * @route GET /api/doctors/:doctorId/slots
 * @desc Get available slots for a doctor at a specific location and date
 * @access Private
 */
router.get('/:doctorId/slots', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { locationId, date } = req.query;

    if (!locationId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Location ID and date are required'
      });
    }

    const slots = await doctorDiscoveryService.getAvailableSlots(
      doctorId,
      locationId,
      new Date(date)
    );

    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
});

/**
 * @route GET /api/doctors/:doctorId/profile
 * @desc Get doctor's complete profile
 * @access Private
 */
router.get('/:doctorId/profile', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const profile = await doctorDiscoveryService.getDoctorProfile(doctorId);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor profile',
      error: error.message
    });
  }
});

/**
 * @route GET /api/doctors/:doctorId/with-fees
 * @desc Get doctor with consultation fees directly from User model
 * @access Private
 */
router.get('/:doctorId/with-fees', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const profile = await doctorDiscoveryService.getDoctorWithFees(doctorId);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting doctor with fees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor with fees',
      error: error.message
    });
  }
});

export default router; 