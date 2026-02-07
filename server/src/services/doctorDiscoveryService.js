import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { createGeoQuery, getCoordinatesFromPincode, calculateTimeSlots } from '../utils/geoUtils.js';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis.js';

class DoctorDiscoveryService {
  /**
   * Find doctors near a given location within a radius
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} radiusInKm 
   * @param {Object} filters 
   * @returns {Promise<Array>}
   */
  async findNearbyDoctors(latitude, longitude, radiusInKm = 5, filters = {}) {
    try {
      // Create cache key
      const cacheKey = `doctors:nearby:${latitude}:${longitude}:${radiusInKm}:${JSON.stringify(filters)}`;
      
      // Try to get from cache
      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }

      // Build query
      const query = {
        ...createGeoQuery(latitude, longitude, radiusInKm),
        status: 'active',
        isVerified: true
      };

      // Apply filters
      if (filters.specialization) {
        query.specialization = filters.specialization;
      }
      if (filters.languages) {
        query.languages = { $in: filters.languages };
      }
      if (filters.consultationType) {
        query[`consultationFees.${filters.consultationType}`] = { $exists: true };
      }
      if (filters.experience) {
        query.experience = { $gte: filters.experience };
      }
      if (filters.rating) {
        query['rating.average'] = { $gte: filters.rating };
      }

      // Execute query with aggregation pipeline
      const doctors = await Doctor.aggregate([
        { $match: query },
        {
          $addFields: {
            distance: {
              $divide: [
                { 
                  $multiply: [
                    { 
                      $sqrt: {
                        $add: [
                          { 
                            $pow: [
                              { $subtract: ['$practiceLocations.location.coordinates.0', longitude] },
                              2
                            ]
                          },
                          {
                            $pow: [
                              { $subtract: ['$practiceLocations.location.coordinates.1', latitude] },
                              2
                            ]
                          }
                        ]
                      }
                    },
                    111.12 // Convert degrees to kilometers
                  ]
                },
                1
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'appointments',
            let: { doctorId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$doctorId', '$$doctorId'] },
                      { $eq: ['$status', 'scheduled'] },
                      { $gte: ['$dateTime', new Date()] }
                    ]
                  }
                }
              },
              { $limit: 5 }
            ],
            as: 'upcomingAppointments'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            specialization: 1,
            experience: 1,
            qualifications: 1,
            languages: 1,
            consultationFees: 1,
            rating: 1,
            profilePicture: 1,
            practiceLocations: {
              $filter: {
                input: '$practiceLocations',
                as: 'location',
                cond: { $eq: ['$$location.isActive', true] }
              }
            },
            distance: 1,
            nextAvailable: {
              $arrayElemAt: ['$upcomingAppointments.dateTime', 0]
            }
          }
        },
        { $sort: { distance: 1 } }
      ]);

      // Cache results for 5 minutes
      await redisClient.setex(cacheKey, 300, JSON.stringify(doctors));

      return doctors;
    } catch (error) {
      console.error('Error finding nearby doctors:', error);
      throw error;
    }
  }

  /**
   * Find doctors by pincode
   * @param {string} pincode 
   * @param {Object} filters 
   * @returns {Promise<Array>}
   */
  async findDoctorsByPincode(pincode, filters = {}) {
    try {
      // Get coordinates for pincode
      const { latitude, longitude } = await getCoordinatesFromPincode(pincode);
      
      // Use the nearby doctors search with the pincode coordinates
      return this.findNearbyDoctors(latitude, longitude, 5, filters);
    } catch (error) {
      console.error('Error finding doctors by pincode:', error);
      throw error;
    }
  }

  /**
   * Get available slots for a doctor on a specific date
   * @param {string} doctorId 
   * @param {string} locationId 
   * @param {Date} date 
   * @returns {Promise<Array>}
   */
  async getAvailableSlots(doctorId, locationId, date) {
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      const practiceLocation = doctor.practiceLocations.id(locationId);
      if (!practiceLocation) {
        throw new Error('Practice location not found');
      }

      const dayOfWeek = date.toLocaleLowerCase('en-US', { weekday: 'long' });
      const workingHours = practiceLocation.workingHours.find(wh => wh.day === dayOfWeek);
      
      if (!workingHours || !workingHours.isWorking) {
        return [];
      }

      // Generate all possible slots
      const slots = calculateTimeSlots(
        workingHours.startTime,
        workingHours.endTime,
        workingHours.slotDuration,
        workingHours.breakTime
      );

      // Get booked appointments for the day
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const bookedAppointments = await mongoose.model('Appointment').find({
        doctorId: doctorId,
        locationId: locationId,
        dateTime: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['scheduled', 'in-progress'] }
      });

      // Mark slots as unavailable if booked
      return slots.map(slot => {
        const slotStart = new Date(`${date.toISOString().split('T')[0]}T${slot.start}`);
        const slotEnd = new Date(`${date.toISOString().split('T')[0]}T${slot.end}`);

        const isBooked = bookedAppointments.some(apt => {
          const aptTime = new Date(apt.dateTime);
          return aptTime >= slotStart && aptTime < slotEnd;
        });

        return {
          ...slot,
          isAvailable: !isBooked
        };
      });
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Get doctor's complete profile with practice locations
   * @param {string} doctorId 
   * @returns {Promise<Object>}
   */
  async getDoctorProfile(doctorId) {
    try {
      const cacheKey = `doctor:profile:${doctorId}`;
      
      // Try to get from cache
      const cachedProfile = await redisClient.get(cacheKey);
      if (cachedProfile) {
        return JSON.parse(cachedProfile);
      }

      const doctor = await Doctor.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(doctorId) } },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'doctorId',
            as: 'reviews'
          }
        },
        {
          $lookup: {
            from: 'appointments',
            let: { doctorId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$doctorId', '$$doctorId'] },
                      { $eq: ['$status', 'completed'] }
                    ]
                  }
                }
              },
              { $count: 'total' }
            ],
            as: 'appointmentCount'
          }
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            name: 1,
            specialization: 1,
            qualifications: 1,
            experience: 1,
            languages: 1,
            about: 1,
            profilePicture: 1,
            practiceLocations: {
              $filter: {
                input: '$practiceLocations',
                as: 'location',
                cond: { $eq: ['$$location.isActive', true] }
              }
            },
            rating: 1,
            reviews: {
              $slice: ['$reviews', 5]
            },
            totalAppointments: {
              $arrayElemAt: ['$appointmentCount.total', 0]
            }
          }
        }
      ]);

      if (!doctor.length) {
        throw new Error('Doctor not found');
      }

      const doctorProfile = doctor[0];

      // Get consultation fees from User model using userId
      let consultationFees = { online: 0, inPerson: 0 };
      try {
        const user = await User.findById(doctorProfile.userId).select('consultationFees languages bio');
        if (user) {
          consultationFees = user.consultationFees || { online: 0, inPerson: 0 };
          // Also get additional fields from User model
          if (user.languages && user.languages.length > 0) {
            doctorProfile.languages = user.languages;
          }
          if (user.bio) {
            doctorProfile.bio = user.bio;
          }
        }
      } catch (userError) {
        console.warn('Could not fetch user data for consultation fees:', userError);
      }

      // Merge consultation fees into the profile
      const profile = {
        ...doctorProfile,
        consultationFees
      };

      // Cache profile for 1 hour
      await redisClient.setex(cacheKey, 3600, JSON.stringify(profile));

      return profile;
    } catch (error) {
      console.error('Error getting doctor profile:', error);
      throw error;
    }
  }

  /**
   * Get doctor with consultation fees directly from User model
   * @param {string} doctorId 
   * @returns {Promise<Object>}
   */
  async getDoctorWithFees(doctorId) {
    try {
      // Get doctor directly from User model where role is 'doctor'
      const doctor = await User.findOne({ 
        _id: doctorId, 
        role: 'doctor' 
      }).select('-password -emailVerificationToken -emailVerificationExpires -twoFactorSecret -backupCodes -mfaSecret');

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // Transform the data to match expected format
      const profile = {
        _id: doctor._id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        experience: doctor.experience || doctor.yearsOfExperience || 0,
        languages: doctor.languages || ['English'],
        bio: doctor.bio,
        profilePicture: doctor.profileImage,
        consultationFees: doctor.consultationFees || { online: 0, inPerson: 0 },
        location: {
          address: doctor.location?.address || doctor.hospital || 'Address not available',
          lat: doctor.location?.lat || 0,
          lng: doctor.location?.lng || 0,
          pincode: doctor.location?.pincode || '000000'
        },
        hospital: doctor.hospital,
        department: doctor.department,
        emergencyAvailable: doctor.emergencyAvailable || false,
        specialties: doctor.specialties || [doctor.specialization || 'General Medicine'],
        licenseNumber: doctor.licenseNumber,
        address: doctor.address,
        profileComplete: doctor.profileComplete,
        isActive: doctor.isActive,
        ratings: doctor.ratings || { average: 4.5, count: 0 }
      };

      return profile;
    } catch (error) {
      console.error('Error getting doctor with fees:', error);
      throw error;
    }
  }
}

export default new DoctorDiscoveryService(); 