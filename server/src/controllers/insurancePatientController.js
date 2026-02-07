import User from '../models/User.js';
import Policy from '../models/Policy.js';
import InsuranceApplication from '../models/InsuranceApplication.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/cloudinary.js';
import mongoose from 'mongoose';

// Search patients with dynamic filters
export const searchPatients = async (req, res) => {
  try {
    const {
      search,
      policyType,
      status,
      lastVisitAfter,
      hasActivePolicy,
      limit = 20,
      page = 1
    } = req.query;

    console.log('🔍 Patient search request:', { search, policyType, status, lastVisitAfter, hasActivePolicy });

    // Build aggregation pipeline
    const pipeline = [];

    // Match stage for basic user criteria
    const matchStage = {
      role: 'patient',
      isActive: true
    };

    // Add search filters
    if (search) {
      matchStage.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      matchStage.status = status;
    }

    pipeline.push({ $match: matchStage });

    // Lookup insurance policies
    pipeline.push({
      $lookup: {
        from: 'policies',
        localField: '_id',
        foreignField: 'patientId',
        as: 'insurancePolicies'
      }
    });

    // Lookup insurance applications
    pipeline.push({
      $lookup: {
        from: 'insuranceapplications',
        localField: '_id',
        foreignField: 'patientId',
        as: 'insuranceApplications'
      }
    });

    // Add policy type filter
    if (policyType) {
      pipeline.push({
        $match: {
          'insurancePolicies.policyType': policyType
        }
      });
    }

    // Add active policy filter
    if (hasActivePolicy === 'true') {
      pipeline.push({
        $match: {
          'insurancePolicies.status': 'active'
        }
      });
    }

    // Add last visit filter
    if (lastVisitAfter) {
      pipeline.push({
        $match: {
          'insuranceApplications.submittedAt': {
            $gte: new Date(lastVisitAfter)
          }
        }
      });
    }

    // Project stage to shape the output
    pipeline.push({
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        dateOfBirth: 1,
        profilePicture: 1,
        cloudinaryId: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        insurancePolicies: {
          $map: {
            input: '$insurancePolicies',
            as: 'policy',
            in: {
              _id: '$$policy._id',
              policyNumber: '$$policy.policyNumber',
              policyType: '$$policy.policyType',
              status: '$$policy.status',
              coverageAmount: '$$policy.coverageAmount',
              premium: '$$policy.premium'
            }
          }
        },
        lastVisit: {
          $max: '$insuranceApplications.submittedAt'
        },
        policyCount: { $size: '$insurancePolicies' },
        activePolicyCount: {
          $size: {
            $filter: {
              input: '$insurancePolicies',
              as: 'policy',
              cond: { $eq: ['$$policy.status', 'active'] }
            }
          }
        }
      }
    });

    // Sort by relevance and activity
    pipeline.push({
      $sort: {
        activePolicyCount: -1,
        lastVisit: -1,
        firstName: 1,
        lastName: 1
      }
    });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute search
    const patients = await User.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline.slice(0, -2)]; // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const countResult = await User.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    console.log(`🔍 Found ${patients.length} patients out of ${total} total`);

    res.json({
      success: true,
      data: {
        patients,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + patients.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search patients',
      error: error.message 
    });
  }
};

// Get patient by ID with full details
export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findById(patientId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Get patient's insurance policies
    const policies = await Policy.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    // Get patient's insurance applications
    const applications = await InsuranceApplication.find({ patientId })
      .populate('policyId', 'policyName policyType')
      .sort({ createdAt: -1 })
      .lean();

    // Get recent health records (if available)
    const healthRecords = []; // TODO: Integrate with health records system

    const patientData = {
      ...patient,
      insurancePolicies: policies,
      insuranceApplications: applications,
      healthRecords
    };

    res.json({
      success: true,
      data: patientData
    });

  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patient details',
      error: error.message 
    });
  }
};

