import express from 'express';
import multer from 'multer';
import { uploadCloud } from '../middleware/cloudinary.js';
import { auth } from '../middleware/auth.js';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
  togglePreferredStatus,
  getSuppliersByLocation,
  getPreferredSuppliers,
  uploadSupplierDocument,
  deleteSupplierDocument,
  getSupplierStats,
  searchSuppliers
} from '../controllers/supplierController.js';
import {
  uploadSupplierLogo,
  deleteSupplierLogo,
  getSupplierLogo,
  updateSupplierLogo
} from '../controllers/logoController.js';
import {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateListSuppliers,
  validateSupplierId,
  validateDocumentUpload,
  validateLocationSearch,
  validateSearchQuery,
  validateFileUpload,
  validateMultipleFileUpload
} from '../middleware/supplierValidation.js';

const router = express.Router();

// Apply authentication middleware to all supplier routes
router.use(auth);

// Configure multer for multiple file uploads
const uploadMultiple = multer({
  storage: uploadCloud.storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
    }
  }
});

// GET /pharmacy/suppliers - Get all suppliers with pagination and filtering
router.get('/', validateListSuppliers, getSuppliers);

// GET /pharmacy/suppliers/search - Search suppliers
router.get('/search', validateSearchQuery, searchSuppliers);

// GET /pharmacy/suppliers/location - Get suppliers by location
router.get('/location', validateLocationSearch, getSuppliersByLocation);

// GET /pharmacy/suppliers/preferred - Get preferred suppliers
router.get('/preferred', getPreferredSuppliers);

// GET /pharmacy/suppliers/stats - Get supplier statistics
router.get('/stats', getSupplierStats);

// GET /pharmacy/suppliers/:id - Get supplier by ID
router.get('/:id', validateSupplierId, getSupplierById);

// POST /pharmacy/suppliers - Create new supplier
router.post(
  '/',
  uploadCloud.single('logo'),
  validateFileUpload,
  validateCreateSupplier,
  createSupplier
);

// POST /pharmacy/suppliers/:id/documents - Upload supplier document
router.post(
  '/:id/documents',
  uploadCloud.single('document'),
  validateFileUpload,
  validateDocumentUpload,
  uploadSupplierDocument
);

// Logo management routes
// POST /pharmacy/suppliers/:id/logo - Upload supplier logo
router.post(
  '/:id/logo',
  uploadCloud.single('logo'),
  validateFileUpload,
  validateSupplierId,
  uploadSupplierLogo
);

// PUT /pharmacy/suppliers/:id/logo - Update supplier logo
router.put(
  '/:id/logo',
  uploadCloud.single('logo'),
  validateFileUpload,
  validateSupplierId,
  updateSupplierLogo
);

// GET /pharmacy/suppliers/:id/logo - Get supplier logo
router.get('/:id/logo', validateSupplierId, getSupplierLogo);

// DELETE /pharmacy/suppliers/:id/logo - Delete supplier logo
router.delete('/:id/logo', validateSupplierId, deleteSupplierLogo);

// PUT /pharmacy/suppliers/:id - Update supplier
router.put(
  '/:id',
  uploadCloud.single('logo'),
  validateFileUpload,
  validateUpdateSupplier,
  updateSupplier
);

// PATCH /pharmacy/suppliers/:id/status - Toggle supplier status
router.patch('/:id/status', validateSupplierId, toggleSupplierStatus);

// PATCH /pharmacy/suppliers/:id/preferred - Toggle preferred status
router.patch('/:id/preferred', validateSupplierId, togglePreferredStatus);

// DELETE /pharmacy/suppliers/:id - Delete supplier
router.delete('/:id', validateSupplierId, deleteSupplier);

// DELETE /pharmacy/suppliers/:id/documents/:documentId - Delete supplier document
router.delete('/:id/documents/:documentId', validateSupplierId, deleteSupplierDocument);

// Bulk operations
// POST /pharmacy/suppliers/bulk-upload - Bulk upload suppliers (CSV)
router.post('/bulk-upload', uploadCloud.single('file'), (req, res) => {
  res.json({
    success: false,
    message: 'Bulk upload feature coming soon'
  });
});

// POST /pharmacy/suppliers/bulk-delete - Bulk delete suppliers
router.post('/bulk-delete', (req, res) => {
  const { supplierIds } = req.body;
  
  if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Supplier IDs array is required'
    });
  }

  res.json({
    success: false,
    message: 'Bulk delete feature coming soon'
  });
});

// Export suppliers
// GET /pharmacy/suppliers/export - Export suppliers to CSV/Excel
router.get('/export', (req, res) => {
  res.json({
    success: false,
    message: 'Export feature coming soon'
  });
});

// Import suppliers
// POST /pharmacy/suppliers/import - Import suppliers from CSV/Excel
router.post('/import', uploadCloud.single('file'), (req, res) => {
  res.json({
    success: false,
    message: 'Import feature coming soon'
  });
});

// Supplier analytics
// GET /pharmacy/suppliers/analytics - Get detailed analytics
router.get('/analytics', (req, res) => {
  res.json({
    success: false,
    message: 'Analytics feature coming soon'
  });
});

// Supplier reviews and ratings
// POST /pharmacy/suppliers/:id/reviews - Add supplier review
router.post('/:id/reviews', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Review feature coming soon'
  });
});

// GET /pharmacy/suppliers/:id/reviews - Get supplier reviews
router.get('/:id/reviews', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Review feature coming soon'
  });
});

// Supplier communication
// POST /pharmacy/suppliers/:id/contact - Send message to supplier
router.post('/:id/contact', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Contact feature coming soon'
  });
});

// GET /pharmacy/suppliers/:id/communication - Get communication history
router.get('/:id/communication', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Communication feature coming soon'
  });
});

// Supplier orders and transactions
// GET /pharmacy/suppliers/:id/orders - Get supplier orders
router.get('/:id/orders', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Orders feature coming soon'
  });
});

// GET /pharmacy/suppliers/:id/transactions - Get supplier transactions
router.get('/:id/transactions', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Transactions feature coming soon'
  });
});

// Supplier performance metrics
// GET /pharmacy/suppliers/:id/performance - Get supplier performance metrics
router.get('/:id/performance', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Performance metrics feature coming soon'
  });
});

// Supplier contracts and agreements
// POST /pharmacy/suppliers/:id/contracts - Add supplier contract
router.post('/:id/contracts', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Contracts feature coming soon'
  });
});

// GET /pharmacy/suppliers/:id/contracts - Get supplier contracts
router.get('/:id/contracts', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Contracts feature coming soon'
  });
});

// Supplier notifications
// POST /pharmacy/suppliers/:id/notifications - Send notification to supplier
router.post('/:id/notifications', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Notifications feature coming soon'
  });
});

// GET /pharmacy/suppliers/:id/notifications - Get supplier notifications
router.get('/:id/notifications', validateSupplierId, (req, res) => {
  res.json({
    success: false,
    message: 'Notifications feature coming soon'
  });
});

export default router;
