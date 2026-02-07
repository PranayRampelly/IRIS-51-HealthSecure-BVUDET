import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import crypto from 'crypto';
import { initSlotSocket } from '../appointments/services/slotSocketService.js';

import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { handleUploadError } from './middleware/upload.js';
import realtimeService from './services/realtimeService.js';
import { startEnvironmentScheduler } from './services/environmentScheduler.js';
import onlineLearningManager from './services/online_learning_manager.js';

// Import routes
import authRoutes from './routes/auth.js';
import healthRecordRoutes from './routes/healthRecords.js';
import proofRoutes from './routes/proofs.js';
import proofRequestRoutes from './routes/proofRequests.js';
import proofValidationRoutes from './routes/proofValidation.js';
import doctorRoutes from './routes/doctor.js';
import patientRoutes from './routes/patient.js';
import accessLogRoutes from './routes/accessLogs.js';
import activityLogRoutes from './routes/activityLogs.js';
import vaultRoutes from './routes/vault.js'; // Document Vault
import proofTemplateRoutes from './routes/proofTemplates.js';
import healthCoachRoutes from './routes/healthCoach.js';
import doctorsRouter from './routes/doctors.js';
import appointmentsRouter from './routes/appointments.js';
import insuranceClaimRoutes from './routes/insuranceClaims.js';
import insuranceDashboardRoutes from './routes/insuranceDashboard.js';
import insurancePolicyRoutes from './routes/insurancePolicies.js';
import insuranceApplicationRoutes from './routes/insuranceApplications.js';
import insurancePatientRoutes from './routes/insurancePatients.js';
import patientPolicyRoutes from './routes/patientPolicies.js';
import patientInsuranceClaimsRoutes from './routes/patientInsuranceClaims.js';
import analyticsRoutes from './routes/analytics.js';
import adminUserRoutes from './routes/adminUsers.js';
import adminAuditLogRoutes from './routes/adminAuditLogs.js';
import adminDashboardRoutes from './routes/adminDashboard.js';
import systemHealthRoutes from './routes/systemHealth.js';
import hospitalRoutes from './routes/hospital.js';
import hospitalCareRoutes from './routes/hospitalCare.js';
import patientHospitalRoutes from './routes/patientHospital.js';
import hospitalServicesRoutes from './routes/hospitalServices.js';
import hospitalPatientsRoutes from './routes/hospitalPatients.js';
import hospitalAnalyticsRoutes from './routes/hospitalAnalytics.js';
import hospitalSettingsRoutes from './routes/hospitalSettings.js';
import aiRoutes from './routes/aiRoutes.js';
import slotsRoutes from './routes/slots.js';
import userRoutes from './routes/user.js';
import doctorAvailabilityRoutes from './routes/doctorAvailability.js';
import doctorScheduleRoutes from './routes/doctorSchedule.js';
import timeSlotRoutes from './routes/timeSlots.js';
import paymentRoutes from './routes/payments.js';
import bloodInventoryRoutes from './routes/bloodInventory.js';
import bloodDonorRoutes from './routes/bloodDonor.js';
import bloodRequestRoutes from './routes/bloodRequest.js';
import qualityControlRoutes from './routes/qualityControl.js';
import pharmacyRoutes from './routes/pharmacy.js';
import supplierRoutes from './routes/suppliers.js';
import customerRoutes from './routes/customers.js';
import reportsRoutes from './routes/reports.js';
import patientCartRoutes from './routes/patientCart.js';
import patientPharmacyRoutes from './routes/patientPharmacy.js';
import ambulanceRoutes from './routes/ambulance.js';
import ambulanceRoutePlanningRoutes from './routes/ambulanceRoutes.js';
import dispatchRoutes from './routes/dispatchRoutes.js';
import hospitalAmbulanceRoutes from './routes/hospitalAmbulance.js';
import bedAvailabilityRoutes from './routes/bedAvailability.js';
import bioAuraRoutes from './routes/bioAura.js';
import bloodbankRoutes from './routes/bloodbank.js';
import hospitalDischargeRoutes from './routes/hospitalDischarge.js';

