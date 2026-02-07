import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  checkEmailVerified,
  resendEmailVerification,
  setup2FA,
  verify2FA,
  getSessions,
  revokeSession,
  login2FA,
  logout,
  logoutAll,
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  generateWebAuthnAuthOptions,
  verifyWebAuthnAuth,
  getUsersByRole
} from '../controllers/authController.js';
import { getAccessLogs } from '../controllers/accessLogController.js';
import { auth } from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserLogin
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.get('/verify-email', verifyEmail);
router.get('/check-email-verified', checkEmailVerified);
router.post('/resend-verification', resendEmailVerification);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

// 2FA routes
router.post('/2fa/setup', setup2FA); // Allow unauthenticated access for onboarding
// Protected route
router.post('/2fa/verify', verify2FA); // Allow unauthenticated access for onboarding
router.post('/2fa/login', login2FA);

// WebAuthn biometric registration (must be logged in)
router.post('/webauthn/register/options', auth, generateWebAuthnRegistrationOptions);
router.post('/webauthn/register/verify', auth, verifyWebAuthnRegistration);
// WebAuthn biometric authentication (public, userId in body)
router.post('/webauthn/authenticate/options', generateWebAuthnAuthOptions);
router.post('/webauthn/authenticate/verify', verifyWebAuthnAuth);

// Session management
router.get('/sessions', auth, getSessions);
router.post('/sessions/revoke', auth, revokeSession);
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);

// Access logs
router.get('/access-logs', auth, getAccessLogs);

// Get users by role
router.get('/users', auth, getUsersByRole);

// Test route for debugging
router.get('/test', (req, res) => res.json({ message: 'Test route works!' }));

// Test JSON body parsing
router.post('/test-json', (req, res) => {
  console.log('Test JSON body:', req.body);
  res.json({ body: req.body });
});

export default router; 