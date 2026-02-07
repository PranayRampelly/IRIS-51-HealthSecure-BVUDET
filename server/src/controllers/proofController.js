import Proof from '../models/Proof.js';
import HealthRecord from '../models/HealthRecord.js';
import { logAccess } from '../utils/logger.js';
import realtimeService from '../services/realtimeService.js';
import crypto from 'crypto';
import ProofAccessRequest from '../models/ProofAccessRequest.js';
import PDFDocument from 'pdfkit';
import stream from 'stream';
import User from '../models/User.js';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { notifyUser } from '../services/notificationService.js';

// @desc    Get all proofs for a patient
// @route   GET /api/proofs
// @access  Private (Patient only)
export const getProofs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, proofType } = req.query;
    const skip = (page - 1) * limit;

    const query = { patientId: req.user._id };
    
    if (status) query.status = status;
    if (proofType) query.proofType = proofType;

    // Debug logging
    console.log('Fetching proofs for user:', req.user._id);
    console.log('Query:', query);

    const proofs = await Proof.find(query)
      .populate('healthRecordIds', 'title type date')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    console.log('Number of proofs found:', proofs.length);

    const total = await Proof.countDocuments(query);

    // Log access
    await logAccess(req.user._id, 'VIEW_PROOF', 'Proof', null, null, req, 'Viewed all proofs list');

    res.json({
      proofs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get proofs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single proof
// @route   GET /api/proofs/:id
// @access  Private (Patient only)
export const getProof = async (req, res) => {
  try {
    const proof = await Proof.findOne({
      _id: req.params.id,
      patientId: req.user._id
    }).populate('healthRecordIds', 'title type date provider');

    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }

    // Check expiry
    if (proof.expiresAt && new Date() > proof.expiresAt) {
      proof.status = 'Expired';
      await proof.save();
      // Emit real-time expired
      notifyUser(proof.patientId, 'proof:expired', {
        proofId: proof._id,
        title: proof.title,
        proofType: proof.proofType,
        status: 'Expired'
      });
      return res.status(400).json({ message: 'Proof has expired' });
    }
    // Check revoked
    if (proof.revoked || proof.status === 'Revoked') {
      return res.status(400).json({ message: 'Proof has been revoked' });
    }
    // Auto-revoke logic
    if (proof.autoRevokeAfterAccess !== null) {
      proof.accessCount = (proof.accessCount || 0) + 1;
      if (proof.accessCount >= proof.autoRevokeAfterAccess) {
        proof.status = 'Revoked';
        proof.revoked = true;
        proof.revokedAt = new Date();
      }
      await proof.save();
    }

    // Log access
    await logAccess(req.user._id, 'VIEW_PROOF', 'Proof', proof._id, null, req, `Viewed proof: ${proof.title}`);

    res.json(proof);
  } catch (error) {
    console.error('Get proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create proof
// @route   POST /api/proofs
// @access  Private (Patient only)
export const createProof = async (req, res) => {
  try {
    const { proofType, title, description, statement, healthRecordIds, expiresAt, isPublic } = req.body;

    // Verify that health records belong to the patient
    if (healthRecordIds && healthRecordIds.length > 0) {
      const records = await HealthRecord.find({
        _id: { $in: healthRecordIds },
        patientId: req.user._id
      });

      if (records.length !== healthRecordIds.length) {
        return res.status(400).json({ message: 'Some health records not found or don\'t belong to you' });
      }
    }

    const proof = await Proof.create({
      patientId: req.user._id,
      proofType,
      title,
      description,
      statement,
      healthRecordIds,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPublic: isPublic || false,
      status: 'Active'
    });

    // Notify connected clients about the new proof
    // realtimeService.send({ ... })
    notifyUser(req.user._id, 'proof:created', {
        proofId: proof._id,
        title: proof.title,
        proofType: proof.proofType,
        status: proof.status
    });

    // Log access
    await logAccess(req.user._id, 'CREATE_PROOF', 'Proof', proof._id, null, req, `Created proof: ${title}`);

    res.status(201).json({
      message: 'Proof created successfully',
      proof: await proof.populate('healthRecordIds', 'title type date provider')
    });
  } catch (error) {
    console.error('Create proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update proof
// @route   PUT /api/proofs/:id
// @access  Private (Patient only)
export const updateProof = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;

    const proof = await Proof.findOneAndUpdate(
      {
        _id: req.params.id,
        patientId: req.user._id
      },
      {
        title,
        description,
        isPublic
      },
      { new: true, runValidators: true }
    );

    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }

    // Emit real-time update
    notifyUser(req.user._id, 'proof:updated', {
      proofId: proof._id,
      title: proof.title,
      proofType: proof.proofType,
      status: proof.status
    });

    res.json({
      message: 'Proof updated successfully',
      proof
    });
  } catch (error) {
    console.error('Update proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Revoke proof
// @route   PUT /api/proofs/:id/revoke
// @access  Private (Patient only)
export const revokeProof = async (req, res) => {
  try {
    const proof = await Proof.findOneAndUpdate(
      {
        _id: req.params.id,
        patientId: req.user._id
      },
      { status: 'Revoked' },
      { new: true }
    );

    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }

    // Emit real-time revoke
    notifyUser(req.user._id, 'proof:revoked', {
      proofId: proof._id,
      title: proof.title,
      proofType: proof.proofType,
      status: 'Revoked'
    });

    // Log access
    await logAccess(req.user._id, 'SHARE_PROOF', 'Proof', proof._id, null, req, `Revoked proof: ${proof._id}`);

    res.json({ message: 'Proof revoked successfully' });
  } catch (error) {
    console.error('Revoke proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify proof (for doctors)
// @route   GET /api/proofs/verify/:signature
// @access  Public
export const verifyProof = async (req, res) => {
  try {
    const { signature } = req.params;

    const proof = await Proof.findOne({ signature })
      .populate('patientId', 'firstName lastName')
      .populate('healthRecordIds', 'title type date provider');

    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }

    if (proof.status !== 'Active') {
      // Emit real-time expired if not already sent
      if (proof.status === 'Expired') {
        notifyUser(proof.patientId, 'proof:expired', {
          proofId: proof._id,
          title: proof.title,
          proofType: proof.proofType,
          status: 'Expired'
        });
      }
      return res.status(400).json({ 
        message: 'Proof is not active',
        status: proof.status
      });
    }
    if (proof.expiresAt && new Date() > proof.expiresAt) {
      proof.status = 'Expired';
      await proof.save();
      // Emit real-time expired
      notifyUser(proof.patientId, 'proof:expired', {
        proofId: proof._id,
        title: proof.title,
        proofType: proof.proofType,
        status: 'Expired'
      });
      return res.status(400).json({ 
        message: 'Proof has expired',
        expiredAt: proof.expiresAt
      });
    }
    if (proof.revoked || proof.status === 'Revoked') {
      return res.status(400).json({ message: 'Proof has been revoked' });
    }
    // Auto-revoke logic
    if (proof.autoRevokeAfterAccess !== null) {
      proof.accessCount = (proof.accessCount || 0) + 1;
      if (proof.accessCount >= proof.autoRevokeAfterAccess) {
        proof.status = 'Revoked';
        proof.revoked = true;
        proof.revokedAt = new Date();
      }
      await proof.save();
    }

    res.json({
      isValid: true,
      proof: {
        id: proof._id,
        title: proof.title,
        statement: proof.statement,
        proofType: proof.proofType,
        patient: proof.patientId,
        healthRecords: proof.healthRecordIds,
        createdAt: proof.createdAt,
        expiresAt: proof.expiresAt,
        signature: proof.signature,
        signatureHash: proof.signatureHash
      }
    });
  } catch (error) {
    console.error('Verify proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get proof statistics
// @route   GET /api/proofs/stats
// @access  Private (Patient only)
export const getProofStats = async (req, res) => {
  try {
    const stats = await Proof.aggregate([
      { $match: { patientId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Proof.aggregate([
      { $match: { patientId: req.user._id } },
      {
        $group: {
          _id: '$proofType',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalProofs = await Proof.countDocuments({ patientId: req.user._id });
    const activeProofs = await Proof.countDocuments({ 
      patientId: req.user._id, 
      status: 'Active' 
    });

    res.json({
      statusStats: stats,
      typeStats,
      totalProofs,
      activeProofs
    });
  } catch (error) {
    console.error('Get proof stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// @desc    Create proof for a health record
// @route   POST /api/proofs
// @access  Private (Patient only)
export const createProofForRecord = async (req, res) => {
  try {
    const { recordId } = req.body;
    if (!recordId) return res.status(400).json({ message: 'recordId is required' });
    const record = await HealthRecord.findOne({ _id: recordId, patientId: req.user._id });
    if (!record) return res.status(404).json({ message: 'Health record not found' });
    // Example: create a hash as a simple proof
    const proofHash = crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex');
    const proof = await Proof.create({
      patientId: req.user._id,
      recordId: record._id,
      proof: proofHash,
      createdAt: new Date()
    });
    res.status(201).json({ message: 'Proof created', proof });
  } catch (error) {
    console.error('Create proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Set expiry and auto-revoke for a proof
// @route   POST /api/proofs/:id/set-expiry
// @access  Private (Patient only)
export const setProofExpiry = async (req, res) => {
  try {
    const { expiresAt, autoRevokeAfterAccess } = req.body;
    const proof = await Proof.findOne({
      _id: req.params.id,
      patientId: req.user._id
    });
    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }
    if (expiresAt) proof.expiresAt = new Date(expiresAt);
    if (autoRevokeAfterAccess !== undefined) proof.autoRevokeAfterAccess = autoRevokeAfterAccess;
    await proof.save();
    res.json({ message: 'Proof expiry/auto-revoke updated', proof });
  } catch (error) {
    console.error('Set proof expiry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request access to a proof (for doctors/recipients)
export const requestAccess = async (req, res) => {
  try {
    const { reason } = req.body;
    const proofId = req.params.id;
    const requester = req.user._id;
    const requesterRole = req.user.role;
    // Only non-patients can request access
    if (requesterRole === 'patient') {
      return res.status(403).json({ message: 'Patients cannot request access to their own proofs' });
    }
    // Check if already requested
    const existing = await ProofAccessRequest.findOne({ proofId, requester });
    if (existing && existing.status === 'pending') {
      return res.status(400).json({ message: 'Access request already pending' });
    }
    const accessRequest = await ProofAccessRequest.create({
      proofId,
      requester,
      requesterRole,
      reason
    });
    // Optionally notify patient via realtimeService
    // realtimeService.send({ type: 'proof_access_requested', data: { proofId, requester, requesterRole } });
    res.status(201).json({ message: 'Access request submitted', accessRequest });
  } catch (error) {
    console.error('Request access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve access request (patient)
export const approveAccess = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const accessRequest = await ProofAccessRequest.findById(requestId);
    if (!accessRequest) return res.status(404).json({ message: 'Access request not found' });
    // Only patient who owns the proof can approve
    const proof = await Proof.findById(accessRequest.proofId);
    if (!proof || proof.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    accessRequest.status = 'approved';
    accessRequest.approvedAt = new Date();
    await accessRequest.save();
    res.json({ message: 'Access approved', accessRequest });
  } catch (error) {
    console.error('Approve access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deny access request (patient)
export const denyAccess = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const accessRequest = await ProofAccessRequest.findById(requestId);
    if (!accessRequest) return res.status(404).json({ message: 'Access request not found' });
    // Only patient who owns the proof can deny
    const proof = await Proof.findById(accessRequest.proofId);
    if (!proof || proof.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    accessRequest.status = 'denied';
    accessRequest.deniedAt = new Date();
    await accessRequest.save();
    res.json({ message: 'Access denied', accessRequest });
  } catch (error) {
    console.error('Deny access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// List all access requests for a proof (patient)
export const listAccessRequests = async (req, res) => {
  try {
    const proofId = req.params.id;
    const proof = await Proof.findById(proofId);
    if (!proof || proof.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const requests = await ProofAccessRequest.find({ proofId }).populate('requester', 'firstName lastName role email');
    res.json({ requests });
  } catch (error) {
    console.error('List access requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download watermarked proof
// @route   POST /api/proofs/:id/download-watermarked
// @access  Private (Patient only)
export const downloadWatermarkedProof = async (req, res) => {
  try {
    const proof = await Proof.findOne({
      _id: req.params.id,
      patientId: req.user._id
    }).populate('healthRecordIds', 'title type date provider');
    if (!proof) return res.status(404).json({ message: 'Proof not found' });

    const patient = await User.findById(req.user._id);

    // --- Compose QR code content as plain text ---
    const qrContent = [
      `Title: ${proof.title}`,
      `Type: ${proof.proofType}`,
      `Statement: ${proof.statement}`,
      `Status: ${proof.status}`,
      `Expires: ${proof.expiresAt ? new Date(proof.expiresAt).toLocaleDateString() : 'N/A'}`,
      `Patient: ${patient.firstName} ${patient.lastName}`,
      `Email: ${patient.email}`,
      `Hash: ${proof.signatureHash}`
    ].join('\n');

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const passThrough = new stream.PassThrough();
    res.setHeader('Content-disposition', `attachment; filename=ZK-Proof-${proof._id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(passThrough);

    // --- Header ---
    try {
      doc.image('public/logo.png', 40, 30, { width: 50 });
    } catch (e) {}
    doc.fontSize(26).fillColor('#008080').font('Helvetica-Bold').text('Zero-Knowledge Proof of Health Data', 110, 40, { align: 'left' });
    doc.fontSize(11).fillColor('#888').text(`Generated: ${new Date().toLocaleString()}`, 400, 55, { align: 'right' });
    doc.moveDown(1.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#008080');
    doc.moveDown(2);

    // --- Statement Section ---
    doc.fontSize(14).fillColor('#008080').font('Helvetica-Bold').text('Attested Statement:', { underline: false });
    doc.moveDown(0.5);
    doc.roundedRect(40, doc.y, 515, 45, 8).fillOpacity(0.10).fill('#008080').fillOpacity(1);
    doc.font('Helvetica-Oblique').fontSize(12).fillColor('#222')
      .text(proof.statement, 55, doc.y + 12, { width: 485 });
    doc.moveDown(3.5);

    // --- Commitment/Hash Section ---
    doc.fontSize(14).fillColor('#008080').font('Helvetica-Bold').text('Zero-Knowledge Commitment Hash:', { underline: false });
    doc.moveDown(0.5);
    doc.roundedRect(40, doc.y, 515, 22, 8).fillOpacity(0.08).fill('#008080').fillOpacity(1);
    doc.font('Courier-Bold').fontSize(11).fillColor('#333')
      .text(proof.signatureHash, 55, doc.y + 5, { width: 485 });
    doc.font('Helvetica').fillColor('#222');
    doc.moveDown(2.5);

    // --- Holder/Patient Section ---
    doc.fontSize(14).fillColor('#008080').font('Helvetica-Bold').text('Holder (Prover):', { underline: false });
    doc.moveDown(0.5);
    doc.roundedRect(40, doc.y, 320, 60, 8).fillOpacity(0.07).fill('#008080').fillOpacity(1);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#008080').text('Name:', 55, doc.y + 8, { continued: true }).font('Helvetica').fillColor('#222').text(` ${patient.firstName} ${patient.lastName}`);
    doc.font('Helvetica-Bold').fillColor('#008080').text('Email:', 55, doc.y + 22, { continued: true }).font('Helvetica').fillColor('#222').text(` ${patient.email}`);
    doc.font('Helvetica-Bold').fillColor('#008080').text('Patient ID:', 55, doc.y + 36, { continued: true }).font('Courier').fillColor('#333').text(` ${patient._id}`);
    doc.font('Helvetica').fillColor('#222');
    doc.moveDown(2);

    // --- QR Code (now encodes proof details, not a URL) ---
    try {
      const qrImage = await QRCode.toDataURL(qrContent);
      // Draw a rounded rectangle as a border/shadow for the QR code
      const qrX = 400, qrY = doc.y, qrSize = 150;
      doc.save();
      doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 16).fillOpacity(0.10).fill('#008080').fillOpacity(1);
      doc.restore();
      doc.image(qrImage, qrX, qrY, { width: qrSize, height: qrSize });
      doc.fontSize(9).fillColor('#888').text('Scan for proof details', qrX, qrY + qrSize + 6, { width: qrSize, align: 'center' });
    } catch (e) {
      console.error('QR code generation error:', e);
    }

    // --- Watermark ---
    doc.rotate(-30, { origin: [300, 400] });
    doc.fontSize(60).fillColor('#E0E0E0').opacity(0.10)
      .text('Zero-Knowledge Proof', 100, 300, { align: 'center', width: 400 });
    doc.opacity(1).rotate(30, { origin: [300, 400] });

    // --- Footer ---
    doc.fontSize(10).fillColor('#888')
      .text('This document is a cryptographic attestation. No sensitive health data is revealed.', 40, 800, { align: 'center', width: 515 });
    doc.fontSize(10).fillColor('#888')
      .text('© 2024 HealthSecure. All rights reserved.', 40, 815, { align: 'center', width: 515 });

    doc.end();
    await logAccess(req.user._id, 'DOWNLOAD_PROOF_WATERMARKED', 'Proof', proof._id, null, req, 'Downloaded watermarked proof');
    passThrough.pipe(res);
  } catch (error) {
    console.error('Download watermarked proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Download proof as PDF (no watermark)
// @route   GET /api/proofs/:id/download
// @access  Private (Patient only)
export const downloadProof = async (req, res) => {
  try {
    const proof = await Proof.findOne({
      _id: req.params.id,
      patientId: req.user._id
    }).populate('healthRecordIds', 'title type date provider');
    if (!proof) return res.status(404).json({ message: 'Proof not found' });

    const patient = await User.findById(req.user._id);

    // Compose QR code content as plain text
    const qrContent = [
      `Title: ${proof.title}`,
      `Type: ${proof.proofType}`,
      `Statement: ${proof.statement}`,
      `Status: ${proof.status}`,
      `Expires: ${proof.expiresAt ? new Date(proof.expiresAt).toLocaleDateString() : 'N/A'}`,
      `Patient: ${patient.firstName} ${patient.lastName}`,
      `Email: ${patient.email}`,
      `Hash: ${proof.signatureHash}`
    ].join('\n');

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const passThrough = new stream.PassThrough();
    res.setHeader('Content-disposition', `attachment; filename=Proof-${proof._id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(passThrough);

    // Header
    try {
      doc.image('public/logo.png', 40, 30, { width: 50 });
    } catch (e) {}
    doc.fontSize(26).fillColor('#008080').font('Helvetica-Bold').text('Zero-Knowledge Proof of Health Data', 110, 40, { align: 'left' });
    doc.fontSize(11).fillColor('#888').text(`Generated: ${new Date().toLocaleString()}`, 400, 55, { align: 'right' });
    doc.moveDown(1.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#008080');
    doc.moveDown(2);

    // Statement Section
    doc.fontSize(14).fillColor('#008080').font('Helvetica-Bold').text('Attested Statement:', { underline: false });
    doc.moveDown(0.5);
    doc.roundedRect(40, doc.y, 515, 45, 8).fillOpacity(0.10).fill('#008080').fillOpacity(1);
    doc.font('Helvetica-Oblique').fontSize(12).fillColor('#222')
      .text(proof.statement, 55, doc.y + 12, { width: 485 });
    doc.moveDown(3.5);

    // Commitment/Hash Section
    doc.fontSize(14).fillColor('#008080').font('Helvetica-Bold').text('Zero-Knowledge Commitment Hash:', { underline: false });
    doc.moveDown(0.5);
    doc.roundedRect(40, doc.y, 515, 22, 8).fillOpacity(0.08).fill('#008080').fillOpacity(1);
    doc.font('Courier-Bold').fontSize(11).fillColor('#333')
      .text(proof.signatureHash, 55, doc.y + 5, { width: 485 });
    doc.font('Helvetica').fillColor('#222');
    doc.moveDown(2.5);

    // Holder/Patient Section
    doc.fontSize(14).fillColor('#008080').font('Helvetica-Bold').text('Holder (Prover):', { underline: false });
    doc.moveDown(0.5);
    doc.roundedRect(40, doc.y, 320, 60, 8).fillOpacity(0.07).fill('#008080').fillOpacity(1);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#008080').text('Name:', 55, doc.y + 8, { continued: true }).font('Helvetica').fillColor('#222').text(` ${patient.firstName} ${patient.lastName}`);
    doc.font('Helvetica-Bold').fillColor('#008080').text('Email:', 55, doc.y + 22, { continued: true }).font('Helvetica').fillColor('#222').text(` ${patient.email}`);
    doc.font('Helvetica-Bold').fillColor('#008080').text('Patient ID:', 55, doc.y + 36, { continued: true }).font('Courier').fillColor('#333').text(` ${patient._id}`);
    doc.font('Helvetica').fillColor('#222');
    doc.moveDown(2);

    // QR Code
    try {
      const qrImage = await QRCode.toDataURL(qrContent);
      const qrX = 400, qrY = doc.y, qrSize = 150;
      doc.save();
      doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 16).fillOpacity(0.10).fill('#008080').fillOpacity(1);
      doc.restore();
      doc.image(qrImage, qrX, qrY, { width: qrSize, height: qrSize });
      doc.fontSize(9).fillColor('#888').text('Scan for proof details', qrX, qrY + qrSize + 6, { width: qrSize, align: 'center' });
    } catch (e) {
      console.error('QR code generation error:', e);
    }

    // Footer
    doc.fontSize(10).fillColor('#888')
      .text('This document is a cryptographic attestation. No sensitive health data is revealed.', 40, 800, { align: 'center', width: 515 });
    doc.fontSize(10).fillColor('#888')
      .text('© 2024 HealthSecure. All rights reserved.', 40, 815, { align: 'center', width: 515 });

    doc.end();
    await logAccess(req.user._id, 'DOWNLOAD_PROOF', 'Proof', proof._id, null, req, 'Downloaded proof PDF');
    passThrough.pipe(res);
  } catch (error) {
    console.error('Download proof error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 