import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Debug: Print JWT secret at runtime
console.log('JWT_SECRET at runtime:', process.env.JWT_SECRET);

// Database connection will be handled in startServer()

// Trust proxy settings for rate limiting (must be first)
// Only trust proxy in production with proper reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.enable('trust proxy');
} else {
  // In development, don't trust proxy to avoid rate limiter warnings
  app.set('trust proxy', false);
}

// Basic middleware (configured once below)

// Add request ID and IP middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  req.realIp = req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://healthsecuree.netlify.app',
      'https://healthsecure.netlify.app',
      'https://heathsecure1.vercel.app',
      'https://healthsecure.vercel.app',
      /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview deployments
      /^https:\/\/.*\.onrender\.com$/ // Allow Render deployments
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 minutes
};

app.use(cors(corsOptions));

// Handle preflight requests for PATCH method
app.options('*', cors(corsOptions));

// Remove or comment out the following lines to disable global API rate limiting:
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     message: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use('/api/', limiter);

// Body parsing middleware with size limits (single registration)
app.use(express.json({
  limit: '10mb',
  strict: false, // allow primitives like strings, numbers for JSON bodies
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 10000
}));

// Additional security headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "wss:", "https:"]
  }
}));

app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.xssFilter());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Disable caching for API responses to avoid 304 with empty body issues in SPA
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint for patient policies
app.get('/api/test-policies', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: {
      policies: [],
      statistics: {
        totalPolicies: 0,
        activePolicies: 0,
        totalPremium: 0,
        totalCoverage: 0
      }
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/proofs', proofRoutes);
app.use('/api/proof-requests', proofRequestRoutes);
app.use('/api/proof-validation', proofValidationRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/access-logs', accessLogRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/vault', vaultRoutes); // Document Vault
app.use('/api/proof-templates', proofTemplateRoutes);
app.use('/api/health-coach', healthCoachRoutes);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);

// Insurance routes - order matters!
app.use('/api/insurance/applications', insuranceApplicationRoutes); // Put this first
app.use('/api/insurance/dashboard', insuranceDashboardRoutes);
app.use('/api/insurance', insurancePolicyRoutes);
app.use('/api/insurance', insuranceClaimRoutes);
app.use('/api/insurance/patients', insurancePatientRoutes);

// Patient policy routes - must come after general patient routes
app.use('/api/patient', patientPolicyRoutes);
app.use('/api/patient/insurance-claims', patientInsuranceClaimsRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Admin routes
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/audit-logs', adminAuditLogRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/system-health', systemHealthRoutes);

// Hospital ambulance & dispatch routes (specific paths must be registered before generic /api/hospital handlers)
app.use('/api/hospital/ambulance/routes', ambulanceRoutePlanningRoutes);
app.use('/api/hospital/ambulance/dispatch', dispatchRoutes);
app.use('/api/hospital/ambulance', hospitalAmbulanceRoutes);

// Hospital routes
app.use('/api/hospital', hospitalRoutes);
app.use('/api/hospital', hospitalCareRoutes);
app.use('/api/hospital/discharges', hospitalDischargeRoutes);

// Hospital Patients routes
app.use('/api/hospital/patients', hospitalPatientsRoutes);

// Hospital Analytics routes
app.use('/api/hospital/analytics', hospitalAnalyticsRoutes);

// Hospital Settings routes
app.use('/api/hospital/settings', hospitalSettingsRoutes);

// Hospital Services routes
app.use('/api/hospital-services', hospitalServicesRoutes);

// Patient-Hospital interaction routes
app.use('/api/patient', patientHospitalRoutes);

// Bed Availability routes
app.use('/api/patient/bed-availability', bedAvailabilityRoutes);

// AI Assistant routes
app.use('/api/ai', aiRoutes);
app.use('/api/slots', slotsRoutes);

// User routes
app.use('/api/user', userRoutes);

// Doctor availability routes
app.use('/api/doctor-availability', doctorAvailabilityRoutes);

// Doctor schedule routes
app.use('/api/doctor/schedule', doctorScheduleRoutes);
app.use('/api/time-slots', timeSlotRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Blood Inventory routes
app.use('/api/blood-inventory', bloodInventoryRoutes);

// Blood Donor routes
app.use('/api/blood-donors', bloodDonorRoutes);

// Blood Request routes
app.use('/api/blood-requests', bloodRequestRoutes);

// Quality Control routes
app.use('/api/quality-control', qualityControlRoutes);

// Pharmacy routes
app.use('/api/pharmacy', pharmacyRoutes);

// Supplier routes
app.use('/api/pharmacy/suppliers', supplierRoutes);

// Customer routes
app.use('/api/pharmacy/customers', customerRoutes);

// Reports routes
app.use('/api/pharmacy/reports', reportsRoutes);

// Patient Cart routes
app.use('/api/patient', patientCartRoutes);
app.use('/api/patient/pharmacy', patientPharmacyRoutes);

// BioAura intelligence routes
app.use('/api/bioaura', bioAuraRoutes);

// Blood Bank routes
app.use('/api/bloodbank', bloodbankRoutes);

// Ambulance routes
app.use('/api/ambulance', ambulanceRoutes);

// Debug: Log all registered routes
console.log('🔍 Registered routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`🔍 ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`🔍 ${Object.keys(handler.route.methods)} ${handler.route.path}`);
      }
    });
  }
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'Proof Health Nexus API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      healthRecords: '/api/health-records',
      proofs: '/api/proofs',
      proofRequests: '/api/proof-requests',
      doctor: '/api/doctor',
      patient: '/api/patient',
      hospital: '/api/hospital',
      accessLogs: '/api/access-logs',
      insuranceClaims: '/api/insurance/claims',
      adminDashboard: '/api/admin/dashboard'
    }
  });
});

// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token or no token provided'
    });
  }

  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

// Handle upload errors first
app.use(handleUploadError);

// Handle 404s
app.use(notFound);

// Handle all other errors
app.use(errorHandler);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e8, // 100 MB
  allowRequest: (req, callback) => {
    // Allow all requests for now, you can add authentication here later
    callback(null, true);
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle authentication
  socket.on('authenticate', (data) => {
    try {
      // You can add JWT verification here if needed
      console.log('Client authenticated:', socket.id);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authentication_error', { error: 'Authentication failed' });
    }
  });

  // Handle appointment events
  socket.on('join-appointment-room', (appointmentId) => {
    socket.join(`appointment-${appointmentId}`);
    console.log(`Client ${socket.id} joined appointment room: ${appointmentId}`);
  });

  socket.on('leave-appointment-room', (appointmentId) => {
    socket.leave(`appointment-${appointmentId}`);
    console.log(`Client ${socket.id} left appointment room: ${appointmentId}`);
  });

  socket.on('join-doctor-room', (doctorId) => {
    socket.join(`doctor-${doctorId}`);
    console.log(`Client ${socket.id} joined doctor room: ${doctorId}`);
  });

  socket.on('leave-doctor-room', (doctorId) => {
    socket.leave(`doctor-${doctorId}`);
    console.log(`Client ${socket.id} left doctor room: ${doctorId}`);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io available globally for other modules
global.io = io;

// Initialize comprehensive real-time service for patient-hospital communication
realtimeService.initialize(server, io);

// Initialize legacy slot socket service
initSlotSocket(realtimeService.io);

// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket server ready on ws://localhost:${PORT}`);

      // Start Environment Agent scheduler
      startEnvironmentScheduler();
      console.log(`🌍 Environment Agent scheduler started`);

      // Start Online Learning Service
      onlineLearningManager.start('continuous', 1, 24);
      console.log(`🤖 Online Learning Service started (collect: 1h, train: 24h)`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection:', err);
  // Log the error but don't exit
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Log the error but don't exit
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');

  // Stop online learning service
  onlineLearningManager.stop();

  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

export default app;

