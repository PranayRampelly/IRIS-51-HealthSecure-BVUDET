import InsuranceClaim from '../models/InsuranceClaim.js';
import * as cloudinary from '../middleware/cloudinary.js';
import { validateClaimData } from '../validators/claimValidator.js';

// Helper function to format claim data
const formatClaimData = (data) => {
  // Helper to safely parse numbers
  const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  return {
    personalInfo: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      dateOfBirth: data.dateOfBirth || null,
      ssn: data.ssn || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zipCode || ''
    },
    employmentInfo: {
      employer: data.employer || '',
      jobTitle: data.jobTitle || '',
      employmentStatus: data.employmentStatus || '',
      annualIncome: safeParseFloat(data.annualIncome)
    },
    healthInfo: {
      height: safeParseFloat(data.height),
      weight: safeParseFloat(data.weight),
      tobaccoUse: data.tobaccoUse || '',
      preExistingConditions: data.preExistingConditions || '',
      currentMedications: data.currentMedications || '',
      familyHistory: data.familyHistory || ''
    },
    coverageInfo: {
      startDate: data.coverageStartDate || new Date(),
      coverageAmount: safeParseFloat(data.coverageAmount),
      selectedPlan: data.selectedPlan || 'Health', // Default to Health if not provided
      riders: data.riders || []
    },
    dependents: data.dependents || []
  };
};

// Save or update draft
export const saveDraft = async (req, res) => {
  try {
    if (!req.user?._id && !req.user?.id) {
      return res.status(401).json({ success: false, message: 'User ID is required' });
    }

    const userId = req.user._id || req.user.id;
    const claimData = formatClaimData(req.body);
    
    let claim;
    if (req.body.claimId) {
      // Update existing draft
      claim = await InsuranceClaim.findOne({ _id: req.body.claimId, userId });
      if (!claim) {
        return res.status(404).json({ success: false, message: 'Claim not found' });
      }
      
      Object.assign(claim, claimData);
      claim.lastSavedAt = new Date();
    } else {
      // Create new draft
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const claimNumber = `CLM${year}${month}${random}`;

      claim = new InsuranceClaim({
        ...claimData,
        userId,
        claimNumber,
        status: 'draft',
        isDraft: true
      });
    }
    
    await claim.save();
    res.json({ 
      success: true, 
      message: 'Draft saved successfully',
      data: { id: claim._id, claimNumber: claim.claimNumber }
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ success: false, message: 'Failed to save draft' });
  }
};

// Submit claim
export const submitClaim = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.body;
    
    // Validate claim data
    const validationResult = validateClaimData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid claim data', 
        errors: validationResult.errors 
      });
    }
    
    // Find existing claim
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    // Update claim with final data
    const claimData = formatClaimData(req.body);
    Object.assign(claim, claimData);
    
    // Update status and timestamps
    claim.status = 'submitted';
    claim.isDraft = false;
    claim.submittedAt = new Date();
    
    await claim.save();
    
    res.json({
      success: true,
      message: 'Claim submitted successfully',
      data: { id: claim._id, claimNumber: claim.claimNumber }
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ success: false, message: 'Failed to submit claim' });
  }
};

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.params;
    const { name, type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Find claim
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploadToCloudinary(req.file.path, 'insurance-claims');
    
    // Add document to claim
    const document = {
      name,
      type,
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url,
      uploadedAt: new Date(),
      status: 'pending'
    };
    
    claim.documents.push(document);
    await claim.save();
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

// Get claim by ID
export const getClaimById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.params;
    
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId })
      .populate('reviewInfo.reviewedBy', 'firstName lastName');
      
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claim' });
  }
};

// Get user's claims
export const getUserClaims = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { userId };
    if (status) {
      query.status = status;
    }
    
    const claims = await InsuranceClaim.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    res.json({ success: true, data: claims });
  } catch (error) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user claims' });
  }
};

// Get claim statistics for user
export const getClaimStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const stats = await InsuranceClaim.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          totalValue: { $sum: '$coverageInfo.coverageAmount' },
          approvedValue: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'approved'] }, 
                '$coverageInfo.coverageAmount', 
                0 
              ] 
            } 
          }
        }
      }
    ]);
    
    const statistics = stats[0] || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      submitted: 0,
      draft: 0,
      totalValue: 0,
      approvedValue: 0
    };
    
    res.json({ success: true, data: statistics });
  } catch (error) {
    console.error('Error fetching claim statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claim statistics' });
  }
};

// Create new patient claim (draft)
export const createPatientClaim = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const claimData = req.body;
    
    // Generate unique claim number
    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const newClaim = new InsuranceClaim({
      userId,
      claimNumber,
      status: 'draft',
      ...claimData
    });
    
    await newClaim.save();
    
    res.status(201).json({
      success: true,
      message: 'Claim draft created successfully',
      data: newClaim
    });
  } catch (error) {
    console.error('Error creating claim draft:', error);
    res.status(500).json({ success: false, message: 'Failed to create claim draft' });
  }
};

