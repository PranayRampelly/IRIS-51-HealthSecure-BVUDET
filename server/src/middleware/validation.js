import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role').isIn(['patient', 'doctor', 'hospital', 'insurance', 'researcher', 'admin', 'bloodbank', 'pharmacy', 'bioaura']).withMessage('Role must be patient, doctor, hospital, insurance, researcher, admin, bloodbank, pharmacy, or bioaura'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Health Record validation rules
export const validateHealthRecord = [
  body('type').isIn(['Lab Report', 'Prescription', 'Imaging', 'EHR Link', 'Vaccination', 'Surgery', 'Allergy', 'Medication', 'Other']).withMessage('Valid record type is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('provider').trim().notEmpty().withMessage('Provider is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  handleValidationErrors
];

// Proof validation rules
export const validateProof = [
  body('proofType').isIn(['Allergy Status', 'Vaccination Status', 'Lab Results', 'Surgery Date', 'Medication Compliance', 'Diabetes Status', 'Age Verification', 'Custom']).withMessage('Valid proof type is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('statement').trim().notEmpty().withMessage('Statement is required'),
  handleValidationErrors
];

// ID validation
export const validateMongoId = [
  param('id').isMongoId().withMessage('Valid ID is required'),
  handleValidationErrors
];

// Query validation
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Insurance Claim validation rules
export const validateClaimCreation = [
  body('policyId').trim().notEmpty().withMessage('Policy ID is required'),
  body('policyNumber').trim().notEmpty().withMessage('Policy number is required'),
  body('policyHolder').trim().notEmpty().withMessage('Policy holder name is required'),
  body('policyHolderSSN').matches(/^\d{3}-?\d{2}-?\d{4}$/).withMessage('Invalid SSN format. Use XXX-XX-XXXX format'),
  body('insuranceProvider').trim().notEmpty().withMessage('Insurance provider is required'),
  body('policyType').isIn(['Health', 'Dental', 'Vision', 'Life', 'Disability', 'Travel', 'Auto']).withMessage('Valid policy type is required'),
  body('claimType').isIn(['medical', 'dental', 'vision', 'pharmacy', 'mental-health', 'emergency', 'accident', 'travel']).withMessage('Valid claim type is required'),
  body('incidentDate').isISO8601().withMessage('Valid incident date is required'),
  body('providerName').trim().notEmpty().withMessage('Provider name is required'),
  handleValidationErrors
];

export const validateClaimUpdate = [
  body('policyHolderSSN').optional().matches(/^\d{3}-?\d{2}-?\d{4}$/).withMessage('Invalid SSN format. Use XXX-XX-XXXX format'),
  body('incidentDate').optional().isISO8601().withMessage('Valid incident date is required'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  handleValidationErrors
];

// Claim item validation
export const validateClaimItem = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('serviceType').optional().isIn(['consultation', 'procedure', 'test', 'medication', 'equipment', 'other']).withMessage('Valid service type is required'),
  handleValidationErrors
];

// Document upload validation
export const validateDocumentUpload = [
  body('documentType').isIn(['itemized-bill', 'medical-records', 'prescription', 'receipts', 'authorization', 'accident-report', 'other-insurance', 'other']).withMessage('Valid document type is required'),
  handleValidationErrors
];

// Custom validation function for claim data
export const validateClaimData = (claim) => {
  const errors = [];

  // For draft claims, only validate basic required fields
  if (claim.status === 'draft') {
    // Only validate the most basic fields for drafts
    if (!claim.policyId) errors.push('Policy ID is required');
    if (!claim.claimType) errors.push('Claim type is required');
    if (!claim.incidentDate) errors.push('Date of service/incident is required');
    
    // Optional validation for drafts
    if (claim.policyHolderSSN) {
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      if (!ssnRegex.test(claim.policyHolderSSN)) {
        errors.push('Invalid SSN format. Use XXX-XX-XXXX format');
      }
    }
    
    if (claim.incidentDate && new Date(claim.incidentDate) > new Date()) {
      errors.push('Incident date cannot be in the future');
    }
    
    return errors.length > 0 ? errors : null;
  }

  // For submitted claims, validate all required fields
  if (!claim.policyId) errors.push('Policy ID is required');
  if (!claim.policyNumber) errors.push('Policy number is required');
  if (!claim.policyHolder) errors.push('Policy holder name is required');
  if (!claim.policyHolderSSN) errors.push('Policy holder SSN is required');
  if (!claim.insuranceProvider) errors.push('Insurance provider is required');
  if (!claim.policyType) errors.push('Policy type is required');
  if (!claim.claimType) errors.push('Claim type is required');
  if (!claim.incidentDate) errors.push('Date of service/incident is required');
  if (!claim.providerName) errors.push('Provider name is required');

  // Claim items validation (only for submitted claims)
  if (!claim.claimItems || claim.claimItems.length === 0) {
    errors.push('At least one claim item is required');
  } else {
    claim.claimItems.forEach((item, index) => {
      if (!item.description) errors.push(`Claim item ${index + 1}: Description is required`);
      if (!item.amount || item.amount <= 0) errors.push(`Claim item ${index + 1}: Valid amount is required`);
      if (!item.date) errors.push(`Claim item ${index + 1}: Date is required`);
    });
  }

  // Document validation (only for submitted claims)
  if (!claim.documents || claim.documents.length === 0) {
    errors.push('At least one supporting document is required');
  }

  // SSN format validation
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  if (claim.policyHolderSSN && !ssnRegex.test(claim.policyHolderSSN)) {
    errors.push('Invalid SSN format. Use XXX-XX-XXXX format');
  }

  // Date validation
  if (claim.incidentDate && new Date(claim.incidentDate) > new Date()) {
    errors.push('Incident date cannot be in the future');
  }

  // Amount validation
  if (claim.totalAmount && claim.totalAmount <= 0) {
    errors.push('Total claim amount must be greater than zero');
  }

  return errors.length > 0 ? errors : null;
};

// Insurance Policy validation rules
export const validatePolicyData = [
  body('policyNumber').trim().notEmpty().withMessage('Policy number is required'),
  body('policyName').trim().notEmpty().withMessage('Policy name is required'),
  body('policyType').isIn(['Health', 'Dental', 'Vision', 'Life', 'Disability', 'Travel', 'Critical Illness', 'Accident', 'Auto']).withMessage('Valid policy type is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('coverageAmount').isFloat({ min: 0 }).withMessage('Coverage amount must be a positive number'),
  body('deductible').isFloat({ min: 0 }).withMessage('Deductible must be a positive number'),
  body('coinsurance').isFloat({ min: 0, max: 100 }).withMessage('Coinsurance must be between 0 and 100'),
  body('outOfPocketMax').isFloat({ min: 0 }).withMessage('Out of pocket maximum must be a positive number'),
  body('premium.amount').isFloat({ min: 0 }).withMessage('Premium amount must be a positive number'),
  body('premium.frequency').optional().isIn(['monthly', 'quarterly', 'semi-annual', 'annual']).withMessage('Valid premium frequency is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('eligibilityCriteria.minAge').isInt({ min: 0 }).withMessage('Minimum age must be a positive number'),
  body('eligibilityCriteria.maxAge').isInt({ min: 0 }).withMessage('Maximum age must be a positive number'),
  body('eligibilityCriteria.waitingPeriod').optional().isInt({ min: 0 }).withMessage('Waiting period must be a positive number'),
  body('coverageDetails.networkType').optional().isIn(['PPO', 'HMO', 'EPO', 'POS', 'HDHP', 'Other']).withMessage('Valid network type is required'),
  handleValidationErrors
];

// Policy document validation
export const validatePolicyDocument = [
  body('documentType').optional().isIn(['policy_document', 'terms_conditions', 'coverage_details', 'claim_procedures', 'network_providers', 'other']).withMessage('Valid document type is required'),
  handleValidationErrors
];

// Custom validation function for policy data
export const validatePolicyDataCustom = (policy) => {
  const errors = [];

  // Basic validation
  if (!policy.policyNumber) errors.push('Policy number is required');
  if (!policy.policyName) errors.push('Policy name is required');
  if (!policy.policyType) errors.push('Policy type is required');
  if (!policy.description) errors.push('Description is required');
  if (!policy.coverageAmount || policy.coverageAmount <= 0) errors.push('Coverage amount must be greater than zero');
  if (!policy.deductible || policy.deductible < 0) errors.push('Deductible must be zero or greater');
  if (!policy.coinsurance || policy.coinsurance < 0 || policy.coinsurance > 100) errors.push('Coinsurance must be between 0 and 100');
  if (!policy.outOfPocketMax || policy.outOfPocketMax <= 0) errors.push('Out of pocket maximum must be greater than zero');
  if (!policy.premium?.amount || policy.premium.amount <= 0) errors.push('Premium amount must be greater than zero');
  if (!policy.startDate) errors.push('Start date is required');
  if (!policy.endDate) errors.push('End date is required');

  // Date validation
  if (policy.startDate && policy.endDate) {
    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
    
    if (startDate < new Date()) {
      errors.push('Start date cannot be in the past');
    }
  }

  // Age validation
  if (policy.eligibilityCriteria?.minAge && policy.eligibilityCriteria?.maxAge) {
    if (policy.eligibilityCriteria.minAge >= policy.eligibilityCriteria.maxAge) {
      errors.push('Maximum age must be greater than minimum age');
    }
  }

  // Coverage validation
  if (policy.coverageDetails?.services) {
    policy.coverageDetails.services.forEach((service, index) => {
      if (!service.name) errors.push(`Service ${index + 1}: Name is required`);
      if (!service.coveragePercentage || service.coveragePercentage < 0 || service.coveragePercentage > 100) {
        errors.push(`Service ${index + 1}: Coverage percentage must be between 0 and 100`);
      }
    });
  }

  return errors.length > 0 ? errors : null;
}; 

export const validateLocation = (req, res, next) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid latitude or longitude format'
    });
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be between -90 and 90'
    });
  }

  if (lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be between -180 and 180'
    });
  }

  next();
};

export const validatePincode = (req, res, next) => {
  const { pincode } = req.params;

  // Basic pincode validation for India (6 digits)
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pincode format. Must be 6 digits.'
    });
  }

  next();
}; 