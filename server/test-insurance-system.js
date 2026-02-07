import mongoose from 'mongoose';
import InsurancePolicy from './src/models/InsurancePolicy.js';
import InsuranceApplication from './src/models/InsuranceApplication.js';
import InsuranceClaim from './src/models/InsuranceClaim.js';
import User from './src/models/User.js';

async function testInsuranceSystem() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    console.log('🏥 Testing Insurance System...\n');

    // Test 1: Create insurance policy
    console.log('1. Creating insurance policy...');
    const newPolicy = new InsurancePolicy({
      policyNumber: 'POL-' + Date.now(),
      policyType: 'health',
      coverageType: 'comprehensive',
      premium: 5000,
      coverageAmount: 500000,
      deductible: 10000,
      coPay: 20,
      maxCoverage: 1000000,
      benefits: [
        'Hospitalization',
        'Outpatient care',
        'Prescription drugs',
        'Emergency services'
      ],
      exclusions: [
        'Cosmetic procedures',
        'Experimental treatments'
      ],
      terms: 'Standard health insurance terms apply',
      isActive: true
    });

    await newPolicy.save();
    console.log('✅ Insurance policy created successfully');
    console.log('   - Policy Number:', newPolicy.policyNumber);
    console.log('   - Type:', newPolicy.policyType);
    console.log('   - Premium:', newPolicy.premium);
    console.log('   - Coverage Amount:', newPolicy.coverageAmount);

    // Test 2: Create insurance application
    console.log('\n2. Creating insurance application...');
    const newApplication = new InsuranceApplication({
      applicantId: new mongoose.Types.ObjectId(),
      policyId: newPolicy._id,
      applicationType: 'new',
      status: 'pending',
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        phone: '+91-9876543210',
        email: 'john.doe@example.com'
      },
      medicalInfo: {
        hasPreExistingConditions: false,
        currentMedications: [],
        recentSurgeries: [],
        familyHistory: []
      },
      documents: [
        {
          type: 'identity_proof',
          url: 'https://example.com/id-proof.pdf',
          uploadedAt: new Date()
        }
      ],
      premiumAmount: 5000,
      coverageAmount: 500000
    });

    await newApplication.save();
    console.log('✅ Insurance application created successfully');
    console.log('   - Application ID:', newApplication._id);
    console.log('   - Status:', newApplication.status);
    console.log('   - Premium Amount:', newApplication.premiumAmount);

    // Test 3: Update application status
    console.log('\n3. Updating application status...');
    const updatedApplication = await InsuranceApplication.findByIdAndUpdate(
      newApplication._id,
      { 
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: new mongoose.Types.ObjectId()
      },
      { new: true }
    );
    console.log('✅ Application status updated to:', updatedApplication.status);

    // Test 4: Create insurance claim
    console.log('\n4. Creating insurance claim...');
    const newClaim = new InsuranceClaim({
      policyId: newPolicy._id,
      claimantId: new mongoose.Types.ObjectId(),
      claimType: 'hospitalization',
      claimAmount: 75000,
      description: 'Emergency appendectomy surgery',
      incidentDate: new Date('2024-01-15'),
      hospitalName: 'City General Hospital',
      doctorName: 'Dr. Smith',
      diagnosis: 'Acute appendicitis',
      treatment: 'Laparoscopic appendectomy',
      documents: [
        {
          type: 'medical_bill',
          url: 'https://example.com/bill.pdf',
          uploadedAt: new Date()
        },
        {
          type: 'discharge_summary',
          url: 'https://example.com/discharge.pdf',
          uploadedAt: new Date()
        }
      ],
      status: 'submitted',
      submittedAt: new Date()
    });

    await newClaim.save();
    console.log('✅ Insurance claim created successfully');
    console.log('   - Claim ID:', newClaim._id);
    console.log('   - Type:', newClaim.claimType);
    console.log('   - Amount:', newClaim.claimAmount);
    console.log('   - Status:', newClaim.status);

    // Test 5: Process claim
    console.log('\n5. Processing claim...');
    const processedClaim = await InsuranceClaim.findByIdAndUpdate(
      newClaim._id,
      {
        status: 'approved',
        approvedAmount: 70000,
        approvedAt: new Date(),
        approvedBy: new mongoose.Types.ObjectId(),
        notes: 'Claim approved with 5% deduction for non-covered items'
      },
      { new: true }
    );
    console.log('✅ Claim processed successfully');
    console.log('   - Final Status:', processedClaim.status);
    console.log('   - Approved Amount:', processedClaim.approvedAmount);

    // Test 6: Test policy queries
    console.log('\n6. Testing policy queries...');
    const activePolicies = await InsurancePolicy.find({ isActive: true });
    console.log(`✅ Found ${activePolicies.length} active policies`);

    const comprehensivePolicies = await InsurancePolicy.find({ 
      coverageType: 'comprehensive' 
    });
    console.log(`✅ Found ${comprehensivePolicies.length} comprehensive policies`);

    // Test 7: Test application statistics
    console.log('\n7. Testing application statistics...');
    const appStats = await InsuranceApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPremium: { $avg: '$premiumAmount' }
        }
      }
    ]);
    console.log('✅ Application statistics:', appStats);

    // Test 8: Test claim statistics
    console.log('\n8. Testing claim statistics...');
    const claimStats = await InsuranceClaim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' },
          avgAmount: { $avg: '$claimAmount' }
        }
      }
    ]);
    console.log('✅ Claim statistics:', claimStats);

    // Test 9: Test policy coverage validation
    console.log('\n9. Testing policy coverage validation...');
    const policy = await InsurancePolicy.findById(newPolicy._id);
    const claimAmount = 75000;
    const isCovered = claimAmount <= policy.maxCoverage;
    const deductibleApplied = Math.max(0, claimAmount - policy.deductible);
    const coPayAmount = deductibleApplied * (policy.coPay / 100);
    const finalAmount = deductibleApplied - coPayAmount;

    console.log('✅ Coverage calculation:');
    console.log('   - Claim Amount:', claimAmount);
    console.log('   - Max Coverage:', policy.maxCoverage);
    console.log('   - Is Covered:', isCovered);
    console.log('   - After Deductible:', deductibleApplied);
    console.log('   - Co-pay Amount:', coPayAmount);
    console.log('   - Final Amount:', finalAmount);

    // Cleanup
    console.log('\n10. Cleaning up test data...');
    await InsurancePolicy.findByIdAndDelete(newPolicy._id);
    await InsuranceApplication.findByIdAndDelete(newApplication._id);
    await InsuranceClaim.findByIdAndDelete(newClaim._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testInsuranceSystem();
