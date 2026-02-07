import AccessLog from '../models/AccessLog.js';
import { notifyUser } from '../services/notificationService.js';

function getClientIp(req) {
  const xff = req?.headers?.['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req?.ip || req?.connection?.remoteAddress || 'unknown';
}

export const logAccess = async (userId, action, resourceType, resourceId = null, targetUserId = null, req = null, details = '') => {
  try {
    const logData = {
      userId,
      action,
      resourceType,
      resourceId,
      targetUserId,
      ipAddress: getClientIp(req),
      userAgent: req?.get('User-Agent') || 'unknown',
      timestamp: new Date(),
      details,
    };

    const log = await AccessLog.create(logData);
    notifyUser(userId.toString(), {
      type: 'access-log:new',
      data: log
    });
  } catch (error) {
    console.error('Error logging access:', error);
  }
};

export const getAccessLogs = async (userId, filters = {}) => {
  try {
    const query = { userId };
    
    if (filters.action) query.action = filters.action;
    if (filters.resourceType) query.resourceType = filters.resourceType;
    if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
      if (query.timestamp) {
        query.timestamp.$lte = new Date(filters.endDate);
      } else {
        query.timestamp = { $lte: new Date(filters.endDate) };
      }
    }

    const logs = await AccessLog.find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0);

    return logs;
  } catch (error) {
    console.error('Error getting access logs:', error);
    throw error;
  }
};

// Simple logger for general use
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()}: ${message}`),
  debug: (message) => console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`)
};

export default logger; 