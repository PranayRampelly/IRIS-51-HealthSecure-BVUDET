import BedManagement from '../models/BedManagement.js';
import User from '../models/User.js';
import HospitalDepartment from '../models/HospitalDepartment.js';
import AdmissionRequest from '../models/AdmissionRequest.js';
import { logAccess } from '../utils/logger.js';

// @desc    Get bed availability for patients
// @route   GET /api/patient/bed-availability
// @access  Private (Patient)
export const getBedAvailability = async (req, res) => {
  try {
    const { 
      city, 
      state, 
      bedType, 
      priceRange, 
      rating,
      sortBy = 'rating',
      limit = 50,
      page = 1
    } = req.query;

    // Build query for hospitals
    const hospitalQuery = { 
      role: 'hospital', 
      isActive: true,
      'hospitalProfile.isComplete': true
    };

    if (city) hospitalQuery['location.city'] = new RegExp(city, 'i');
    if (state) hospitalQuery['location.state'] = new RegExp(state, 'i');
    if (rating) hospitalQuery.rating = { $gte: parseFloat(rating) };

    // Get hospitals with available beds
    const hospitals = await User.find(hospitalQuery)
      .select('hospitalName hospitalType location phone rating emergencyContact hospitalProfile')
      .populate({
        path: 'hospitalProfile',
        select: 'specialties facilities services insuranceAccepted website email description'
      })
      .lean();

    // Get bed availability for each hospital
    const hospitalsWithBeds = await Promise.all(
      hospitals.map(async (hospital) => {
        // Build bed query
        const bedQuery = { 
          hospital: hospital._id, 
          status: 'available' 
        };

        if (bedType && bedType !== 'all') {
          bedQuery.bedType = bedType;
        }

        // Get available beds
        const availableBeds = await BedManagement.find(bedQuery)
          .populate('department', 'name')
          .lean();

        // Filter by price range
        let filteredBeds = availableBeds;
        if (priceRange && priceRange !== 'all') {
          filteredBeds = availableBeds.filter(bed => {
            const price = bed.pricing.dailyRate;
            switch (priceRange) {
              case 'low':
                return price < 3000;
              case 'medium':
                return price >= 3000 && price <= 6000;
              case 'high':
                return price > 6000;
              default:
                return true;
            }
          });
        }

        // Calculate bed statistics
        const totalBeds = await BedManagement.countDocuments({ hospital: hospital._id });
        const availableCount = filteredBeds.length;
        const occupancyRate = totalBeds > 0 ? ((totalBeds - availableCount) / totalBeds * 100).toFixed(1) : 0;

        // Group beds by type for display
        const bedsByType = filteredBeds.reduce((acc, bed) => {
          const type = bed.bedTypeDisplay;
          if (!acc[type]) {
            acc[type] = {
              type: type,
              count: 0,
              minPrice: bed.pricing.dailyRate,
              maxPrice: bed.pricing.dailyRate,
              beds: []
            };
          }
          acc[type].count++;
          acc[type].minPrice = Math.min(acc[type].minPrice, bed.pricing.dailyRate);
          acc[type].maxPrice = Math.max(acc[type].maxPrice, bed.pricing.dailyRate);
          acc[type].beds.push(bed);
          return acc;
        }, {});

        return {
          hospitalId: hospital._id,
          hospitalName: hospital.hospitalName,
          hospitalType: hospital.hospitalType,
          location: {
            address: hospital.location.address,
            city: hospital.location.city,
            state: hospital.location.state,
            coordinates: hospital.location.coordinates
          },
          contact: {
            phone: hospital.phone,
            emergencyContact: hospital.emergencyContact,
            email: hospital.hospitalProfile?.email,
            website: hospital.hospitalProfile?.website
          },
          rating: hospital.rating || 0,
          reviews: hospital.reviews || 0,
          description: hospital.hospitalProfile?.description || '',
          specialties: hospital.hospitalProfile?.specialties || [],
          facilities: hospital.hospitalProfile?.facilities || [],
          services: hospital.hospitalProfile?.services || [],
          insuranceAccepted: hospital.hospitalProfile?.insuranceAccepted || [],
          bedAvailability: {
            totalBeds,
            availableBeds: availableCount,
            occupancyRate: parseFloat(occupancyRate),
            bedsByType: Object.values(bedsByType)
          },
          realTimeData: {
            availabilityStatus: availableCount > 0 ? 'Available' : 'Limited',
            lastUpdated: new Date()
          }
        };
      })
    );

    // Filter out hospitals with no available beds
    const hospitalsWithAvailableBeds = hospitalsWithBeds.filter(hospital => 
      hospital.bedAvailability.availableBeds > 0
    );

    // Sort results
    let sortedHospitals = hospitalsWithAvailableBeds;
    switch (sortBy) {
      case 'rating':
        sortedHospitals.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price':
        sortedHospitals.sort((a, b) => {
          const aMinPrice = Math.min(...a.bedAvailability.bedsByType.map(bed => bed.minPrice));
          const bMinPrice = Math.min(...b.bedAvailability.bedsByType.map(bed => bed.minPrice));
          return aMinPrice - bMinPrice;
        });
        break;
      case 'availability':
        sortedHospitals.sort((a, b) => b.bedAvailability.availableBeds - a.bedAvailability.availableBeds);
        break;
      case 'distance':
        // For now, sort by name. In a real app, you'd calculate distance from patient location
        sortedHospitals.sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
        break;
      default:
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHospitals = sortedHospitals.slice(startIndex, endIndex);

    // Log access
    await logAccess(req.user.id, 'bed_availability_search', {
      query: req.query,
      resultsCount: paginatedHospitals.length
    });

    res.json({
      success: true,
      data: {
        hospitals: paginatedHospitals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(sortedHospitals.length / limit),
          totalHospitals: sortedHospitals.length,
          hasNextPage: endIndex < sortedHospitals.length,
          hasPrevPage: startIndex > 0
        },
        filters: {
          city,
          state,
          bedType,
          priceRange,
          rating,
          sortBy
        }
      }
    });

  } catch (error) {
    console.error('Error fetching bed availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bed availability',
      error: error.message
    });
  }
};

