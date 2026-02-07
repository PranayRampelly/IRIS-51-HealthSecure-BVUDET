import InsurancePolicy from '../models/InsurancePolicy.js';
import InsuranceApplication from '../models/InsuranceApplication.js';
import Policy from '../models/Policy.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/cloudinary.js';
import mongoose from 'mongoose';

// Debug endpoint to check application status
export const debugApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Debugging application:', id);
    
    const application = await InsuranceApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    console.log('🔍 Application details:', {
      id: application._id,
      status: application.status,
      applicationNumber: application.applicationNumber,
      patientId: application.patientId,
      policyId: application.policyId,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      submittedAt: application.submittedAt
    });
    
    res.json({
      success: true,
      data: {
        id: application._id,
        status: application.status,
        applicationNumber: application.applicationNumber,
        patientId: application.patientId,
        policyId: application.policyId,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        submittedAt: application.submittedAt
      }
    });
  } catch (error) {
    console.error('Error debugging application:', error);
    res.status(500).json({ success: false, message: 'Failed to debug application' });
  }
};

// Get available insurance policies for application
export const getAvailablePolicies = async (req, res) => {
  try {
    console.log('Fetching available policies...');
    
    // First, let's ensure we have some sample policies
    await ensureSamplePoliciesExist();
    
    const policies = await InsurancePolicy.find({ 
      status: 'active', 
      availableForNewEnrollments: true 
    }).select('-documents -networkProviders');
    
    console.log(`Found ${policies.length} available policies:`, policies.map(p => ({ 
      id: p._id, 
      name: p.policyName, 
      type: p.policyType, 
      status: p.status 
    })));
    
    res.json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching available policies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

// Helper function to ensure sample policies exist
const ensureSamplePoliciesExist = async () => {
  try {
    const existingPolicies = await InsurancePolicy.countDocuments({ status: 'active' });
    
    if (existingPolicies === 0) {
      console.log('No active policies found, creating sample policies...');
      
      const samplePolicies = [
        {
          policyNumber: `POL${Date.now()}001`,
          policyName: 'Premium Health Plus',
          policyType: 'Health',
          description: 'Comprehensive health insurance with extensive coverage',
          coverageAmount: 500000,
          deductible: 1000,
          coinsurance: 20,
          copay: 25,
          outOfPocketMax: 5000,
          premium: {
            amount: 450,
            frequency: 'monthly'
          },
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active',
          isPublic: true,
          availableForNewEnrollments: true,
          eligibilityCriteria: {
            minAge: 18,
            maxAge: 65,
            preExistingConditions: true,
            waitingPeriod: 30,
            requiredDocuments: ['ID', 'Medical History']
          },
          coverageDetails: {
            services: ['Hospitalization', 'Outpatient Care', 'Prescription Drugs', 'Mental Health'],
            exclusions: ['Cosmetic Surgery', 'Experimental Treatments'],
            networkType: 'PPO'
          },
          networkProviders: ['City General Hospital', 'Metro Medical Center'],
          documents: [],
          tags: ['premium', 'comprehensive'],
          notes: 'Best value for comprehensive coverage'
        },
        {
          policyNumber: `POL${Date.now()}002`,
          policyName: 'Basic Health Coverage',
          policyType: 'Health',
          description: 'Affordable basic health insurance',
          coverageAmount: 250000,
          deductible: 2000,
          coinsurance: 30,
          copay: 40,
          outOfPocketMax: 8000,
          premium: {
            amount: 250,
            frequency: 'monthly'
          },
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active',
          isPublic: true,
          availableForNewEnrollments: true,
          eligibilityCriteria: {
            minAge: 18,
            maxAge: 70,
            preExistingConditions: false,
            waitingPeriod: 90,
            requiredDocuments: ['ID']
          },
          coverageDetails: {
            services: ['Hospitalization', 'Basic Outpatient Care'],
            exclusions: ['Prescription Drugs', 'Mental Health', 'Dental'],
            networkType: 'HMO'
          },
          networkProviders: ['Community Health Center'],
          documents: [],
          tags: ['basic', 'affordable'],
          notes: 'Entry-level health coverage'
        },
        {
          policyNumber: `POL${Date.now()}003`,
          policyName: 'Family Health Plan',
          policyType: 'Health',
          description: 'Family-focused health insurance with dependents coverage',
          coverageAmount: 750000,
          deductible: 1500,
          coinsurance: 15,
          copay: 20,
          outOfPocketMax: 4000,
          premium: {
            amount: 650,
            frequency: 'monthly'
          },
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active',
          isPublic: true,
          availableForNewEnrollments: true,
          eligibilityCriteria: {
            minAge: 0,
            maxAge: 80,
            preExistingConditions: true,
            waitingPeriod: 15,
            requiredDocuments: ['ID', 'Family Information']
          },
          coverageDetails: {
            services: ['Hospitalization', 'Outpatient Care', 'Prescription Drugs', 'Mental Health', 'Dental', 'Vision'],
            exclusions: ['Cosmetic Surgery'],
            networkType: 'PPO'
          },
          networkProviders: ['Family Medical Center', 'Children\'s Hospital'],
          documents: [],
          tags: ['family', 'comprehensive'],
          notes: 'Perfect for families with children'
        },
        {
          policyNumber: `POL${Date.now()}004`,
          policyName: 'Dental Care Plus',
          policyType: 'Dental',
          description: 'Complete dental coverage including preventive, basic, and major procedures',
          coverageAmount: 25000,
          deductible: 100,
          coinsurance: 0,
          copay: 0,
          outOfPocketMax: 1000,
          premium: {
            amount: 75,
            frequency: 'monthly'
          },
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active',
          isPublic: true,
          availableForNewEnrollments: true,
          eligibilityCriteria: {
            minAge: 0,
            maxAge: 100,
            preExistingConditions: false,
            waitingPeriod: 0,
            requiredDocuments: ['ID']
          },
          coverageDetails: {
            services: ['Preventive Care', 'Basic Procedures', 'Major Procedures'],
            exclusions: ['Cosmetic procedures', 'Orthodontics'],
            networkType: 'PPO'
          },
          networkProviders: ['Bright Smile Dental'],
          documents: [],
          tags: ['dental', 'preventive'],
          notes: 'Complete dental coverage'
        },
        {
          policyNumber: `POL${Date.now()}005`,
          policyName: 'Vision Care Basic',
          policyType: 'Vision',
          description: 'Basic vision coverage for eye exams and corrective lenses',
          coverageAmount: 5000,
          deductible: 0,
          coinsurance: 0,
          copay: 20,
          outOfPocketMax: 200,
          premium: {
            amount: 25,
            frequency: 'monthly'
          },
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          status: 'active',
          isPublic: true,
          availableForNewEnrollments: true,
          eligibilityCriteria: {
            minAge: 0,
            maxAge: 100,
            preExistingConditions: false,
            waitingPeriod: 0,
            requiredDocuments: ['ID']
          },
          coverageDetails: {
            services: ['Eye Exam', 'Glasses', 'Contact Lenses'],
            exclusions: ['Laser eye surgery', 'Designer frames'],
            networkType: 'PPO'
          },
          networkProviders: ['Clear Vision Optometry'],
          documents: [],
          tags: ['vision', 'basic'],
          notes: 'Basic vision coverage'
        }
      ];

      await InsurancePolicy.insertMany(samplePolicies);
      console.log('Sample policies created successfully');
    }
  } catch (error) {
    console.error('Error ensuring sample policies exist:', error);
  }
};

// Create new insurance application
export const createApplication = async (req, res) => {
  try {
    const patientId = req.user._id || req.user.id;
    const { policyId, applicant, employment, health, dependents, coverage } = req.body;
    
    console.log('🔍 Creating application for patient:', patientId);
    console.log('🔍 Policy ID:', policyId);
    
    // Validate policy exists
    const policy = await InsurancePolicy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    
    // Check if user already has an active application for this policy (but allow multiple applications)
    const existingApplication = await InsuranceApplication.findOne({
      patientId,
      policyId,
      status: { $in: ['draft', 'submitted', 'under_review'] }
    });
    
    console.log('🔍 Existing active application found:', existingApplication ? existingApplication._id : 'None');
    
    // Allow multiple applications - just log the existing one but don't block
    if (existingApplication) {
      console.log('🔍 Found existing application but allowing new application creation');
    }
    
    // Check if user already has an approved application and active policy for this policy (but allow multiple applications)
    const approvedApplication = await InsuranceApplication.findOne({
      patientId,
      policyId,
      status: 'approved'
    });
    
    console.log('🔍 Approved application found:', approvedApplication ? approvedApplication._id : 'None');
    
    if (approvedApplication) {
      // Check if there's already an active policy created from this approved application
      const existingPolicy = await Policy.findOne({
        patientId,
        policyId,
        applicationId: approvedApplication._id,
        status: 'active'
      });
      
      console.log('🔍 Existing active policy found:', existingPolicy ? existingPolicy._id : 'None');
      
      // Allow multiple applications even if there's an active policy - just log it
      if (existingPolicy) {
        console.log('🔍 Found existing active policy but allowing new application creation');
      }
    }
    
    // Generate application number
    const count = await InsuranceApplication.countDocuments();
    const applicationNumber = `APP${Date.now()}${String(count + 1).padStart(4, '0')}`;
    
    const application = new InsuranceApplication({
      applicationNumber,
      policyId,
      patientId,
      applicant,
      employment,
      health,
      dependents,
      coverage
    });
    
    await application.save();
    
    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ success: false, message: 'Failed to create application' });
  }
};

