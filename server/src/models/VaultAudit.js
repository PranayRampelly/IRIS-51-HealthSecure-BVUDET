// VaultAudit.js
import mongoose from 'mongoose';

const VaultAuditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'VaultFile', index: true },
  share: { type: mongoose.Schema.Types.ObjectId, ref: 'VaultShare' },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  details: { type: String },
  result: { type: String },
});

const VaultAudit = mongoose.model('VaultAudit', VaultAuditSchema);
export default VaultAudit; 