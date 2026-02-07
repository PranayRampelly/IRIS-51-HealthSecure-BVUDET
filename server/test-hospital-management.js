import mongoose from 'mongoose';
import HospitalDepartment from './src/models/HospitalDepartment.js';
import BedManagement from './src/models/BedManagement.js';
import PatientAdmission from './src/models/PatientAdmission.js';
import AdmissionRequest from './src/models/AdmissionRequest.js';
import Doctor from './src/models/Doctor.js';
import Patient from './src/models/Patient.js';

async function testHospitalManagement() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    console.log('🏥 Testing Hospital Management System...\n');

    // Test 1: Create hospital department
    console.log('1. Creating hospital department...');
    const newDepartment = new HospitalDepartment({
      hospitalId: new mongoose.Types.ObjectId(),
      name: 'Cardiology',
      code: 'CARD',
      description: 'Cardiology department specializing in heart care',
      headOfDepartment: new mongoose.Types.ObjectId(),
      contactInfo: {
        phone: '+91-11-23456789',
        email: 'cardiology@hospital.com',
        extension: '101'
      },
      capacity: {
        totalBeds: 50,
        icuBeds: 10,
        generalBeds: 40
      },
      services: [
        'ECG',
        'Echocardiogram',
        'Cardiac Catheterization',
        'Heart Surgery'
      ],
      isActive: true
    });

    await newDepartment.save();
    console.log('✅ Hospital department created successfully');
    console.log('   - Department ID:', newDepartment._id);
    console.log('   - Name:', newDepartment.name);
    console.log('   - Code:', newDepartment.code);
    console.log('   - Total Beds:', newDepartment.capacity.totalBeds);

    // Test 2: Create bed management
    console.log('\n2. Creating bed management...');
    const newBed = new BedManagement({
      hospitalId: new mongoose.Types.ObjectId(),
      departmentId: newDepartment._id,
      bedNumber: 'CARD-001',
      bedType: 'ICU',
      roomNumber: 'ICU-101',
      floor: 1,
      wing: 'A',
      status: 'available',
      equipment: [
        'Ventilator',
        'Monitor',
        'Oxygen Supply'
      ],
      isActive: true
    });

    await newBed.save();
    console.log('✅ Bed management created successfully');
    console.log('   - Bed ID:', newBed._id);
    console.log('   - Bed Number:', newBed.bedNumber);
    console.log('   - Type:', newBed.bedType);
    console.log('   - Status:', newBed.status);

    // Test 3: Create patient
    console.log('\n3. Creating patient...');
    const newPatient = new Patient({
      patientId: 'PAT-' + Date.now(),
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'female',
        bloodType: 'O+',
        phone: '+91-9876543210',
        email: 'jane.smith@example.com',
        address: {
          street: '123 Main Street',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        }
      },
      emergencyContact: {
        name: 'John Smith',
        relationship: 'Spouse',
        phone: '+91-9876543211',
        email: 'john.smith@example.com'
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
        currentMedications: ['Amlodipine'],
        previousSurgeries: ['Appendectomy']
      },
      insuranceInfo: {
        provider: 'HealthSecure Insurance',
        policyNumber: 'POL-123456',
        groupNumber: 'GRP-001'
      },
      isActive: true
    });

    await newPatient.save();
    console.log('✅ Patient created successfully');
    console.log('   - Patient ID:', newPatient._id);
    console.log('   - Name:', `${newPatient.personalInfo.firstName} ${newPatient.personalInfo.lastName}`);
    console.log('   - Blood Type:', newPatient.personalInfo.bloodType);

    // Test 4: Create admission request
    console.log('\n4. Creating admission request...');
    const newAdmissionRequest = new AdmissionRequest({
      patientId: newPatient._id,
      hospitalId: new mongoose.Types.ObjectId(),
      departmentId: newDepartment._id,
      requestedBy: new mongoose.Types.ObjectId(),
      admissionType: 'emergency',
      reason: 'Chest pain and shortness of breath',
      priority: 'high',
      requestedBedType: 'ICU',
      estimatedDuration: 5,
      status: 'pending',
      notes: 'Patient experiencing severe chest pain, needs immediate attention'
    });

    await newAdmissionRequest.save();
    console.log('✅ Admission request created successfully');
    console.log('   - Request ID:', newAdmissionRequest._id);
    console.log('   - Type:', newAdmissionRequest.admissionType);
    console.log('   - Priority:', newAdmissionRequest.priority);
    console.log('   - Status:', newAdmissionRequest.status);

    // Test 5: Process admission request
    console.log('\n5. Processing admission request...');
    const processedRequest = await AdmissionRequest.findByIdAndUpdate(
      newAdmissionRequest._id,
      {
        status: 'approved',
        approvedBy: new mongoose.Types.ObjectId(),
        approvedAt: new Date(),
        assignedBedId: newBed._id,
        notes: 'Request approved, ICU bed assigned'
      },
      { new: true }
    );
    console.log('✅ Admission request processed successfully');
    console.log('   - Final Status:', processedRequest.status);
    console.log('   - Assigned Bed:', processedRequest.assignedBedId);

    // Test 6: Create patient admission
    console.log('\n6. Creating patient admission...');
    const newAdmission = new PatientAdmission({
      patientId: newPatient._id,
      hospitalId: new mongoose.Types.ObjectId(),
      departmentId: newDepartment._id,
      bedId: newBed._id,
      admissionRequestId: newAdmissionRequest._id,
      admissionType: 'emergency',
      admissionDate: new Date(),
      estimatedDischargeDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      diagnosis: 'Acute coronary syndrome',
      treatmentPlan: 'Cardiac monitoring, medication, possible angioplasty',
      attendingDoctor: new mongoose.Types.ObjectId(),
      status: 'admitted',
      notes: 'Patient admitted to ICU for cardiac monitoring'
    });

    await newAdmission.save();
    console.log('✅ Patient admission created successfully');
    console.log('   - Admission ID:', newAdmission._id);
    console.log('   - Diagnosis:', newAdmission.diagnosis);
    console.log('   - Status:', newAdmission.status);

    // Test 7: Update bed status
    console.log('\n7. Updating bed status...');
    const updatedBed = await BedManagement.findByIdAndUpdate(
      newBed._id,
      {
        status: 'occupied',
        currentPatientId: newPatient._id,
        admissionId: newAdmission._id,
        occupiedAt: new Date()
      },
      { new: true }
    );
    console.log('✅ Bed status updated successfully');
    console.log('   - New Status:', updatedBed.status);
    console.log('   - Current Patient:', updatedBed.currentPatientId);

    // Test 8: Test department queries
    console.log('\n8. Testing department queries...');
    const activeDepartments = await HospitalDepartment.find({ isActive: true });
    console.log(`✅ Found ${activeDepartments.length} active departments`);

    const icuDepartments = await HospitalDepartment.find({
      'capacity.icuBeds': { $gt: 0 }
    });
    console.log(`✅ Found ${icuDepartments.length} departments with ICU beds`);

    // Test 9: Test bed availability
    console.log('\n9. Testing bed availability...');
    const availableBeds = await BedManagement.find({ status: 'available' });
    console.log(`✅ Found ${availableBeds.length} available beds`);

    const occupiedBeds = await BedManagement.find({ status: 'occupied' });
    console.log(`✅ Found ${occupiedBeds.length} occupied beds`);

    // Test 10: Test admission statistics
    console.log('\n10. Testing admission statistics...');
    const admissionStats = await PatientAdmission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('✅ Admission statistics:', admissionStats);

    // Test 11: Test patient queries
    console.log('\n11. Testing patient queries...');
    const activePatients = await Patient.find({ isActive: true });
    console.log(`✅ Found ${activePatients.length} active patients`);

    const patientsWithInsurance = await Patient.find({
      'insuranceInfo.provider': { $exists: true, $ne: null }
    });
    console.log(`✅ Found ${patientsWithInsurance.length} patients with insurance`);

    // Test 12: Test bed capacity calculation
    console.log('\n12. Testing bed capacity calculation...');
    const bedCapacity = await BedManagement.aggregate([
      {
        $group: {
          _id: '$bedType',
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          },
          occupied: {
            $sum: {
              $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0]
            }
          }
        }
      }
    ]);
    console.log('✅ Bed capacity statistics:', bedCapacity);

    // Cleanup
    console.log('\n13. Cleaning up test data...');
    await HospitalDepartment.findByIdAndDelete(newDepartment._id);
    await BedManagement.findByIdAndDelete(newBed._id);
    await Patient.findByIdAndDelete(newPatient._id);
    await AdmissionRequest.findByIdAndDelete(newAdmissionRequest._id);
    await PatientAdmission.findByIdAndDelete(newAdmission._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testHospitalManagement();