// Get user's applications
export const getUserApplications = async (req, res) => {
  try {
    const patientId = req.user._id || req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { patientId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const applications = await InsuranceApplication.find(query)
      .populate('policyId', 'policyName policyType premium coverageAmount')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await InsuranceApplication.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalApplications: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id || req.user.id;
    
    const application = await InsuranceApplication.findOne({ _id: id, patientId })
      .populate('policyId')
      .populate('reviewedBy', 'firstName lastName');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch application' });
  }
};

// Update application
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id || req.user.id;
    const updateData = req.body;
    const userRole = req.user?.role;
    
    console.log('🔍 Updating application:', id);
    console.log('🔍 Patient ID:', patientId);
    console.log('🔍 Update data:', updateData);
    console.log('🔍 User role:', userRole);
    
    // Allow insurance/admin to update status without patient ownership constraint (scoped fields only)
    let application;
    if (userRole === 'insurance' || userRole === 'admin') {
      application = await InsuranceApplication.findById(id);
      if (!application) {
        console.log('🔍 Application not found');
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      // Whitelist updatable fields for insurance/admin
      const allowedStatuses = ['draft', 'under_review', 'submitted', 'pending_documents'];
      const nextStatus = updateData?.status;
      if (nextStatus && !allowedStatuses.includes(nextStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid status transition' });
      }
      if (nextStatus) {
        application.status = nextStatus;
      }
      if (nextStatus === 'under_review') {
        application.reviewedAt = new Date();
        application.reviewedBy = req.user._id || req.user.id;
      }
    } else {
      // Patient can update only their own draft/submitted applications
      application = await InsuranceApplication.findOne({ _id: id, patientId });
      if (!application) {
        console.log('🔍 Application not found');
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      console.log('🔍 Application status:', application.status);
      // Allow updates for draft and submitted applications
      if (application.status !== 'draft' && application.status !== 'submitted') {
        console.log('🔍 Cannot update application - status is:', application.status);
        return res.status(400).json({ 
          success: false, 
          message: `Cannot update application that is in ${application.status} status. Only draft and submitted applications can be updated.` 
        });
      }
      Object.assign(application, updateData);
    }
    
    await application.save();
    
    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ success: false, message: 'Failed to update application' });
  }
};

