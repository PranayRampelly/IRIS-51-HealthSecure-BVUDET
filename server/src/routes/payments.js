import express from 'express';
import mongoose from 'mongoose';
import razorpayService from '../services/razorpayService.js';
import { auth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import PDFDocument from 'pdfkit';
import crypto from 'crypto';

const router = express.Router();
// GET /api/payments/key - expose Razorpay key id to frontend (non-secret)
router.get('/key', (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY || '';
    if (!keyId) {
      return res.status(404).json({ success: false, message: 'Razorpay key not configured' });
    }
    res.json({ success: true, keyId });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to retrieve key' });
  }
});

// Validation middleware
const validateAppointmentData = [
  body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
  body('consultationType').isIn(['online', 'in-person']).withMessage('Invalid consultation type'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('appointmentId').isMongoId().withMessage('Invalid appointment ID')
];

// POST /api/payments/create-order (Create Razorpay order for online payment)
router.post('/create-order', auth, validateAppointmentData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { doctorId, consultationType, amount, appointmentId } = req.body;
    const patientId = req.user._id;

    // Get doctor to find hospital
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    // Resolve hospital as ObjectId (doctor.hospital may be a name string)
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

    const appointmentData = {
      doctorId,
      patientId,
      hospitalId: resolvedHospitalId,
      consultationType,
      amount,
      appointmentId
    };

    const result = await razorpayService.createOrder(appointmentData);

    res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: result.order.id,
        amount: result.order.amount,
        currency: result.order.currency,
        key: result.key,
        paymentId: result.payment._id,
        baseAmount: result.baseAmount,
        convenienceFee: result.convenienceFee,
        totalAmount: result.totalAmount
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error.message 
    });
  }
});

// POST /api/payments/verify (Verify online payment)
router.post('/verify', auth, [
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
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

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    console.log('🔍 Processing payment verification...');
    const result = await razorpayService.processOnlinePayment({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    });
    
    console.log('🔍 Payment verification result:', {
      paymentId: result.payment._id,
      status: result.payment.status,
      hasAppointment: !!result.payment.appointment,
      hasAppointmentData: !!result.payment.appointmentData,
      appointmentData: result.payment.appointmentData
    });

    // After successful payment verification, confirm the appointment
    if (result.payment.status === 'completed') {
      try {
        // Since appointments are now created immediately, we should always have an appointment ID
        if (result.payment.appointment) {
          // Update the existing appointment status to confirmed
          await Appointment.findByIdAndUpdate(result.payment.appointment, {
            'paymentStatus': 'paid',
            'status': 'confirmed',
            'cost.consultationFee': result.payment.baseAmount || result.payment.amount,
            'cost.convenienceFee': result.payment.convenienceFee || 0,
            'cost.totalAmount': result.payment.amount,
            $push: {
              statusHistory: {
                status: 'confirmed',
                timestamp: new Date(),
                updatedBy: req.user._id,
                notes: 'Appointment confirmed after successful payment verification'
              }
            }
          });

          console.log('✅ Appointment confirmed after payment verification:', result.payment.appointment);
        } else {
          // Fallback: Check if we have appointment data (for backward compatibility)
          if (result.payment.appointmentData) {
            console.log('🔍 Creating appointment from payment data (fallback)');
            
            const paymentRecord = await Payment.findById(result.payment._id);
            if (paymentRecord && paymentRecord.appointmentData) {
              try {
                const appointmentData = {
                  ...paymentRecord.appointmentData,
                  status: 'confirmed',
                  paymentStatus: 'paid',
                  statusHistory: [{
                    status: 'confirmed',
                    timestamp: new Date(),
                    updatedBy: req.user._id,
                    notes: 'Appointment created and confirmed after successful payment (fallback)'
                  }]
                };
                
                const actualAppointment = new Appointment(appointmentData);
                await actualAppointment.save();
                
                // Update the payment record with the actual appointment ID
                paymentRecord.appointment = actualAppointment._id;
                await paymentRecord.save();
                
                console.log('✅ Appointment created from payment data (fallback):', actualAppointment._id);
              } catch (appointmentError) {
                console.error('❌ Failed to create appointment from payment data:', appointmentError);
              }
            }
          } else {
            console.warn('⚠️ No appointment found for payment confirmation');
          }
        }
      } catch (confirmError) {
        console.error('⚠️ Warning: Failed to confirm appointment after payment:', confirmError);
        // Don't fail the payment verification if appointment confirmation fails
      }
    }

    // Get the final payment record to return the appointment ID if it was created
    let finalPaymentRecord = null;
    try {
      finalPaymentRecord = await Payment.findById(result.payment._id).populate('appointment');
      console.log('🔍 Final payment record:', {
        paymentId: finalPaymentRecord._id,
        hasAppointment: !!finalPaymentRecord.appointment,
        appointmentId: finalPaymentRecord.appointment?._id,
        appointmentNumber: finalPaymentRecord.appointment?.appointmentNumber
      });
    } catch (populateError) {
      console.error('⚠️ Warning: Failed to populate payment record:', populateError);
    }
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: result.payment._id,
        status: result.payment.status,
        amount: result.payment.amount,
        receiptUrl: `/api/payments/${result.payment._id}/receipt/pdf`,
        appointmentId: finalPaymentRecord?.appointment?._id,
        appointmentNumber: finalPaymentRecord?.appointment?.appointmentNumber
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
});