// Get patient's insurance policies
export const getPatientPolicies = async (req, res) => {
  try {
    const { patientId } = req.params;

    const policies = await Policy.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        policies,
        total: policies.length
      }
    });

  } catch (error) {
    console.error('Error fetching patient policies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patient policies',
      error: error.message 
    });
  }
};

// Get patient's health summary
export const getPatientHealthSummary = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get insurance applications summary
    const applicationsSummary = await InsuranceApplication.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(patientId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get policy summary
    const policySummary = await Policy.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(patientId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          totalPremium: { $sum: '$premium.amount' }
        }
      }
    ]);

    const summary = {
      applications: applicationsSummary,
      policies: policySummary,
      totalApplications: applicationsSummary.reduce((sum, item) => sum + item.count, 0),
      totalPolicies: policySummary.reduce((sum, item) => sum + item.count, 0)
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching patient health summary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patient health summary',
      error: error.message 
    });
  }
};

// Upload patient document to Cloudinary
export const uploadPatientDocument = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'patient-documents');

    // Create document record (you might want to create a separate Document model)
    const documentData = {
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      documentType: documentType || 'patient_document',
      patientId: patientId,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    // TODO: Save document record to database

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: documentData
    });

  } catch (error) {
    console.error('Error uploading patient document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload document',
      error: error.message 
    });
  }
};

// Get patient's recent activity
export const getPatientActivity = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10 } = req.query;

    // Get recent insurance applications
    const applications = await InsuranceApplication.find({ patientId })
      .populate('policyId', 'policyName policyType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get recent policy changes
    const policies = await Policy.find({ patientId })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Combine and sort activities
    const activities = [
      ...applications.map(app => ({
        type: 'application',
        action: `Insurance application ${app.status}`,
        date: app.createdAt,
        details: app.policyId?.policyName || 'Unknown Policy',
        status: app.status
      })),
      ...policies.map(policy => ({
        type: 'policy',
        action: `Policy ${policy.status}`,
        date: policy.updatedAt,
        details: `${policy.policyType} - ${policy.policyNumber}`,
        status: policy.status
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        activities,
        total: activities.length
      }
    });

  } catch (error) {
    console.error('Error fetching patient activity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patient activity',
      error: error.message 
    });
  }
};

// Search patients by insurance policy number
export const searchPatientsByPolicy = async (req, res) => {
  try {
    const { policyNumber } = req.params;

    const policies = await Policy.find({ 
      policyNumber: { $regex: policyNumber, $options: 'i' } 
    }).populate('patientId', 'firstName lastName email phone');

    const patients = policies.map(policy => ({
      _id: policy.patientId._id,
      firstName: policy.patientId.firstName,
      lastName: policy.patientId.lastName,
      email: policy.patientId.email,
      phone: policy.patientId.phone,
      policyNumber: policy.policyNumber,
      policyType: policy.policyType,
      policyStatus: policy.status
    }));

    res.json({
      success: true,
      data: {
        patients,
        total: patients.length
      }
    });

  } catch (error) {
    console.error('Error searching patients by policy:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search patients by policy',
      error: error.message 
    });
  }
};

// Get patient statistics for insurance dashboard
export const getPatientStatistics = async (req, res) => {
  try {
    // Get total patient count
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });

    // Get patients with active policies
    const activePolicyPatients = await Policy.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$patientId' } },
      { $count: 'total' }
    ]);

    // Get patients by policy type
    const patientsByPolicyType = await Policy.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$policyType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent patient registrations
    const recentPatients = await User.countDocuments({
      role: 'patient',
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const statistics = {
      totalPatients,
      activePolicyPatients: activePolicyPatients[0]?.total || 0,
      patientsByPolicyType,
      recentPatients,
      coverageRate: totalPatients > 0 ? Math.round((activePolicyPatients[0]?.total || 0) / totalPatients * 100) : 0
    };

    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('Error fetching patient statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patient statistics',
      error: error.message 
    });
  }
};


