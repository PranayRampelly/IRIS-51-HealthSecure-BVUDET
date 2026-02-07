import express from 'express';
import multer from 'multer';
import { body, param, query } from 'express-validator';
import { uploadCloud } from '../middleware/cloudinary.js';
import { auth } from '../middleware/auth.js';
import PharmacyCustomer from '../models/PharmacyCustomer.js';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  getCustomersByLocation,
  getPremiumCustomers,
  uploadCustomerDocument,
  deleteCustomerDocument,
  getCustomerStats,
  searchCustomers
} from '../controllers/customerController.js';
import {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateListCustomers,
  validateCustomerId,
  validateDocumentUpload,
  validateLocationSearch,
  validateSearchQuery,
  validateFileUpload,
  validateMultipleFileUpload
} from '../middleware/customerValidation.js';

const router = express.Router();

// Apply authentication middleware to all customer routes
router.use(auth);

// Configure multer for multiple file uploads
const uploadMultiple = multer({
  storage: uploadCloud.storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF images and PDF documents are allowed'), false);
    }
  }
});

// Configure multer for single file upload (profile image)
const uploadSingle = multer({
  storage: uploadCloud.storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
    }
  }
});

// Customer CRUD routes
// GET /pharmacy/customers - List all customers with pagination and filtering
router.get(
  '/',
  validateListCustomers,
  getCustomers
);

// GET /pharmacy/customers/stats - Get customer statistics
router.get('/stats', getCustomerStats);

// GET /pharmacy/customers/search - Search customers
router.get(
  '/search',
  validateSearchQuery,
  searchCustomers
);

// GET /pharmacy/customers/location - Get customers by location
router.get(
  '/location',
  validateLocationSearch,
  getCustomersByLocation
);

// GET /pharmacy/customers/premium - Get premium/VIP customers
router.get('/premium', getPremiumCustomers);

// GET /pharmacy/customers/:id - Get customer by ID
router.get(
  '/:id',
  validateCustomerId,
  getCustomerById
);

// POST /pharmacy/customers - Create new customer
router.post(
  '/',
  uploadSingle.single('profileImage'),
  validateFileUpload,
  validateCreateCustomer,
  createCustomer
);

// PUT /pharmacy/customers/:id - Update customer
router.put(
  '/:id',
  uploadSingle.single('profileImage'),
  validateFileUpload,
  validateUpdateCustomer,
  updateCustomer
);

// DELETE /pharmacy/customers/:id - Delete customer (soft delete)
router.delete(
  '/:id',
  validateCustomerId,
  deleteCustomer
);

// PATCH /pharmacy/customers/:id/status - Toggle customer status
router.patch(
  '/:id/status',
  validateCustomerId,
  toggleCustomerStatus
);

// Document management routes
// POST /pharmacy/customers/:id/documents - Upload customer document
router.post(
  '/:id/documents',
  uploadSingle.single('document'),
  validateDocumentUpload,
  uploadCustomerDocument
);

// DELETE /pharmacy/customers/:id/documents/:docId - Delete customer document
router.delete(
  '/:id/documents/:docId',
  validateCustomerId,
  deleteCustomerDocument
);

