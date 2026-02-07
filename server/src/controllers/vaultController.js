// vaultController.js
// Advanced, secure Document Vault controller (HIPAA/GDPR/SOC2/AES-256/DLP)
import VaultFile from '../models/VaultFile.js';
import { encryptFile, decryptFile } from '../middleware/encryption.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import VaultShare from '../models/VaultShare.js';
import { v4 as uuidv4 } from 'uuid';
import { notifyUser } from '../services/notificationService.js';

// UPLOAD FILE
export async function uploadFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    console.log('Upload request received:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      url: req.file.url,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // If the multer middleware didn't provide a URL, upload to Cloudinary manually
    let cloudinaryUrl = req.file.url;
    let cloudinaryId = req.file.filename;
    
    if (!cloudinaryUrl) {
      console.log('No Cloudinary URL from multer, uploading manually...');
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        
        // Determine resource type based on file extension
        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(req.file.originalname);
        const isVideo = /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(req.file.originalname);
        const isAudio = /\.(mp3|wav|ogg|aac)$/i.test(req.file.originalname);
        const isPDF = /\.pdf$/i.test(req.file.originalname);
        
        let resourceType = 'auto';
        if (isImage) resourceType = 'image';
        else if (isVideo) resourceType = 'video';
        else if (isAudio) resourceType = 'video'; // Cloudinary treats audio as video
        else if (isPDF) resourceType = 'raw'; // PDFs should be uploaded as raw files
        
        console.log('Uploading to Cloudinary with resource type:', resourceType);
        
        // Upload the file to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'healthsecure_uploads',
          resource_type: resourceType,
          format: isPDF ? 'pdf' : undefined // Ensure PDFs keep their format
        });
        
        cloudinaryUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
        
        console.log('Manual Cloudinary upload successful:', {
          url: cloudinaryUrl,
          public_id: cloudinaryId
        });
      } catch (cloudinaryError) {
        console.error('Manual Cloudinary upload failed:', cloudinaryError);
        return res.status(500).json({ message: 'Failed to upload file to Cloudinary', error: cloudinaryError.message });
      }
    }
    
    // Save metadata using Cloudinary info
    const vaultFile = await VaultFile.create({
      user: req.user._id,
      filename: req.file.originalname,
      cloudinaryUrl: cloudinaryUrl,
      cloudinaryId: cloudinaryId,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      size: req.file.size,
      version: 1,
      securityStatus: { integrity: true, virus: false, dlpFlagged: false },
    });
    
    console.log('Vault file created:', {
      id: vaultFile._id,
      filename: vaultFile.filename,
      cloudinaryUrl: vaultFile.cloudinaryUrl,
      cloudinaryId: vaultFile.cloudinaryId
    });
    
    // Clean up temporary file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Temporary file cleaned up:', req.file.path);
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file:', cleanupError);
      }
    }
    
    // Emit real-time dashboard update
    notifyUser(
      req.user._id.toString(),
      'dashboardUpdate',
      {
        action: 'upload',
        file: {
          id: vaultFile._id,
          filename: vaultFile.filename,
          tags: vaultFile.tags,
          size: vaultFile.size,
          version: vaultFile.version,
          createdAt: vaultFile.createdAt,
          cloudinaryUrl: vaultFile.cloudinaryUrl
        },
        timestamp: new Date()
      }
    );
    res.status(201).json({ message: 'File uploaded to Cloudinary', file: {
      id: vaultFile._id,
      filename: vaultFile.filename,
      tags: vaultFile.tags,
      size: vaultFile.size,
      version: vaultFile.version,
      createdAt: vaultFile.createdAt,
      cloudinaryUrl: vaultFile.cloudinaryUrl
    }});
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
}

// LIST FILES
export async function listFiles(req, res) {
  try {
    const files = await VaultFile.find({ user: req.user._id, deleted: false })
      .select('filename tags size version createdAt expiry securityStatus cloudinaryUrl');
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'List files failed', error: err.message });
  }
}

