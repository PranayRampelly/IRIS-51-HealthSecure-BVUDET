import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['record_activity']
  },
  action: {
    type: String,
    required: true,
    enum: ['downloaded', 'shared', 'proof_created', 'link_copied', 'printed']
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ recordId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ type: 1, action: 1, timestamp: -1 });

// Add method to get recent activities for a record
activityLogSchema.statics.getRecentActivities = async function(recordId, limit = 10) {
  return this.find({ recordId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name role')
    .lean();
};

// Add method to get user activity summary
activityLogSchema.statics.getUserActivitySummary = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    }
  ]);
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog; 