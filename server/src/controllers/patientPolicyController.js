import Policy from '../models/Policy.js';
import InsuranceApplication from '../models/InsuranceApplication.js';
import mongoose from 'mongoose';

// Helper function to check and create policies from approved applications
const checkAndCreatePoliciesFromApplications = async (patientId) => {
  try {
    console.log('🔍 Checking for approved applications for patient:', patientId);
    
    // Find approved applications for this patient that don't have policies yet
    const approvedApplications = await InsuranceApplication.find({
      patientId: patientId,
      status: 'approved'
    }).populate('policyId');
    
    console.log(`🔍 Found ${approvedApplications.length} approved applications`);
    
    for (const app of approvedApplications) {
      // Check if policy already exists for this application
      const existingPolicy = await Policy.findOne({ applicationId: app._id });
      
      if (!existingPolicy) {
        console.log(`🔍 Creating policy for approved application: ${app.applicationNumber}`);
        
        const policyData = {
          patientId: app.patientId,
          policyId: app.policyId._id,
          applicationId: app._id,
          policyNumber: app.applicationNumber.replace('APP', 'POL'),
          status: 'active',
          startDate: app.effectiveDate || app.approvalDate || new Date(),
          endDate: new Date((app.effectiveDate || app.approvalDate || new Date()).getTime() + (365 * 24 * 60 * 60 * 1000)), // 1 year
          premium: app.policyId.premium,
          coverageAmount: app.policyId.coverageAmount,
          deductible: app.policyId.deductible || 0,
          coinsurance: app.policyId.coinsurance || 0,
          copay: app.policyId.copay || 0,
          outOfPocketMax: app.policyId.outOfPocketMax || 0,
          usedAmount: 0,
          remainingAmount: app.policyId.coverageAmount,
          policyName: app.policyId.policyName,
          policyType: app.policyId.policyType,
          insuranceCompany: app.reviewedBy || app.patientId, // Use reviewer or patient as insurance company
          documents: app.documents || [],
          notes: `Auto-created from approved application ${app.applicationNumber}`,
          autoRenew: true
        };
        
        const newPolicy = new Policy(policyData);
        await newPolicy.save();
        console.log(`🔍 Created policy: ${newPolicy.policyNumber}`);
      } else {
        console.log(`🔍 Policy already exists for application: ${app.applicationNumber}`);
      }
    }
  } catch (error) {
    console.error('🔍 Error in checkAndCreatePoliciesFromApplications:', error);
  }
};

// Get patient's policies
export const getPatientPolicies = async (req, res) => {
  try {
    const patientId = req.user._id || req.user.id;
    console.log('🔍 Fetching policies for patient:', patientId);
    
    if (!patientId) {
      console.error('🔍 No patient ID found in request user:', req.user);
      return res.status(400).json({ 
        success: false, 
        message: 'No patient ID found in request' 
      });
    }
    
    // First, check if there are any approved applications that should create policies
    await checkAndCreatePoliciesFromApplications(patientId);
    
    const policies = await Policy.find({ patientId }).sort({ createdAt: -1 });
    console.log('🔍 Found policies:', policies.length);
    
    res.json({
      success: true,
      data: policies
    });
  } catch (error) {
    console.error('Error fetching patient policies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

// Get policy by ID
export const getPolicyById = async (req, res) => {
  try {
    const { policyId } = req.params;
    const patientId = req.user._id || req.user.id;
    
    const policy = await Policy.findOne({ _id: policyId, patientId })
      .populate('policyId', 'policyName policyType premium coverageAmount deductible coinsurance copay outOfPocketMax')
      .populate('insuranceCompany', 'firstName lastName companyName')
      .populate('applicationId', 'applicationNumber status');
    
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policy' });
  }
};

// Update policy (for patient to update their own policy details)
export const updatePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const patientId = req.user._id || req.user.id;
    const { autoRenew, notes } = req.body;
    
    const policy = await Policy.findOne({ _id: policyId, patientId });
    
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    
    // Only allow updating certain fields
    if (autoRenew !== undefined) policy.autoRenew = autoRenew;
    if (notes !== undefined) policy.notes = notes;
    
    await policy.save();
    
    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ success: false, message: 'Failed to update policy' });
  }
};