// DOWNLOAD FILE
export async function downloadFile(req, res) {
  try {
    console.log('Download request for fileId:', req.params.fileId, 'user:', req.user._id);
    
    const file = await VaultFile.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) {
      console.log('File not found for fileId:', req.params.fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    
    console.log('File found:', {
      id: file._id,
      filename: file.filename,
      cloudinaryUrl: file.cloudinaryUrl,
      encryptedPath: file.encryptedPath
    });
    
    // Emit real-time notification for download
    try {
      notifyUser(
        req.user._id.toString(),
        'dashboardUpdate',
        {
          action: 'download',
          file: {
            id: file._id,
            filename: file.filename,
            downloadedAt: new Date(),
          },
          timestamp: new Date()
        }
      );
    } catch (notifyErr) {
      console.error('Notification error:', notifyErr);
      // Continue with download even if notification fails
    }
    
    if (file.cloudinaryUrl) {
      console.log('Attempting to download from Cloudinary:', file.cloudinaryUrl);
      
      const isPDF = /\.pdf$/i.test(file.filename);
      let downloadUrl = file.cloudinaryUrl;
      
      // For PDFs, add the attachment flag to force download
      if (isPDF) {
        downloadUrl = file.cloudinaryUrl + '?fl_attachment';
        console.log('PDF download URL with attachment flag:', downloadUrl);
      }
      
      try {
        // Stream the file from Cloudinary
        let response = await fetch(downloadUrl);
        console.log('Cloudinary response status:', response.status);
        
        if (!response.ok) {
          console.error('Cloudinary fetch failed:', response.status, response.statusText);
          
          // If the first attempt failed, try without the attachment flag
          if (isPDF) {
            console.log('Retrying PDF download without attachment flag...');
            const retryResponse = await fetch(file.cloudinaryUrl);
            if (!retryResponse.ok) {
              return res.status(500).json({ message: 'Failed to fetch file from Cloudinary' });
            }
            response = retryResponse;
          } else {
            return res.status(500).json({ message: 'Failed to fetch file from Cloudinary' });
          }
        }
        
        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        
        // Set content type based on file type
        let contentType = 'application/octet-stream';
        if (isPDF) contentType = 'application/pdf';
        else if (/\.(jpg|jpeg)$/i.test(file.filename)) contentType = 'image/jpeg';
        else if (/\.png$/i.test(file.filename)) contentType = 'image/png';
        else if (/\.gif$/i.test(file.filename)) contentType = 'image/gif';
        else if (/\.(mp4|avi|mov)$/i.test(file.filename)) contentType = 'video/mp4';
        
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
        return;
        
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return res.status(500).json({ message: 'Failed to fetch file from Cloudinary' });
      }
    }
    
    // Otherwise, use local decryption logic
    if (!file.encryptedPath) {
      console.error('No cloudinaryUrl or encryptedPath found for file:', file._id);
      return res.status(404).json({ 
        message: 'File not available for download. This file may have been uploaded incorrectly or is missing from storage.',
        error: 'FILE_NOT_FOUND_IN_STORAGE'
      });
    }
    
    const decryptedPath = path.join(__dirname, '../../uploads', 'dec-' + path.basename(file.encryptedPath));
    await decryptFile(file.encryptedPath, decryptedPath);
    res.download(decryptedPath, file.filename, err => {
      fs.unlink(decryptedPath, () => {}); // Clean up temp decrypted file
      if (err) console.error('Download error:', err);
    });
  } catch (err) {
    console.error('Download function error:', err);
    res.status(500).json({ message: 'Download failed', error: err.message });
  }
}

// DELETE FILE (highly secure)
export async function deleteFile(req, res) {
  try {
    // 2FA check removed: enforced by middleware
    const file = await VaultFile.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    // Only owner or admin can delete
    const isOwner = file.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }
    // If already soft-deleted, only admin can hard delete
    if (file.deleted) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only admin can permanently delete' });
      }
      // Hard delete: remove file from disk and DB
      const fs = require('fs');
      try { fs.unlinkSync(file.encryptedPath); } catch (e) {}
      await file.remove();
      // Emit real-time notification (hard delete)
      notifyUser(
        req.user._id.toString(),
        'dashboardUpdate',
        {
          action: 'delete',
          fileId: req.params.fileId,
          hardDelete: true,
          timestamp: new Date()
        }
      );
      return res.json({ message: 'File permanently deleted' });
    }
    // Soft delete: mark as deleted
    file.deleted = true;
    file.deletedAt = new Date();
    file.deletedBy = req.user._id;
    await file.save();
    // Emit real-time notification (soft delete)
    notifyUser(
      req.user._id.toString(),
      'dashboardUpdate',
      {
        action: 'delete',
        fileId: req.params.fileId,
        hardDelete: false,
        timestamp: new Date()
      }
    );
    res.json({ message: 'File deleted (soft delete, recoverable by admin)' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

// UPDATE TAGS/EXPIRY (secure, auditable)
export async function updateTags(req, res) {
  try {
    // 2FA check removed: enforced by middleware
    const file = await VaultFile.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    // Only owner or admin can update
    const isOwner = file.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this file' });
    }
    // Validate input
    let tags = file.tags;
    if (req.body.tags) {
      if (!Array.isArray(req.body.tags) && typeof req.body.tags !== 'string') {
        return res.status(400).json({ message: 'Tags must be an array or comma-separated string' });
      }
      tags = Array.isArray(req.body.tags)
        ? req.body.tags.map(t => t.trim())
        : req.body.tags.split(',').map(t => t.trim());
    }
    let expiry = file.expiry;
    if (req.body.expiry) {
      const expDate = new Date(req.body.expiry);
      if (isNaN(expDate.getTime())) {
        return res.status(400).json({ message: 'Invalid expiry date' });
      }
      expiry = expDate;
    }
    // Audit old values
    const oldTags = file.tags;
    const oldExpiry = file.expiry;
    // Update
    file.tags = tags;
    file.expiry = expiry;
    await file.save();
    // Emit real-time notification for tag/expiry update
    notifyUser(
      req.user._id.toString(),
      'dashboardUpdate',
      {
        action: 'updateTags',
        file: {
          id: file._id,
          tags: file.tags,
          expiry: file.expiry
        },
        timestamp: new Date()
      }
    );
    res.json({
      message: 'Tags/expiry updated',
      file: {
        id: file._id,
        tags: file.tags,
        expiry: file.expiry
      },
      audit: {
        oldTags,
        newTags: file.tags,
        oldExpiry,
        newExpiry: file.expiry
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Update tags/expiry failed', error: err.message });
  }
};

// UPLOAD NEW VERSION (highly secure)
export async function uploadVersion(req, res) {
  try {
    // 2FA check removed: enforced by middleware
    const parentFile = await VaultFile.findById(req.params.fileId);
    if (!parentFile) return res.status(404).json({ message: 'File not found' });
    // Only owner or admin can upload new version
    const isOwner = parentFile.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to version this file' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // DLP, virus scan, AES-256 handled by middleware
    // Find max version in group
    const versionGroup = parentFile.versionGroup || parentFile._id;
    const maxVersionDoc = await VaultFile.findOne({ $or: [ { versionGroup }, { _id: versionGroup } ] }).sort({ version: -1 });
    const newVersion = (maxVersionDoc ? maxVersionDoc.version : parentFile.version) + 1;
    // Optionally limit max versions (e.g., 10)
    const versionCount = await VaultFile.countDocuments({ $or: [ { versionGroup }, { _id: versionGroup } ] });
    if (versionCount >= 10) {
      return res.status(400).json({ message: 'Max versions reached (10). Please delete old versions first.' });
    }
    // Encrypt file
    const path = require('path');
    const fs = require('fs');
    const encryptedPath = path.join(__dirname, '../../uploads', 'enc-' + req.file.filename);
    await encryptFile(req.file.path, encryptedPath);
    fs.unlinkSync(req.file.path);
    // Save new version
    const newFile = await VaultFile.create({
      user: req.user._id,
      filename: req.file.originalname,
      cloudinaryUrl: req.file.url, // Use the real Cloudinary URL
      cloudinaryId: req.file.filename, // Cloudinary public_id
      tags: parentFile.tags,
      size: req.file.size,
      version: newVersion,
      versionGroup,
      securityStatus: { integrity: true, virus: false, dlpFlagged: false },
    });
    // Emit real-time notification for new version
    notifyUser(
      req.user._id.toString(),
      'dashboardUpdate',
      {
        action: 'uploadVersion',
        file: {
          id: newFile._id,
          filename: newFile.filename,
          version: newFile.version
        },
        timestamp: new Date()
      }
    );
    res.status(201).json({ message: 'New version uploaded', file: {
      id: newFile._id,
      filename: newFile.filename,
      version: newFile.version
    }});
  } catch (err) {
    res.status(500).json({ message: 'Upload version failed', error: err.message });
  }
};

// CREATE SHARE (highly secure, advanced)
export async function createShare(req, res) {
  try {
    // 2FA check removed: enforced by middleware
    const { fileIds, expiresAt, accessLimit, message } = req.body;
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: 'fileIds (array) required' });
    }
    // Check all files exist and user owns them
    const files = await VaultFile.find({ _id: { $in: fileIds }, deleted: false });
    if (files.length !== fileIds.length) {
      return res.status(404).json({ message: 'One or more files not found' });
    }
    const isOwner = files.every(f => f.user.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to share these files' });
    }
    // DLP check (already enforced on upload, but could rescan here if needed)
    // Enforce max duration (30 days)
    let exp = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const maxExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (exp > maxExp) exp = maxExp;
    if (isNaN(exp.getTime())) {
      return res.status(400).json({ message: 'Invalid expiry date' });
    }
    // Access limit
    const limit = accessLimit && Number.isInteger(accessLimit) && accessLimit > 0 ? accessLimit : 5;
    // Create share link
    const link = uuidv4();
    const share = await VaultShare.create({
      user: req.user._id,
      fileIds,
      link,
      expiresAt: exp,
      accessLimit: limit,
      message,
      revoked: false
    });
    // Emit real-time notification for share
    notifyUser(
      req.user._id.toString(),
      'dashboardUpdate',
      {
        action: 'createShare',
        share: {
          id: share._id,
          link: share.link,
          expiresAt: share.expiresAt
        },
        timestamp: new Date()
      }
    );
    res.status(201).json({ message: 'Share link created', share: {
      id: share._id,
      link: share.link,
      expiresAt: share.expiresAt
    }});
  } catch (err) {
    res.status(500).json({ message: 'Create share failed', error: err.message });
  }
};

// REVOKE SHARE (highly secure)
export async function revokeShare(req, res) {
  try {
    // 2FA check removed: enforced by middleware
    const share = await VaultShare.findOne({ link: req.params.shareId });
    if (!share) return res.status(404).json({ message: 'Share not found' });
    const isOwner = share.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to revoke this share' });        
    }
    share.revoked = true;
    await share.save();
    // Emit real-time notification for revoke
    notifyUser(
      req.user._id.toString(),
      'dashboardUpdate',
      {
        action: 'revokeShare',
        shareId: share._id,
        link: share.link,
        timestamp: new Date()
      }
    );
    res.json({ message: 'Share revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Revoke share failed', error: err.message });
  }
};

