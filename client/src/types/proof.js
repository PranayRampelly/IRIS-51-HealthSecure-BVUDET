// Proof-related types and interfaces for JavaScript

/**
 * @typedef {Object} Proof
 * @property {string} _id - Proof ID
 * @property {string} patientId - Patient ID
 * @property {string} [doctorId] - Doctor ID (optional)
 * @property {string} proofType - Type of proof
 * @property {string} title - Proof title
 * @property {string} [description] - Proof description (optional)
 * @property {string} statement - Proof statement
 * @property {'Pending'|'Active'|'Expired'|'Revoked'} status - Proof status
 * @property {string} [signature] - Digital signature (optional)
 * @property {string} [signatureHash] - Signature hash (optional)
 * @property {Date} [expiresAt] - Expiration date (optional)
 * @property {boolean} isPublic - Whether proof is public
 * @property {string[]} healthRecordIds - Associated health record IDs
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 * @property {number} accessCount - Number of times accessed
 * @property {number|null} [autoRevokeAfterAccess] - Auto-revoke after access count (optional)
 * @property {boolean} [revoked] - Whether proof is revoked (optional)
 * @property {Date} [revokedAt] - Revocation date (optional)
 * @property {Object} [requestedBy] - Request details (optional)
 * @property {string} requestedBy.name - Requester name
 * @property {string} requestedBy.organization - Requester organization
 * @property {string} requestedBy.role - Requester role
 */

/**
 * @typedef {Object} CreateProofDto
 * @property {string} proofType - Type of proof
 * @property {string} title - Proof title
 * @property {string} [description] - Proof description (optional)
 * @property {string} statement - Proof statement
 * @property {string[]} healthRecordIds - Associated health record IDs
 * @property {Date} [expiresAt] - Expiration date (optional)
 * @property {boolean} isPublic - Whether proof is public
 */

/**
 * @typedef {Object} ProofFilters
 * @property {number} [page] - Page number for pagination
 * @property {number} [limit] - Number of items per page
 * @property {string} [status] - Filter by status
 * @property {string} [proofType] - Filter by proof type
 * @property {string} [search] - Search query
 */

/**
 * @typedef {Object} ProofRequest
 * @property {string} _id - Request ID
 * @property {string} patientId - Patient ID
 * @property {string} proofType - Type of proof requested
 * @property {string} urgency - Urgency level
 * @property {string} reason - Reason for request
 * @property {Date} dueDate - Due date
 * @property {string} category - Request category
 * @property {number} priority - Priority level
 * @property {string} notes - Additional notes
 * @property {boolean} autoFollowUp - Whether to auto-follow up
 * @property {boolean} notifyPatient - Whether to notify patient
 * @property {string[]} documents - Associated documents
 * @property {string} status - Request status
 * @property {string} requestedBy - Requester ID
 * @property {Date} requestedAt - Request date
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} ProofTemplate
 * @property {string} _id - Template ID
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string} category - Template category
 * @property {Object} structure - Template structure
 * @property {boolean} isActive - Whether template is active
 * @property {string} createdBy - Creator ID
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} ProofAccessRequest
 * @property {string} _id - Access request ID
 * @property {string} proofId - Proof ID
 * @property {string} requesterId - Requester ID
 * @property {string} reason - Reason for access
 * @property {string} status - Request status
 * @property {Date} requestedAt - Request date
 * @property {Date} [approvedAt] - Approval date (optional)
 * @property {Date} [deniedAt] - Denial date (optional)
 * @property {string} [approvedBy] - Approver ID (optional)
 * @property {string} [deniedBy] - Denier ID (optional)
 */

/**
 * @typedef {Object} ProofStats
 * @property {number} totalProofs - Total number of proofs
 * @property {number} activeProofs - Number of active proofs
 * @property {number} expiredProofs - Number of expired proofs
 * @property {number} revokedProofs - Number of revoked proofs
 * @property {number} totalAccessRequests - Total access requests
 * @property {number} pendingAccessRequests - Pending access requests
 * @property {number} approvedAccessRequests - Approved access requests
 * @property {number} deniedAccessRequests - Denied access requests
 */

// Export types for use in other files
export const ProofStatus = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked'
};

export const ProofRequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  CANCELLED: 'cancelled'
};

export const AccessRequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied'
};

export const UrgencyLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const ProofCategories = {
  MEDICAL: 'medical',
  INSURANCE: 'insurance',
  LEGAL: 'legal',
  EMPLOYMENT: 'employment',
  EDUCATION: 'education',
  GENERAL: 'general'
};
