import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  // Create Razorpay order for online payment
  async createOrder(appointmentData) {
    try {
      const { doctorId, patientId, hospitalId, consultationType, amount, appointmentId } = appointmentData;
      
      // Debug logging for received data
      console.log('🔍 Razorpay Service - Received Data:', {
        consultationType,
        amount,
        amountType: typeof amount,
        amountValue: amount
      });
      
      // Get doctor details for order description
      const doctor = await User.findById(doctorId);
      const patient = await User.findById(patientId);
      const hospital = await User.findById(hospitalId);
      
      if (!doctor || !patient || !hospital) {
        throw new Error('Doctor, patient, or hospital not found');
      }

      // Build a short, unique receipt id within Razorpay's 40-char limit
      const shortId = String(appointmentId).slice(-6);
      const ts = Math.floor(Date.now() / 1000); // 10 digits
      const computedReceipt = `apt_${shortId}_${ts}`; // typically ~21 chars
      const receipt = computedReceipt.slice(0, 40);

      // Calculate fees based on consultation type
      let baseConsultationFee = 0;
      let originalConsultationFee = 0; // Store original fee for display
      let convenienceFee = 0;
      let totalAmount = 0;
      
      if (consultationType === 'online') {
        // Online consultation: Use the amount parameter (already calculated)
        totalAmount = Math.round(Number(amount) || doctor.consultationFees?.online);
        originalConsultationFee = totalAmount;
        baseConsultationFee = totalAmount;
        convenienceFee = 0;
      } else if (consultationType === 'in-person') {
        // In-person consultation: Use the amount parameter (already calculated convenience fee)
        // The amount parameter should already be the convenience fee amount
        totalAmount = Math.round(Number(amount));
        
        // For in-person, we need to calculate the original consultation fee from the convenience fee
        // Since convenience fee is 5% of original fee, original fee = convenience fee / 0.05
        originalConsultationFee = Math.round(totalAmount / 0.05);
        baseConsultationFee = originalConsultationFee;
        convenienceFee = totalAmount; // The amount passed is already the convenience fee
        
        // Debug logging for convenience fee calculation
        console.log('🔍 In-Person Consultation Fee Calculation (Razorpay):', {
          amount: amount,
          totalAmount,
          originalConsultationFee,
          baseConsultationFee,
          convenienceFee,
          calculation: `Convenience Fee: ₹${totalAmount}, Original Fee: ₹${totalAmount} / 0.05 = ₹${originalConsultationFee}`,
          doctorFees: {
            online: doctor.consultationFees?.online,
            inPerson: doctor.consultationFees?.inPerson
          }
        });
      }

      const orderData = {
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: receipt,
        notes: {
          appointmentId: appointmentId,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          patientName: `${patient.firstName} ${patient.lastName}`,
          hospitalName: hospital.hospitalName || hospital.firstName,
          consultationType: consultationType,
          baseFee: baseConsultationFee,
          convenienceFee: convenienceFee,
          totalAmount: totalAmount
        },
        partial_payment: false,
        payment_capture: 1
      };

      // Debug logging for order data
      console.log('🔍 Razorpay Order Data:', {
        amount: orderData.amount,
        totalAmount,
        totalAmountInPaise: totalAmount * 100,
        currency: orderData.currency
      });

      const order = await this.razorpay.orders.create(orderData);
      
      // Create payment record with convenience fee details
      const payment = new Payment({
        // Since appointments are now created immediately, we always have a valid appointment ID
        appointment: appointmentId,
        patient: patientId,
        doctor: doctorId,
        hospital: hospitalId,
        amount: totalAmount, // Store total amount including convenience fee
        baseAmount: baseConsultationFee, // Store base consultation fee
        convenienceFee: convenienceFee, // Store convenience fee separately
        currency: 'INR',
        consultationType: consultationType,
        paymentMethod: 'online',
        razorpayOrderId: order.id,
        status: 'pending',
        createdBy: patientId
      });

      await payment.save();

      // Emit real-time event for payment initiated
      if (globalThis.io) {
        globalThis.io.to(`appointment:${appointmentId}`).emit('payment:initiated', {
          appointmentId,
          orderId: order.id,
          amount: order.amount,
          baseAmount: baseConsultationFee,
          convenienceFee: convenienceFee,
          totalAmount: totalAmount
        });
      }

      return {
        success: true,
        order: order,
        payment: payment,
        key: process.env.RAZORPAY_KEY_ID,
        baseAmount: baseConsultationFee,
        convenienceFee: convenienceFee,
        totalAmount: totalAmount
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify online payment signature
  async verifyPayment(paymentId, orderId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generatedSignature === signature) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  // Process online payment completion
  async processOnlinePayment(paymentData) {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentData;
      
      // Find payment record
      const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Verify payment signature
      let isValidSignature = await this.verifyPayment(
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      );

      // Fallback: query Razorpay to double-check status in case of signature mismatch
      if (!isValidSignature) {
        try {
          const fetched = await this.razorpay.payments.fetch(razorpay_payment_id);
          if (fetched && fetched.order_id === razorpay_order_id && ['captured', 'authorized'].includes(fetched.status)) {
            isValidSignature = true;
          }
        } catch (fetchErr) {
          // ignore; will be treated as invalid
        }
      }

      if (!isValidSignature) {
        await payment.updateStatus('failed', {
          errorCode: 'INVALID_SIGNATURE',
          errorDescription: 'Payment signature verification failed'
        });
        throw new Error('Invalid payment signature');
      }

      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpayData = {
        order: { id: razorpay_order_id },
        payment: { id: razorpay_payment_id },
        signature: razorpay_signature
      };
      
      await payment.updateStatus('completed');

      // Update appointment payment status (only if appointment exists)
      if (payment.appointment) {
        await Appointment.findByIdAndUpdate(payment.appointment, {
          'paymentStatus': 'paid',
          'cost.consultationFee': payment.baseAmount || payment.amount,
          'cost.convenienceFee': payment.convenienceFee || 0,
          'cost.totalAmount': payment.amount
        });
      }

      // Emit real-time verified event if socket exists and appointment exists
      if (globalThis.io && payment.appointment) {
        globalThis.io.to(`appointment:${payment.appointment}`).emit('payment:verified', {
          appointmentId: payment.appointment,
          paymentId: payment._id,
          status: 'completed',
          amount: payment.amount
        });
      }

      return {
        success: true,
        payment: payment,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('Error processing online payment:', error);
      throw error;
    }
  }

  // Create offline payment record
  async createOfflinePayment(appointmentData) {
    try {
      const { doctorId, patientId, hospitalId, consultationType, amount, appointmentId } = appointmentData;
      
      // Get doctor details
      const doctor = await User.findById(doctorId);
      const patient = await User.findById(patientId);
      const hospital = await User.findById(hospitalId);
      
      if (!doctor || !patient || !hospital) {
        throw new Error('Doctor, patient, or hospital not found');
      }

      // Calculate fees based on consultation type
      let baseConsultationFee = 0;
      let originalConsultationFee = 0; // Store original fee for display
      let convenienceFee = 0;
      let totalAmount = 0;
      
      if (consultationType === 'online') {
        // Online consultation: Only consultation fee, no convenience fee
        originalConsultationFee = doctor.consultationFees?.online;
        if (!originalConsultationFee || originalConsultationFee <= 0) {
          throw new Error('Doctor online consultation fee is not configured. Please contact the doctor to set their fees.');
        }
        baseConsultationFee = Math.round(Number(amount) || originalConsultationFee);
        convenienceFee = 0;
        totalAmount = baseConsultationFee;
      } else if (consultationType === 'in-person') {
        // In-person consultation: Show full consultation fee but only charge convenience fee
        originalConsultationFee = doctor.consultationFees?.inPerson;
        if (!originalConsultationFee || originalConsultationFee <= 0) {
          throw new Error('Doctor in-person consultation fee is not configured. Please contact the doctor to set their fees.');
        }
        baseConsultationFee = originalConsultationFee; // Show full consultation fee (but not charged)
        convenienceFee = Math.round(originalConsultationFee * 0.05); // 5% convenience fee only
        totalAmount = convenienceFee; // Only charge convenience fee
      }

      // Create payment record for offline payment
      const payment = new Payment({
        appointment: appointmentId,
        patient: patientId,
        doctor: doctorId,
        hospital: hospitalId,
        amount: totalAmount, // Store total amount including convenience fee
        baseAmount: baseConsultationFee, // Store base consultation fee
        convenienceFee: convenienceFee, // Store convenience fee separately
        currency: 'INR',
        consultationType: consultationType,
        paymentMethod: 'offline',
        status: 'pending',
        createdBy: patientId,
        offlinePayment: {}
      });

      // Generate receipt number and payment token
      payment.generateOfflineReceipt();
      payment.generatePaymentToken();

      await payment.save();

      return {
        success: true,
        payment: payment,
        receiptNumber: payment.offlinePayment.receiptNumber,
        paymentToken: payment.offlinePayment.paymentToken,
        baseAmount: baseConsultationFee,
        convenienceFee: convenienceFee,
        totalAmount: totalAmount
      };
    } catch (error) {
      console.error('Error creating offline payment:', error);
      throw error;
    }
  }

  // Complete offline payment
  async completeOfflinePayment(paymentId, paymentProof = null, collectedBy = null) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment record not found');
      }

      if (payment.paymentMethod !== 'offline') {
        throw new Error('Invalid payment method');
      }

      // Update payment record
      payment.offlinePayment.paymentDate = new Date();
      if (paymentProof) {
        payment.offlinePayment.paymentProof = paymentProof;
      }
      if (collectedBy) {
        payment.offlinePayment.collectedBy = collectedBy;
      }

      await payment.updateStatus('completed');

      // Update appointment payment status
      await Appointment.findByIdAndUpdate(payment.appointment, {
        'paymentStatus': 'paid',
        'cost.consultationFee': payment.baseAmount || payment.amount,
        'cost.convenienceFee': payment.convenienceFee || 0,
        'cost.totalAmount': payment.amount
      });

      return {
        success: true,
        payment: payment,
        message: 'Offline payment completed successfully'
      };
    } catch (error) {
      console.error('Error completing offline payment:', error);
      throw error;
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('appointment')
        .populate('patient', 'firstName lastName email phone')
        .populate('doctor', 'firstName lastName specialization')
        .populate('hospital', 'hospitalName firstName lastName');

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        success: true,
        payment: payment
      };
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error;
    }
  }

  // Get payment by receipt number (for offline payments)
  async getPaymentByReceipt(receiptNumber) {
    try {
      const payment = await Payment.findOne({ 'offlinePayment.receiptNumber': receiptNumber })
        .populate('appointment')
        .populate('patient', 'firstName lastName email phone')
        .populate('doctor', 'firstName lastName specialization')
        .populate('hospital', 'hospitalName firstName lastName');

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        success: true,
        payment: payment
      };
    } catch (error) {
      console.error('Error getting payment by receipt:', error);
      throw error;
    }
  }

  // Get payment by token (for offline payments)
  async getPaymentByToken(token) {
    try {
      const payment = await Payment.findOne({ 'offlinePayment.paymentToken': token })
        .populate('appointment')
        .populate('patient', 'firstName lastName email phone')
        .populate('doctor', 'firstName lastName specialization')
        .populate('hospital', 'hospitalName firstName lastName');

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        success: true,
        payment: payment
      };
    } catch (error) {
      console.error('Error getting payment by token:', error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount = null, reason = '') {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Payment is not completed');
      }

      if (payment.paymentMethod === 'online' && payment.razorpayPaymentId) {
        // Process online refund through Razorpay
        const refundData = {
          payment_id: payment.razorpayPaymentId,
          amount: amount ? amount * 100 : payment.amount * 100, // Convert to paise
          speed: 'normal'
        };

        if (reason) {
          refundData.notes = { reason: reason };
        }

        const refund = await this.razorpay.payments.refund(refundData);
        
        await payment.updateStatus('refunded', {
          'razorpayData.refund': refund
        });
      } else {
        // For offline payments, just mark as refunded
        await payment.updateStatus('refunded');
      }

      return {
        success: true,
        payment: payment,
        message: 'Payment refunded successfully'
      };
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(filters = {}) {
    try {
      const matchStage = {};
      
      if (filters.startDate && filters.endDate) {
        matchStage.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      
      if (filters.status) {
        matchStage.status = filters.status;
      }
      
      if (filters.paymentMethod) {
        matchStage.paymentMethod = filters.paymentMethod;
      }

      const stats = await Payment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            completedPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            completedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
            },
            pendingPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            failedPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        success: true,
        stats: stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          completedPayments: 0,
          completedAmount: 0,
          pendingPayments: 0,
          failedPayments: 0
        }
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }
}

export default new RazorpayService();
