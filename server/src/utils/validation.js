import mongoose from 'mongoose';

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The string to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
export const validateObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates if a string is a valid email format
 * @param {string} email - The email string to validate
 * @returns {boolean} - True if valid email, false otherwise
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string is a valid phone number (basic validation)
 * @param {string} phone - The phone string to validate
 * @returns {boolean} - True if valid phone, false otherwise
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it has 10-15 digits (international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validates if a string is not empty and has minimum length
 * @param {string} value - The string to validate
 * @param {number} minLength - Minimum length required
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateString = (value, minLength = 1) => {
  return value && typeof value === 'string' && value.trim().length >= minLength;
};

/**
 * Validates if a number is within a specified range
 * @param {number} value - The number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateNumberRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validates if a date is valid and not in the past
 * @param {string|Date} date - The date to validate
 * @param {boolean} allowPast - Whether to allow past dates
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateDate = (date, allowPast = false) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  if (!allowPast) {
    const now = new Date();
    return dateObj >= now;
  }
  
  return true;
};

/**
 * Validates if a value is one of the allowed options
 * @param {*} value - The value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Sanitizes a string by removing potentially dangerous characters
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validates and sanitizes user input
 * @param {Object} data - The data object to validate
 * @param {Object} schema - The validation schema
 * @returns {Object} - Object with isValid boolean and errors array
 */
export const validateData = (data, schema) => {
  const errors = [];
  const sanitizedData = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if required
    if (rules.required && !value) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if value is empty and not required
    if (!value && !rules.required) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }

    // String validation
    if (rules.type === 'string') {
      if (!validateString(value, rules.minLength || 1)) {
        errors.push(`${field} must be a non-empty string`);
        continue;
      }
      sanitizedData[field] = sanitizeString(value);
    }

    // Number validation
    if (rules.type === 'number') {
      if (!validateNumberRange(value, rules.min || -Infinity, rules.max || Infinity)) {
        errors.push(`${field} must be a valid number`);
        continue;
      }
      sanitizedData[field] = Number(value);
    }

    // Email validation
    if (rules.email && !validateEmail(value)) {
      errors.push(`${field} must be a valid email address`);
      continue;
    }

    // Phone validation
    if (rules.phone && !validatePhone(value)) {
      errors.push(`${field} must be a valid phone number`);
      continue;
    }

    // Date validation
    if (rules.date && !validateDate(value, rules.allowPast)) {
      errors.push(`${field} must be a valid date`);
      continue;
    }

    // Enum validation
    if (rules.enum && !validateEnum(value, rules.enum)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      continue;
    }

    // ObjectId validation
    if (rules.objectId && !validateObjectId(value)) {
      errors.push(`${field} must be a valid ID`);
      continue;
    }

    // If no specific validation rules, just sanitize if it's a string
    if (typeof value === 'string') {
      sanitizedData[field] = sanitizeString(value);
    } else {
      sanitizedData[field] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
};
