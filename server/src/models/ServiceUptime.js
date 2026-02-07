import mongoose from 'mongoose';

const serviceUptimeSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
        index: true
    },
    serviceType: {
        type: String,
        required: true,
        enum: ['http', 'mongodb', 'cloudinary', 'smtp', 'websocket', 'other']
    },
    port: {
        type: Number
    },
    endpoint: {
        type: String
    },
    // Uptime tracking
    startTime: {
        type: Date,
        default: Date.now
    },
    lastCheckTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['running', 'warning', 'error', 'unknown'],
        default: 'running'
    },
    // Response time tracking
    responseTime: {
        current: { type: Number, default: 0 }, // in milliseconds
        average: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    // Downtime tracking
    downtimeEvents: [{
        startTime: Date,
        endTime: Date,
        duration: Number, // in minutes
        reason: String,
        resolved: { type: Boolean, default: false }
    }],
    totalDowntimeMinutes: {
        type: Number,
        default: 0
    },
    // Statistics
    totalChecks: {
        type: Number,
        default: 0
    },
    successfulChecks: {
        type: Number,
        default: 0
    },
    failedChecks: {
        type: Number,
        default: 0
    },
    // Calculated uptime percentage
    uptimePercentage: {
        type: Number,
        default: 100
    },
    // Last error
    lastError: {
        message: String,
        timestamp: Date
    }
}, {
    timestamps: true
});

// Calculate uptime percentage
serviceUptimeSchema.methods.calculateUptime = function () {
    const totalTime = Date.now() - this.startTime.getTime();
    const totalMinutes = totalTime / (1000 * 60);

    if (totalMinutes === 0) return 100;

    const uptime = ((totalMinutes - this.totalDowntimeMinutes) / totalMinutes) * 100;
    return Math.max(0, Math.min(100, uptime));
};

// Update response time statistics
serviceUptimeSchema.methods.updateResponseTime = function (newResponseTime) {
    if (this.responseTime.min === 0 || newResponseTime < this.responseTime.min) {
        this.responseTime.min = newResponseTime;
    }
    if (newResponseTime > this.responseTime.max) {
        this.responseTime.max = newResponseTime;
    }

    // Calculate new average
    const totalChecks = this.totalChecks || 1;
    this.responseTime.average = ((this.responseTime.average * (totalChecks - 1)) + newResponseTime) / totalChecks;
    this.responseTime.current = newResponseTime;
};

// Record downtime event
serviceUptimeSchema.methods.recordDowntime = function (reason) {
    const now = new Date();

    // Check if there's an ongoing downtime event
    const ongoingEvent = this.downtimeEvents.find(event => !event.resolved);

    if (!ongoingEvent) {
        this.downtimeEvents.push({
            startTime: now,
            reason: reason || 'Service unavailable',
            resolved: false
        });
    }
};

// Resolve downtime event
serviceUptimeSchema.methods.resolveDowntime = function () {
    const now = new Date();

    // Find ongoing downtime event
    const ongoingEvent = this.downtimeEvents.find(event => !event.resolved);

    if (ongoingEvent) {
        ongoingEvent.endTime = now;
        ongoingEvent.duration = (now.getTime() - ongoingEvent.startTime.getTime()) / (1000 * 60); // in minutes
        ongoingEvent.resolved = true;

        // Update total downtime
        this.totalDowntimeMinutes += ongoingEvent.duration;
    }
};

// Static method to get or create service uptime record
serviceUptimeSchema.statics.getOrCreate = async function (serviceName, serviceType, port, endpoint) {
    let record = await this.findOne({ serviceName });

    if (!record) {
        record = await this.create({
            serviceName,
            serviceType,
            port,
            endpoint,
            startTime: new Date(),
            status: 'unknown'
        });
    }

    return record;
};

// Update check statistics
serviceUptimeSchema.methods.recordCheck = function (success, responseTime, error) {
    this.totalChecks += 1;
    this.lastCheckTime = new Date();

    if (success) {
        this.successfulChecks += 1;
        this.status = 'running';

        // Update response time
        this.updateResponseTime(responseTime);

        // Resolve any ongoing downtime
        this.resolveDowntime();
    } else {
        this.failedChecks += 1;
        this.status = 'error';

        // Record downtime
        this.recordDowntime(error);

        // Record last error
        this.lastError = {
            message: error || 'Unknown error',
            timestamp: new Date()
        };
    }

    // Update uptime percentage
    this.uptimePercentage = this.calculateUptime();
};

// Index for efficient queries
serviceUptimeSchema.index({ serviceName: 1, lastCheckTime: -1 });
serviceUptimeSchema.index({ status: 1 });

const ServiceUptime = mongoose.model('ServiceUptime', serviceUptimeSchema);

export default ServiceUptime;
