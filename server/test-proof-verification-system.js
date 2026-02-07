import mongoose from 'mongoose';
import ProofRequest from './src/models/ProofRequest.js';
import ProofTemplate from './src/models/ProofTemplate.js';
import ProofValidation from './src/models/ProofValidation.js';
import Proof from './src/models/Proof.js';
import User from './src/models/User.js';

async function testProofVerificationSystem() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    console.log('🔐 Testing Proof & Verification System...\n');

    // Test 1: Create proof template
    console.log('1. Creating proof template...');
    const newTemplate = new ProofTemplate({
      templateId: 'TEMP-' + Date.now(),
      name: 'Medical Certificate Template',
      description: 'Template for medical certificates and health records',
      category: 'medical',
      fields: [
        {
          name: 'patientName',
          type: 'string',
          required: true,
          label: 'Patient Name',
          validation: {
            minLength: 2,
            maxLength: 100
          }
        },
        {
          name: 'diagnosis',
          type: 'string',
          required: true,
          label: 'Diagnosis',
          validation: {
            minLength: 5,
            maxLength: 500
          }
        },
        {
          name: 'treatmentDate',
          type: 'date',
          required: true,
          label: 'Treatment Date'
        },
        {
          name: 'doctorSignature',
          type: 'signature',
          required: true,
          label: 'Doctor Signature'
        },
        {
          name: 'hospitalStamp',
          type: 'image',
          required: false,
          label: 'Hospital Stamp'
        }
      ],
      requirements: [
        'Valid medical license',
        'Hospital affiliation',
        'Patient consent'
      ],
      isActive: true
    });

    await newTemplate.save();
    console.log('✅ Proof template created successfully');
    console.log('   - Template ID:', newTemplate._id);
    console.log('   - Name:', newTemplate.name);
    console.log('   - Category:', newTemplate.category);
    console.log('   - Fields:', newTemplate.fields.length);

    // Test 2: Create proof request
    console.log('\n2. Creating proof request...');
    const newProofRequest = new ProofRequest({
      requestId: 'REQ-' + Date.now(),
      requesterId: new mongoose.Types.ObjectId(),
      requesteeId: new mongoose.Types.ObjectId(),
      templateId: newTemplate._id,
      category: 'medical',
      title: 'Medical Certificate Request',
      description: 'Please provide a medical certificate for insurance purposes',
      requiredFields: ['patientName', 'diagnosis', 'treatmentDate', 'doctorSignature'],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      priority: 'normal',
      status: 'pending',
      metadata: {
        insuranceClaim: true,
        claimNumber: 'CLM-123456',
        purpose: 'Insurance verification'
      },
      isActive: true
    });

    await newProofRequest.save();
    console.log('✅ Proof request created successfully');
    console.log('   - Request ID:', newProofRequest._id);
    console.log('   - Title:', newProofRequest.title);
    console.log('   - Status:', newProofRequest.status);
    console.log('   - Deadline:', newProofRequest.deadline);

    // Test 3: Create proof
    console.log('\n3. Creating proof...');
    const newProof = new Proof({
      proofId: 'PROOF-' + Date.now(),
      requestId: newProofRequest._id,
      templateId: newTemplate._id,
      providerId: new mongoose.Types.ObjectId(),
      recipientId: new mongoose.Types.ObjectId(),
      category: 'medical',
      title: 'Medical Certificate',
      data: {
        patientName: 'John Doe',
        diagnosis: 'Hypertension - controlled with medication',
        treatmentDate: new Date('2024-01-15'),
        doctorSignature: 'https://example.com/signature.png',
        hospitalStamp: 'https://example.com/stamp.png'
      },
      attachments: [
        {
          type: 'medical_report',
          url: 'https://example.com/medical-report.pdf',
          filename: 'medical-report.pdf',
          size: 1024000,
          uploadedAt: new Date()
        },
        {
          type: 'lab_results',
          url: 'https://example.com/lab-results.pdf',
          filename: 'lab-results.pdf',
          size: 512000,
          uploadedAt: new Date()
        }
      ],
      status: 'submitted',
      submittedAt: new Date(),
      isActive: true
    });

    await newProof.save();
    console.log('✅ Proof created successfully');
    console.log('   - Proof ID:', newProof._id);
    console.log('   - Title:', newProof.title);
    console.log('   - Status:', newProof.status);
    console.log('   - Attachments:', newProof.attachments.length);

    // Test 4: Create proof validation
    console.log('\n4. Creating proof validation...');
    const newValidation = new ProofValidation({
      proofId: newProof._id,
      validatorId: new mongoose.Types.ObjectId(),
      validationType: 'manual',
      status: 'pending',
      criteria: [
        {
          field: 'patientName',
          requirement: 'Must match patient records',
          status: 'pending'
        },
        {
          field: 'diagnosis',
          requirement: 'Must be medically valid',
          status: 'pending'
        },
        {
          field: 'doctorSignature',
          requirement: 'Must be from authorized doctor',
          status: 'pending'
        }
      ],
      notes: 'Initial validation pending',
      isActive: true
    });

    await newValidation.save();
    console.log('✅ Proof validation created successfully');
    console.log('   - Validation ID:', newValidation._id);
    console.log('   - Type:', newValidation.validationType);
    console.log('   - Status:', newValidation.status);

    // Test 5: Update proof request status
    console.log('\n5. Updating proof request status...');
    const updatedRequest = await ProofRequest.findByIdAndUpdate(
      newProofRequest._id,
      {
        status: 'in_progress',
        updatedAt: new Date(),
        notes: 'Proof submitted, awaiting validation'
      },
      { new: true }
    );
    console.log('✅ Proof request status updated to:', updatedRequest.status);

    // Test 6: Process proof validation
    console.log('\n6. Processing proof validation...');
    const processedValidation = await ProofValidation.findByIdAndUpdate(
      newValidation._id,
      {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: new mongoose.Types.ObjectId(),
        criteria: [
          {
            field: 'patientName',
            requirement: 'Must match patient records',
            status: 'approved',
            notes: 'Patient name verified'
          },
          {
            field: 'diagnosis',
            requirement: 'Must be medically valid',
            status: 'approved',
            notes: 'Diagnosis is medically valid'
          },
          {
            field: 'doctorSignature',
            requirement: 'Must be from authorized doctor',
            status: 'approved',
            notes: 'Doctor signature verified'
          }
        ],
        notes: 'All validation criteria met'
      },
      { new: true }
    );
    console.log('✅ Proof validation processed successfully');
    console.log('   - Final Status:', processedValidation.status);
    console.log('   - Approved Criteria:', processedValidation.criteria.filter(c => c.status === 'approved').length);

    // Test 7: Update proof status
    console.log('\n7. Updating proof status...');
    const updatedProof = await Proof.findByIdAndUpdate(
      newProof._id,
      {
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: new mongoose.Types.ObjectId(),
        validationId: processedValidation._id,
        notes: 'Proof verified and approved'
      },
      { new: true }
    );
    console.log('✅ Proof status updated to:', updatedProof.status);

    // Test 8: Test template queries
    console.log('\n8. Testing template queries...');
    const activeTemplates = await ProofTemplate.find({ isActive: true });
    console.log(`✅ Found ${activeTemplates.length} active templates`);

    const medicalTemplates = await ProofTemplate.find({ category: 'medical' });
    console.log(`✅ Found ${medicalTemplates.length} medical templates`);

    // Test 9: Test proof request queries
    console.log('\n9. Testing proof request queries...');
    const pendingRequests = await ProofRequest.find({ status: 'pending' });
    console.log(`✅ Found ${pendingRequests.length} pending requests`);

    const inProgressRequests = await ProofRequest.find({ status: 'in_progress' });
    console.log(`✅ Found ${inProgressRequests.length} in-progress requests`);

    // Test 10: Test proof queries
    console.log('\n10. Testing proof queries...');
    const submittedProofs = await Proof.find({ status: 'submitted' });
    console.log(`✅ Found ${submittedProofs.length} submitted proofs`);

    const verifiedProofs = await Proof.find({ status: 'verified' });
    console.log(`✅ Found ${verifiedProofs.length} verified proofs`);

    // Test 11: Test validation statistics
    console.log('\n11. Testing validation statistics...');
    const validationStats = await ProofValidation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('✅ Validation statistics:', validationStats);

    // Test 12: Test proof request statistics
    console.log('\n12. Testing proof request statistics...');
    const requestStats = await ProofRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPriority: { $avg: { $cond: [{ $eq: ['$priority', 'high'] }, 3, { $cond: [{ $eq: ['$priority', 'normal'] }, 2, 1] }] } }
        }
      }
    ]);
    console.log('✅ Proof request statistics:', requestStats);

    // Test 13: Test template field validation
    console.log('\n13. Testing template field validation...');
    const template = await ProofTemplate.findById(newTemplate._id);
    const testData = {
      patientName: 'John Doe',
      diagnosis: 'Hypertension',
      treatmentDate: new Date(),
      doctorSignature: 'https://example.com/signature.png'
    };

    console.log('✅ Template field validation:');
    template.fields.forEach(field => {
      const value = testData[field.name];
      const isValid = value && (!field.validation || 
        (!field.validation.minLength || value.length >= field.validation.minLength) &&
        (!field.validation.maxLength || value.length <= field.validation.maxLength));
      
      console.log(`   - ${field.name}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    });

    // Test 14: Test proof expiration
    console.log('\n14. Testing proof expiration...');
    const expiredRequests = await ProofRequest.find({
      deadline: { $lt: new Date() },
      status: { $in: ['pending', 'in_progress'] }
    });
    console.log(`✅ Found ${expiredRequests.length} expired proof requests`);

    // Test 15: Test proof access control
    console.log('\n15. Testing proof access control...');
    const accessibleProofs = await Proof.find({
      $or: [
        { providerId: new mongoose.Types.ObjectId() },
        { recipientId: new mongoose.Types.ObjectId() }
      ]
    });
    console.log(`✅ Found ${accessibleProofs.length} accessible proofs for user`);

    // Cleanup
    console.log('\n16. Cleaning up test data...');
    await ProofTemplate.findByIdAndDelete(newTemplate._id);
    await ProofRequest.findByIdAndDelete(newProofRequest._id);
    await Proof.findByIdAndDelete(newProof._id);
    await ProofValidation.findByIdAndDelete(newValidation._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testProofVerificationSystem();
