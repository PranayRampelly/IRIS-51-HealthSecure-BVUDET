import { body, param, query } from 'express-validator';

// Validation for creating a customer
export const validateCreateCustomer = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .trim(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('alternatePhone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid alternate phone number'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),
  
  body('gender')
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Please select a valid gender'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  
  body('address.pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country name cannot exceed 50 characters'),
  
  body('medicalInfo.bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
    .withMessage('Please select a valid blood group'),
  
  body('medicalInfo.allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  
  body('medicalInfo.allergies.*.allergen')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Allergen name cannot exceed 100 characters'),
  
  body('medicalInfo.allergies.*.severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Please select a valid severity level'),
  
  body('medicalInfo.chronicConditions')
    .optional()
    .isArray()
    .withMessage('Chronic conditions must be an array'),
  
  body('medicalInfo.chronicConditions.*.condition')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Condition name cannot exceed 100 characters'),
  
  body('medicalInfo.currentMedications')
    .optional()
    .isArray()
    .withMessage('Current medications must be an array'),
  
  body('insurance.provider')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Insurance provider name cannot exceed 100 characters'),
  
  body('insurance.policyNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Policy number cannot exceed 50 characters'),
  
  body('insurance.copayAmount')
    .optional()
    .isNumeric()
    .withMessage('Copay amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Copay amount cannot be negative'),
  
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name cannot exceed 100 characters'),
  
  body('emergencyContact.phone')
    .optional()
    .matches(/^[\+]?[0-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid emergency contact email')
    .normalizeEmail(),
  
  body('customerType')
    .optional()
    .isIn(['regular', 'premium', 'vip', 'wholesale'])
    .withMessage('Please select a valid customer type'),
  
  body('preferredLanguage')
    .optional()
    .isIn(['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi'])
    .withMessage('Please select a valid preferred language'),
  
  body('communicationPreferences.email')
    .optional()
    .isBoolean()
    .withMessage('Email preference must be true or false'),
  
  body('communicationPreferences.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS preference must be true or false'),
  
  body('communicationPreferences.phone')
    .optional()
    .isBoolean()
    .withMessage('Phone preference must be true or false'),
  
  body('communicationPreferences.whatsapp')
    .optional()
    .isBoolean()
    .withMessage('WhatsApp preference must be true or false'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
];

// Validation for updating a customer
export const validateUpdateCustomer = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
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
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Please select a valid gender'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Please select a valid status'),
  
  body('customerType')
    .optional()
    .isIn(['regular', 'premium', 'vip', 'wholesale'])
    .withMessage('Please select a valid customer type'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Validation for listing customers
export const validateListCustomers = [
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
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Please select a valid status'),
  
  query('customerType')
    .optional()
    .isIn(['regular', 'premium', 'vip', 'wholesale'])
    .withMessage('Please select a valid customer type'),
  
  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'createdAt', 'orderStats.totalSpent', 'orderStats.lastOrderDate'])
    .withMessage('Please select a valid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Validation for customer ID parameter
export const validateCustomerId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID')
];

// Validation for document upload
export const validateDocumentUpload = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  body('type')
    .isIn(['id_proof', 'insurance_card', 'prescription', 'medical_report', 'other'])
    .withMessage('Please select a valid document type'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Document name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Validation for location search
export const validateLocationSearch = [
  query('city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  
  query('state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  
  query('pincode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit pincode')
];

// Validation for search query
export const validateSearchQuery = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Validation for file upload
export const validateFileUpload = [
  body('profileImage')
    .optional()
    .custom((value, { req }) => {
      if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only JPEG, PNG, and GIF images are allowed');
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
          throw new Error('Image size cannot exceed 5MB');
        }
      }
      return true;
    })
];

// Validation for multiple file upload
export const validateMultipleFileUpload = [
  body('documents')
    .optional()
    .custom((value, { req }) => {
      if (req.files && req.files.length > 0) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        for (const file of req.files) {
          if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Only JPEG, PNG, GIF images and PDF documents are allowed');
          }
          if (file.size > maxSize) {
            throw new Error('File size cannot exceed 10MB');
          }
        }
      }
      return true;
    })
];

