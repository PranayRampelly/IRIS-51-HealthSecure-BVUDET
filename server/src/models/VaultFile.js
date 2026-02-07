// VaultFile.js
import mongoose from 'mongoose';

const VaultFileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  cloudinaryUrl: { type: String }, // Cloudinary file URL
  cloudinaryId: { type: String }, // Cloudinary public_id
  encryptedPath: { type: String },
  tags: [{ type: String }],
  version: { type: Number, default: 1 },
  versionGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'VaultFile' },
  expiry: { type: Date },
  size: { type: Number },
  hash: { type: String },
  securityStatus: {
    integrity: { type: Boolean, default: true },
    virus: { type: Boolean, default: false },
    dlpFlagged: { type: Boolean, default: false },
    dlpReason: { type: String },
  },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  audit: [{
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
    ip: String,
    details: String,
  }],
}, { timestamps: true });

VaultFileSchema.index({ user: 1, filename: 1 });

const VaultFile = mongoose.model('VaultFile', VaultFileSchema);
export default VaultFile; 