// Get policy statistics
export const getPolicyStatistics = async (req, res) => {
  try {
    const patientId = req.user._id || req.user.id;
    console.log('🔍 Fetching policy statistics for patient:', patientId);
    
    if (!patientId) {
      console.error('🔍 No patient ID found in request user:', req.user);
      return res.status(400).json({ 
        success: false, 
        message: 'No patient ID found in request' 
      });
    }
    
    const policies = await Policy.find({ patientId });
    
    const stats = {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      totalCoverage: policies.reduce((sum, p) => sum + (p.coverageAmount || 0), 0),
      totalPremium: policies.reduce((sum, p) => sum + (p.premium?.amount || 0), 0),
      totalUsed: policies.reduce((sum, p) => sum + (p.usedAmount || 0), 0),
      totalRemaining: policies.reduce((sum, p) => sum + (p.remainingAmount || 0), 0)
    };
    
    console.log('🔍 Policy statistics:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching policy statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
}; 

// Test endpoint to create a sample policy (for debugging)
export const createTestPolicy = async (req, res) => {
  try {
    const patientId = req.user._id || req.user.id; // Use _id first, fallback to id
    const customData = req.body; // Accept custom data from request body
    
    console.log('🔍 Creating test policy for patient:', patientId);
    console.log('🔍 User object:', req.user);
    console.log('🔍 Custom data received:', customData);
    
    if (!patientId) {
      console.error('🔍 No patient ID found in request user:', req.user);
      return res.status(400).json({ 
        success: false, 
        message: 'No patient ID found in request' 
      });
    }
    
    // Generate unique policy number
    const timestamp = Date.now();
    const policyNumber = customData.policyNumber || `TEST-POL-${timestamp}`;
    
    // Check if test policy already exists
    const existingPolicy = await Policy.findOne({ 
      patientId, 
      policyNumber: policyNumber 
    });
    
    if (existingPolicy) {
      console.log('🔍 Test policy already exists');
      return res.json({
        success: true,
        message: 'Test policy already exists',
        data: existingPolicy
      });
    }
    
    // Create a test policy with custom data or defaults
    const testPolicy = new Policy({
      patientId: patientId, // Ensure patientId is set
      policyId: customData.policyId || '687be3873512610c69167d3d', // Use existing policy ID
      applicationId: customData.applicationId || '687bf61901cf78b42ec8cc4c', // Use existing application ID
      policyNumber: policyNumber,
      status: customData.status || 'active',
      startDate: customData.startDate || new Date(),
      endDate: customData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      premium: customData.premium || {
        amount: 450,
        frequency: 'monthly'
      },
      coverageAmount: customData.coverageAmount || 50000,
      deductible: customData.deductible || 1000,
      coinsurance: customData.coinsurance || 20,
      copay: customData.copay || 25,
      outOfPocketMax: customData.outOfPocketMax || 5000,
      usedAmount: customData.usedAmount || 2800,
      remainingAmount: customData.remainingAmount || 47200,
      policyName: customData.policyName || 'Test Health Insurance',
      policyType: customData.policyType || 'Health',
      insuranceCompany: patientId, // Use patientId as insuranceCompany for test
      documents: customData.documents || [],
      notes: customData.notes || `Test policy created for debugging - ${policyNumber}`,
      autoRenew: customData.autoRenew !== undefined ? customData.autoRenew : true
    });
    
    console.log('🔍 Test policy data:', JSON.stringify(testPolicy, null, 2));
    
    await testPolicy.save();
    
    console.log('🔍 Test policy created:', testPolicy._id);
    
    res.json({
      success: true,
      message: 'Test policy created successfully',
      data: testPolicy
    });
  } catch (error) {
    console.error('Error creating test policy:', error);
    res.status(500).json({ success: false, message: 'Failed to create test policy' });
  }
}; 