import speakeasy from 'speakeasy';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// In-memory brute-force tracker (replace with Redis/DB in prod)
const attemptTracker = {};
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export default async function twoFactorAuth(req, res, next) {
  try {
    const code = req.body.code || req.body.twoFACode;
    const backupCode = req.body.backupCode;
    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up' });
    }
    if (backupCode) {
      // Check backup codes
      const matches = await Promise.all((user.backupCodes || []).map(async (hashed) => await bcrypt.compare(backupCode, hashed)));
      const match = matches.some(Boolean);
      if (!match) {
        return res.status(400).json({ message: 'Invalid backup code' });
      }
      return next();
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
    next();
  } catch (error) {
    res.status(500).json({ message: '2FA verification failed', error: error.message });
  }
} 