import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import razorpayService from '../services/razorpayService.js';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import Payment from '../models/Payment.js'; // Added import for Payment model

// Debug: Check if Appointment model has slot checking methods
console.log('🔍 APPOINTMENTS ROUTE - Appointment model slot checking methods:', {
  checkSlotAvailability: typeof Appointment.checkSlotAvailability === 'function',
  findByDoctorAndDate: typeof Appointment.findByDoctorAndDate === 'function',
  modelName: Appointment.modelName
});

const router = express.Router();

// Test route to verify Appointment model with time slot fields
router.get('/test-appointment-slots', async (req, res) => {
  try {
    console.log('🧪 Testing Appointment model with time slot fields...');
    console.log('Appointment modelName:', Appointment.modelName);
    console.log('checkSlotAvailability method:', typeof Appointment.checkSlotAvailability);
    console.log('findByDoctorAndDate method:', typeof Appointment.findByDoctorAndDate);
    
    // Check if the new fields exist in the schema
    const hasStartTime = Appointment.schema.paths.startTime !== undefined;
    const hasEndTime = Appointment.schema.paths.endTime !== undefined;
    
    console.log('✅ Schema field check:', { hasStartTime, hasEndTime });
    
    // Test creating an appointment with time slot fields
    const testAppointment = new Appointment({
      patient: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      hospital: new mongoose.Types.ObjectId(),
      appointmentType: 'consultation',
      department: 'General Medicine',
      scheduledDate: new Date(),
      scheduledTime: '10:00:00',
      startTime: '10:00',
      endTime: '10:30',
      consultationType: 'online',
      createdBy: new mongoose.Types.ObjectId()
    });
    
    console.log('✅ Test appointment object created with time slots:', {
      startTime: testAppointment.startTime,
      endTime: testAppointment.endTime,
      scheduledTime: testAppointment.scheduledTime
    });
    
    // Test the methods
    const testDoctorId = new mongoose.Types.ObjectId();
    const testDate = new Date();
    
    console.log('✅ Testing checkSlotAvailability method...');
    const slotCheck = await Appointment.checkSlotAvailability(
      testDoctorId, 
      testDoctorId, 
      testDate, 
      '10:00', 
      '10:30'
    );
    
    console.log('✅ Testing findByDoctorAndDate method...');
    const dateCheck = await Appointment.findByDoctorAndDate(testDoctorId, testDate);
    
    res.json({
      success: true,
      message: 'Appointment model with time slot fields is working correctly',
      modelName: Appointment.modelName,
      schemaFields: {
        hasStartTime,
        hasEndTime,
        startTimeType: Appointment.schema.paths.startTime?.instance,
        endTimeType: Appointment.schema.paths.endTime?.instance
      },
      methods: {
        checkSlotAvailability: typeof Appointment.checkSlotAvailability,
        findByDoctorAndDate: typeof Appointment.findByDoctorAndDate
      },
      testResults: {
        slotCheck: !!slotCheck,
        dateCheck: Array.isArray(dateCheck),
        testAppointmentCreated: !!testAppointment,
        timeSlotFields: {
          startTime: testAppointment.startTime,
          endTime: testAppointment.endTime
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing Appointment with time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Appointment model with time slots test failed',
      error: error.message
    });
  }
});

// Validation middleware
const validateAppointmentBooking = [
  body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
  body('scheduledDate')
    .exists().withMessage('scheduledDate is required')
    .bail()
    .custom((value) => {
      if (typeof value !== 'string') return false;
      const dashes = /^\d{4}-\d{2}-\d{2}$/;
      const fullIso = /^\d{4}-\d{2}-\d{2}T.*Z?$/;
      return dashes.test(value) || fullIso.test(value) || !isNaN(Date.parse(value));
    })
    .withMessage('Invalid date format. Use YYYY-MM-DD or ISO string'),
  body('scheduledTime')
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('Scheduled time must be HH:mm or HH:mm:ss'),
  body('consultationType').isIn(['online', 'in-person']).withMessage('Invalid consultation type'),
  body('paymentMethod').isIn(['online', 'offline']).withMessage('Invalid payment method')
];

// GET /api/appointments/my (list patient's appointments)
router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization hospital location profileImage experience languages yearsOfExperience')
      .populate('hospital', 'hospitalName firstName lastName address phone email')
      .sort({ scheduledDate: -1 });

    // Attach payment summary for each appointment
    const appointmentIds = appointments.map(a => a._id);
    const payments = await Payment.find({ appointment: { $in: appointmentIds } })
      .select('appointment paymentId razorpayOrderId razorpayPaymentId amount currency status createdAt updatedAt completedAt');
    const paymentsByAppointment = new Map(
      payments.map(p => [p.appointment?.toString(), p])
    );

    const enriched = appointments.map(appt => {
      const obj = appt.toObject();
      const pay = paymentsByAppointment.get(appt._id.toString());
      if (pay) {
        obj.paymentData = {
          orderId: pay.razorpayOrderId || '-',
          paymentId: pay.paymentId || '-',
          razorpayPaymentId: pay.razorpayPaymentId || '-',
          amount: pay.amount,
          currency: pay.currency || 'INR',
          status: pay.status || 'pending',
          paidAt: pay.completedAt || pay.updatedAt || pay.createdAt
        };
      }
      return obj;
    });

    res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/appointments/debug (debug endpoint for appointment statistics)
router.get('/debug', auth, async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments({ patient: req.user._id });
    const pendingAppointments = await Appointment.countDocuments({ 
      patient: req.user._id, 
      status: 'pending' 
    });
    const confirmedAppointments = await Appointment.countDocuments({ 
      patient: req.user._id, 
      status: 'confirmed' 
    });
    const completedAppointments = await Appointment.countDocuments({ 
      patient: req.user._id, 
      status: 'completed' 
    });
    const cancelledAppointments = await Appointment.countDocuments({ 
      patient: req.user._id, 
      status: 'cancelled' 
    });
    const onlineAppointments = await Appointment.countDocuments({ 
      patient: req.user._id, 
      consultationType: 'online' 
    });
    const offlineAppointments = await Appointment.countDocuments({ 
      patient: req.user._id, 
      consultationType: 'in-person' 
    });

    res.json({
      success: true,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      onlineAppointments,
      offlineAppointments,
      message: 'Appointment statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/appointments/:id/video-link (return Jitsi join URL for video consultations)
router.get('/:id/video-link', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only the owning patient or the assigned doctor/hospital can fetch the link
    const isPatient = appointment.patient?.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor?.toString() === req.user._id.toString();
    const isHospital = appointment.hospital?.toString() === req.user._id.toString();
    if (!(isPatient || isDoctor || isHospital)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (appointment.consultationType !== 'online') {
      return res.status(400).json({ success: false, message: 'Not a video consultation' });
    }

    // Ensure we have deterministic Jitsi room details
    const defaultRoomId = `healthsecure-${appointment._id}-public`;
    if (!appointment.videoCallDetails || !appointment.videoCallDetails.roomId) {
      appointment.videoCallDetails = {
        ...(appointment.videoCallDetails || {}),
        platform: appointment.videoCallDetails?.platform || 'Jitsi',
        roomId: defaultRoomId,
      };
      await appointment.save();
    }

    const roomId = appointment.videoCallDetails.roomId || defaultRoomId;
    const videoLink = `https://meet.jit.si/${roomId}`;

    return res.json({
      success: true,
      videoLink,
      data: {
        platform: appointment.videoCallDetails.platform || 'Jitsi',
        roomId,
      }
    });
  } catch (error) {
    console.error('Error generating video link:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/appointments/book (book an appointment with payment integration)
router.post('/book', auth, validateAppointmentBooking, async (req, res) => {
  console.log('🚀 BOOKING ROUTE HIT: /api/appointments/book');
  console.log('🚀 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🚀 User ID:', req.user._id);
  console.log('🔍 Appointment model slot checking methods:', {
    checkSlotAvailability: typeof Appointment.checkSlotAvailability === 'function',
    findByDoctorAndDate: typeof Appointment.findByDoctorAndDate === 'function',
    modelName: Appointment.modelName,
    hasStartTimeField: Appointment.schema.paths.startTime !== undefined,
    hasEndTimeField: Appointment.schema.paths.endTime !== undefined
  });
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Appointment booking validation failed:', {
        body: req.body,
        errors: errors.array()
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      doctorId, 
      scheduledDate, 
      scheduledTime, 
      consultationType, 
      paymentMethod,
      symptoms = [],
      notes = '',
      emergencyContact = {},
      step = 1 // Track which step of the booking process
    } = req.body;

    // Debug: Log the received date data
    console.log('🔍 Backend received appointment booking request:', {
      doctorId,
      scheduledDate,
      scheduledTime,
      consultationType,
      paymentMethod,
      scheduledDateType: typeof scheduledDate,
      scheduledDateValue: scheduledDate,
      consultationTypeType: typeof consultationType,
      consultationTypeValue: consultationType,
      fullBody: req.body
    });

    // Get doctor details
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    // Resolve hospital ObjectId
    let resolvedHospitalId = doctor._id;
    if (doctor.hospital) {
      if (mongoose.Types.ObjectId.isValid(doctor.hospital)) {
        resolvedHospitalId = doctor.hospital;
      } else {
        const hospitalUser = await User.findOne({ role: 'hospital', hospitalName: doctor.hospital });
        if (hospitalUser) {
          resolvedHospitalId = hospitalUser._id;
        }
      }
    }

    // Determine valid department value per schema enum
    const allowedDepartments = new Set(['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'General Medicine', 'Surgery', 'Radiology', 'Laboratory']);
    let resolvedDepartment = 'General Medicine';
    if (doctor.specialization && allowedDepartments.has(doctor.specialization)) {
      resolvedDepartment = doctor.specialization;
    }

    // Calculate fees based on consultation type
    let consultationFee = 0;
    let originalConsultationFee = 0; // Store original fee for display
    let convenienceFee = 0;
    let totalAmount = 0;
    
    if (consultationType === 'online') {
      // Online consultation: Use the amount parameter or doctor's online fee
      originalConsultationFee = Math.round(Number(req.body.amount) || doctor.consultationFees?.online);
      consultationFee = originalConsultationFee;
      convenienceFee = 0;
      totalAmount = consultationFee;
    } else if (consultationType === 'in-person') {
      // In-person consultation: Use the amount parameter (doctor's actual consultation fee)
      // Add validation to ensure amount is valid and not too small
      const amountParam = Number(req.body.amount);
      const isValidAmount = amountParam && amountParam > 10; // Amount should be at least ₹10
      
      if (isValidAmount) {
        originalConsultationFee = Math.round(amountParam);
      } else {
        // Use doctor's actual in-person fee if amount is invalid
        originalConsultationFee = Math.round(doctor.consultationFees?.inPerson);
        console.log(`⚠️ Invalid amount parameter (${req.body.amount}), using doctor's actual fee: ₹${originalConsultationFee}`);
      }
      
      consultationFee = originalConsultationFee; // Show full consultation fee (but not charged)
      convenienceFee = Math.round(originalConsultationFee * 0.05); // 5% convenience fee only
      totalAmount = convenienceFee; // Only charge convenience fee
      
      // Debug logging for convenience fee calculation
      console.log('🔍 Appointment Booking - In-Person Fee Calculation:', {
        amount: req.body.amount,
        amountParam: amountParam,
        isValidAmount: isValidAmount,
        originalConsultationFee,
        consultationFee,
        convenienceFee,
        totalAmount,
        calculation: `${originalConsultationFee} * 0.05 = ${originalConsultationFee * 0.05} = ${convenienceFee}`,
        doctorFees: {
          online: doctor.consultationFees?.online,
          inPerson: doctor.consultationFees?.inPerson
        }
      });
    }

    // Normalize scheduled date to start of day UTC to avoid timezone mismatches
    const scheduledDateObj = new Date(scheduledDate);
    if (!isNaN(scheduledDateObj.getTime())) {
      scheduledDateObj.setUTCHours(0, 0, 0, 0);
    }

    // Debug: Log the date processing
    console.log('🔍 Backend date processing:', {
      originalScheduledDate: scheduledDate,
      scheduledDateObj: scheduledDateObj,
      scheduledDateObjISO: scheduledDateObj.toISOString(),
      scheduledDateObjDate: scheduledDateObj.toDateString(),
      isValid: !isNaN(scheduledDateObj.getTime())
    });

    // Check if slot is still available (allow re-booking if previous is cancelled)
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      scheduledDate: scheduledDateObj,
      scheduledTime,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (existingAppointment) {
      console.info('Blocking booking due to existing appointment at same slot', {
        doctorId,
        scheduledDate: scheduledDateObj,
        scheduledTime,
        existingAppointmentId: existingAppointment._id
      });
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available. Please select another time or choose a different time.'
      });
    }

    // Get doctor's availability to use their actual appointment duration
    const availability = await DoctorAvailability.findOne({ doctorId });
    const doctorAppointmentDuration = availability?.appointmentDuration || 30;
    const finalDuration = req.body.estimatedDuration || doctorAppointmentDuration;
    
    console.log('🔍 Appointment Booking - Duration calculation:', {
      doctorId: doctorId,
      requestedDuration: req.body.estimatedDuration,
      doctorSetting: doctorAppointmentDuration,
      finalDuration: finalDuration,
      availabilityFound: !!availability
    });

    // Additional validation: Check if the time slot is already booked using Appointment model
    try {
      const startTime = scheduledTime;
      const startTimeParts = startTime.split(':');
      const startHour = parseInt(startTimeParts[0]);
      const startMinute = parseInt(startTimeParts[1]);
      
      const endTimeDate = new Date(scheduledDateObj);
      endTimeDate.setHours(startHour, startMinute + finalDuration, 0, 0);
      const endTime = endTimeDate.toTimeString().slice(0, 5);
      
      const existingBookedSlot = await Appointment.checkSlotAvailability(
        doctorId,
        resolvedHospitalId,
        scheduledDateObj,
        startTime,
        endTime
      );
      
      if (existingBookedSlot) {
        console.info('Blocking booking due to existing booked time slot', {
          doctorId,
          hospitalId: resolvedHospitalId,
          scheduledDate: scheduledDateObj,
          startTime,
          endTime,
          existingSlotId: existingBookedSlot._id
        });
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked. Please select a different time.'
        });
      }
    } catch (slotValidationError) {
      console.error('⚠️ Warning: Failed to validate time slot availability:', slotValidationError);
      // Continue with appointment creation if slot validation fails
    }

    // Create appointment
    // Debug: Log the appointment data being saved
    console.log('🔍 Backend creating appointment with date:', {
      scheduledDate: scheduledDateObj,
      scheduledDateISO: scheduledDateObj.toISOString(),
      scheduledDateDate: scheduledDateObj.toDateString(),
      scheduledTime,
      consultationType
    });

    // Debug: Log the complete appointment object
    const appointmentToSave = {
      patient: req.user._id,
      doctor: doctorId,
      hospital: resolvedHospitalId,
      appointmentType: 'consultation',
      department: resolvedDepartment,
      scheduledDate: scheduledDateObj,
      scheduledTime,
      estimatedDuration: finalDuration, // Use the dynamic duration
      consultationType,
      symptoms,
      doctorNotes: notes,
      emergencyContact,
      cost: {
        consultationFee,
        originalConsultationFee, // Store original fee for display
        convenienceFee,
        additionalCharges: 0,
        totalAmount
      },
      paymentStatus: 'pending',
      status: 'pending',
      createdBy: req.user._id,
      bookingStep: step,
      bookingProgress: step * 25
    };

    console.log('🔍 Complete appointment object to save:', appointmentToSave);

    // Create appointment with pending payment status
    const appointment = new Appointment(appointmentToSave);

    // Set initial status as pending (will be confirmed after payment)
    appointment.status = 'pending';
    appointment.paymentStatus = 'pending';

    // Calculate startTime and endTime for the appointment
    const startTime = appointment.scheduledTime;
    const startTimeParts = startTime.split(':');
    const startHour = parseInt(startTimeParts[0]);
    const startMinute = parseInt(startTimeParts[1]);
    
    // Use the finalDuration we calculated earlier, or get it from doctor's availability
    const appointmentDuration = finalDuration || appointment.estimatedDuration || 30;
    const endTimeDate = new Date(appointment.scheduledDate);
    endTimeDate.setHours(startHour, startMinute + appointmentDuration, 0, 0);
    const endTime = endTimeDate.toTimeString().slice(0, 5);
    
    // Set the startTime and endTime fields in the appointment
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    
    // Save appointment immediately with pending status so doctor can see it
    console.log('🚀 BEFORE: About to save appointment...');
    await appointment.save();
    console.log('✅ Appointment saved immediately with pending status:', appointment._id);
    console.log('✅ Time slot stored in appointment:', {
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      scheduledTime: appointment.scheduledTime
    });



    // Emit real-time appointment creation event
    if (req.app.locals.io) {
      req.app.locals.io.to(`doctor:${doctorId}`).emit('appointment:created', {
        appointmentId: appointment._id,
        patient: {
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        },
        scheduledDate,
        scheduledTime,
        consultationType,
        timestamp: new Date()
      });
    }

    // Handle payment based on method
    if (paymentMethod === 'online') {
      // Debug logging for payment data
      console.log('🔍 Payment Data Debug:', {
        consultationType,
        totalAmount,
        consultationFee,
        originalConsultationFee,
        convenienceFee,
        amount: req.body.amount,
        doctorFees: {
          online: doctor.consultationFees?.online,
          inPerson: doctor.consultationFees?.inPerson
        }
      });

      // Create Razorpay order for online payment
      const paymentData = {
        doctorId,
        patientId: req.user._id,
        hospitalId: resolvedHospitalId,
        consultationType,
        amount: totalAmount, // Use totalAmount for online payment
        appointmentId: appointment._id, // Use the actual appointment ID since it's already saved
        // Pass complete appointment data for payment processing
        appointmentData: {
          appointmentNumber: `APT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          patient: req.user._id,
          doctor: doctorId,
          hospital: resolvedHospitalId,
          appointmentType: 'consultation',
          department: resolvedDepartment,
          scheduledDate: scheduledDateObj,
          scheduledTime,
          consultationType,
          symptoms,
          doctorNotes: notes,
          emergencyContact,
          cost: {
            consultationFee,
            originalConsultationFee,
            convenienceFee,
            additionalCharges: 0,
            totalAmount
          },
          paymentStatus: 'pending',
          status: 'pending',
          createdBy: req.user._id,
          bookingStep: step,
          bookingProgress: step * 25
        }
      };

      console.log('🔍 Payment Data being sent to Razorpay:', {
        amount: paymentData.amount,
        consultationType: paymentData.consultationType,
        totalAmount: paymentData.amount
      });

      try {
        const paymentResult = await razorpayService.createOrder(paymentData);

        // Emit real-time payment order created event
        if (req.app.locals.io) {
          req.app.locals.io.to(`doctor:${doctorId}`).emit('payment:order:created', {
            appointmentId: paymentData.appointmentId,
            orderId: paymentResult.order.id,
            amount: paymentResult.order.amount,
            timestamp: new Date()
          });
        }

        return res.json({
          success: true,
          message: 'Payment order created. Please complete payment to confirm appointment.',
          data: {
            appointment: {
              _id: appointment._id, // Use actual appointment ID
              scheduledDate: scheduledDateObj,
              scheduledTime: scheduledTime,
              consultationType: consultationType,
              cost: {
                consultationFee,
                originalConsultationFee,
                convenienceFee,
                additionalCharges: 0,
                totalAmount
              },
              status: 'pending'
            },
            payment: {
              orderId: paymentResult.order.id,
              amount: paymentResult.order.amount,
              currency: paymentResult.order.currency,
              key: paymentResult.key,
              paymentId: paymentResult.payment._id,
              baseAmount: consultationFee,
              convenienceFee: convenienceFee,
              totalAmount: totalAmount
            }
          }
        });
      } catch (paymentError) {
        console.error('Payment order creation failed:', paymentError);
        
        // No appointment to delete since it was never saved
        
        return res.status(500).json({
          success: false,
          message: 'Payment initialization failed. Please try again.',
          error: paymentError.message
        });
      }
    } else {
      // Create offline payment record
      const paymentData = {
        doctorId,
        patientId: req.user._id,
        hospitalId: resolvedHospitalId,
        consultationType,
        amount: totalAmount, // Use totalAmount for offline payment
        appointmentId: appointment._id // Use the actual appointment ID
      };

      try {
        const paymentResult = await razorpayService.createOfflinePayment(paymentData);

        // Emit real-time offline payment created event
        if (req.app.locals.io) {
          req.app.locals.io.to(`appointment:${appointment._id}`).emit('payment:offline:created', {
            appointmentId: appointment._id,
            paymentId: paymentResult.payment._id,
            receiptNumber: paymentResult.receiptNumber,
            timestamp: new Date()
          });
        }

        return res.json({
          success: true,
          message: 'Appointment booked successfully. Please pay at the hospital.',
          data: {
            appointment: appointment,
            payment: {
              paymentId: paymentResult.payment._id,
              receiptNumber: paymentResult.receiptNumber,
              paymentToken: paymentResult.paymentToken,
              amount: paymentResult.payment.amount,
              baseAmount: consultationFee,
              convenienceFee: convenienceFee,
              totalAmount: totalAmount,
              status: paymentResult.payment.status
            }
          }
        });
      } catch (paymentError) {
        console.error('Offline payment creation failed:', paymentError);
        
        // Delete the appointment if payment record creation fails
        await Appointment.findByIdAndDelete(appointment._id);
        
        return res.status(500).json({
          success: false,
          message: 'Payment record creation failed. Please try again.',
          error: paymentError.message
        });
      }
    }
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to book appointment',
      error: error.message 
    });
  }
});

// PUT /api/appointments/:id/progress (update booking progress)
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { step, progress, patientNotes, emergencyContact } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify ownership
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update progress
    appointment.bookingStep = step;
    appointment.bookingProgress = progress;
    
    if (patientNotes) appointment.patientNotes = patientNotes;
    if (emergencyContact) appointment.emergencyContact = emergencyContact;

    await appointment.save();

    // Emit real-time progress update
    if (req.app.locals.io) {
      req.app.locals.io.to(`appointment:${id}`).emit('appointment:progress:updated', {
        appointmentId: id,
        step,
        progress,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Appointment progress updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment progress',
      error: error.message
    });
  }
});

// POST /api/appointments/:id/confirm (final confirmation step)
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { patientNotes, emergencyContact, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions to proceed'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify ownership
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this appointment'
      });
    }

    // Check if payment is completed
    if (appointment.paymentStatus !== 'paid' && appointment.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed before confirming appointment'
      });
    }

    // Update appointment
    appointment.patientNotes = patientNotes;
    appointment.emergencyContact = emergencyContact;
    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    appointment.bookingStep = 4;
    appointment.bookingProgress = 100;

    await appointment.save();

    // Emit real-time confirmation event
    if (req.app.locals.io) {
      req.app.locals.io.to(`appointment:${id}`).emit('appointment:confirmed', {
        appointmentId: id,
        appointment,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Appointment confirmed successfully!',
      data: appointment
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error.message
    });
  }
});

// PUT /api/appointments/:id/confirm (confirm appointment after successful payment)
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentId, razorpayPaymentId } = req.body;

    console.log('🔍 Confirming appointment after payment:', { id, paymentId, razorpayPaymentId });

    // Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify payment status
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed or invalid'
      });
    }

    // Update appointment status
    appointment.status = 'confirmed';
    appointment.paymentStatus = 'paid';
    appointment.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: 'Appointment confirmed after successful payment'
    });

    await appointment.save();

    console.log('✅ Appointment confirmed successfully:', {
      appointmentId: appointment._id,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus
    });

    // Emit real-time appointment confirmation event
    if (req.app.locals.io) {
      req.app.locals.io.to(`appointment:${appointment._id}`).emit('appointment:confirmed', {
        appointmentId: appointment._id,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: {
        appointment: appointment
      }
    });

  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/appointments (legacy booking - kept for backward compatibility)
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, time, type, consent } = req.body;
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      time,
      type,
      status: 'booked',
      consent: consent || {},
      createdBy: req.user._id
    });
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/appointments/doctor (doctor's appointments)
router.get('/doctor', auth, async (req, res) => {
  try {
    console.log('🔍 Doctor appointments request received');
    console.log('👤 User:', req.user._id, req.user.role);
    
    if (req.user.role !== 'doctor') {
      console.log('❌ User is not a doctor');
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }
    
    const { status, consultationType, search, page = 1, limit = 20 } = req.query;
    
    console.log('🔍 Query parameters:', { status, consultationType, search, page, limit });
    
    // Build filter object
    const filter = { doctor: req.user._id };
    console.log('🔍 Filter:', filter);
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (consultationType && consultationType !== 'all') {
      filter.consultationType = consultationType;
    }
    
    // Search functionality - only search in non-populated fields
    if (search) {
      filter.$or = [
        { appointmentNumber: { $regex: search, $options: 'i' } },
        { symptoms: { $regex: search, $options: 'i' } },
        { patientNotes: { $regex: search, $options: 'i' } },
        { doctorNotes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('🔍 Executing database query...');
    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email phone profileImage')
      .populate('hospital', 'hospitalName firstName lastName address phone email')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log('✅ Database query completed, found appointments:', appointments.length);
    
    // Get total count for pagination
    const totalAppointments = await Appointment.countDocuments(filter);
    
    // Get statistics
    const stats = await Promise.all([
      Appointment.countDocuments({ doctor: req.user._id }),
      Appointment.countDocuments({ doctor: req.user._id, status: 'pending' }),
      Appointment.countDocuments({ doctor: req.user._id, status: 'confirmed' }),
      Appointment.countDocuments({ doctor: req.user._id, status: 'completed' }),
      Appointment.countDocuments({ doctor: req.user._id, status: 'cancelled' }),
      Appointment.countDocuments({ doctor: req.user._id, consultationType: 'online' }),
      Appointment.countDocuments({ doctor: req.user._id, consultationType: 'in-person' })
    ]);
    
    const [total, pending, confirmed, completed, cancelled, online, offline] = stats;
    
    // Transform appointments to match frontend interface
    const transformedAppointments = appointments.map(appt => {
      console.log('🔍 Processing appointment:', appt._id);
      console.log('👤 Patient data:', appt.patient);
      console.log('🏥 Hospital data:', appt.hospital);
      console.log('📅 Scheduled date (raw):', appt.scheduledDate);
      console.log('📅 Scheduled date (type):', typeof appt.scheduledDate);
      console.log('📅 Scheduled date (instanceof Date):', appt.scheduledDate instanceof Date);
      if (appt.scheduledDate instanceof Date) {
        console.log('📅 Scheduled date (ISO):', appt.scheduledDate.toISOString());
        console.log('📅 Scheduled date (getTime):', appt.scheduledDate.getTime());
      }
      
      return {
        _id: appt._id,
        appointmentNumber: appt.appointmentNumber || `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patient: {
          _id: appt.patient?._id || 'Unknown',
          firstName: appt.patient?.firstName || 'Unknown',
          lastName: appt.patient?.lastName || 'Patient',
          email: appt.patient?.email || 'No email',
          phone: appt.patient?.phone || 'No phone',
          profileImage: appt.patient?.profileImage
        },
        scheduledDate: appt.scheduledDate,
        scheduledTime: appt.scheduledTime,
        consultationType: appt.consultationType || 'online',
        status: appt.status || 'pending',
        estimatedDuration: appt.estimatedDuration || 30,
        symptoms: appt.symptoms || [],
        patientNotes: appt.patientNotes || 'No reason specified',
        doctorNotes: appt.doctorNotes || undefined,
        emergencyContact: appt.emergencyContact || undefined,
        followUpRequired: appt.followUpRequired || false,
        followUpDate: appt.followUpDate || undefined,
        cost: appt.cost || undefined,
        paymentStatus: appt.paymentStatus || 'pending',
        department: appt.department || 'General Medicine',
        priority: appt.priority || 'normal',
        room: appt.room || appt.hospital?.hospitalName || 'No location specified',
        hospital: appt.hospital ? {
          hospitalName: appt.hospital.hospitalName || 'Unknown Hospital',
          address: appt.hospital.address ? 
            (typeof appt.hospital.address === 'object' ? 
              `${appt.hospital.address.street || ''} ${appt.hospital.address.city || ''} ${appt.hospital.address.state || ''} ${appt.hospital.address.zipCode || ''} ${appt.hospital.address.country || ''}`.trim() :
              appt.hospital.address
            ) : 'No address',
          phone: appt.hospital.phone || 'No phone'
        } : undefined,
        patientVitals: appt.patientVitals,
        createdAt: appt.createdAt,
        updatedAt: appt.updatedAt
      };
    });
      
    res.json({
      success: true,
      data: {
        appointments: transformedAppointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAppointments / parseInt(limit)),
          totalItems: totalAppointments,
          itemsPerPage: parseInt(limit)
        },
        statistics: {
          total,
          pending,
          confirmed,
          completed,
          cancelled,
          online,
          offline
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching doctor appointments:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// DELETE /api/appointments/:id (cancel appointment)
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user._id });
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    appointment.status = 'cancelled';
    appointment.updatedBy = req.user._id;
    await appointment.save();
    
    res.json({ 
      success: true,
      message: 'Appointment cancelled successfully', 
      data: appointment 
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/appointments/:id (get appointment details for patients and doctors)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is a patient trying to access their own appointment
    if (req.user.role === 'patient') {
      const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user._id })
        .populate('patient', 'firstName lastName email phone')
        .populate('doctor', 'firstName lastName specialization hospital location profileImage experience languages yearsOfExperience')
        .populate('hospital', 'hospitalName firstName lastName address phone email');
        
      if (!appointment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Appointment not found' 
        });
      }
      
      // Attach latest payment info if available
      const payment = await Payment.findOne({ appointment: appointment._id })
        .sort({ updatedAt: -1 })
        .select('paymentId razorpayOrderId razorpayPaymentId amount currency status createdAt updatedAt completedAt');

      const data = appointment.toObject();
      if (payment) {
        data.paymentData = {
          orderId: payment.razorpayOrderId || '-',
          paymentId: payment.paymentId || '-',
          razorpayPaymentId: payment.razorpayPaymentId || '-',
          amount: payment.amount,
          currency: payment.currency || 'INR',
          status: payment.status || 'pending',
          paidAt: payment.completedAt || payment.updatedAt || payment.createdAt
        };
      }

      res.json({
        success: true,
        data
      });
    } 
    // Check if user is a doctor trying to access an appointment they're assigned to
    else if (req.user.role === 'doctor') {
      const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.user._id })
        .populate('patient', 'firstName lastName email phone')
        .populate('doctor', 'firstName lastName specialization hospital location profileImage experience languages yearsOfExperience')
        .populate('hospital', 'hospitalName firstName lastName address phone email');
        
      if (!appointment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Appointment not found or you are not assigned to this appointment' 
        });
      }

      res.json({
        success: true,
        data: appointment
      });
    }
    // For other roles, return forbidden
    else {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// PUT /api/appointments/:id/status (update appointment status)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }

    const { status, notes } = req.body;
    const { id } = req.params;

    const appointment = await Appointment.findOne({ 
      _id: id, 
      doctor: req.user._id 
    });

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Update status
    appointment.status = status;
    
    // Add to status history
    appointment.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: notes || `Status changed to ${status}`
    });

    // Add doctor notes if provided
    if (notes) {
      appointment.doctorNotes = notes;
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// PUT /api/appointments/:id/notes (update doctor notes)
router.put('/:id/notes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }

    const { notes, followUpRequired, followUpDate } = req.body;
    const { id } = req.params;

    const appointment = await Appointment.findOne({ 
      _id: id, 
      doctor: req.user._id 
    });

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Update notes and follow-up information
    if (notes !== undefined) {
      appointment.doctorNotes = notes;
    }
    
    if (followUpRequired !== undefined) {
      appointment.followUpRequired = followUpRequired;
    }
    
    if (followUpDate) {
      appointment.followUpDate = followUpDate;
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment notes updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment notes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/appointments/doctor/statistics (get doctor appointment statistics)
router.get('/doctor/statistics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden' 
      });
    }

    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const baseFilter = { doctor: req.user._id, ...dateFilter };

    // Get comprehensive statistics
    const stats = await Promise.all([
      Appointment.countDocuments(baseFilter),
      Appointment.countDocuments({ ...baseFilter, status: 'pending' }),
      Appointment.countDocuments({ ...baseFilter, status: 'confirmed' }),
      Appointment.countDocuments({ ...baseFilter, status: 'completed' }),
      Appointment.countDocuments({ ...baseFilter, status: 'cancelled' }),
      Appointment.countDocuments({ ...baseFilter, consultationType: 'online' }),
      Appointment.countDocuments({ ...baseFilter, consultationType: 'in-person' }),
      Appointment.countDocuments({ ...baseFilter, priority: 'emergency' }),
      Appointment.countDocuments({ ...baseFilter, priority: 'urgent' }),
      Appointment.countDocuments({ ...baseFilter, followUpRequired: true })
    ]);

    const [total, pending, confirmed, completed, cancelled, online, offline, emergency, urgent, followUp] = stats;

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          doctor: req.user._id,
          scheduledDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total,
          pending,
          confirmed,
          completed,
          cancelled,
          online,
          offline,
          emergency,
          urgent,
          followUp
        },
        monthlyTrends: monthlyStats,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching doctor statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// POST /api/appointments/emergency (book with next available emergency doctor)
