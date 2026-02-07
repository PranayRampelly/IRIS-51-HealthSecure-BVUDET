import mongoose from 'mongoose';
import crypto from 'crypto';

const proofSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proofType: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  statement: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Expired', 'Revoked'],
    default: 'Active'
  },
  signature: String,
  signatureHash: String,
  expiresAt: Date,
  autoRevokeAfterAccess: {
    type: Number, // Number of accesses allowed before auto-revoke (e.g., 1 for one-time access)
    default: null
  },
  revoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  isPublic: {
    type: Boolean,
    default: false
  },
  healthRecordIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord'
  }],
  accessCount: {
    type: Number,
    default: 0
  },
  accessRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProofAccessRequest'
  }]
}, {
  timestamps: true
});

// Generate signature and hash before saving
proofSchema.pre('save', function(next) {
  if (!this.signature) {
    // Generate a unique signature
    const data = `${this.patientId}-${this.statement}-${Date.now()}`;
    this.signature = crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
    
    // Generate signature hash for verification
    this.signatureHash = crypto
      .createHash('sha512')
      .update(this.signature)
      .digest('hex');
  }
  next();
});

// Update status based on expiry date and auto-revoke
proofSchema.pre('save', function(next) {
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.status = 'Expired';
  }
  if (this.autoRevokeAfterAccess !== null && this.accessCount >= this.autoRevokeAfterAccess) {
    this.status = 'Revoked';
    this.revoked = true;
    this.revokedAt = new Date();
  }
  next();
});

const Proof = mongoose.model('Proof', proofSchema);

export default Proof; 