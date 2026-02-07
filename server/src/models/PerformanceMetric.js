import mongoose from 'mongoose';

const performanceMetricSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
        index: true,
        default: Date.now
    },
    // System metrics
    cpu: {
        usage: { type: Number, required: true }, // percentage
        cores: { type: Number },
        loadAverage: [Number] // 1min, 5min, 15min
    },
    memory: {
        usage: { type: Number, required: true }, // percentage
        total: { type: Number }, // in bytes
        used: { type: Number }, // in bytes
        free: { type: Number } // in bytes
    },
    disk: {
        usage: { type: Number }, // percentage
        total: { type: Number }, // in bytes
        used: { type: Number }, // in bytes
        free: { type: Number } // in bytes
    },
    network: {
        input: { type: Number }, // bytes per second
        output: { type: Number }, // bytes per second
        total: { type: Number } // bytes per second
    },
    // Application metrics
    activeConnections: {
        type: Number,
        default: 0
    },
    requestsPerMinute: {
        type: Number,
        default: 0
    },
    averageResponseTime: {
        type: Number,
        default: 0
    },
    errorRate: {
        type: Number,
        default: 0
    },
    // Database metrics
    database: {
        connections: { type: Number },
        queriesPerSecond: { type: Number },
        slowQueries: { type: Number },
        cacheHitRatio: { type: Number }
    }
}, {
    timestamps: true
});

// Index for time-based queries
performanceMetricSchema.index({ timestamp: -1 });

// Static method to get metrics for last N hours
performanceMetricSchema.statics.getLastNHours = async function (hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.find({
        timestamp: { $gte: startTime }
    }).sort({ timestamp: 1 }).lean();
};

// Static method to get hourly averages for last N hours
performanceMetricSchema.statics.getHourlyAverages = async function (hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const metrics = await this.aggregate([
        {
            $match: {
                timestamp: { $gte: startTime }
            }
        },
        {
            $group: {
                _id: {
                    hour: { $hour: '$timestamp' },
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                },
                avgCpu: { $avg: '$cpu.usage' },
                avgMemory: { $avg: '$memory.usage' },
                avgNetwork: { $avg: { $add: ['$network.input', '$network.output'] } },
                timestamp: { $first: '$timestamp' }
            }
        },
        {
            $sort: { timestamp: 1 }
        },
        {
            $project: {
                _id: 0,
                time: {
                    $concat: [
                        { $toString: '$_id.hour' },
                        ':00'
                    ]
                },
                cpu: { $round: ['$avgCpu', 0] },
                memory: { $round: ['$avgMemory', 0] },
                network: { $round: [{ $divide: ['$avgNetwork', 1024 * 1024] }, 0] } // Convert to MB/s
            }
        }
    ]);

    return metrics;
};

// Static method to record current metrics
performanceMetricSchema.statics.recordCurrent = async function (systemMetrics, dbMetrics) {
    try {
        const metric = new this({
            timestamp: new Date(),
            cpu: {
                usage: systemMetrics.cpu.usage,
                cores: systemMetrics.cpu.cores,
                loadAverage: systemMetrics.loadAverage
            },
            memory: {
                usage: systemMetrics.memory.usage,
                total: systemMetrics.memory.totalBytes,
                used: systemMetrics.memory.usedBytes,
                free: systemMetrics.memory.freeBytes
            },
            disk: systemMetrics.disk ? {
                usage: systemMetrics.disk.usage,
                total: systemMetrics.disk.totalBytes,
                used: systemMetrics.disk.usedBytes,
                free: systemMetrics.disk.freeBytes
            } : undefined,
            network: systemMetrics.network ? {
                input: systemMetrics.network.inputBytes,
                output: systemMetrics.network.outputBytes,
                total: systemMetrics.network.totalBytes
            } : undefined,
            database: dbMetrics ? {
                connections: dbMetrics.activeConnections,
                queriesPerSecond: dbMetrics.queriesPerSec,
                slowQueries: dbMetrics.slowQueries,
                cacheHitRatio: dbMetrics.cacheHitRatio
            } : undefined
        });

        await metric.save();
        return metric;
    } catch (error) {
        console.error('Error recording performance metric:', error);
        throw error;
    }
};

// Cleanup old metrics (keep only last 7 days)
performanceMetricSchema.statics.cleanup = async function () {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
        const result = await this.deleteMany({
            timestamp: { $lt: sevenDaysAgo }
        });

        console.log(`Cleaned up ${result.deletedCount} old performance metrics`);
        return result;
    } catch (error) {
        console.error('Error cleaning up performance metrics:', error);
        throw error;
    }
};

const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);

export default PerformanceMetric;