// @desc    Get detailed bed information for a specific hospital
// @route   GET /api/patient/bed-availability/hospital/:hospitalId
// @access  Private (Patient)
export const getHospitalBedDetails = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { bedType } = req.query;

    // Get hospital details
    const hospital = await User.findById(hospitalId)
      .select('hospitalName hospitalType location phone rating emergencyContact hospitalProfile')
      .populate({
        path: 'hospitalProfile',
        select: 'specialties facilities services insuranceAccepted website email description'
      })
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Build bed query
    const bedQuery = { 
      hospital: hospitalId,
      status: 'available'
    };

    if (bedType && bedType !== 'all') {
      bedQuery.bedType = bedType;
    }

    // Get available beds with department info
    const availableBeds = await BedManagement.find(bedQuery)
      .populate('department', 'name description')
      .lean();

    // Group beds by department and type
    const bedsByDepartment = availableBeds.reduce((acc, bed) => {
      const deptName = bed.department?.name || 'General';
      if (!acc[deptName]) {
        acc[deptName] = {
          departmentName: deptName,
          departmentDescription: bed.department?.description || '',
          bedTypes: {}
        };
      }

      const bedType = bed.bedTypeDisplay;
      if (!acc[deptName].bedTypes[bedType]) {
        acc[deptName].bedTypes[bedType] = {
          type: bedType,
          count: 0,
          beds: [],
          minPrice: bed.pricing.dailyRate,
          maxPrice: bed.pricing.dailyRate
        };
      }

      acc[deptName].bedTypes[bedType].count++;
      acc[deptName].bedTypes[bedType].minPrice = Math.min(
        acc[deptName].bedTypes[bedType].minPrice, 
        bed.pricing.dailyRate
      );
      acc[deptName].bedTypes[bedType].maxPrice = Math.max(
        acc[deptName].bedTypes[bedType].maxPrice, 
        bed.pricing.dailyRate
      );
      acc[deptName].bedTypes[bedType].beds.push({
        bedId: bed._id,
        bedNumber: bed.bedNumber,
        roomNumber: bed.roomNumber,
        floor: bed.floor,
        wing: bed.wing,
        price: bed.pricing.dailyRate,
        specifications: bed.specifications,
        insuranceAccepted: bed.pricing.insuranceAccepted,
        coordinates: bed.coordinates
      });

      return acc;
    }, {});

    // Calculate overall statistics
    const totalBeds = await BedManagement.countDocuments({ hospital: hospitalId });
    const availableCount = availableBeds.length;
    const occupancyRate = totalBeds > 0 ? ((totalBeds - availableCount) / totalBeds * 100).toFixed(1) : 0;

    // Log access
    await logAccess(req.user.id, 'hospital_bed_details', {
      hospitalId,
      bedType
    });

    res.json({
      success: true,
      data: {
        hospital: {
          hospitalId: hospital._id,
          hospitalName: hospital.hospitalName,
          hospitalType: hospital.hospitalType,
          location: hospital.location,
          contact: {
            phone: hospital.phone,
            emergencyContact: hospital.emergencyContact,
            email: hospital.hospitalProfile?.email,
            website: hospital.hospitalProfile?.website
          },
          rating: hospital.rating || 0,
          reviews: hospital.reviews || 0,
          description: hospital.hospitalProfile?.description || '',
          specialties: hospital.hospitalProfile?.specialties || [],
          facilities: hospital.hospitalProfile?.facilities || [],
          services: hospital.hospitalProfile?.services || [],
          insuranceAccepted: hospital.hospitalProfile?.insuranceAccepted || []
        },
        bedAvailability: {
          totalBeds,
          availableBeds: availableCount,
          occupancyRate: parseFloat(occupancyRate),
          bedsByDepartment: Object.values(bedsByDepartment).map(dept => ({
            ...dept,
            bedTypes: Object.values(dept.bedTypes)
          }))
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching hospital bed details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital bed details',
      error: error.message
    });
  }
};

