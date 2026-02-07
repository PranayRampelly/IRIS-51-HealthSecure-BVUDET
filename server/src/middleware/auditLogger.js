// auditLogger.js
import VaultAudit from '../models/VaultAudit.js';
import crypto from 'crypto';

// Helper to get previous log hash for tamper-evidence
async function getLastLogHash() {
  const last = await VaultAudit.findOne().sort({ timestamp: -1 });
  return last ? last.hash : null;
}

// Audit logger middleware factory
function auditLogger(action) {
  return (req, res, next) => {
    // Create a function to log after response is sent
    const logAction = async () => {
      try {
        const user = req.user ? req.user._id : null;
        const role = req.user ? req.user.role : null;
        const device = req.headers['user-agent'] || 'unknown';
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const timestamp = new Date();
        const outcome = res.statusCode;
        const prevHash = await getLastLogHash();
        const logString = JSON.stringify({ user, role, action, device, ip, timestamp, outcome, prevHash });
        const hash = crypto.createHash('sha256').update(logString).digest('hex');
        
        await VaultAudit.create({
          user,
          role,
          action,
          device,
          ip,
          timestamp,
          outcome,
          prevHash,
          hash,
        });
      } catch (err) {
        console.error('Audit logging error:', err);
      }
    };

    // Add listener for when response is finished
    res.on('finish', logAction);
    next();
  };
}

export default auditLogger; 