// Medical information routes
// POST /pharmacy/customers/:id/allergies - Add allergy
router.post(
  '/:id/allergies',
  validateCustomerId,
  [
    body('allergen')
      .notEmpty()
      .withMessage('Allergen is required')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Allergen name cannot exceed 100 characters'),
    body('severity')
      .optional()
      .isIn(['mild', 'moderate', 'severe'])
      .withMessage('Please select a valid severity level'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { allergen, severity = 'mild', notes = '' } = req.body;
      
      const customer = await PharmacyCustomer.findOne({
        _id: id,
        pharmacy: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.addAllergy(allergen, severity, notes);

      res.json({
        success: true,
        message: 'Allergy added successfully',
        data: customer.medicalInfo.allergies
      });
    } catch (error) {
      console.error('Add allergy error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add allergy',
        error: error.message
      });
    }
  }
);

// POST /pharmacy/customers/:id/chronic-conditions - Add chronic condition
router.post(
  '/:id/chronic-conditions',
  validateCustomerId,
  [
    body('condition')
      .notEmpty()
      .withMessage('Condition is required')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Condition name cannot exceed 100 characters'),
    body('diagnosisDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid diagnosis date'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { condition, diagnosisDate, notes = '' } = req.body;
      
      const customer = await PharmacyCustomer.findOne({
        _id: id,
        pharmacy: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.addChronicCondition(condition, diagnosisDate, notes);

      res.json({
        success: true,
        message: 'Chronic condition added successfully',
        data: customer.medicalInfo.chronicConditions
      });
    } catch (error) {
      console.error('Add chronic condition error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add chronic condition',
        error: error.message
      });
    }
  }
);

// POST /pharmacy/customers/:id/medications - Add current medication
router.post(
  '/:id/medications',
  validateCustomerId,
  [
    body('medication')
      .notEmpty()
      .withMessage('Medication is required')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Medication name cannot exceed 100 characters'),
    body('dosage')
      .notEmpty()
      .withMessage('Dosage is required')
      .trim()
      .isLength({ max: 50 })
      .withMessage('Dosage cannot exceed 50 characters'),
    body('frequency')
      .notEmpty()
      .withMessage('Frequency is required')
      .trim()
      .isLength({ max: 50 })
      .withMessage('Frequency cannot exceed 50 characters'),
    body('prescribedBy')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Prescribed by cannot exceed 100 characters')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { medication, dosage, frequency, prescribedBy = '' } = req.body;
      
      const customer = await PharmacyCustomer.findOne({
        _id: id,
        pharmacy: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.addCurrentMedication(medication, dosage, frequency, prescribedBy);

      res.json({
        success: true,
        message: 'Medication added successfully',
        data: customer.medicalInfo.currentMedications
      });
    } catch (error) {
      console.error('Add medication error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add medication',
        error: error.message
      });
    }
  }
);

// Payment method routes
// POST /pharmacy/customers/:id/payment-methods - Add payment method
router.post(
  '/:id/payment-methods',
  validateCustomerId,
  [
    body('type')
      .isIn(['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'cash_on_delivery'])
      .withMessage('Please select a valid payment method type'),
    body('provider')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Provider name cannot exceed 50 characters'),
    body('lastFourDigits')
      .optional()
      .matches(/^[0-9]{4}$/)
      .withMessage('Last four digits must be exactly 4 digits'),
    body('expiryDate')
      .optional()
      .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      .withMessage('Expiry date must be in MM/YY format'),
    body('isDefault')
      .optional()
      .isBoolean()
      .withMessage('isDefault must be true or false')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const paymentMethodData = req.body;
      
      const customer = await PharmacyCustomer.findOne({
        _id: id,
        pharmacy: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // If this is set as default, remove default from other payment methods
      if (paymentMethodData.isDefault) {
        customer.paymentMethods.forEach(method => {
          method.isDefault = false;
        });
      }

      customer.paymentMethods.push(paymentMethodData);
      await customer.save();

      res.json({
        success: true,
        message: 'Payment method added successfully',
        data: customer.paymentMethods
      });
    } catch (error) {
      console.error('Add payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add payment method',
        error: error.message
      });
    }
  }
);

// DELETE /pharmacy/customers/:id/payment-methods/:methodId - Remove payment method
router.delete(
  '/:id/payment-methods/:methodId',
  validateCustomerId,
  async (req, res) => {
    try {
      const { id, methodId } = req.params;
      
      const customer = await PharmacyCustomer.findOne({
        _id: id,
        pharmacy: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const paymentMethod = customer.paymentMethods.id(methodId);
      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }

      customer.paymentMethods.pull(methodId);
      await customer.save();

      res.json({
        success: true,
        message: 'Payment method removed successfully'
      });
    } catch (error) {
      console.error('Remove payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove payment method',
        error: error.message
      });
    }
  }
);

// Order statistics routes
// PATCH /pharmacy/customers/:id/order-stats - Update order statistics
router.patch(
  '/:id/order-stats',
  validateCustomerId,
  [
    body('orderValue')
      .isNumeric()
      .withMessage('Order value must be a number')
      .isFloat({ min: 0 })
      .withMessage('Order value cannot be negative')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { orderValue } = req.body;
      
      const customer = await PharmacyCustomer.findOne({
        _id: id,
        pharmacy: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.updateOrderStats(orderValue);

      res.json({
        success: true,
        message: 'Order statistics updated successfully',
        data: customer.orderStats
      });
    } catch (error) {
      console.error('Update order stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order statistics',
        error: error.message
      });
    }
  }
);

// PATCH /pharmacy/customers/:id/loyalty-points - Add loyalty points
router.patch(
  '/:id/loyalty-points',
  validateCustomerId,
  [
    body('points')
      .isNumeric()
      .withMessage('Points must be a number')
      .isInt({ min: 1 })
      .withMessage('Points must be a positive integer')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { points } = req.body;
      
      const customer = await PharmacyCustomer.findOne({
        _id: id,
        pharmacy: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.addLoyaltyPoints(points);

      res.json({
        success: true,
        message: 'Loyalty points added successfully',
        data: { loyaltyPoints: customer.orderStats.loyaltyPoints }
      });
    } catch (error) {
      console.error('Add loyalty points error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add loyalty points',
        error: error.message
      });
    }
  }
);

export default router;
