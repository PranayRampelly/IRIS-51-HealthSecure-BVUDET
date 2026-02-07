import mongoose from 'mongoose';

const ambulanceDriverSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    dateOfBirth: {
        type: Date
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'United States'
        }
    },
    experience: {
        type: Number,
        min: 0,
        default: 0
    },
    specializations: [{
        type: String,
        enum: ['basic-life-support', 'advanced-life-support', 'critical-care', 'neonatal', 'trauma', 'cardiac']
    }],
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        certificateNumber: String
    }],
    status: {
        type: String,
        enum: ['active', 'on-duty', 'off-duty', 'on-leave', 'suspended', 'inactive'],
        default: 'off-duty'
    },
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AmbulanceService'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    emergencyResponseTime: {
        type: Number,
        default: 0
    },
    availability: {
        schedule: {
            monday: { available: Boolean, startTime: String, endTime: String },
            tuesday: { available: Boolean, startTime: String, endTime: String },
            wednesday: { available: Boolean, startTime: String, endTime: String },
            thursday: { available: Boolean, startTime: String, endTime: String },
            friday: { available: Boolean, startTime: String, endTime: String },
            saturday: { available: Boolean, startTime: String, endTime: String },
            sunday: { available: Boolean, startTime: String, endTime: String }
        },
        currentLocation: {
            lat: Number,
            lng: Number,
            address: String,
            lastUpdated: Date
        }
    },
    documents: [{
        type: {
            type: String,
            enum: ['license', 'medical-certificate', 'background-check', 'training-certificate', 'other']
        },
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        expiryDate: Date
    }],
    performanceMetrics: {
        onTimePercentage: {
            type: Number,
            default: 0
        },
        patientSatisfaction: {
            type: Number,
            default: 0
        },
        safetyScore: {
            type: Number,
            default: 0
        },
        completedTrips: {
            type: Number,
            default: 0
        },
        cancelledTrips: {
            type: Number,
            default: 0
        }
    },
    profileImage: {
        type: String
    },
    notes: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
ambulanceDriverSchema.index({ hospital: 1, status: 1 });
// licenseNumber already has unique: true which creates an index, so no need for duplicate
ambulanceDriverSchema.index({ assignedVehicle: 1 });

// Virtual for full name
ambulanceDriverSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Method to update status
ambulanceDriverSchema.methods.updateStatus = function (newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
    return this.save();
};

// Method to assign vehicle
ambulanceDriverSchema.methods.assignVehicle = function (vehicleId) {
    this.assignedVehicle = vehicleId;
    this.updatedAt = new Date();
    return this.save();
};

// Method to update location
ambulanceDriverSchema.methods.updateLocation = function (lat, lng, address) {
    this.availability.currentLocation = {
        lat,
        lng,
        address,
        lastUpdated: new Date()
    };
    this.updatedAt = new Date();
    return this.save();
};

const AmbulanceDriver = mongoose.model('AmbulanceDriver', ambulanceDriverSchema);

export default AmbulanceDriver;