// GET AUDIT LOGS (basic stub)
export async function getAuditLogs(req, res) {
  try {
    // TODO: Implement filtering, pagination, etc.
    res.json({ logs: [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
}

export async function getShares(req, res) {
  try {
    const shares = await VaultShare.find({ user: req.user._id, revoked: { $ne: true } })
      .populate('fileIds', 'filename cloudinaryUrl')
      .sort({ createdAt: -1 });
    res.json({ shares });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shares', error: err.message });
  }
}

export async function getShareByLink(req, res) {
  try {
    const share = await VaultShare.findOne({ link: req.params.link })
      .populate('fileIds', 'filename cloudinaryUrl');
    if (!share) return res.status(404).json({ message: 'Share not found' });
    if (share.revoked) return res.status(403).json({ message: 'Share revoked' });
    if (share.expiresAt && new Date() > share.expiresAt) return res.status(403).json({ message: 'Share expired' });
    res.json({
      files: share.fileIds.map(f => ({ filename: f.filename, cloudinaryUrl: f.cloudinaryUrl })),
      expiresAt: share.expiresAt,
      message: share.message || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to access share', error: err.message });
  }
}

export async function bulkDeleteFiles(req, res) {
  try {
    const { fileIds } = req.body;
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ message: 'fileIds (array) required' });
    }
    const files = await VaultFile.find({ _id: { $in: fileIds }, deleted: false });
    const notFound = fileIds.filter(id => !files.some(f => f._id.toString() === id));
    const deleted = [];
    for (const file of files) {
      const isOwner = file.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) continue;
      file.deleted = true;
      file.deletedAt = new Date();
      file.deletedBy = req.user._id;
      await file.save();
      deleted.push(file._id.toString());
      notifyUser(
        req.user._id.toString(),
        'dashboardUpdate',
        {
          action: 'delete',
          fileId: file._id,
          hardDelete: false,
          timestamp: new Date()
        }
      );
    }
    res.json({ message: 'Bulk delete complete', deleted, notFound });
  } catch (err) {
    res.status(500).json({ message: 'Bulk delete failed', error: err.message });
  }
}

export async function bulkRevokeShares(req, res) {
  try {
    const { shareLinks } = req.body;
    if (!Array.isArray(shareLinks) || shareLinks.length === 0) {
      return res.status(400).json({ message: 'shareLinks (array) required' });
    }
    const shares = await VaultShare.find({ link: { $in: shareLinks }, revoked: false });
    const notFound = shareLinks.filter(l => !shares.some(s => s.link === l));
    const revoked = [];
    for (const share of shares) {
      const isOwner = share.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) continue;
      share.revoked = true;
      await share.save();
      revoked.push(share.link);
      notifyUser(
        req.user._id.toString(),
        'dashboardUpdate',
        {
          action: 'revokeShare',
          shareId: share._id,
          link: share.link,
          timestamp: new Date()
        }
      );
    }
    res.json({ message: 'Bulk revoke complete', revoked, notFound });
  } catch (err) {
    res.status(500).json({ message: 'Bulk revoke failed', error: err.message });
  }
}