// POST /api/payments/offline/create (Create offline payment record)
router.post('/offline/create', auth, validateAppointmentData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { doctorId, consultationType, amount, appointmentId } = req.body;
    const patientId = req.user._id;

    // Get doctor to find hospital
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    // Resolve hospital as ObjectId for offline payments too
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

    const appointmentData = {
      doctorId,
      patientId,
      hospitalId: resolvedHospitalId,
      consultationType,
      amount,
      appointmentId
    };

    const result = await razorpayService.createOfflinePayment(appointmentData);

    res.json({
      success: true,
      message: 'Offline payment record created successfully',
      data: {
        paymentId: result.payment._id,
        receiptNumber: result.receiptNumber,
        paymentToken: result.paymentToken,
        amount: result.payment.amount,
        baseAmount: result.baseAmount,
        convenienceFee: result.convenienceFee,
        totalAmount: result.totalAmount,
        status: result.payment.status
      }
    });
  } catch (error) {
    console.error('Error creating offline payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create offline payment record',
      error: error.message 
    });
  }
});

// POST /api/payments/offline/complete (Complete offline payment)
router.post('/offline/complete', auth, [
  body('paymentId').isMongoId().withMessage('Invalid payment ID'),
  body('paymentProof').optional().isURL().withMessage('Invalid payment proof URL')
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

    const { paymentId, paymentProof } = req.body;
    const collectedBy = req.user._id;

    const result = await razorpayService.completeOfflinePayment(paymentId, paymentProof, collectedBy);

    res.json({
      success: true,
      message: 'Offline payment completed successfully',
      data: {
        paymentId: result.payment._id,
        receiptNumber: result.payment.offlinePayment.receiptNumber,
        status: result.payment.status,
        amount: result.payment.amount
      }
    });
  } catch (error) {
    console.error('Error completing offline payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete offline payment',
      error: error.message 
    });
  }
});

// GET /api/payments/:paymentId (Get payment details)
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await razorpayService.getPaymentDetails(paymentId);

    // Check if user has access to this payment
    if (result.payment.patient.toString() !== req.user._id.toString() && 
        result.payment.doctor.toString() !== req.user._id.toString() &&
        result.payment.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: result.payment
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment details',
      error: error.message 
    });
  }
});

// GET /api/payments/order/:orderId (lookup by Razorpay order id)
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ razorpayOrderId: req.params.orderId })
      .populate('appointment')
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('hospital', 'hospitalName');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Access check
    if (payment.patient.toString() !== req.user._id.toString() &&
        payment.doctor.toString() !== req.user._id.toString() &&
        payment.hospital.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Error looking up payment by orderId:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Razorpay webhook to finalize payments even if client verification fails
// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET not set');
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = req.body; // raw buffer due to express.raw
    const payload = body instanceof Buffer ? body.toString('utf8') : JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret || '')
      .update(payload)
      .digest('hex');

    if (webhookSecret && signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(payload);
    if (!event || !event.event) {
      return res.status(200).send('ignored');
    }

    if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
      const p = event.payload?.payment?.entity;
      if (p) {
        const orderId = p.order_id;
        const paymentId = p.id;
        const status = p.status;
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment) {
          payment.razorpayPaymentId = paymentId;
          payment.status = status === 'captured' || status === 'authorized' ? 'completed' : payment.status;
          payment.razorpayData = { ...(payment.razorpayData || {}), webhook: event };
          await payment.save();

          // Update appointment payment status
          const { default: Appointment } = await import('../models/Appointment.js');
          await Appointment.findByIdAndUpdate(payment.appointment, {
            'paymentStatus': 'paid',
            'cost.consultationFee': payment.baseAmount || payment.amount,
            'cost.convenienceFee': payment.convenienceFee || 0,
            'cost.totalAmount': payment.amount
          });

          // Emit real-time event
          if (req.app?.locals?.io) {
            req.app.locals.io.to(`appointment:${payment.appointment}`).emit('payment:verified', {
              appointmentId: payment.appointment,
              paymentId: payment._id,
              status: payment.status,
              amount: payment.amount
            });
          }
        }
      }
    }

    res.status(200).send('ok');
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).send('error');
  }
});

// GET /api/payments/receipt/:receiptNumber (Get payment by receipt number)
router.get('/receipt/:receiptNumber', auth, async (req, res) => {
  try {
    const { receiptNumber } = req.params;

    const result = await razorpayService.getPaymentByReceipt(receiptNumber);

    // Check if user has access to this payment
    if (result.payment.patient.toString() !== req.user._id.toString() && 
        result.payment.doctor.toString() !== req.user._id.toString() &&
        result.payment.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: result.payment
    });
  } catch (error) {
    console.error('Error getting payment by receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment details',
      error: error.message 
    });
  }
});

