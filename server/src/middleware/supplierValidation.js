import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation for creating a supplier
export const validateCreateSupplier = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Supplier name must be between 2 and 100 characters'),

  body('contactName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Contact name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('alternatePhone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid alternate phone number'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a valid 6-digit number'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country must not exceed 50 characters'),

  body('gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number'),

  body('panNumber')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please provide a valid PAN number'),

  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('License number must not exceed 50 characters'),

  body('businessType')
    .optional()
    .isIn(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Other'])
    .withMessage('Business type must be one of: Manufacturer, Distributor, Wholesaler, Retailer, Other'),

  body('deliveryAreas')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Delivery areas cannot exceed 20 items'),

  body('deliveryAreas.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each delivery area must be between 2 and 50 characters'),

  body('minOrderQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order quantity must be a positive number'),

  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a positive number'),

  body('leadTimeDays')
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage('Lead time must be between 0 and 365 days'),

  body('deliveryCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery charges must be a positive number'),

  body('freeDeliveryThreshold')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Free delivery threshold must be a positive number'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),

  body('terms')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Terms must not exceed 1000 characters'),

  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Payment terms must not exceed 200 characters'),

  body('returnPolicy')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Return policy must not exceed 500 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('website')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid website URL'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('isPreferred')
    .optional()
    .isBoolean()
    .withMessage('isPreferred must be a boolean value'),

  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean value'),

  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact name must be between 2 and 50 characters'),

  body('emergencyContact.phone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),

  body('emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid emergency contact email address')
    .normalizeEmail(),

  handleValidationErrors
];

// Validation for updating a supplier
export const validateUpdateSupplier = [
  param('id')
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Supplier name must be between 2 and 100 characters'),

  body('contactName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Contact name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('alternatePhone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid alternate phone number'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  body('pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a valid 6-digit number'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country must not exceed 50 characters'),

  body('gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number'),

  body('panNumber')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please provide a valid PAN number'),

  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('License number must not exceed 50 characters'),

  body('businessType')
    .optional()
    .isIn(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Other'])
    .withMessage('Business type must be one of: Manufacturer, Distributor, Wholesaler, Retailer, Other'),

  body('deliveryAreas')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Delivery areas cannot exceed 20 items'),

  body('deliveryAreas.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each delivery area must be between 2 and 50 characters'),

  body('minOrderQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order quantity must be a positive number'),

  body('minOrderValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order value must be a positive number'),

  body('leadTimeDays')
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage('Lead time must be between 0 and 365 days'),

  body('deliveryCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery charges must be a positive number'),

  body('freeDeliveryThreshold')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Free delivery threshold must be a positive number'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),

  body('terms')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Terms must not exceed 1000 characters'),

  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Payment terms must not exceed 200 characters'),

  body('returnPolicy')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Return policy must not exceed 500 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('website')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid website URL'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('isPreferred')
    .optional()
    .isBoolean()
    .withMessage('isPreferred must be a boolean value'),

  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean value'),

  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact name must be between 2 and 50 characters'),

  body('emergencyContact.phone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),

  body('emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid emergency contact email address')
    .normalizeEmail(),

  handleValidationErrors
];

// Validation for query parameters (list suppliers)
export const validateListSuppliers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search term must be between 2 and 50 characters'),

  query('businessType')
    .optional()
    .isIn(['Manufacturer', 'Distributor', 'Wholesaler', 'Retailer', 'Other'])
    .withMessage('Business type must be one of: Manufacturer, Distributor, Wholesaler, Retailer, Other'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  query('isPreferred')
    .optional()
    .isBoolean()
    .withMessage('isPreferred must be a boolean value'),

  query('sortBy')
    .optional()
    .isIn(['name', 'contactName', 'email', 'city', 'state', 'businessType', 'rating', 'createdAt', 'updatedAt'])
    .withMessage('Sort by must be one of: name, contactName, email, city, state, businessType, rating, createdAt, updatedAt'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// Validation for supplier ID parameter
export const validateSupplierId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  handleValidationErrors
];

// Validation for document upload
export const validateDocumentUpload = [
  param('id')
    .isMongoId()
    .withMessage('Invalid supplier ID'),

  body('documentType')
    .optional()
    .isIn(['license', 'gst', 'pan', 'agreement', 'other'])
    .withMessage('Document type must be one of: license, gst, pan, agreement, other'),

  handleValidationErrors
];

// Validation for location-based search
export const validateLocationSearch = [
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),

  query('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),

  // At least one of city or state must be provided
  (req, res, next) => {
    const { city, state } = req.query;
    if (!city && !state) {
      return res.status(400).json({
        success: false,
        message: 'At least one of city or state is required'
      });
    }
    next();
  },

  handleValidationErrors
];

// Validation for search query
export const validateSearchQuery = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters'),

  handleValidationErrors
];

// File upload validation
export const validateFileUpload = (req, res, next) => {
  if (req.file) {
    // Check file size (max 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }

    // Check file type for images
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images and documents are allowed.'
      });
    }
  }
  next();
};

// Multiple file upload validation
export const validateMultipleFileUpload = (req, res, next) => {
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    for (const file of files) {
      // Check file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB per file.'
        });
      }

      // Check file type
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only images and documents are allowed.'
        });
      }
    }
  }
  next();
};
