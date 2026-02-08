import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
import { generateToken } from '../utils/jwt.js';
import { logAccess } from '../utils/logger.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import bcrypt from 'bcryptjs';
import Session from '../models/Session.js';
import AccessLog from '../models/AccessLog.js';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

// In-memory challenge store (replace with Redis/DB for production)
const webauthnChallengeStore = {};

// Helper to generate backup codes
function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // 8-digit numeric code
    codes.push(Math.floor(10000000 + Math.random() * 90000000).toString());
  }
  return codes;
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, ...otherFields } = req.body;

    // Check if user already exists in User or PendingUser
    const existingUser = await User.findOne({ email });
    const existingPending = await PendingUser.findOne({ email });
    if (existingUser || existingPending) {
      return res.status(400).json({ message: 'User already exists or is pending verification' });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    // Prepare pending user data
    let pendingUserData = {
      email,
      password,
      firstName,
      lastName,
      role,
      verificationToken: emailVerificationToken,
      verificationExpires: emailVerificationExpires,
      ...otherFields
    };

    // Add role-specific validation
    if (role === 'patient') {
      if (!otherFields.dateOfBirth || !otherFields.bloodType) {
        return res.status(400).json({
          message: 'Date of birth and blood type are required for patients'
        });
      }
    } else if (role === 'doctor') {
      if (!otherFields.licenseNumber || !otherFields.specialization || !otherFields.hospital) {
        return res.status(400).json({
          message: 'License number, specialization, and hospital are required for doctors'
        });
      }
    } else if (role === 'insurance') {
      if (!otherFields.insurance || !otherFields.insurance.provider) {
        return res.status(400).json({
          message: 'Insurance company/provider is required for insurance signup'
        });
      }
    } else if (role === 'hospital') {
      if (!otherFields.hospitalName || !otherFields.licenseNumber || !otherFields.hospitalType) {
        return res.status(400).json({
          message: 'Hospital name, license number, and hospital type are required for hospital signup'
        });
      }
    } else if (role === 'bloodbank') {
      if (!otherFields.bloodBankName || !otherFields.bloodBankLicense || !otherFields.bloodBankType) {
        return res.status(400).json({
          message: 'Blood bank name, license number, and blood bank type are required for blood bank signup'
        });
      }
    } else if (role === 'researcher') {
      // Researchers don't need specific validation for registration
      // They can complete their profile later
    } else if (role === 'pharmacy') {
      if (!otherFields.pharmacyName || !otherFields.pharmacyLicense) {
        return res.status(400).json({
          message: 'Pharmacy name and license are required for pharmacy signup'
        });
      }
    } else if (role === 'bioaura') {
      if (!otherFields.organization || !otherFields.licenseNumber) {
        return res.status(400).json({
          message: 'Organization and operations license are required for BioAura signup'
        });
      }
    } else if (role === 'admin') {
      // Admin registration should be restricted in production
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          message: 'Admin registration is not allowed in production'
        });
      }
    }

    await PendingUser.create(pendingUserData);

    // Send verification email (always send email, even in development)
    try {
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${emailVerificationToken}`;
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address - HealthSecure',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Email Verification</h2>
            <p>Hi ${firstName},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p style="margin: 20px 0;">
              <a href="${verifyUrl}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verifyUrl}
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 12px;">
              This is an automated message from HealthSecure. Please do not reply to this email.
            </p>
          </div>
        `
      });

      res.status(201).json({
        message: 'Registration initiated. Please check your email to verify your account.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(201).json({
        message: 'Registration successful! Please contact support for email verification.',
        note: 'Email service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role, device } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check role (optional - only validate if role is provided and strict validation is needed)
    // For now, we'll allow login regardless of role to prevent role mismatch errors
    // if (role && user.role !== role) {
    //   return res.status(400).json({ message: 'Role mismatch' });
    // }
    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // MFA check
    if (user.twoFactorEnabled) {
      // Do not issue JWT yet, require 2FA verification
      return res.json({
        message: '2FA required',
        mfaRequired: true,
        userId: user._id
      });
    }
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id, user.role);
    // Create session
    await Session.create({
      userId: user._id,
      device: device || req.headers['user-agent'],
      ip: req.ip
    });
    // Log the login
    await logAccess(user._id, 'LOGIN', 'User', user._id, null, req, 'User logged in successfully');

    // Check if profile is complete based on role
    const isProfileComplete = user.isProfileComplete();

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        patientId: user.patientId, // Include patient ID for patient users
        isEmailVerified: user.isEmailVerified,
        profileComplete: isProfileComplete
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add debugging for profile data based on role
    if (user.role === 'doctor') {
      console.log('Doctor profile data being returned:', {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        licenseNumber: user.licenseNumber,
        specialization: user.specialization,
        hospital: user.hospital,
        department: user.department,
        yearsOfExperience: user.yearsOfExperience,
        bio: user.bio,
        languages: user.languages,
        consultationFees: user.consultationFees,
        availability: user.availability,
        location: user.location,
        specialties: user.specialties,
        emergencyAvailable: user.emergencyAvailable,
        documents: user.documents
      });
    } else if (user.role === 'hospital') {
      console.log('Hospital profile data being returned:', {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        hospitalName: user.hospitalName,
        hospitalType: user.hospitalType,
        licenseNumber: user.licenseNumber,
        emergencyContact: user.emergencyContact,
        bio: user.bio,
        location: user.location,
        documents: user.documents
      });
    } else if (user.role === 'insurance' || user.role === 'researcher') {
      console.log(`${user.role} profile data being returned:`, {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        organization: user.organization,
        bio: user.bio,
        location: user.location,
        documents: user.documents
      });
    }

    res.json(user); // Return all fields except password
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // Remove sensitive fields that shouldn't be updated
    const forbidden = ['password', 'email', 'role', 'isEmailVerified', 'isActive', '_id', 'patientId'];
    forbidden.forEach(f => delete req.body[f]);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email?token=...
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }
    // Find pending user by token
    const pendingUser = await PendingUser.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } });
    if (!pendingUser) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email: pendingUser.email });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create user in main User collection
    const userData = pendingUser.toObject();
    delete userData._id;
    delete userData.verificationToken;
    delete userData.verificationExpires;
    delete userData.createdAt;
    userData.isEmailVerified = true;

    // Remove patientId if it exists (let the pre-save hook generate a new one)
    if (userData.patientId) {
      delete userData.patientId;
    }

    // Use new User() constructor to ensure pre-save hooks run (for patient ID generation)
    const user = new User(userData);
    await user.save();
    // Delete pending user entry
    await PendingUser.deleteOne({ _id: pendingUser._id });
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if email is verified
// @route   GET /api/auth/check-email-verified?email=...
// @access  Public
export const checkEmailVerified = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ verified: false, message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ verified: false, message: 'User not found' });
    res.json({ verified: !!user.isEmailVerified });
  } catch (error) {
    res.status(500).json({ verified: false, message: 'Server error' });
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists in pending users
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ message: 'No pending verification found for this email' });
    }

    // Check if user is already verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    // Update pending user with new token
    await PendingUser.updateOne(
      { email },
      {
        verificationToken: emailVerificationToken,
        verificationExpires: emailVerificationExpires
      }
    );

    // Send verification email
    try {
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${emailVerificationToken}`;
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address - HealthSecure',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Email Verification</h2>
            <p>Hi ${pendingUser.firstName},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p style="margin: 20px 0;">
              <a href="${verifyUrl}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verifyUrl}
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 12px;">
              This is an automated message from HealthSecure. Please do not reply to this email.
            </p>
          </div>
        `
      });

      res.json({ message: 'Verification email sent successfully' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        message: 'Failed to send verification email. Please try again later.',
        note: 'Email service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Setup 2FA (generate secret and QR code)
// @route   POST /api/auth/2fa/setup
// @access  Public (token in body or query for onboarding, or JWT for logged-in users)
export const setup2FA = async (req, res) => {
  try {
    // Debug: Log the request body
    console.log('2FA Setup Request body:', req.body);
    let user;
    const { email, token } = req.body;

    console.log('2FA Setup Request:', { email, token, hasUser: !!req.user });

    if (req.user) {
      // User is authenticated via JWT
      user = await User.findById(req.user._id);
    } else if (email) {
      // Find user by email (for onboarding flow)
      user = await User.findOne({ email });
    } else if (token) {
      // Try to find user by verification token (fallback)
      user = await User.findOne({ emailVerificationToken: token });
    }

    if (!user) {
      console.log('User not found for 2FA setup');
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA already enabled' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `ProofHealth (${user.email})`,
      issuer: 'ProofHealth'
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const otpauthUrl = secret.otpauth_url;
    const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);

    console.log('2FA setup successful for user:', user.email);

    res.json({
      otpauthUrl,
      qrCodeDataURL,
      secret: secret.base32
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify 2FA code and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Public (token in query or body)
export const verify2FA = async (req, res) => {
  try {
    const { code, email, token } = req.body;
    let user;

    console.log('2FA Verify Request:', { email, token, hasUser: !!req.user });

    if (req.user) {
      user = await User.findById(req.user._id);
    } else if (email) {
      // Find user by email (for onboarding flow)
      user = await User.findOne({ email });
    } else if (token) {
      // Try to find user by verification token (fallback)
      user = await User.findOne({ emailVerificationToken: token });
    }

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up' });
    }
    if (!code) {
      return res.status(400).json({ message: '2FA code is required' });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid 2FA code' });
    }

    user.twoFactorEnabled = true;
    user.isFullyActivated = true;

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    user.backupCodes = await Promise.all(backupCodes.map(async c => await bcrypt.hash(c, 10)));
    await user.save();

    console.log('2FA verification successful for user:', user.email);

    res.json({ message: '2FA enabled successfully', backupCodes });
  } catch (error) {
    console.error('2FA verify error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id, revoked: false });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.revoked = true;
    await session.save();

    // Log the session revocation
    await logAccess(req.user._id, 'REVOKE_SESSION', 'Session', sessionId, null, req, 'Session revoked');

    res.json({ message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Log the logout
    await logAccess(req.user._id, 'LOGOUT', 'User', req.user._id, null, req, 'User logged out');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user from all sessions
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAll = async (req, res) => {
  try {
    // Update all active sessions for the user to revoked
    await Session.updateMany(
      { userId: req.user._id, revoked: false },
      { revoked: true }
    );

    // Log the logout from all sessions
    await logAccess(req.user._id, 'LOGOUT_ALL', 'User', req.user._id, null, req, 'User logged out from all sessions');

    res.json({ message: 'Logged out from all sessions successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login2FA = async (req, res) => {
  try {
    const { userId, code, device } = req.body;
    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up' });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });
    if (!verified) {
      return res.status(400).json({ message: 'Invalid 2FA code' });
    }
    // Issue JWT and create session
    const token = generateToken(user._id, user.role);
    await Session.create({
      userId: user._id,
      device: device || req.headers['user-agent'],
      ip: req.ip
    });
    await logAccess(user._id, 'LOGIN_2FA', 'User', user._id, null, req, 'User logged in with 2FA');
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate registration options
export const generateWebAuthnRegistrationOptions = async (req, res) => {
  try {
    console.log('WebAuthn registration: req.user =', req.user);
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('WebAuthn registration: user not found');
      return res.status(404).json({ message: 'User not found' });
    }
    const options = await generateRegistrationOptions({
      rpName: 'HealthSecure',
      rpID: req.hostname,
      userID: Buffer.from(user._id.toString()),
      userName: user.email,
      attestationType: 'indirect',
      authenticatorSelection: { userVerification: 'preferred' },
      excludeCredentials: (user.webauthnCredentials || []).map(cred => ({
        id: Buffer.from(cred.credentialID, 'base64url'),
        type: 'public-key',
        transports: cred.transports || [],
      })),
    });
    console.log('WebAuthn registration: generated options =', options);
    webauthnChallengeStore[user._id] = options.challenge;
    res.json(options);
  } catch (err) {
    console.error('WebAuthn registration error:', err);
    res.status(500).json({ message: 'Failed to generate registration options' });
  }
};

// Verify registration response
export const verifyWebAuthnRegistration = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const expectedChallenge = webauthnChallengeStore[user._id];
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: req.headers.origin,
      expectedRPID: req.hostname,
    });
    if (!verification.verified) return res.status(400).json({ message: 'Registration verification failed' });
    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    user.webauthnCredentials.push({
      credentialID: Buffer.from(credentialID).toString('base64url'),
      publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: req.body.transports || [],
      createdAt: new Date(),
    });
    await user.save();
    delete webauthnChallengeStore[user._id];
    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify registration' });
  }
};

// Generate authentication options
export const generateWebAuthnAuthOptions = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId || req.user?._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const options = generateAuthenticationOptions({
      rpID: req.hostname,
      userVerification: 'preferred',
      allowCredentials: (user.webauthnCredentials || []).map(cred => ({
        id: Buffer.from(cred.credentialID, 'base64url'),
        type: 'public-key',
        transports: cred.transports || [],
      })),
    });
    webauthnChallengeStore[user._id] = options.challenge;
    res.json(options);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate authentication options' });
  }
};

// Verify authentication response
export const verifyWebAuthnAuth = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId || req.user?._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const expectedChallenge = webauthnChallengeStore[user._id];
    const credential = (user.webauthnCredentials || []).find(
      cred => cred.credentialID === req.body.id
    );
    if (!credential) return res.status(400).json({ message: 'Credential not found' });
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: req.headers.origin,
      expectedRPID: req.hostname,
      authenticator: {
        credentialPublicKey: Buffer.from(credential.publicKey, 'base64url'),
        credentialID: Buffer.from(credential.credentialID, 'base64url'),
        counter: credential.counter,
        transports: credential.transports,
      },
    });
    if (!verification.verified) return res.status(400).json({ message: 'Authentication failed' });
    credential.counter = verification.authenticationInfo.newCounter;
    await user.save();
    delete webauthnChallengeStore[user._id];
    // Issue JWT/session as with password login
    const token = generateToken(user._id, user.role);
    res.json({ verified: true, token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify authentication' });
  }
};

// @desc    Get users by role
// @route   GET /api/auth/users
// @access  Private (Admin/Insurance)
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: 'Role parameter is required' });
    }

    // Only allow insurance users to get insurance users, or admin to get any role
    if (req.user.role !== 'admin' && (req.user.role !== 'insurance' || role !== 'insurance')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ role }).select('firstName lastName email _id');

    res.json({
      users,
      count: users.length
    });

    await logAccess(req.user._id, 'VIEW', 'User', null, null, req, `Viewed users with role: ${role}`);
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 