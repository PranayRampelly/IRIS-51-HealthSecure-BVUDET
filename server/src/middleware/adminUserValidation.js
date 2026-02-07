import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
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

// Validation for creating a new user
export const validateCreateUser = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('role')
    .isIn(['patient', 'doctor', 'insurance', 'researcher', 'admin'])
    .withMessage('Role must be one of: patient, doctor, insurance, researcher, admin'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('Date of birth must be reasonable');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Gender must be one of: Male, Female, Other, Prefer not to say'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed', 'Separated'])
    .withMessage('Marital status must be one of: Single, Married, Divorced, Widowed, Separated'),
  
  // Doctor-specific validations
  body('licenseNumber')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('License number is required for doctors')
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters'),
  
  body('specialization')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Specialization is required for doctors')
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  
  body('hospital')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Hospital is required for doctors')
    .isLength({ min: 2, max: 100 })
    .withMessage('Hospital must be between 2 and 100 characters'),
  
  // Patient-specific validations
  body('bloodType')
    .if(body('role').equals('patient'))
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-'),
  
  body('height')
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage('Height must be between 50 and 250 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 10, max: 300 })
    .withMessage('Weight must be between 10 and 300 kg'),
  
  handleValidationErrors
];

// Validation for updating a user
export const validateUpdateUser = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('Date of birth must be reasonable');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Gender must be one of: Male, Female, Other, Prefer not to say'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed', 'Separated'])
    .withMessage('Marital status must be one of: Single, Married, Divorced, Widowed, Separated'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('isEmailVerified must be a boolean value'),
  
  // Doctor-specific validations
  body('licenseNumber')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters'),
  
  body('specialization')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  
  body('hospital')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hospital must be between 2 and 100 characters'),
  
  // Patient-specific validations
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-'),
  
  body('height')
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage('Height must be between 50 and 250 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 10, max: 300 })
    .withMessage('Weight must be between 10 and 300 kg'),
  
  handleValidationErrors
];

// Validation for query parameters (list users)
export const validateListUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('role')
    .optional()
    .isIn(['patient', 'doctor', 'insurance', 'researcher', 'admin'])
    .withMessage('Role must be one of: patient, doctor, insurance, researcher, admin'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either "active" or "inactive"'),
  
  query('search')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search term must be between 2 and 50 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'role', 'createdAt', 'lastLogin'])
    .withMessage('Sort by must be one of: firstName, lastName, email, role, createdAt, lastLogin'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
  
  handleValidationErrors
];

// Validation for user ID parameter
export const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  handleValidationErrors
];

// Validation for file upload
export const validateFileUpload = (req, res, next) => {
  if (req.file) {
    // Check file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 5MB.'
      });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      });
    }
  }
  next();
}; 