import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import PatientAdmission from '../models/PatientAdmission.js';
import EmergencyResponse from '../models/EmergencyResponse.js';
import { logAccess } from '../utils/logger.js';

class RealtimeService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket
    this.userRooms = new Map(); // userId -> rooms
    this.hospitalRooms = new Map(); // hospitalId -> connected users
    this.emergencyRooms = new Map(); // emergencyId -> connected users
    this.slotLocks = new Map(); // doctorId:date:time -> lockData
  }

  initialize(server, existingIo = null) {
    if (existingIo) {
      this.io = existingIo;
    } else {
      this.io = new Server(server, {
        cors: {
          origin: process.env.FRONTEND_URL || "http://localhost:8080",
          methods: ["GET", "POST"],
          credentials: true
        }
      });
    }

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🚀 Real-time service initialized');
  }

  setupMiddleware() {
    // Authentication middleware (optional - allows connections without auth)
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          console.log('Socket connection without token - allowing for now');
          socket.user = null; // No user authenticated
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId || decoded.id).select('-password');
        
        if (!user) {
          console.log('Socket connection with invalid user - allowing for now');
          socket.user = null;
          return next();
        }

        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        // Allow connection even if auth fails
        socket.user = null;
        next();
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      if (socket.user) {
        console.log(`🔌 User connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user.role})`);
      } else {
        console.log(`🔌 Anonymous user connected: ${socket.id}`);
      }
      
      this.handleConnection(socket);
      this.setupUserEvents(socket);
      this.setupHospitalEvents(socket);
      this.setupPatientEvents(socket);
      this.setupEmergencyEvents(socket);
      this.setupAppointmentEvents(socket);
      this.setupAdmissionEvents(socket);
      
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  handleConnection(socket) {
    if (!socket.user) {
      // Handle anonymous connections
      return;
    }
    
    const userId = socket.user._id.toString();
    const userRole = socket.user.role;
    
    // Store connected user
    this.connectedUsers.set(userId, socket);
    
    // Join user-specific room
    socket.join(`user:${userId}`);
    this.userRooms.set(userId, [`user:${userId}`]);
    
    // Join role-specific room
    socket.join(`role:${userRole}`);
    this.userRooms.get(userId).push(`role:${userRole}`);
    
    // Join hospital room if user is hospital staff or patient
    if (userRole === 'hospital') {
      socket.join(`hospital:${userId}`);
      this.hospitalRooms.set(userId, [userId]);
      this.userRooms.get(userId).push(`hospital:${userId}`);
    } else if (userRole === 'doctor' && socket.user.hospital) {
      socket.join(`hospital:${socket.user.hospital}`);
      this.userRooms.get(userId).push(`hospital:${socket.user.hospital}`);
    } else if (userRole === 'patient') {
      // Patients can join hospital rooms for their appointments/admissions
      socket.join(`patient:${userId}`);
      this.userRooms.get(userId).push(`patient:${userId}`);
    }
    
    // Emit user online status
    this.io.to(`role:${userRole}`).emit('user:online', {
      userId,
      user: {
        id: socket.user._id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        role: socket.user.role
      },
      timestamp: new Date()
    });
  }

  handleDisconnection(socket) {
    if (!socket.user) {
      console.log(`🔌 Anonymous user disconnected: ${socket.id}`);
      return;
    }
    
    const userId = socket.user._id.toString();
    const userRole = socket.user.role;
    console.log(`🔌 User disconnected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user.role})`);
    
    // Remove from connected users
    this.connectedUsers.delete(userId);
    this.userRooms.delete(userId);
    
    // Emit user offline status
    this.io.to(`role:${userRole}`).emit('user:offline', {
      userId,
      timestamp: new Date()
    });
  }

  setupUserEvents(socket) {
    // User typing indicator
    socket.on('typing:start', (data) => {
      const { room, message } = data;
      socket.to(room).emit('typing:start', {
        userId: socket.user._id,
        user: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        },
        message
      });
    });

    socket.on('typing:stop', (data) => {
      const { room } = data;
      socket.to(room).emit('typing:stop', {
        userId: socket.user._id
      });
    });

    // User status updates
    socket.on('status:update', (data) => {
      const { status, message } = data;
      this.io.to(`role:${socket.user.role}`).emit('user:status:update', {
        userId: socket.user._id,
        status,
        message,
        timestamp: new Date()
      });
    });
  }

  setupHospitalEvents(socket) {
    if (socket.user.role !== 'hospital') return;

    // Hospital capacity updates
    socket.on('hospital:capacity:update', async (data) => {
      const { departmentId, capacity } = data;
      this.io.to(`hospital:${socket.user._id}`).emit('hospital:capacity:updated', {
        departmentId,
        capacity,
        updatedBy: socket.user._id,
        timestamp: new Date()
      });
    });

    // Hospital announcements
    socket.on('hospital:announcement:create', async (data) => {
      const { title, message, priority, targetAudience } = data;
      const announcement = {
        id: Date.now().toString(),
        title,
        message,
        priority,
        createdBy: socket.user._id,
        timestamp: new Date()
      };

      // Broadcast to appropriate audience
      if (targetAudience === 'all') {
        this.io.to(`hospital:${socket.user._id}`).emit('hospital:announcement:new', announcement);
      } else if (targetAudience === 'staff') {
        this.io.to(`hospital:${socket.user._id}`).emit('hospital:announcement:new', announcement);
      } else if (targetAudience === 'patients') {
        // Send to patients with active appointments/admissions
        this.io.to(`hospital:${socket.user._id}`).emit('hospital:announcement:new', announcement);
      }
    });

    // Hospital emergency alerts
    socket.on('hospital:emergency:alert', async (data) => {
      const { type, message, priority, location } = data;
      const alert = {
        id: Date.now().toString(),
        type,
        message,
        priority,
        location,
        hospitalId: socket.user._id,
        timestamp: new Date()
      };

      // Broadcast emergency alert to all hospital staff
      this.io.to(`hospital:${socket.user._id}`).emit('hospital:emergency:alert', alert);
      
      // Also send to emergency response system
      this.io.to('emergency:response').emit('emergency:alert', alert);
    });

    // Bed availability updates
    socket.on('bed:status:update', async (data) => {
      const { bedId, status, reason, updatedBy } = data;
      const update = {
        bedId,
        status,
        reason,
        updatedBy: updatedBy || socket.user._id,
        timestamp: new Date()
      };

      // Broadcast to hospital staff
      this.io.to(`hospital:${socket.user._id}`).emit('bed:status:updated', update);
      
      // Also send to patients if bed becomes available
      if (status === 'available') {
        this.io.to('patients:waiting').emit('bed:available', update);
      }
    });

    // Doctor availability updates
    socket.on('doctor:availability:update', async (data) => {
      const { doctorId, availability, reason } = data;
      const update = {
        doctorId,
        availability,
        reason,
        updatedBy: socket.user._id,
        timestamp: new Date()
      };

      // Broadcast to hospital staff
      this.io.to(`hospital:${socket.user._id}`).emit('doctor:availability:updated', update);
      
      // Send to patients with appointments
      this.io.to(`doctor:${doctorId}`).emit('doctor:availability:updated', update);
    });

    // Department status updates
    socket.on('department:status:update', async (data) => {
      const { departmentId, status, waitTime, capacity } = data;
      const update = {
        departmentId,
        status,
        waitTime,
        capacity,
        updatedBy: socket.user._id,
        timestamp: new Date()
      };

      // Broadcast to hospital staff
      this.io.to(`hospital:${socket.user._id}`).emit('department:status:updated', update);
      
      // Send to patients
      this.io.to('patients:waiting').emit('department:status:updated', update);
    });

    // Hospital service updates
    socket.on('hospital:service:update', async (data) => {
      const { serviceId, status, availability, waitTime } = data;
      const update = {
        serviceId,
        status,
        availability,
        waitTime,
        updatedBy: socket.user._id,
        timestamp: new Date()
      };

      // Broadcast to all connected users
      this.io.to(`hospital:${socket.user._id}`).emit('hospital:service:updated', update);
    });
  }

  setupPatientEvents(socket) {
    if (socket.user.role !== 'patient') return;

    // Patient location updates (for emergency tracking)
    socket.on('patient:location:update', (data) => {
      const { latitude, longitude, timestamp } = data;
      this.io.to(`patient:${socket.user._id}`).emit('patient:location:updated', {
        patientId: socket.user._id,
        location: { latitude, longitude },
        timestamp
      });
    });

    // Patient emergency request
    socket.on('patient:emergency:request', async (data) => {
      const { type, description, location, severity } = data;
      const emergencyRequest = {
        id: Date.now().toString(),
        patientId: socket.user._id,
        patient: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          phone: socket.user.phone
        },
        type,
        description,
        location,
        severity,
        timestamp: new Date()
      };

      // Send to emergency response system
      this.io.to('emergency:response').emit('emergency:request', emergencyRequest);
      
      // Also send to nearby hospitals
      this.io.to('hospital:nearby').emit('emergency:request', emergencyRequest);
    });

    // Patient appointment requests
    socket.on('patient:appointment:request', async (data) => {
      const { hospitalId, department, appointmentType, preferredDate, symptoms } = data;
      const appointmentRequest = {
        id: Date.now().toString(),
        patientId: socket.user._id,
        patient: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          phone: socket.user.phone
        },
        hospitalId,
        department,
        appointmentType,
        preferredDate,
        symptoms,
        timestamp: new Date()
      };

      // Send to specific hospital
      this.io.to(`hospital:${hospitalId}`).emit('appointment:request', appointmentRequest);
    });
  }

  setupEmergencyEvents(socket) {
    // Join emergency response room for all users
    socket.join('emergency:response');

    // Emergency call handling
    socket.on('emergency:call:create', async (data) => {
      const { caller, emergencyType, location, description, priority } = data;
      const emergencyCall = {
        id: Date.now().toString(),
        caller,
        emergencyType,
        location,
        description,
        priority,
        status: 'received',
        timestamp: new Date()
      };

      // Broadcast to all emergency responders
      this.io.to('emergency:response').emit('emergency:call:new', emergencyCall);
      
      // Send to nearby hospitals
      this.io.to('hospital:nearby').emit('emergency:call:new', emergencyCall);
    });

    // Emergency response updates
    socket.on('emergency:response:update', async (data) => {
      const { emergencyId, status, location, notes } = data;
      const update = {
        emergencyId,
        status,
        location,
        notes,
        updatedBy: socket.user._id,
        timestamp: new Date()
      };

      // Update emergency room
      if (this.emergencyRooms.has(emergencyId)) {
        this.io.to(`emergency:${emergencyId}`).emit('emergency:response:updated', update);
      }
      
      // Also broadcast to emergency response system
      this.io.to('emergency:response').emit('emergency:response:updated', update);
    });
  }

  setupAppointmentEvents(socket) {
    // Join appointment-specific rooms
    socket.on('appointment:join', (data) => {
      const { appointmentId } = data;
      socket.join(`appointment:${appointmentId}`);
      
      if (!this.userRooms.has(socket.user._id.toString())) {
        this.userRooms.set(socket.user._id.toString(), []);
      }
      this.userRooms.get(socket.user._id.toString()).push(`appointment:${appointmentId}`);
    });

    // Real-time slot locking for step 2 (Date & Time)
    socket.on('slot:lock', async (data) => {
      const { doctorId, date, time, patientId, duration = 30 } = data;
      const slotKey = `${doctorId}:${date}:${time}`;
      
      try {
        // Check if slot is available
        const existingAppointment = await Appointment.findOne({
          doctor: doctorId,
          scheduledDate: new Date(date),
          scheduledTime: time,
          status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });

        if (existingAppointment) {
          socket.emit('slot:lock:failed', {
            message: 'Slot is no longer available',
            doctorId,
            date,
            time
          });
          return;
        }

        // Lock the slot temporarily (5 minutes)
        const lockData = {
          doctorId,
          date,
          time,
          patientId,
          lockedAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          duration
        };

        // Store lock in memory (in production, use Redis)
        if (!this.slotLocks) this.slotLocks = new Map();
        this.slotLocks.set(slotKey, lockData);

        // Broadcast slot locked to all users viewing this doctor's calendar
        this.io.to(`doctor:${doctorId}`).emit('slot:locked', lockData);
        
        // Confirm lock to the requesting user
        socket.emit('slot:locked', lockData);

        // Auto-unlock after 5 minutes
        setTimeout(() => {
          if (this.slotLocks.has(slotKey)) {
            this.slotLocks.delete(slotKey);
            this.io.to(`doctor:${doctorId}`).emit('slot:unlocked', {
              doctorId,
              date,
              time
            });
          }
        }, 5 * 60 * 1000);

      } catch (error) {
        console.error('Error locking slot:', error);
        socket.emit('slot:lock:failed', {
          message: 'Failed to lock slot',
          doctorId,
          date,
          time
        });
      }
    });

    // Release slot lock
    socket.on('slot:unlock', (data) => {
      const { doctorId, date, time } = data;
      const slotKey = `${doctorId}:${date}:${time}`;
      
      if (this.slotLocks && this.slotLocks.has(slotKey)) {
        this.slotLocks.delete(slotKey);
        
        // Broadcast slot unlocked
        this.io.to(`doctor:${doctorId}`).emit('slot:unlocked', {
          doctorId,
          date,
          time
        });
      }
    });

    // Join doctor's calendar room
    socket.on('join-doctor-calendar', (data) => {
      const { doctorId } = data;
      socket.join(`doctor:${doctorId}`);
      console.log(`Client ${socket.id} joined doctor calendar: ${doctorId}`);
    });

    // Leave doctor's calendar room
    socket.on('leave-doctor-calendar', (data) => {
      const { doctorId } = data;
      socket.leave(`doctor:${doctorId}`);
      console.log(`Client ${socket.id} left doctor calendar: ${doctorId}`);
    });

    // Join patient room
    socket.on('join-patient-room', (data) => {
      const { patientId } = data;
      socket.join(`patient:${patientId}`);
      console.log(`Client ${socket.id} joined patient room: ${patientId}`);
    });

    // Join patients room for general updates
    socket.on('join-patients-room', () => {
      socket.join('patients');
      console.log(`Client ${socket.id} joined patients room`);
    });



    // Join doctor's calendar room for real-time updates
    socket.on('doctor:calendar:join', (data) => {
      const { doctorId } = data;
      socket.join(`doctor:${doctorId}`);
      
      if (!this.userRooms.has(socket.user._id.toString())) {
        this.userRooms.set(socket.user._id.toString(), []);
      }
      this.userRooms.get(socket.user._id.toString()).push(`doctor:${doctorId}`);
    });

    // Real-time payment processing for step 3
    socket.on('payment:initiate', async (data) => {
      const { appointmentId, paymentMethod, amount } = data;
      
      try {
        // Emit payment initiation event
        this.io.to(`appointment:${appointmentId}`).emit('payment:initiated', {
          appointmentId,
          paymentMethod,
          amount,
          timestamp: new Date()
        });

        // If online payment, create Razorpay order
        if (paymentMethod === 'online') {
          // This will be handled by the payment service
          socket.emit('payment:order:created', {
            appointmentId,
            paymentMethod,
            amount,
            timestamp: new Date()
          });
        } else {
          // Offline payment confirmation
          socket.emit('payment:offline:confirmed', {
            appointmentId,
            paymentMethod,
            amount,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error initiating payment:', error);
        socket.emit('payment:failed', {
          appointmentId,
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    // Payment verification
    socket.on('payment:verify', async (data) => {
      const { appointmentId, paymentId, signature } = data;
      
      try {
        // Emit payment verification event
        this.io.to(`appointment:${appointmentId}`).emit('payment:verifying', {
          appointmentId,
          timestamp: new Date()
        });

        // Payment verification will be handled by the payment service
        // For now, emit success (in real implementation, verify with Razorpay)
        setTimeout(() => {
          this.io.to(`appointment:${appointmentId}`).emit('payment:verified', {
            appointmentId,
            paymentId,
            timestamp: new Date()
          });
        }, 2000);

      } catch (error) {
        console.error('Error verifying payment:', error);
        socket.emit('payment:verification:failed', {
          appointmentId,
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    // Appointment confirmation for step 4
    socket.on('appointment:confirm', async (data) => {
      const { appointmentId, patientNotes, emergencyContact } = data;
      
      try {
        // Update appointment with final details
        const appointment = await Appointment.findById(appointmentId);
        if (appointment) {
          appointment.patientNotes = patientNotes;
          appointment.emergencyContact = emergencyContact;
          appointment.status = 'confirmed';
          appointment.confirmedAt = new Date();
          await appointment.save();

          // Emit appointment confirmed event
          this.io.to(`appointment:${appointmentId}`).emit('appointment:confirmed', {
            appointmentId,
            appointment,
            timestamp: new Date()
          });

          // Send notification to patient
          this.sendNotification(appointment.patient, {
            type: 'appointment_confirmed',
            title: 'Appointment Confirmed!',
            message: `Your appointment has been confirmed successfully. You will receive a confirmation email shortly.`,
            data: { appointmentId, appointment }
          });

          // Send notification to doctor
          this.sendNotification(appointment.doctor, {
            type: 'new_appointment',
            title: 'New Appointment Booked',
            message: `New appointment booked by ${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
            data: { appointmentId, appointment }
          });
        }
      } catch (error) {
        console.error('Error confirming appointment:', error);
        socket.emit('appointment:confirmation:failed', {
          appointmentId,
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    // Appointment status updates
    socket.on('appointment:status:update', async (data) => {
      const { appointmentId, status, notes } = data;
      const update = {
        appointmentId,
        status,
        notes,
        updatedBy: socket.user._id,
        timestamp: new Date()
      };

      // Update appointment room
      this.io.to(`appointment:${appointmentId}`).emit('appointment:status:updated', update);
      
      // Also send notification to patient
      try {
        const appointment = await Appointment.findById(appointmentId).populate('patient');
        if (appointment && appointment.patient) {
          this.sendNotification(appointment.patient._id, {
            type: 'appointment_update',
            title: 'Appointment Update',
            message: `Your appointment status has been updated to: ${status}`,
            data: { appointmentId, status }
          });
        }
      } catch (error) {
        console.error('Error sending appointment notification:', error);
      }
    });

    // Appointment messages
    socket.on('appointment:message:send', async (data) => {
      const { appointmentId, message, type = 'text' } = data;
      const messageData = {
        id: Date.now().toString(),
        appointmentId,
        message,
        type,
        sender: {
          id: socket.user._id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          role: socket.user.role
        },
        timestamp: new Date()
      };

      // Send to appointment room
      this.io.to(`appointment:${appointmentId}`).emit('appointment:message:new', messageData);
    });

    // Real-time appointment progress tracking
    socket.on('appointment:progress:update', (data) => {
      const { appointmentId, step, progress } = data;
      
      this.io.to(`appointment:${appointmentId}`).emit('appointment:progress:updated', {
        appointmentId,
        step,
        progress,
        timestamp: new Date()
      });
    });
  }

  setupAdmissionEvents(socket) {
    // Join admission-specific rooms
    socket.on('admission:join', (data) => {
      const { admissionId } = data;
      socket.join(`admission:${admissionId}`);
      
      if (!this.userRooms.has(socket.user._id.toString())) {
        this.userRooms.set(socket.user._id.toString(), []);
      }
      this.userRooms.get(socket.user._id.toString()).push(`admission:${admissionId}`);
    });

    // Admission status updates
    socket.on('admission:status:update', async (data) => {
      const { admissionId, status, notes } = data;
      const update = {
        admissionId,
        status,
        notes,
        updatedBy: socket.user._id,
        timestamp: new Date()
      };

      // Update admission room
      this.io.to(`admission:${admissionId}`).emit('admission:status:updated', update);
    });

    // Vital signs updates
    socket.on('admission:vitals:update', async (data) => {
      const { admissionId, vitals } = data;
      const update = {
        admissionId,
        vitals,
        recordedBy: socket.user._id,
        timestamp: new Date()
      };

      // Update admission room
      this.io.to(`admission:${admissionId}`).emit('admission:vitals:updated', update);
    });
  }

  // Utility methods for external use
  sendNotification(userId, notification) {
    const socket = this.connectedUsers.get(userId.toString());
    if (socket) {
      socket.emit('notification:new', notification);
    }
  }

  notifyUser(userId, event, payload) {
    const socket = this.connectedUsers.get(userId.toString());
    if (socket) {
      socket.emit(event, payload);
    }
  }

  broadcastToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  broadcastToHospital(hospitalId, event, data) {
    this.io.to(`hospital:${hospitalId}`).emit(event, data);
  }

  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users by role
  getUsersByRole(role) {
    const users = [];
    for (const [userId, socket] of this.connectedUsers) {
      if (socket.user.role === role) {
        users.push({
          id: userId,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          role: socket.user.role
        });
      }
    }
    return users;
  }

  // Get hospital staff
  getHospitalStaff(hospitalId) {
    const staff = [];
    for (const [userId, socket] of this.connectedUsers) {
      if (socket.user.role === 'doctor' && socket.user.hospital?.toString() === hospitalId.toString()) {
        staff.push({
          id: userId,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          specialization: socket.user.specialization
        });
      }
    }
    return staff;
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService; 