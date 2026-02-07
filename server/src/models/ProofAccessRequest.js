import mongoose from 'mongoose';

const proofAccessRequestSchema = new mongoose.Schema({
  proofId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proof',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterRole: {
    type: String,
    enum: ['doctor', 'insurance', 'researcher', 'pharmacy', 'hospital'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  reason: {
    type: String,
    trim: true
  },
  approvedAt: Date,
  deniedAt: Date,
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

const ProofAccessRequest = mongoose.model('ProofAccessRequest', proofAccessRequestSchema);
export default ProofAccessRequest; 