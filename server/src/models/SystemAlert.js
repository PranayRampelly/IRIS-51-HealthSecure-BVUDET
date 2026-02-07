import mongoose from 'mongoose';

const systemAlertSchema = new mongoose.Schema({
    severity: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'critical'],
        index: true
    },
    message: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ['system', 'database', 'security', 'service', 'performance', 'other'],
        default: 'other'
    },
    // Alert details
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    // Threshold information
    threshold: {
        metric: String,
        value: Number,
        currentValue: Number
    },
    // Resolution tracking
    resolved: {
        type: Boolean,
        default: false,
        index: true
    },
    resolvedAt: {
        type: Date
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolutionNotes: {
        type: String
    },
    // Auto-resolution
    autoResolved: {
        type: Boolean,
        default: false
    },
    // Notification tracking
    notificationSent: {
        type: Boolean,
        default: false
    },
    notifiedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Recurrence tracking
    isRecurring: {
        type: Boolean,
        default: false
    },
    occurrenceCount: {
        type: Number,
        default: 1
    },
    lastOccurrence: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
systemAlertSchema.index({ severity: 1, resolved: 1, createdAt: -1 });
systemAlertSchema.index({ service: 1, resolved: 1 });
systemAlertSchema.index({ createdAt: -1 });

// Static method to create or update alert
systemAlertSchema.statics.createOrUpdate = async function (alertData) {
    const { severity, message, service, category, details, threshold } = alertData;

    // Check if similar unresolved alert exists
    const existingAlert = await this.findOne({
        service,
        message,
        resolved: false,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Within last hour
    });

    if (existingAlert) {
        // Update existing alert
        existingAlert.occurrenceCount += 1;
        existingAlert.lastOccurrence = new Date();
        existingAlert.isRecurring = existingAlert.occurrenceCount > 1;

        if (threshold) {
            existingAlert.threshold = threshold;
        }

        await existingAlert.save();
        return existingAlert;
    }

    // Create new alert
    const alert = new this({
        severity,
        message,
        service,
        category: category || 'other',
        details,
        threshold
    });

    await alert.save();
    return alert;
};

// Method to resolve alert
systemAlertSchema.methods.resolve = async function (userId, notes, autoResolved = false) {
    this.resolved = true;
    this.resolvedAt = new Date();
    this.resolvedBy = userId;
    this.resolutionNotes = notes;
    this.autoResolved = autoResolved;

    await this.save();
    return this;
};

// Static method to auto-resolve alerts
systemAlertSchema.statics.autoResolveByCondition = async function (service, condition) {
    const alerts = await this.find({
        service,
        resolved: false,
        ...condition
    });

    for (const alert of alerts) {
        await alert.resolve(null, 'Auto-resolved: condition no longer met', true);
    }

    return alerts.length;
};

// Static method to get active alerts
systemAlertSchema.statics.getActive = async function (filters = {}) {
    return await this.find({
        resolved: false,
        ...filters
    }).sort({ severity: -1, createdAt: -1 }).lean();
};

// Static method to get alert statistics
systemAlertSchema.statics.getStatistics = async function (days = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stats = await this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$severity',
                total: { $sum: 1 },
                resolved: {
                    $sum: { $cond: ['$resolved', 1, 0] }
                },
                unresolved: {
                    $sum: { $cond: ['$resolved', 0, 1] }
                }
            }
        }
    ]);

    return stats;
};

// Cleanup old resolved alerts (keep only last 30 days)
systemAlertSchema.statics.cleanup = async function () {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
        const result = await this.deleteMany({
            resolved: true,
            resolvedAt: { $lt: thirtyDaysAgo }
        });

        console.log(`Cleaned up ${result.deletedCount} old resolved alerts`);
        return result;
    } catch (error) {
        console.error('Error cleaning up alerts:', error);
        throw error;
    }
};

const SystemAlert = mongoose.model('SystemAlert', systemAlertSchema);

export default SystemAlert;