// GET /api/payments/token/:token (Get payment by token)
router.get('/token/:token', auth, async (req, res) => {
  try {
    const { token } = req.params;

    const result = await razorpayService.getPaymentByToken(token);

    // Check if user has access to this payment
    if (result.payment.patient.toString() !== req.user._id.toString() && 
        result.payment.doctor.toString() !== req.user._id.toString() &&
        result.payment.hospital.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: result.payment
    });
  } catch (error) {
    console.error('Error getting payment by token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment details',
      error: error.message 
    });
  }
});

// POST /api/payments/:paymentId/refund (Refund payment)
router.post('/:paymentId/refund', auth, [
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('reason').optional().isString().withMessage('Reason must be a string')
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

    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    // Check if user has permission to refund (doctor, hospital, or admin)
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    if (payment.doctor.toString() !== req.user._id.toString() && 
        payment.hospital.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const result = await razorpayService.refundPayment(paymentId, amount, reason);

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        paymentId: result.payment._id,
        status: result.payment.status,
        amount: result.payment.amount
      }
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refund payment',
      error: error.message 
    });
  }
});

// GET /api/payments/stats (Get payment statistics)
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;
    const filters = { startDate, endDate, status, paymentMethod };

    const result = await razorpayService.getPaymentStats(filters);

    res.json({
      success: true,
      data: result.stats
    });
  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment statistics',
      error: error.message 
    });
  }
});

// GET /api/payments/my (Get user's payments)
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentMethod } = req.query;
    const skip = (page - 1) * limit;

    const query = { patient: req.user._id };
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const payments = await Payment.find(query)
      .populate('appointment')
      .populate('doctor', 'firstName lastName specialization')
      .populate('hospital', 'hospitalName firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting user payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payments',
      error: error.message 
    });
  }
});

// GET /api/payments/:paymentId/receipt/pdf (Download detailed receipt)
router.get('/:paymentId/receipt/pdf', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('appointment')
      .populate('patient', 'firstName lastName email phone address')
      .populate('doctor', 'firstName lastName specialization')
      .populate('hospital', 'hospitalName firstName lastName address phone');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Access check
    if (payment.patient.toString() !== req.user._id.toString() &&
        payment.doctor.toString() !== req.user._id.toString() &&
        payment.hospital.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment.paymentId || payment._id}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#0d9488').font('Helvetica-Bold').text('HealthSecure - Payment Receipt');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('black').font('Helvetica').text(`Receipt Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#0d9488');
    doc.moveDown();

    // Receipt Details
    doc.font('Helvetica-Bold').text('Receipt Details');
    doc.font('Helvetica').text(`Receipt Number: ${payment.offlinePayment?.receiptNumber || payment.paymentId}`);
    doc.text(`Payment Method: ${payment.paymentMethod}`);
    doc.text(`Payment Status: ${payment.status}`);
    if (payment.razorpayOrderId) doc.text(`Razorpay Order ID: ${payment.razorpayOrderId}`);
    if (payment.razorpayPaymentId) doc.text(`Razorpay Payment ID: ${payment.razorpayPaymentId}`);
    doc.moveDown();

    // Parties
    doc.font('Helvetica-Bold').text('Patient');
    const patient = payment.patient;
    doc.font('Helvetica').text(`${patient.firstName} ${patient.lastName}`);
    if (patient.email) doc.text(`Email: ${patient.email}`);
    if (patient.phone) doc.text(`Phone: ${patient.phone}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Doctor');
    const doctor = payment.doctor;
    doc.font('Helvetica').text(`Dr. ${doctor.firstName} ${doctor.lastName}`);
    if (doctor.specialization) doc.text(`Specialization: ${doctor.specialization}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Hospital/Clinic');
    const hospital = payment.hospital;
    doc.font('Helvetica').text(hospital.hospitalName || `${hospital.firstName || ''} ${hospital.lastName || ''}`.trim());
    doc.moveDown();

    // Appointment
    if (payment.appointment) {
      doc.font('Helvetica-Bold').text('Appointment');
      doc.font('Helvetica').text(`Appointment ID: ${payment.appointment._id}`);
      doc.text(`Date: ${payment.appointment.scheduledDate ? new Date(payment.appointment.scheduledDate).toLocaleDateString() : 'N/A'}`);
      doc.text(`Time: ${payment.appointment.scheduledTime || 'N/A'}`);
      doc.text(`Type: ${payment.appointment.consultationType || 'consultation'}`);
      if (payment.appointment.department) doc.text(`Department: ${payment.appointment.department}`);
      doc.moveDown();
    }

    // Amounts
    doc.font('Helvetica-Bold').text('Amount');
    doc.font('Helvetica').text(`Consultation Fee: ₹${payment.amount}`);
    doc.text(`Currency: ${payment.currency}`);
    doc.text(`Total Paid: ₹${payment.amount}`);
    doc.moveDown();

    // Footer
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text('Thank you for your payment. For support, contact support@healthsecure.example');
    doc.end();
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate receipt' });
  }
});

export default router;
