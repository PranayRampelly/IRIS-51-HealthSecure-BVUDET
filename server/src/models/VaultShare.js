// VaultShare.js
import mongoose from 'mongoose';

const VaultShareSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VaultFile' }],
  link: { type: String, required: true, index: true },
  expiresAt: { type: Date },
  accessLimit: { type: Number, default: 5 },
  accessCount: { type: Number, default: 0 },
  message: { type: String },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  audit: [{
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
    ip: String,
    details: String,
  }],
});

const VaultShare = mongoose.model('VaultShare', VaultShareSchema);
export default VaultShare; 