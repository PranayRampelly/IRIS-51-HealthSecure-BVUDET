// Validation helper functions
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const isValidSSN = (ssn) => {
  return /^\d{3}-?\d{2}-?\d{4}$/.test(ssn);
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^\+?[\d\s-()]{10,}$/.test(phone);
};

const isValidZipCode = (zipCode) => {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
};

// Main validation function
export const validateClaimData = (data) => {
  const errors = [];

  // Personal Information
  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }
  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }
  if (!data.dateOfBirth || !isValidDate(data.dateOfBirth)) {
    errors.push('Valid date of birth is required');
  }
  if (data.ssn && !isValidSSN(data.ssn)) {
    errors.push('Invalid SSN format');
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }
  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Valid phone number is required');
  }
  if (!data.address?.trim()) {
    errors.push('Address is required');
  }
  if (!data.city?.trim()) {
    errors.push('City is required');
  }
  if (!data.state?.trim()) {
    errors.push('State is required');
  }
  if (!data.zipCode || !isValidZipCode(data.zipCode)) {
    errors.push('Valid ZIP code is required');
  }

  // Employment Information
  if (data.employmentStatus && !['full-time', 'part-time', 'self-employed', 'unemployed', 'retired', 'student'].includes(data.employmentStatus)) {
    errors.push('Invalid employment status');
  }
  if (data.annualIncome && (isNaN(data.annualIncome) || parseFloat(data.annualIncome) < 0)) {
    errors.push('Annual income must be a positive number');
  }

  // Health Information
  if (data.height && (isNaN(data.height) || parseFloat(data.height) <= 0)) {
    errors.push('Height must be a positive number');
  }
  if (data.weight && (isNaN(data.weight) || parseFloat(data.weight) <= 0)) {
    errors.push('Weight must be a positive number');
  }
  if (data.tobaccoUse && !['never', 'former', 'current'].includes(data.tobaccoUse)) {
    errors.push('Invalid tobacco use status');
  }

  // Coverage Information
  if (!data.selectedPlan?.trim()) {
    errors.push('Selected plan is required');
  }
  if (!data.coverageStartDate || !isValidDate(data.coverageStartDate)) {
    errors.push('Valid coverage start date is required');
  }
  if (data.coverageAmount && (isNaN(data.coverageAmount) || parseFloat(data.coverageAmount) <= 0)) {
    errors.push('Coverage amount must be a positive number');
  }

  // Dependents Validation
  if (data.dependents?.length > 0) {
    data.dependents.forEach((dependent, index) => {
      if (!dependent.firstName?.trim()) {
        errors.push(`Dependent ${index + 1}: First name is required`);
      }
      if (!dependent.lastName?.trim()) {
        errors.push(`Dependent ${index + 1}: Last name is required`);
      }
      if (!dependent.dateOfBirth || !isValidDate(dependent.dateOfBirth)) {
        errors.push(`Dependent ${index + 1}: Valid date of birth is required`);
      }
      if (!dependent.relationship || !['spouse', 'child', 'stepchild', 'adopted', 'foster', 'domestic-partner'].includes(dependent.relationship)) {
        errors.push(`Dependent ${index + 1}: Invalid relationship`);
      }
      if (dependent.ssn && !isValidSSN(dependent.ssn)) {
        errors.push(`Dependent ${index + 1}: Invalid SSN format`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 