// Update patient claim
export const updatePatientClaim = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.params;
    const updateData = req.body;
    
    const claim = await InsuranceClaim.findOneAndUpdate(
      { _id: claimId, userId },
      { ...updateData, lastSavedAt: new Date() },
      { new: true }
    );
    
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    res.json({
      success: true,
      message: 'Claim updated successfully',
      data: claim
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ success: false, message: 'Failed to update claim' });
  }
};

// Get specific patient claim by ID
export const getPatientClaimById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.params;
    
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claim' });
  }
};

// Delete claim (only draft claims)
export const deleteClaim = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.params;
    
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    if (claim.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft claims can be deleted' });
    }
    
    await InsuranceClaim.findByIdAndDelete(claimId);
    
    res.json({ success: true, message: 'Claim deleted successfully' });
  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({ success: false, message: 'Failed to delete claim' });
  }
};

// Track claim (public endpoint)
export const trackClaim = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const claim = await InsuranceClaim.findOne({ claimNumber: trackingNumber })
      .select('-personalInfo.ssn -personalInfo.email -personalInfo.phone');
    
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('Error tracking claim:', error);
    res.status(500).json({ success: false, message: 'Failed to track claim' });
  }
};

// Export claim as PDF
export const exportClaim = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.params;
    
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    // For now, return claim data as JSON
    // TODO: Implement PDF generation
    res.json({
      success: true,
      message: 'PDF export not yet implemented',
      data: claim
    });
  } catch (error) {
    console.error('Error exporting claim:', error);
    res.status(500).json({ success: false, message: 'Failed to export claim' });
  }
};

// Upload multiple documents for a claim
export const uploadDocuments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    // Find claim
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    const uploadedDocuments = [];
    
    for (const file of req.files) {
      // Upload to Cloudinary
      const result = await cloudinary.uploadToCloudinary(file.path, 'insurance-claims');
      
      // Add document to claim
      const document = {
        name: file.originalname,
        type: file.mimetype,
        cloudinaryId: result.public_id,
        cloudinaryUrl: result.secure_url,
        uploadedAt: new Date(),
        status: 'pending'
      };
      
      claim.documents.push(document);
      uploadedDocuments.push(document);
    }
    
    await claim.save();
    
    res.json({
      success: true,
      message: `${uploadedDocuments.length} document(s) uploaded successfully`,
      data: uploadedDocuments
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ success: false, message: 'Failed to upload documents' });
  }
};

// Remove document from a claim
export const removeDocument = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId, documentId } = req.params;
    
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    const document = claim.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Remove from Cloudinary
    await cloudinary.deleteFromCloudinary(document.cloudinaryId);
    
    // Remove from claim
    document.remove();
    await claim.save();
    
    res.json({ success: true, message: 'Document removed successfully' });
  } catch (error) {
    console.error('Error removing document:', error);
    res.status(500).json({ success: false, message: 'Failed to remove document' });
  }
};

// Get all claims for insurance providers (with pagination, filtering, and statistics)
export const getAllClaims = async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 10, 
      search, 
      claimType, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = {};
    // Role-based scoping: insurance users should only see their own assigned/handled claims
    if (req.user?.role === 'insurance') {
      const reviewerId = req.user._id || req.user.id;
      // Restrict to claims reviewed/handled by this insurance user
      query['reviewInfo.reviewedBy'] = reviewerId;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { claimNumber: { $regex: search, $options: 'i' } },
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    if (claimType && claimType !== 'all') {
      query['coverageInfo.selectedPlan'] = claimType;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination
    const totalClaims = await InsuranceClaim.countDocuments(query);
    const totalPages = Math.ceil(totalClaims / Number(limit));
    
    // Get claims with pagination
    const claims = await InsuranceClaim.find(query)
      .populate('userId', 'firstName lastName email')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    // Get statistics with same query constraints
    const stats = await InsuranceClaim.aggregate([
      { $match: Object.keys(query).length ? query : {} },
      {
        $group: {
          _id: null,
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          totalValue: { $sum: '$coverageInfo.coverageAmount' }
        }
      }
    ]);
    
    const statistics = stats[0] || {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalValue: 0
    };
    
    // Format claims for frontend
    const formattedClaims = claims.map(claim => ({
      _id: claim._id,
      claimId: claim._id,
      claimNumber: claim.claimNumber,
      status: claim.status,
      priority: claim.priority || 'medium',
      patientName: `${claim.personalInfo.firstName} ${claim.personalInfo.lastName}`,
      patientEmail: claim.personalInfo.email,
      providerName: claim.userId ? `${claim.userId.firstName} ${claim.userId.lastName}` : 'Unknown',
      coverageAmount: claim.coverageInfo.coverageAmount,
      selectedPlan: claim.coverageInfo.selectedPlan,
      createdAt: claim.createdAt,
      submittedAt: claim.submittedAt,
      ...claim.toObject()
    }));
    
    res.json({
      success: true,
      data: {
        claims: formattedClaims,
        statistics,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalClaims,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all claims:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claims' });
  }
};

// Delete document from a claim
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { claimId, documentId } = req.params;
    
    const claim = await InsuranceClaim.findOne({ _id: claimId, userId });
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    
    const document = claim.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Remove from Cloudinary
    await cloudinary.deleteFromCloudinary(document.cloudinaryId);
    
    // Remove from claim
    document.remove();
    await claim.save();
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
}; 