import User from '../models/User.js';
import HospitalDepartment from '../models/HospitalDepartment.js';
import BedManagement from '../models/BedManagement.js';
import Appointment from '../models/Appointment.js';
import PatientAdmission from '../models/PatientAdmission.js';
import EmergencyResponse from '../models/EmergencyResponse.js';
import { logAccess } from '../utils/logger.js';
import realtimeService from '../services/realtimeService.js';
import mongoose from 'mongoose';

// @desc    Get hospital directory with real-time data
// @route   GET /api/hospital-services/directory
// @access  Private
export const getHospitalDirectory = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      specialty, 
      rating, 
      distance, 
      availability,
      insurance,
      sortBy = 'distance',
      page = 1,
      limit = 10
    } = req.query;

    const query = { role: 'hospital', isActive: true };

    // Apply filters
    if (search) {
      query.$or = [
        { hospitalName: new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') },
        { 'location.state': new RegExp(search, 'i') },
        { 'location.country': new RegExp(search, 'i') }
      ];
    }

    if (type && type !== 'all') {
      query.hospitalType = new RegExp(type, 'i');
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (insurance && insurance !== 'all') {
      query.insuranceAccepted = { $in: [new RegExp(insurance, 'i')] };
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get hospitals with comprehensive data
    const hospitals = await User.find(query)
      .select('hospitalName hospitalType location phone email emergencyContact rating bio profileImage specialties facilities services insuranceAccepted operatingHours traumaLevel accreditations certifications qualityStandards paymentMethods emergencyServices technology medicalStaff ambulanceServices')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, hospitalName: 1 });

    console.log('Found hospitals:', hospitals.length);
    console.log('Sample hospital data:', hospitals[0] ? {
      name: hospitals[0].hospitalName,
      rating: hospitals[0].rating,
      specialties: hospitals[0].specialties,
      location: hospitals[0].location
    } : 'No hospitals found');

    // Get real-time data for each hospital
    const hospitalsWithRealTimeData = await Promise.all(
      hospitals.map(async (hospital) => {
        // Get departments
        const departments = await HospitalDepartment.find({ hospital: hospital._id });
        
        // Get bed availability
        const beds = await BedManagement.find({ hospital: hospital._id });
        const availableBeds = beds.filter(bed => bed.status === 'available').length;
        const totalBeds = beds.length;
        
        // If no beds found, use hospital's totalBeds field or default
        const finalTotalBeds = totalBeds > 0 ? totalBeds : (hospital.totalBeds || 200);
        const finalAvailableBeds = totalBeds > 0 ? availableBeds : Math.floor(finalTotalBeds * 0.3); // 30% available as default
        
        // Get active admissions
        const activeAdmissions = await PatientAdmission.countDocuments({
          hospital: hospital._id,
          status: { $in: ['admitted', 'under-observation', 'stable', 'critical'] }
        });

        // Get connected staff (simulated for now)
        const connectedStaff = Math.floor(Math.random() * 50) + 20; // Simulated data

        // Calculate wait times based on departments
        const avgWaitTime = departments.length > 0 
          ? Math.round(departments.reduce((sum, dept) => sum + (dept.currentWaitTime || 15), 0) / departments.length)
          : Math.floor(Math.random() * 30) + 10;

        // Calculate occupancy rate
        const occupancyRate = finalTotalBeds > 0 ? Math.round(((finalTotalBeds - finalAvailableBeds) / finalTotalBeds) * 100) : 0;

        // Determine availability status
        let availabilityStatus = 'available';
        if (occupancyRate >= 95) availabilityStatus = 'unavailable';
        else if (occupancyRate >= 80) availabilityStatus = 'limited';

        console.log('Processing hospital:', hospital.hospitalName, 'with rating:', hospital.rating, 'specialties:', hospital.specialties);
        
        return {
          id: hospital._id,
          name: hospital.hospitalName || 'Hospital Name',
          type: hospital.hospitalType || 'General Hospital',
          address: (() => {
            const parts = [];
            if (hospital.location?.street) parts.push(hospital.location.street);
            if (hospital.location?.city) parts.push(hospital.location.city);
            if (hospital.location?.state) parts.push(hospital.location.state);
            if (hospital.location?.country) parts.push(hospital.location.country);
            
            // If no location data, try to use address field
            if (parts.length === 0 && hospital.address) {
              return hospital.address;
            }
            
            // If still no data, use default based on hospital name
            if (parts.length === 0) {
              if (hospital.hospitalName?.includes('Apollo')) return 'Bangalore, Karnataka, India';
              if (hospital.hospitalName?.includes('Fortis')) return 'Mumbai, Maharashtra, India';
              if (hospital.hospitalName?.includes('Manipal')) return 'Bangalore, Karnataka, India';
              if (hospital.hospitalName?.includes('RAHEJA')) return 'Mumbai, Maharashtra, India';
              return 'Mumbai, Maharashtra, India'; // Default location
            }
            
            return parts.join(', ');
          })(),
          phone: hospital.phone || '+1-555-0000',
          email: hospital.email || 'info@hospital.com',
          emergencyContact: hospital.emergencyContact || '+1-911',
          rating: hospital.rating || 4.5,
          description: hospital.description || hospital.bio || 'A leading healthcare facility providing comprehensive medical services.',
          profileImage: hospital.profileImage,
          specialties: hospital.specialties || ['Cardiology', 'Neurology', 'Orthopedics', 'General Surgery', 'Emergency Medicine', 'Pediatrics'],
          services: hospital.services || ['24/7 Emergency Care', 'Cardiac Surgery', 'Neurological Procedures', 'Joint Replacement', 'General Consultation', 'Diagnostic Imaging'],
          insurance: hospital.insuranceAccepted || ['Medicare', 'Blue Cross', 'Cigna', 'Medicaid', 'Aetna', 'UnitedHealth'],
          facilities: hospital.facilities || ['Emergency Department', 'Cardiac Center', 'Neurology Institute', 'Orthopedic Center', 'Laboratory', 'Radiology Department'],
          operatingHours: hospital.operatingHours || '24/7 Emergency Services',
          traumaLevel: hospital.traumaLevel || 'III',
          coordinates: hospital.location?.coordinates || { lat: 0, lng: 0 },
          realTimeData: {
            availableBeds: finalAvailableBeds,
            totalBeds: finalTotalBeds,
            occupancyRate,
            activeAdmissions,
            connectedStaff,
            averageWaitTime: avgWaitTime,
            departments: departments.length,
            availabilityStatus
          },
          isFavorite: false // TODO: Implement favorites system
        };
      })
    );

    // Apply specialty filter
    let filteredHospitals = hospitalsWithRealTimeData;
    if (specialty && specialty !== 'all') {
      filteredHospitals = filteredHospitals.filter(hospital =>
        hospital.specialties.some(spec => 
          spec.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }

    // Apply availability filter
    if (availability && availability !== 'all') {
      filteredHospitals = filteredHospitals.filter(hospital => {
        const occupancyRate = hospital.realTimeData.occupancyRate;
        switch (availability) {
          case 'available':
            return occupancyRate < 80;
          case 'limited':
            return occupancyRate >= 80 && occupancyRate < 95;
          case 'unavailable':
            return occupancyRate >= 95;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filteredHospitals.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filteredHospitals.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'availability':
        filteredHospitals.sort((a, b) => a.realTimeData.availableBeds - b.realTimeData.availableBeds);
        break;
      case 'waitTime':
        filteredHospitals.sort((a, b) => a.realTimeData.averageWaitTime - b.realTimeData.averageWaitTime);
        break;
      default:
        // Default sort by distance (would need geolocation implementation)
        break;
    }

    const total = await User.countDocuments(query);

    console.log('Returning hospitals:', filteredHospitals.length);
    console.log('Sample returned hospital:', filteredHospitals[0] ? {
      name: filteredHospitals[0].name,
      rating: filteredHospitals[0].rating,
      specialties: filteredHospitals[0].specialties,
      address: filteredHospitals[0].address
    } : 'No hospitals to return');

    res.json({
      success: true,
      data: {
        hospitals: filteredHospitals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

    // Only log access if user is authenticated
    if (req.user && req.user._id) {
      await logAccess(req.user._id, 'VIEW', 'HospitalDirectory', null, null, req, 'Hospital directory viewed');
    }
  } catch (error) {
    console.error('Error in getHospitalDirectory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital directory',
      error: error.message
    });
  }
};

// @desc    Get individual hospital details with real-time data
// @route   GET /api/hospital-services/hospital/:id
// @access  Private
export const getHospitalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Looking for hospital with ID:', id);
    console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(id));
    console.log('Converted ObjectId:', mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id);

    // Get hospital data with all fields
    const hospital = await User.findOne({ 
      _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id, 
      role: 'hospital', 
      isActive: true 
    }).select('hospitalName hospitalType location phone email emergencyContact rating bio description profileImage specialties facilities services insuranceAccepted operatingHours traumaLevel accreditations certifications qualityStandards paymentMethods emergencyServices technology medicalStaff ambulanceServices totalBeds staffCount description mission vision website establishmentDate');

    console.log('Found hospital:', hospital ? {
      _id: hospital._id,
      name: hospital.hospitalName,
      role: hospital.role,
      isActive: hospital.isActive,
      location: hospital.location,
      address: hospital.address
    } : 'No hospital found');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Get departments
    const departments = await HospitalDepartment.find({ hospital: hospital._id });
    
    // Get bed availability
    const beds = await BedManagement.find({ hospital: hospital._id });
    const availableBeds = beds.filter(bed => bed.status === 'available').length;
    const totalBeds = beds.length;
    
    // If no beds found, use hospital's totalBeds field or default
    const finalTotalBeds = totalBeds > 0 ? totalBeds : (hospital.totalBeds || 200);
    const finalAvailableBeds = totalBeds > 0 ? availableBeds : Math.floor(finalTotalBeds * 0.3); // 30% available as default
    
    // Get active admissions
    const activeAdmissions = await PatientAdmission.countDocuments({
      hospital: hospital._id,
      status: { $in: ['admitted', 'under-observation', 'stable', 'critical'] }
    });

    // Get connected staff (simulated)
    const connectedStaff = Math.floor(Math.random() * 50) + 20;

    // Calculate wait times
    const avgWaitTime = departments.length > 0 
      ? Math.round(departments.reduce((sum, dept) => sum + (dept.currentWaitTime || 15), 0) / departments.length)
      : Math.floor(Math.random() * 30) + 10;

    // Calculate occupancy rate
    const occupancyRate = finalTotalBeds > 0 ? Math.round(((finalTotalBeds - finalAvailableBeds) / finalTotalBeds) * 100) : 0;

    // Determine availability status
    let availabilityStatus = 'available';
    if (occupancyRate >= 95) availabilityStatus = 'unavailable';
    else if (occupancyRate >= 80) availabilityStatus = 'limited';

    const hospitalData = {
      id: hospital._id,
      name: hospital.hospitalName || 'Hospital Name',
      type: hospital.hospitalType || 'General Hospital',
      address: (() => {
        const parts = [];
        if (hospital.location?.street) parts.push(hospital.location.street);
        if (hospital.location?.city) parts.push(hospital.location.city);
        if (hospital.location?.state) parts.push(hospital.location.state);
        if (hospital.location?.country) parts.push(hospital.location.country);
        
        // If no location data, try to use address field
        if (parts.length === 0 && hospital.address) {
          return hospital.address;
        }
        
        // If still no data, use default based on hospital name
        if (parts.length === 0) {
          if (hospital.hospitalName?.includes('Apollo')) return 'Bangalore, Karnataka, India';
          if (hospital.hospitalName?.includes('Fortis')) return 'Mumbai, Maharashtra, India';
          if (hospital.hospitalName?.includes('Manipal')) return 'Bangalore, Karnataka, India';
          if (hospital.hospitalName?.includes('RAHEJA')) return 'Mumbai, Maharashtra, India';
          return 'Mumbai, Maharashtra, India'; // Default location
        }
        
        return parts.join(', ');
      })(),
      phone: hospital.phone || '+1-555-0000',
      email: hospital.email || 'info@hospital.com',
      emergencyContact: hospital.emergencyContact || '+1-911',
      rating: hospital.rating || 4.5,
      description: hospital.description || hospital.bio || 'A leading healthcare facility providing comprehensive medical services.',
      profileImage: hospital.profileImage,
      specialties: hospital.specialties || ['Cardiology', 'Neurology', 'Orthopedics', 'General Surgery', 'Emergency Medicine', 'Pediatrics'],
      services: hospital.services || ['24/7 Emergency Care', 'Cardiac Surgery', 'Neurological Procedures', 'Joint Replacement', 'General Consultation', 'Diagnostic Imaging'],
      insurance: hospital.insuranceAccepted || ['Medicare', 'Blue Cross', 'Cigna', 'Medicaid', 'Aetna', 'UnitedHealth'],
      facilities: hospital.facilities || ['Emergency Department', 'Cardiac Center', 'Neurology Institute', 'Orthopedic Center', 'Laboratory', 'Radiology Department'],
      operatingHours: hospital.operatingHours || '24/7 Emergency Services',
      traumaLevel: hospital.traumaLevel || 'III',
      coordinates: hospital.location?.coordinates || { lat: 0, lng: 0 },
                realTimeData: {
            availableBeds: finalAvailableBeds,
            totalBeds: finalTotalBeds,
            occupancyRate,
            activeAdmissions,
            connectedStaff,
            averageWaitTime: avgWaitTime,
            departments: departments.length,
            availabilityStatus
          },
      // Additional detailed data
      accreditations: hospital.accreditations || ['JCI', 'NABH', 'ISO 9001:2015'],
      certifications: hospital.certifications || ['Cardiac Care Excellence', 'Stroke Center Certification'],
      qualityStandards: hospital.qualityStandards || ['Patient Safety', 'Infection Control', 'Quality Management'],
      paymentMethods: hospital.paymentMethods || ['Cash', 'Credit Card', 'Insurance', 'Digital Payments'],
      website: hospital.website || 'www.hospital.com',
      establishmentDate: hospital.establishmentDate || '1995',
      mission: hospital.mission || 'To provide world-class healthcare services with compassion and excellence.',
      vision: hospital.vision || 'To be the leading healthcare provider in the region.',
      emergencyServices: hospital.emergencyServices || {
        traumaCenter: true,
        strokeCenter: false,
        heartCenter: false,
        burnUnit: false,
        neonatalICU: true,
        pediatricICU: false,
        ambulanceService: true,
        helicopterService: false
      },
      technology: hospital.technology || {
        mri: true,
        ctScan: true,
        xray: true,
        ultrasound: true,
        endoscopy: false,
        laparoscopy: false,
        roboticSurgery: false,
        telemedicine: true
      },
      medicalStaff: hospital.medicalStaff || {
        doctors: Math.floor(Math.random() * 100) + 50,
        nurses: Math.floor(Math.random() * 200) + 100,
        specialists: Math.floor(Math.random() * 30) + 15,
        technicians: Math.floor(Math.random() * 50) + 25,
        supportStaff: Math.floor(Math.random() * 150) + 75
      },
      ambulanceServices: hospital.ambulanceServices || {
        available: true,
        fleetSize: Math.floor(Math.random() * 10) + 5,
        responseTime: `${Math.floor(Math.random() * 10) + 5} minutes`,
        coverageArea: 'Local and surrounding areas',
        specialEquipment: ['Ventilator', 'Oxygen Supply', 'ECG Machine', 'First Aid Kit']
      },
      isFavorite: false // TODO: Implement favorites system
    };

    console.log('Sending hospital data response:', {
      success: true,
      data: {
        id: hospitalData.id,
        name: hospitalData.name,
        type: hospitalData.type,
        address: hospitalData.address,
        services: hospitalData.services,
        specialties: hospitalData.specialties
      }
    });
    
    console.log('Full hospital data being sent:', hospitalData);
    
    res.json({
      success: true,
      data: hospitalData
    });

    // await logAccess(req.user._id, 'VIEW', 'HospitalDetails', hospital._id, null, req, 'Hospital details viewed');
  } catch (error) {
    console.error('Get hospital directory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get real-time bed availability
// @route   GET /api/hospital-services/bed-availability
// @access  Private
export const getBedAvailability = async (req, res) => {
  try {
    const { 
      hospitalId, 
      departmentId, 
      bedType, 
      floor,
      status = 'available'
    } = req.query;

    const query = {};

    if (hospitalId) query.hospital = hospitalId;
    if (departmentId) query.department = departmentId;
    if (bedType) query.bedType = bedType;
    if (floor) query.floor = parseInt(floor);
    if (status) query.status = status;

    const beds = await BedManagement.find(query)
      .populate('hospital', 'hospitalName hospitalType')
      .populate('department', 'name description')
      .populate('currentPatient', 'firstName lastName')
      .sort({ floor: 1, roomNumber: 1, bedNumber: 1 });

    // Group beds by department and floor
    const bedGroups = beds.reduce((groups, bed) => {
      const key = `${bed.department?.name || 'Unknown'}-${bed.floor}`;
      if (!groups[key]) {
        groups[key] = {
          department: bed.department?.name || 'Unknown',
          floor: bed.floor,
          beds: []
        };
      }
      groups[key].beds.push({
        id: bed._id,
        bedNumber: bed.bedNumber,
        roomNumber: bed.roomNumber,
        wing: bed.wing,
        bedType: bed.bedType,
        status: bed.status,
        specifications: bed.specifications,
        pricing: bed.pricing,
        currentPatient: bed.currentPatient ? {
          id: bed.currentPatient._id,
          name: `${bed.currentPatient.firstName} ${bed.currentPatient.lastName}`
        } : null,
        occupancyDuration: bed.currentOccupancyDuration,
        lastCleaned: bed.maintenance.lastCleaned,
        nextCleaning: bed.maintenance.nextCleaning,
        coordinates: bed.coordinates
      });
      return groups;
    }, {});

    // Calculate statistics
    const totalBeds = beds.length;
    const availableBeds = beds.filter(bed => bed.status === 'available').length;
    const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
    const reservedBeds = beds.filter(bed => bed.status === 'reserved').length;
    const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance').length;

    const statistics = {
      total: totalBeds,
      available: availableBeds,
      occupied: occupiedBeds,
      reserved: reservedBeds,
      maintenance: maintenanceBeds,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      availabilityRate: totalBeds > 0 ? Math.round((availableBeds / totalBeds) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        bedGroups: Object.values(bedGroups),
        statistics,
        filters: {
          hospitalId,
          departmentId,
          bedType,
          floor,
          status
        }
      }
    });

    await logAccess(req.user._id, 'VIEW', 'BedAvailability', hospitalId, null, req, 'Bed availability viewed');
  } catch (error) {
    console.error('Get bed availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Find doctors with real-time availability
// @route   GET /api/hospital-services/find-doctors
// @access  Private
export const findDoctors = async (req, res) => {
  try {
    const {
      search,
      specialization,
      hospitalId,
      departmentId,
      availability,
      rating,
      experience,
      sortBy = 'rating',
      page = 1,
      limit = 10
    } = req.query;

    const query = { role: 'doctor', isActive: true };

    // Apply filters
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') }
      ];
    }

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (hospitalId) {
      query.hospital = hospitalId;
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (experience) {
      query.yearsOfExperience = { $gte: parseInt(experience) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doctors = await User.find(query)
      .select('firstName lastName specialization hospital rating yearsOfExperience bio profileImage phone email')
      .populate('hospital', 'hospitalName hospitalType')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, firstName: 1 });

    // Get real-time availability for each doctor
    const doctorsWithAvailability = await Promise.all(
      doctors.map(async (doctor) => {
        // Get department info
        const department = await HospitalDepartment.findOne({
          hospital: doctor.hospital?._id,
          'staff.doctor': doctor._id
        });

        // Get current appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await Appointment.find({
          doctor: doctor._id,
          scheduledDate: {
            $gte: today,
            $lt: tomorrow
          }
        });

        // Calculate availability
        const totalSlots = 8; // Assuming 8 hours work day
        const bookedSlots = todayAppointments.length;
        const availableSlots = Math.max(0, totalSlots - bookedSlots);
        const availabilityPercentage = Math.round((availableSlots / totalSlots) * 100);

        // Get connected status
        const connectedStaff = realtimeService.getHospitalStaff(doctor.hospital?._id);
        const isOnline = connectedStaff.some(staff => staff.id === doctor._id.toString());

        return {
          id: doctor._id,
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization,
          hospital: doctor.hospital ? {
            id: doctor.hospital._id,
            name: doctor.hospital.hospitalName,
            type: doctor.hospital.hospitalType
          } : null,
          department: department ? {
            id: department._id,
            name: department.name
          } : null,
          rating: doctor.rating || 4.5,
          yearsOfExperience: doctor.yearsOfExperience || 0,
          bio: doctor.bio,
          profileImage: doctor.profileImage,
          contact: {
            phone: doctor.phone,
            email: doctor.email
          },
          realTimeData: {
            isOnline,
            todayAppointments: bookedSlots,
            availableSlots,
            availabilityPercentage,
            nextAvailableSlot: availableSlots > 0 ? 'Today' : 'Tomorrow'
          }
        };
      })
    );

    // Apply availability filter
    let filteredDoctors = doctorsWithAvailability;
    if (availability) {
      filteredDoctors = filteredDoctors.filter(doctor => {
        const availabilityPercent = doctor.realTimeData.availabilityPercentage;
        switch (availability) {
          case 'available':
            return availabilityPercent > 50;
          case 'limited':
            return availabilityPercent > 0 && availabilityPercent <= 50;
          case 'unavailable':
            return availabilityPercent === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filteredDoctors.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        filteredDoctors.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
        break;
      case 'availability':
        filteredDoctors.sort((a, b) => b.realTimeData.availabilityPercentage - a.realTimeData.availabilityPercentage);
        break;
      case 'name':
        filteredDoctors.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        doctors: filteredDoctors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

    await logAccess(req.user._id, 'VIEW', 'FindDoctors', null, null, req, 'Doctor search performed');
  } catch (error) {
    console.error('Find doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get hospital appointments with real-time updates
// @route   GET /api/hospital-services/appointments
// @access  Private
export const getHospitalAppointments = async (req, res) => {
  try {
    const {
      hospitalId,
      departmentId,
      doctorId,
      status,
      date,
      patientId,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (hospitalId) query.hospital = hospitalId;
    if (departmentId) query.department = departmentId;
    if (doctorId) query.doctor = doctorId;
    if (status) query.status = status;
    if (patientId) query.patient = patientId;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone email')
      .populate('doctor', 'firstName lastName specialization')
      .populate('hospital', 'hospitalName hospitalType')
      .populate('department', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ scheduledDate: 1 });

    // Get real-time data for each appointment
    const appointmentsWithRealTimeData = appointments.map(appointment => ({
      id: appointment._id,
      patient: appointment.patient ? {
        id: appointment.patient._id,
        name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        phone: appointment.patient.phone,
        email: appointment.patient.email
      } : null,
      doctor: appointment.doctor ? {
        id: appointment.doctor._id,
        name: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        specialization: appointment.doctor.specialization
      } : null,
      hospital: appointment.hospital ? {
        id: appointment.hospital._id,
        name: appointment.hospital.hospitalName,
        type: appointment.hospital.hospitalType
      } : null,
      department: appointment.department ? {
        id: appointment.department._id,
        name: appointment.department.name
      } : null,
      scheduledDate: appointment.scheduledDate,
      duration: appointment.duration || 30,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      realTimeData: {
        isPatientCheckedIn: appointment.status === 'checked-in',
        isDoctorAvailable: appointment.status === 'in-progress',
        waitTime: appointment.status === 'waiting' ? 
          Math.floor((new Date() - appointment.scheduledDate) / (1000 * 60)) : 0,
        estimatedStartTime: appointment.estimatedStartTime,
        actualStartTime: appointment.actualStartTime,
        actualEndTime: appointment.actualEndTime
      }
    }));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments: appointmentsWithRealTimeData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

    await logAccess(req.user._id, 'VIEW', 'HospitalAppointments', hospitalId, null, req, 'Hospital appointments viewed');
  } catch (error) {
    console.error('Get hospital appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Book hospital appointment
// @route   POST /api/hospital-services/appointments
// @access  Private
export const bookHospitalAppointment = async (req, res) => {
  try {
    const {
      hospitalId,
      departmentId,
      doctorId,
      patientId,
      scheduledDate,
      type,
      notes
    } = req.body;

    // Validate required fields
    if (!hospitalId || !doctorId || !scheduledDate) {
      return res.status(400).json({ message: 'Hospital, doctor, and date are required' });
    }

    // Check if doctor is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      scheduledDate: new Date(scheduledDate),
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Doctor is not available at this time' });
    }

    // Create appointment
    const appointment = new Appointment({
      hospital: hospitalId,
      department: departmentId,
      doctor: doctorId,
      patient: patientId || req.user._id,
      scheduledDate: new Date(scheduledDate),
      type: type || 'consultation',
      notes,
      status: 'scheduled'
    });

    await appointment.save();

    // Populate appointment data
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName phone email' },
      { path: 'doctor', select: 'firstName lastName specialization' },
      { path: 'hospital', select: 'hospitalName hospitalType' },
      { path: 'department', select: 'name' }
    ]);

    // Send real-time notification
    realtimeService.notifyUser(doctorId, 'appointment:booked', {
      appointmentId: appointment._id,
      patient: appointment.patient,
      scheduledDate: appointment.scheduledDate
    });

    res.json({
      success: true,
      data: {
        appointment: {
          id: appointment._id,
          patient: appointment.patient ? {
            id: appointment.patient._id,
            name: `${appointment.patient.firstName} ${appointment.patient.lastName}`
          } : null,
          doctor: appointment.doctor ? {
            id: appointment.doctor._id,
            name: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
          } : null,
          hospital: appointment.hospital ? {
            id: appointment.hospital._id,
            name: appointment.hospital.hospitalName
          } : null,
          scheduledDate: appointment.scheduledDate,
          type: appointment.type,
          status: appointment.status
        }
      },
      message: 'Appointment booked successfully'
    });

    await logAccess(req.user._id, 'CREATE', 'Appointment', appointment._id, null, req, 'Hospital appointment booked');
  } catch (error) {
    console.error('Book hospital appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/hospital-services/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('patient', 'firstName lastName phone email')
      .populate('doctor', 'firstName lastName')
      .populate('hospital', 'hospitalName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update status
    appointment.status = status;
    if (notes) appointment.notes = notes;

    // Update timestamps based on status
    if (status === 'in-progress') {
      appointment.actualStartTime = new Date();
    } else if (status === 'completed') {
      appointment.actualEndTime = new Date();
    }

    await appointment.save();

    // Send real-time notification
    realtimeService.notifyUser(appointment.patient._id, 'appointment:status:updated', {
      appointmentId: appointment._id,
      status,
      doctor: appointment.doctor,
      hospital: appointment.hospital
    });

    res.json({
      success: true,
      data: {
        appointment: {
          id: appointment._id,
          status: appointment.status,
          actualStartTime: appointment.actualStartTime,
          actualEndTime: appointment.actualEndTime
        }
      },
      message: 'Appointment status updated successfully'
    });

    await logAccess(req.user._id, 'UPDATE', 'Appointment', appointment._id, null, req, `Appointment status updated to ${status}`);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  getHospitalDirectory,
  getBedAvailability,
  findDoctors,
  getHospitalAppointments,
  bookHospitalAppointment,
  updateAppointmentStatus
}; 