import mongoose from 'mongoose';

const hospitalDischargeSchema = new mongoose.Schema({
    // Patient Information
    patientId: {
        type: String,
        required: true,
        index: true,
    },
    patientName: {
        type: String,
        required: true,
    },
    admissionDate: {
        type: Date,
        required: true,
    },
    dischargeDate: {
        type: Date,
        required: true,
    },

    // Medical Information
    department: {
        type: String,
        required: true,
        enum: ['cardiology', 'orthopedics', 'neurology', 'emergency', 'pediatrics', 'general', 'surgery', 'icu', 'oncology'],
    },
    primaryDiagnosis: {
        type: String,
        required: true,
    },
    dischargeDiagnosis: {
        type: String,
        required: true,
    },

    // Discharge Planning
    dischargeType: {
        type: String,
        required: true,
        enum: ['regular', 'early', 'against_advice', 'transfer', 'deceased'],
        default: 'regular',
    },
    dischargeDestination: {
        type: String,
        required: true,
        enum: ['home', 'rehabilitation', 'nursing_home', 'another_hospital', 'deceased'],
    },
    dischargeInstructions: {
        type: String,
        default: '',
    },
    medications: {
        type: String,
        default: '',
    },

    // Follow-up Care
    followUpAppointment: {
        type: Date,
    },
    followUpPhysician: {
        type: String,
        default: '',
    },

    // Care Requirements
    homeCareNeeded: {
        type: Boolean,
        default: false,
    },
    homeCareDetails: {
        type: String,
        default: '',
    },
    transportationNeeded: {
        type: Boolean,
        default: false,
    },
    transportationDetails: {
        type: String,
        default: '',
    },

    // Summary and Notes
    dischargeSummary: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },

    // Status Tracking
    status: {
        type: String,
        enum: ['pending', 'approved', 'discharged', 'completed', 'cancelled'],
        default: 'pending',
        index: true,
    },

    // Hospital and User References
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes for efficient queries
hospitalDischargeSchema.index({ hospital: 1, status: 1 });
hospitalDischargeSchema.index({ hospital: 1, department: 1 });
hospitalDischargeSchema.index({ hospital: 1, dischargeDate: 1 });
hospitalDischargeSchema.index({ patientId: 1, hospital: 1 });
hospitalDischargeSchema.index({ createdAt: -1 });

// Virtual for patient reference (if needed)
hospitalDischargeSchema.virtual('patient', {
    ref: 'PatientRecord',
    localField: 'patientId',
    foreignField: 'patientId',
    justOne: true,
});

const HospitalDischarge = mongoose.model('HospitalDischarge', hospitalDischargeSchema);

export default HospitalDischarge;