// @desc    Book a bed for patient
// @route   POST /api/patient/bed-availability/:bedId/book
// @access  Private (Patient)
export const bookBed = async (req, res) => {
  try {
    const { bedId } = req.params;
    const {
      admissionType,
      department,
      primaryDiagnosis,
      expectedStay,
      emergencyContact,
      specialRequirements,
      insuranceProvider,
      policyNumber
    } = req.body;

    // Validate required fields
    if (!admissionType || !department || !primaryDiagnosis || !expectedStay) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: admissionType, department, primaryDiagnosis, expectedStay'
      });
    }

    // Check if bed is available
    const bed = await BedManagement.findById(bedId)
      .populate('hospital', 'hospitalName location phone')
      .populate('department', 'name');

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found'
      });
    }

    if (bed.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Bed is not available for booking'
      });
    }

    // Create admission request
    const admissionRequest = new AdmissionRequest({
      patient: req.user.id,
      hospital: bed.hospital._id,
      bed: bedId,
      admissionType,
      department,
      primaryDiagnosis,
      expectedStay,
      emergencyContact,
      specialRequirements,
      insuranceProvider,
      policyNumber,
      status: 'pending',
      requestedAt: new Date()
    });

    await admissionRequest.save();

    // Reserve the bed
    await bed.reserveBed(req.user.id, `Reserved for admission request ${admissionRequest._id}`);

    // Log access
    await logAccess(req.user.id, 'bed_booking_request', {
      bedId,
      admissionRequestId: admissionRequest._id,
      hospitalId: bed.hospital._id
    });

    res.json({
      success: true,
      message: 'Bed booking request submitted successfully',
      data: {
        admissionRequestId: admissionRequest._id,
        bed: {
          bedId: bed._id,
          bedNumber: bed.bedNumber,
          bedType: bed.bedTypeDisplay,
          roomNumber: bed.roomNumber,
          floor: bed.floor,
          wing: bed.wing,
          price: bed.pricing.dailyRate
        },
        hospital: {
          hospitalId: bed.hospital._id,
          hospitalName: bed.hospital.hospitalName,
          location: bed.hospital.location
        },
        status: 'pending',
        requestedAt: admissionRequest.requestedAt
      }
    });

  } catch (error) {
    console.error('Error booking bed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book bed',
      error: error.message
    });
  }
};

// @desc    Get patient's bed booking requests
// @route   GET /api/patient/bed-availability/bookings
// @access  Private (Patient)
export const getPatientBedBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { patient: req.user.id };
    if (status) query.status = status;

    const admissionRequests = await AdmissionRequest.find(query)
      .populate('hospital', 'hospitalName location phone')
      .populate('bed', 'bedNumber bedType roomNumber floor wing pricing')
      .sort({ requestedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await AdmissionRequest.countDocuments(query);

    // Log access
    await logAccess(req.user.id, 'patient_bed_bookings', {
      status,
      count: admissionRequests.length
    });

    res.json({
      success: true,
      data: {
        bookings: admissionRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching patient bed bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bed bookings',
      error: error.message
    });
  }
};

// @desc    Cancel bed booking request
// @route   PUT /api/patient/bed-availability/bookings/:bookingId/cancel
// @access  Private (Patient)
export const cancelBedBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const admissionRequest = await AdmissionRequest.findById(bookingId)
      .populate('bed');

    if (!admissionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    if (admissionRequest.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking'
      });
    }

    if (admissionRequest.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (admissionRequest.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel confirmed booking. Please contact hospital directly.'
      });
    }

    // Update booking status
    admissionRequest.status = 'cancelled';
    admissionRequest.cancelledAt = new Date();
    await admissionRequest.save();

    // Release the bed if it was reserved
    if (admissionRequest.bed && admissionRequest.bed.status === 'reserved') {
      await admissionRequest.bed.markAvailable(req.user.id);
    }

    // Log access
    await logAccess(req.user.id, 'bed_booking_cancellation', {
      bookingId,
      bedId: admissionRequest.bed?._id
    });

    res.json({
      success: true,
      message: 'Bed booking cancelled successfully',
      data: {
        bookingId: admissionRequest._id,
        status: 'cancelled',
        cancelledAt: admissionRequest.cancelledAt
      }
    });

  } catch (error) {
    console.error('Error cancelling bed booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel bed booking',
      error: error.message
    });
  }
};