router.post('/emergency', auth, async (req, res) => {
  try {
    // Find next available emergency doctor
    const doctor = await User.findOne({ 
      role: 'doctor', 
      emergencyAvailable: true,
      isActive: true
    });
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'No emergency doctor available' 
      });
    }
    
    const { scheduledDate, scheduledTime, consultationType = 'in-person', symptoms = [] } = req.body;
    
    // Resolve hospital for emergency doctor as ObjectId
    let resolvedHospitalId = doctor._id;
    if (doctor.hospital) {
      if (mongoose.Types.ObjectId.isValid(doctor.hospital)) {
        resolvedHospitalId = doctor.hospital;
      } else {
        const hospitalUser = await User.findOne({ role: 'hospital', hospitalName: doctor.hospital });
        if (hospitalUser) {
          resolvedHospitalId = hospitalUser._id;
        }
      }
    }

    const allowedDepartments = new Set(['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'General Medicine', 'Surgery', 'Radiology', 'Laboratory']);
    const resolvedDepartment = (doctor.specialization && allowedDepartments.has(doctor.specialization)) ? doctor.specialization : 'Emergency';

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      hospital: resolvedHospitalId,
      appointmentType: 'emergency',
      department: resolvedDepartment,
      scheduledDate: scheduledDate || new Date(),
      scheduledTime: scheduledTime || new Date().toTimeString().split(' ')[0],
      consultationType,
      symptoms,
      priority: 'emergency',
      isEmergency: true,
      status: 'confirmed',
      paymentStatus: 'pending',
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Emergency appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error booking emergency appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// PUT /api/appointments/:id/status (update appointment status)
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Check if user has permission to update status
    if (appointment.doctor.toString() !== req.user._id.toString() && 
        appointment.hospital.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    appointment.status = status;
    appointment.updatedBy = req.user._id;
    
    if (notes) {
      appointment.doctorNotes = notes;
    }

    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

export default router; 