// Submit application
export const submitApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id || req.user.id;
    
    const application = await InsuranceApplication.findOne({ _id: id, patientId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    if (application.status !== 'draft' && application.status !== 'submitted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Application is not in draft or submitted status' 
      });
    }
    
    // Validate required fields
    const requiredFields = [
      'applicant.firstName', 'applicant.lastName', 'applicant.dateOfBirth',
      'applicant.ssn', 'applicant.email', 'applicant.phone', 'applicant.address',
      'applicant.city', 'applicant.state', 'applicant.zipCode', 'coverage.startDate'
    ];
    
    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], application);
      if (!value) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required field: ${field}` 
        });
      }
    }
    
    application.status = 'submitted';
    application.submittedAt = new Date();
    await application.save();
    
    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
};

// Upload application documents
export const uploadApplicationDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id || req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const application = await InsuranceApplication.findOne({ _id: id, patientId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'insurance-applications');
    
    const document = {
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      documentType: req.body.documentType || 'application_document'
    };
    
    application.documents.push(document);
    await application.save();
    
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

// Delete application document
export const deleteApplicationDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const patientId = req.user._id || req.user.id;
    
    const application = await InsuranceApplication.findOne({ _id: id, patientId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    const document = application.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Delete from Cloudinary if exists
    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId);
    }
    
    application.documents.pull(documentId);
    await application.save();
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};

// Get application statistics
export const getApplicationStatistics = async (req, res) => {
  try {
    const patientId = req.user._id || req.user.id;
    
    const stats = await InsuranceApplication.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(patientId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statistics = {
      total: 0,
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      pending_documents: 0
    };
    
    stats.forEach(stat => {
      statistics[stat._id] = stat.count;
      statistics.total += stat.count;
    });
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
}; 

// Get all applications (for insurance dashboard)
export const getAllApplications = async (req, res) => {
  try {
    const { status, policyType, page = 1, limit = 10, search } = req.query;
    
    console.log('🔍 Fetching all applications with filters:', { status, policyType, search });
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (policyType && policyType !== 'all') {
      query['policyId.policyType'] = policyType;
    }
    if (search) {
      query.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
        { 'applicant.firstName': { $regex: search, $options: 'i' } },
        { 'applicant.lastName': { $regex: search, $options: 'i' } },
        { 'applicant.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Database query:', JSON.stringify(query, null, 2));
    
    const applications = await InsuranceApplication.find(query)
      .populate('policyId', 'policyName policyType premium coverageAmount')
      .populate('patientId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await InsuranceApplication.countDocuments(query);
    
    console.log(`🔍 Found ${applications.length} applications out of ${total} total`);
    console.log('🔍 Sample application:', applications[0] ? {
      id: applications[0]._id,
      applicationNumber: applications[0].applicationNumber,
      status: applications[0].status,
      applicant: applications[0].applicant,
      policyId: applications[0].policyId
    } : 'No applications found');
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalApplications: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// Approve application
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalNotes, effectiveDate } = req.body;
    
    console.log('🔍 Approving application:', id);
    console.log('🔍 User object:', req.user);
    console.log('🔍 Request body:', req.body);
    
    const application = await InsuranceApplication.findById(id)
      .populate('policyId')
      .populate('patientId');
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Update application status
    application.status = 'approved';
    application.approvalDate = new Date();
    application.approvalNotes = approvalNotes;
    application.effectiveDate = effectiveDate || new Date();
    application.reviewedBy = req.user._id || req.user.id || application.patientId._id;
    
    await application.save();
    
    // Create a policy record for the patient
    const policyData = {
      patientId: application.patientId._id,
      policyId: application.policyId._id,
      applicationId: application._id,
      policyNumber: application.applicationNumber.replace('APP', 'POL'),
      status: 'active',
      startDate: application.effectiveDate,
      endDate: new Date(application.effectiveDate.getTime() + (365 * 24 * 60 * 60 * 1000)), // 1 year from effective date
      premium: application.policyId.premium,
      coverageAmount: application.policyId.coverageAmount,
      deductible: application.policyId.deductible || 0,
      coinsurance: application.policyId.coinsurance || 0,
      copay: application.policyId.copay || 0,
      outOfPocketMax: application.policyId.outOfPocketMax || 0,
      usedAmount: 0,
      remainingAmount: application.policyId.coverageAmount,
      policyName: application.policyId.policyName,
      policyType: application.policyId.policyType,
      insuranceCompany: req.user._id || req.user.id || application.patientId._id, // Use user ID or fallback to patient ID
      documents: application.documents || [],
      notes: `Approved from application ${application.applicationNumber}`
    };
    
    console.log('🔍 Creating policy record for patient:', policyData);
    
    // Check if policy already exists for this application
    const existingPolicy = await Policy.findOne({ applicationId: application._id });
    if (existingPolicy) {
      console.log('🔍 Policy already exists for this application, updating...');
      Object.assign(existingPolicy, policyData);
      await existingPolicy.save();
    } else {
      // Create new policy
      const newPolicy = new Policy(policyData);
      await newPolicy.save();
      console.log('🔍 New policy created:', newPolicy._id);
    }
    
    // Send notification to patient
    // TODO: Implement notification service
    
    res.json({
      success: true,
      message: 'Application approved successfully',
      data: {
        application: application,
        policyCreated: true
      }
    });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve application' });
  }
};

// Reject application
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedBy, reason } = req.body;
    
    const application = await InsuranceApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    if (application.status !== 'submitted' && application.status !== 'under_review') {
      return res.status(400).json({ 
        success: false, 
        message: 'Application must be submitted or under review to reject' 
      });
    }
    
    application.status = 'rejected';
    application.rejectedAt = new Date();
    application.reviewedBy = rejectedBy;
    application.rejectionReason = reason;
    await application.save();
    
    res.json({
      success: true,
      message: 'Application rejected',
      data: application
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ success: false, message: 'Failed to reject application' });
  }
};

// Request additional documents
export const requestDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { requestedBy, documents, message } = req.body;
    
    const application = await InsuranceApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    application.status = 'pending_documents';
    application.documentRequests = {
      requestedBy,
      documents,
      message,
      requestedAt: new Date()
    };
    await application.save();
    
    res.json({
      success: true,
      message: 'Document request sent successfully',
      data: application
    });
  } catch (error) {
    console.error('Error requesting documents:', error);
    res.status(500).json({ success: false, message: 'Failed to request documents' });
  }
};

// Export applications
export const exportApplications = async (req, res) => {
  try {
    const { status, policyType, format = 'csv' } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (policyType && policyType !== 'all') {
      query['policyId.policyType'] = policyType;
    }
    
    const applications = await InsuranceApplication.find(query)
      .populate('policyId', 'policyName policyType premium coverageAmount')
      .populate('patientId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      const csvData = applications.map(app => ({
        'Application Number': app.applicationNumber,
        'Applicant Name': `${app.applicant.firstName} ${app.applicant.lastName}`,
        'Email': app.applicant.email,
        'Policy Name': app.policyId?.policyName || 'N/A',
        'Policy Type': app.policyId?.policyType || 'N/A',
        'Status': app.status,
        'Submitted Date': app.submittedAt ? new Date(app.submittedAt).toISOString() : 'N/A',
        'Created Date': new Date(app.createdAt).toISOString()
      }));
      
      const csv = require('csv-stringify');
      csv.stringify(csvData, { header: true }, (err, output) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Failed to generate CSV' });
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
        res.send(output);
      });
    } else {
      res.json({
        success: true,
        data: applications
      });
    }
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({ success: false, message: 'Failed to export applications' });
  }
}; 

// Get applications by policy ID
export const getApplicationsByPolicyId = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { status, page = 1, limit = 10, search } = req.query;
    
    console.log('🔍 Fetching applications for policy ID:', policyId);
    
    const query = { policyId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
        { 'applicant.firstName': { $regex: search, $options: 'i' } },
        { 'applicant.lastName': { $regex: search, $options: 'i' } },
        { 'applicant.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Database query for policy applications:', JSON.stringify(query, null, 2));
    
    const applications = await InsuranceApplication.find(query)
      .populate('policyId', 'policyName policyType premium coverageAmount')
      .populate('patientId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await InsuranceApplication.countDocuments(query);
    
    console.log(`🔍 Found ${applications.length} applications for policy ${policyId} out of ${total} total`);
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalApplications: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching applications by policy ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
}; 