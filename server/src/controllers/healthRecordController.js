  import HealthRecord from '../models/HealthRecord.js';
import User from '../models/User.js';
import { logAccess, getAccessLogs } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { ObjectId } from 'mongodb';
import realtimeService from '../services/realtimeService.js';
import PDFDocument from 'pdfkit';
import { encrypt, decrypt } from '../utils/encryption.js';
import AccessLog from '../models/AccessLog.js';
import { sendHealthRecordEmail } from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all health records for a patient with advanced filtering
// @route   GET /api/health-records
// @access  Private (Patient only)
export const getHealthRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      search, 
      startDate, 
      endDate,
      tags,
      provider,
      sortBy = 'date',
      sortOrder = 'desc',
      export: isExport = false
    } = req.query;
    
    const skip = (page - 1) * limit;

    const query = { patientId: req.user._id };
    
    // Type filter
    if (type && type !== 'all') query.type = type;
    
    // Status filter
    if (status && status !== 'all') query.status = status;
    
    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Provider filter
    if (provider) {
      query.provider = { $regex: provider, $options: 'i' };
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const records = await HealthRecord.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('doctorId', 'firstName lastName email');

    const total = await HealthRecord.countDocuments(query);

    // Get statistics
    const stats = await getHealthRecordStats(req.user._id); 

    // Log access
    await logAccess(req.user._id, 'VIEW_RECORDS', 'HealthRecord', null, null, req, 'Viewed all health records list');
    await AccessLog.create({
      userId: req.user._id,
      action: 'VIEW_RECORDS',
      resourceType: 'HealthRecord',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Handle export
    if (isExport === 'true') {
      return handleExportRecords(records, res);
    }

    // Decrypt sensitive fields for each record
    const decryptedRecords = records.map(record => {
      const rec = record.toObject ? record.toObject() : record;
      rec.title = decrypt(rec.title);
      rec.description = decrypt(rec.description);
      return rec;
    });

    res.json({
      records: decryptedRecords,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        totalRecords: total
      },
      stats
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single health record with full details
// @route   GET /api/health-records/:id
// @access  Private (Patient only)
export const getHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      patientId: req.user._id
    }).populate('doctorId', 'firstName lastName email specialization');

    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    // Decrypt sensitive fields
    record.title = decrypt(record.title);
    record.description = decrypt(record.description);
    try {
      record.metadata = JSON.parse(decrypt(record.metadataEncrypted));
    } catch (e) {
      record.metadata = {};
    }

    // Get related records
    const relatedRecords = await HealthRecord.find({
      patientId: req.user._id,
      _id: { $ne: record._id },
      $or: [
        { type: record.type },
        { tags: { $in: record.tags } },
        { provider: record.provider }
      ]
    })
    .limit(5)
    .select('title type date provider');

    // Log access
    await logAccess(req.user._id, 'VIEW_RECORD', 'HealthRecord', record._id, null, req, `Viewed record: ${record.title}`);

    // Get access history
    const accessHistory = await getAccessLogs(req.user._id, {
      resourceType: 'HealthRecord',
      resourceId: record._id,
      limit: 10
    });

    res.json({
      record,
      relatedRecords,
      accessHistory
    });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create health record with file upload
// @route   POST /api/health-records
// @access  Private (Patient only)
export const createHealthRecord = async (req, res) => {
  try {
    const { type, title, description, provider, date, doctorId, tags, metadata } = req.body;
    
    // Handle file upload
    const fileUrl = req.file?.path || req.body.fileUrl;
    const fileName = req.file?.originalname || req.body.fileName;
    const fileSize = req.file?.size || req.body.fileSize;
    const mimeType = req.file?.mimetype || req.body.mimeType;

    if (!fileUrl || !fileName || !fileSize || !mimeType) {
      return res.status(400).json({ message: 'File information is required' });
    }

    // Parse tags
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Parse metadata
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        parsedMetadata = { customData: metadata };
      }
    }

    // Encrypt sensitive fields
    const encryptedTitle = encrypt(title);
    const encryptedDescription = encrypt(description);
    const encryptedMetadata = encrypt(JSON.stringify(parsedMetadata));

    const record = await HealthRecord.create({
      patientId: req.user._id,
      type,
      title: encryptedTitle,
      description: encryptedDescription,
      provider,
      date: new Date(date),
      doctorId: doctorId || null,
      fileUrl,
      fileName,
      fileSize: parseInt(fileSize),
      mimeType,
      tags: tagArray,
      metadata: parsedMetadata, // keep as Map
      metadataEncrypted: encryptedMetadata, // store encrypted string separately
      status: 'Active'
    });

    // Populate doctor info if available
    if (doctorId) {
      await record.populate('doctorId', 'firstName lastName email specialization');
    }

    // Log access
    await logAccess(req.user._id, 'CREATE_RECORD', 'HealthRecord', record._id, null, req, `Created record: ${title}`);

    // Emit real-time update
    realtimeService.notifyUser(req.user._id, 'health-record:created', {
      type: 'health-record',
      record: {
        _id: record._id,
        title: decrypt(record.title),
        type: record.type,
        provider: record.provider,
        date: record.date,
        status: record.status
      }
    });

    res.status(201).json({
      message: 'Health record created successfully',
      record
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update health record
// @route   PUT /api/health-records/:id
// @access  Private (Patient only)
export const updateHealthRecord = async (req, res) => {
  try {
    const { title, description, tags, metadata, status, type, provider, date } = req.body;

    const updateData = {};
    if (title) updateData.title = encrypt(title);
    if (description !== undefined) updateData.description = encrypt(description);
    if (status) updateData.status = status;
    if (type) updateData.type = type;
    if (provider) updateData.provider = provider;
    if (date) updateData.date = new Date(date);
    if (tags) {
      if (Array.isArray(tags)) {
        updateData.tags = tags.map(tag => tag.trim()).filter(tag => tag);
      } else if (typeof tags === 'string') {
        updateData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        updateData.metadata = parsed;
        updateData.metadataEncrypted = encrypt(JSON.stringify(parsed));
      } catch (e) {
        updateData.metadata = { customData: metadata };
        updateData.metadataEncrypted = encrypt(JSON.stringify({ customData: metadata }));
      }
    }

    const record = await HealthRecord.findOneAndUpdate(
      {
        _id: req.params.id,
        patientId: req.user._id
      },
      updateData,
      { new: true, runValidators: true }
    ).populate('doctorId', 'firstName lastName email specialization');

    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    // Log access
    await logAccess(req.user._id, 'UPDATE_RECORD', 'HealthRecord', record._id, null, req, `Updated record: ${record.title}`);

    // Emit real-time update
    realtimeService.notifyUser(req.user._id, 'health-record:updated', {
      type: 'health-record',
      record: {
        _id: record._id,
        title: decrypt(record.title),
        type: record.type,
        provider: record.provider,
        date: record.date,
        status: record.status
      }
    });

    res.json({
      message: 'Health record updated successfully',
      record
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete health record (soft delete)
// @route   DELETE /api/health-records/:id
// @access  Private (Patient only)
export const deleteHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      {
        _id: req.params.id,
        patientId: req.user._id
      },
      { status: 'Deleted' },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    // Log access
    await logAccess(req.user._id, 'DELETE_RECORD', 'HealthRecord', record._id, null, req, `Deleted record: ${record._id}`);

    // Emit real-time update
    realtimeService.notifyUser(req.user._id, 'health-record:deleted', {
      type: 'health-record',
      recordId: record._id
    });

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Share health record
// @route   POST /api/health-records/:id/share
// @access  Private (Patient only)
export const shareHealthRecord = async (req, res) => {
  try {
    const { email, message, duration } = req.body;
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Generate email content with inline image if available
    let html = `
      <h2>Health Record Shared With You</h2>
      <p>${message || ''}</p>
      <ul>
        <li><b>Type:</b> ${record.type}</li>
        <li><b>Provider:</b> ${record.provider}</li>
        <li><b>Description:</b> ${record.description}</li>
        <li><b>Date:</b> ${record.date}</li>
      </ul>
    `;
    let attachments = [];
    if (record.fileUrl && record.mimeType && record.fileUrl.startsWith('http')) {
      html += `<h3>File:</h3><img src='${record.fileUrl}' alt='record file' style='max-width:400px;'/><br/>`;
      attachments.push({
        filename: record.fileName,
        path: record.fileUrl,
        contentType: record.mimeType
      });
    }
    html += `<p>This link will expire in ${duration} days.</p>`;

    await sendHealthRecordEmail(email, 'A Health Record Has Been Shared With You', html, attachments);

    res.json({ message: 'Health record shared successfully! The recipient has been emailed with the record details and file.' });
  } catch (error) {
    console.error('Share record error:', error);
    res.status(500).json({ message: 'Failed to share record' });
  }
};

// @desc    Get health record statistics
// @route   GET /api/health-records/stats
// @access  Private (Patient only)
export const getHealthRecordStatsEndpoint = async (req, res) => {
  try {
    const stats = await getHealthRecordStats(req.user._id);
    res.json({ stats });
  } catch (error) {
    console.error('Get health record stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export health records
// @route   GET /api/health-records/export
// @access  Private (Patient only)
export const exportHealthRecords = async (req, res) => {
  try {
    const { format = 'zip', type, startDate, endDate } = req.query;

    const query = { patientId: req.user._id, status: 'Active' };
    
    if (type && type !== 'all') query.type = type;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await HealthRecord.find(query).sort({ date: -1 });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="health-records.json"');
      res.json(records);
    } else {
      await handleExportRecords(records, res);
    }
  } catch (error) {
    console.error('Export health records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get record analytics
// @route   GET /api/health-records/analytics
// @access  Private (Patient only)
export const getRecordAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const analytics = await HealthRecord.aggregate([
      { $match: { patientId: req.user._id, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            type: '$type',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({ analytics });
  } catch (error) {
    console.error('Get record analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download health record file
// @route   GET /api/health-records/:id/download
// @access  Private (Patient only)
export const downloadHealthRecordFile = async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      patientId: req.user._id
    });
    if (!record || !record.fileUrl) {
      return res.status(404).json({ message: 'File not found' });
    }
    const filePath = path.resolve(record.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    res.download(filePath, record.fileName);
    res.on('finish', async () => {
      await AccessLog.create({
        userId: req.user._id,
        action: 'DOWNLOAD_RECORD_FILE',
        resourceType: 'HealthRecord',
        resourceId: record._id,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export health record as PDF
// @route   GET /api/health-records/:id/export?format=pdf
// @access  Private (Patient only)
export const exportHealthRecordAsPDF = async (req, res) => {
  try {
    // Fetch record and populate doctor info
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      patientId: req.user._id
    }).populate('doctorId', 'firstName lastName email specialization');
    if (!record) return res.status(404).json({ message: 'Health record not found' });

    // Decrypt sensitive fields
    record.title = decrypt(record.title);
    record.description = decrypt(record.description);
    try {
      record.metadata = JSON.parse(decrypt(record.metadataEncrypted));
    } catch (e) {
      record.metadata = {};
    }

    // Fetch patient info
    const patient = await User.findById(record.patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=record-${record._id}.pdf`);
    doc.pipe(res);

    // --- Professional Header ---
    // Logo (optional, use a placeholder if no logo file)
    try {
      doc.image(path.join(__dirname, '../../public/logo-medical.png'), 40, 30, { width: 60 });
    } catch (e) {
      // If logo not found, skip
    }
    doc.fontSize(24).fillColor('#006d77').font('Helvetica-Bold').text('Lifeline Multispeciality Hospital', 110, 40, { align: 'left' });
    doc.fontSize(12).fillColor('black').font('Helvetica').text('Comprehensive Health Record Report', 110, 68, { align: 'left' });
    doc.moveDown(2);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#006d77');
    doc.moveDown(1.5);

    // --- Patient Information ---
    doc.fontSize(14).fillColor('#006d77').font('Helvetica-Bold').text('Patient Information', { underline: true });
    doc.font('Helvetica').fontSize(12).fillColor('black');
    doc.text(`Name: ${patient.firstName} ${patient.lastName}`);
    doc.text(`Date of Birth: ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}`);
    doc.text(`Gender: ${patient.gender || 'N/A'}`);
    doc.text(`Blood Type: ${patient.bloodType || 'N/A'}`);
    doc.text(`Phone: ${patient.phone || 'N/A'}`);
    doc.text(`Email: ${patient.email}`);
    if (patient.address) {
      doc.text(`Address: ${patient.address.street || ''} ${patient.address.city || ''} ${patient.address.state || ''} ${patient.address.zipCode || ''} ${patient.address.country || ''}`);
    }
    if (patient.insurance && (patient.insurance.provider || patient.insurance.policyNumber)) {
      doc.text(`Insurance: ${patient.insurance.provider || ''} (Policy: ${patient.insurance.policyNumber || ''})`);
    }
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#83c5be');
    doc.moveDown();

    // --- Record Information ---
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#006d77').text('Record Information', { underline: true });
    doc.font('Helvetica').fontSize(12).fillColor('black');
    doc.text(`Type: ${record.type}`);
    doc.text(`Title: ${record.title}`);
    doc.text(`Provider: ${record.provider}`);
    doc.text(`Date: ${record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}`);
    doc.text(`Status: ${record.status}`);
    if (record.doctorId) {
      doc.text(`Doctor: ${record.doctorId.firstName} ${record.doctorId.lastName} (${record.doctorId.specialization || ''})`);
      doc.text(`Doctor Email: ${record.doctorId.email}`);
    }
    doc.text(`Tags: ${(record.tags || []).join(', ')}`);
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#83c5be');
    doc.moveDown();

    // --- Details ---
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#006d77').text('Details', { underline: true });
    doc.font('Helvetica').fontSize(12).fillColor('black');
    doc.text(`Description: ${record.description || 'N/A'}`);
    if (record.metadata && Object.keys(record.metadata).length > 0) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fillColor('#006d77').text('Additional Metadata:');
      doc.font('Helvetica').fillColor('black');
      for (const [key, value] of Object.entries(record.metadata)) {
        doc.text(`${key}: ${value}`);
      }
    }
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#83c5be');
    doc.moveDown();

    // --- Signature/Footer ---
    doc.moveDown(2);
    doc.fontSize(12).fillColor('black').font('Helvetica').text('Doctor Signature:', 40, doc.y);
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('gray')
      .text('This report is confidential and intended solely for the patient and authorized healthcare providers.', 40, doc.y, { align: 'center', width: 515 });
    doc.fontSize(10).fillColor('black').text(`Generated on: ${new Date().toLocaleString()}`, 40, doc.y + 12, { align: 'center', width: 515 });

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions
const getHealthRecordStats = async (patientId) => {
  const totalRecords = await HealthRecord.countDocuments({ patientId, status: 'Active' });
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthCount = await HealthRecord.countDocuments({
    patientId,
    status: 'Active',
    createdAt: { $gte: thisMonth }
  });

  // Count shared records (records that have been shared)
  const sharedCount = await HealthRecord.countDocuments({ 
    patientId, 
    status: 'Active',
    isPublic: true 
  });

  // Count recent views (this would typically come from access logs)
  const recentViews = 0; // Placeholder - would be calculated from access logs

  const typeStats = await HealthRecord.aggregate([
    { $match: { patientId, status: 'Active' } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const recentActivity = await HealthRecord.find({ patientId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title type updatedAt');

  return {
    totalRecords,
    thisMonth: thisMonthCount,
    shared: sharedCount,
    recentViews,
    typeStats,
    recentActivity
  };
};

const handleExportRecords = async (records, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="health-records.zip"');
  
  archive.pipe(res);

  // Add JSON metadata
  const metadata = records.map(record => ({
    id: record._id,
    title: record.title,
    type: record.type,
    provider: record.provider,
    date: record.date,
    description: record.description,
    tags: record.tags
  }));

  archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

  // Add files if they exist
  for (const record of records) {
    if (record.fileUrl && fs.existsSync(record.fileUrl)) {
      const fileName = `${record.type.replace(/\s+/g, '_')}_${record.title.replace(/\s+/g, '_')}.${record.fileName.split('.').pop()}`;
      archive.file(record.fileUrl, { name: fileName });
    }
  }

  await archive.finalize();
};

const generateShareToken = (recordId, duration, accessType) => {
  const payload = {
    recordId,
    accessType,
    expiresAt: Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000
  };
  
  // In a real implementation, you'd use JWT or a similar token system
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const sendShareNotification = async (email, record, message, shareToken) => {
  // In a real implementation, you'd send an email here
  console.log(`Share notification sent to ${email} for record ${record._id}`);
};

 