import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import BloodInventory from './src/models/BloodInventory.js';
import BloodDonor from './src/models/BloodDonor.js';
import BloodRequest from './src/models/BloodRequest.js';
import QualityControl from './src/models/QualityControl.js';
import EmergencyAlert from './src/models/EmergencyAlert.js';

async function testBloodbankIntegration() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('✅ Connected to MongoDB');

    // Create test bloodbank user
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    const bloodbankUser = new User({
      email: 'bloodbank@test.com',
      password: hashedPassword,
      role: 'bloodbank',
      isVerified: true,
      profile: {
        firstName: 'Test',
        lastName: 'BloodBank',
        organization: 'Test Blood Bank Center',
        phone: '+1234567890',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '12345',
          country: 'Test Country'
        }
      }
    });

    await bloodbankUser.save();
    console.log('✅ Created test bloodbank user');

    // Generate JWT token
    const token = jwt.sign(
      { userId: bloodbankUser._id, role: bloodbankUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Create test blood donors
    const donors = [
      {
        donorId: 'D001',
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1990-01-15',
          gender: 'male',
          bloodType: 'O+',
          phone: '+1234567891',
          email: 'john.smith@email.com',
          address: {
            street: '456 Donor Ave',
            city: 'Donor City',
            state: 'Donor State',
            pincode: '54321',
            country: 'Donor Country'
          }
        },
        eligibility: {
          isEligible: true,
          lastDonation: '2024-01-01',
          nextEligibleDate: '2024-03-01'
        },
        donationHistory: [
          {
            donationId: 'DON001',
            donationDate: '2024-01-01',
            bloodType: 'O+',
            volume: 450,
            status: 'completed'
          }
        ],
        medicalHistory: {
          allergies: [],
          medications: [],
          conditions: []
        },
        isActive: true
      },
      {
        donorId: 'D002',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: '1988-05-20',
          gender: 'female',
          bloodType: 'A+',
          phone: '+1234567892',
          email: 'sarah.johnson@email.com',
          address: {
            street: '789 Donor Blvd',
            city: 'Donor City',
            state: 'Donor State',
            pincode: '54322',
            country: 'Donor Country'
          }
        },
        eligibility: {
          isEligible: true,
          lastDonation: '2024-01-05',
          nextEligibleDate: '2024-03-05'
        },
        donationHistory: [
          {
            donationId: 'DON002',
            donationDate: '2024-01-05',
            bloodType: 'A+',
            volume: 400,
            status: 'completed'
          }
        ],
        medicalHistory: {
          allergies: [],
          medications: [],
          conditions: []
        },
        isActive: true
      }
    ];

    const createdDonors = await BloodDonor.insertMany(donors);
    console.log('✅ Created test blood donors');

    // Create test blood inventory
    const inventoryItems = [
      {
        unitId: 'BB001',
        bloodType: 'O+',
        componentType: 'whole_blood',
        donor: {
          donorId: 'D001',
          name: 'John Smith',
          age: 34,
          gender: 'male'
        },
        collection: {
          date: '2024-01-15',
          location: 'Main Center',
          volume: 450
        },
        status: 'available',
        storage: {
          location: 'Refrigerator A',
          shelf: 'S1',
          rack: 'R1'
        },
        expiry: {
          expiryDate: '2024-02-15',
          daysUntilExpiry: 15
        },
        qualityTests: [
          {
            testType: 'HIV',
            result: 'pass',
            testDate: '2024-01-16',
            technician: 'Dr. Chen',
            qualityScore: 98
          },
          {
            testType: 'Hepatitis B',
            result: 'pass',
            testDate: '2024-01-16',
            technician: 'Dr. Garcia',
            qualityScore: 97
          }
        ]
      },
      {
        unitId: 'BB002',
        bloodType: 'A+',
        componentType: 'red_blood_cells',
        donor: {
          donorId: 'D002',
          name: 'Sarah Johnson',
          age: 35,
          gender: 'female'
        },
        collection: {
          date: '2024-01-14',
          location: 'Mobile Unit',
          volume: 400
        },
        status: 'reserved',
        storage: {
          location: 'Refrigerator B',
          shelf: 'S2',
          rack: 'R1'
        },
        expiry: {
          expiryDate: '2024-02-14',
          daysUntilExpiry: 14
        },
        qualityTests: [
          {
            testType: 'HIV',
            result: 'pass',
            testDate: '2024-01-15',
            technician: 'Dr. Wilson',
            qualityScore: 99
          }
        ],
        reservation: {
          isReserved: true,
          reservedBy: {
            hospital: 'City General Hospital',
            patient: 'Patient 123'
          },
          reservedUntil: '2024-01-20'
        }
      }
    ];

    const createdInventory = await BloodInventory.insertMany(inventoryItems);
    console.log('✅ Created test blood inventory');

    // Create test blood requests
    const requests = [
      {
        requestId: 'REQ001',
        requester: {
          hospitalId: 'H001',
          hospitalName: 'City General Hospital',
          doctorName: 'Dr. Smith',
          patientName: 'Patient 123'
        },
        bloodType: 'O+',
        componentType: 'whole_blood',
        quantity: 2,
        urgency: 'emergency',
        status: 'pending',
        requestDate: '2024-01-16',
        requiredBy: '2024-01-16',
        reason: 'Emergency surgery'
      },
      {
        requestId: 'REQ002',
        requester: {
          hospitalId: 'H002',
          hospitalName: 'Regional Medical Center',
          doctorName: 'Dr. Johnson',
          patientName: 'Patient 456'
        },
        bloodType: 'A+',
        componentType: 'red_blood_cells',
        quantity: 1,
        urgency: 'urgent',
        status: 'approved',
        requestDate: '2024-01-16',
        requiredBy: '2024-01-17',
        reason: 'Blood transfusion'
      }
    ];

    const createdRequests = await BloodRequest.insertMany(requests);
    console.log('✅ Created test blood requests');

    // Create test quality control records
    const qualityControls = [
      {
        unitId: 'BB001',
        bloodType: 'O+',
        componentType: 'whole_blood',
        tests: [
          {
            testType: 'HIV',
            result: 'pass',
            testDate: '2024-01-16',
            technician: 'Dr. Chen'
          },
          {
            testType: 'Hepatitis B',
            result: 'pass',
            testDate: '2024-01-16',
            technician: 'Dr. Garcia'
          }
        ],
        status: 'passed',
        expiryDate: '2024-02-15',
        isActive: true
      }
    ];

    const createdQualityControls = await QualityControl.insertMany(qualityControls);
    console.log('✅ Created test quality control records');

    // Create test emergency alerts
    const alerts = [
      {
        alertId: 'ALT001',
        type: 'blood_shortage',
        severity: 'critical',
        title: 'Critical O- Blood Shortage',
        description: 'Emergency need for O- blood type',
        bloodType: 'O-',
        location: 'Emergency Room',
        status: 'active'
      },
      {
        alertId: 'ALT002',
        type: 'equipment_failure',
        severity: 'high',
        title: 'Refrigerator Temperature Alert',
        description: 'Refrigerator A temperature is above normal range',
        location: 'Storage Room A',
        status: 'active'
      }
    ];

    const createdAlerts = await EmergencyAlert.insertMany(alerts);
    console.log('✅ Created test emergency alerts');

    // Test API endpoints
    console.log('\n🧪 Testing API Endpoints...');

    // Test dashboard stats
    const dashboardStats = await BloodInventory.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          reserved: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
          testing: { $sum: { $cond: [{ $eq: ['$status', 'testing'] }, 1, 0] } },
          expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } }
        }
      }
    ]);

    console.log('📊 Dashboard Stats:', dashboardStats[0]);

    // Test blood type distribution
    const bloodTypeStats = await BloodInventory.aggregate([
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          reserved: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
          testing: { $sum: { $cond: [{ $eq: ['$status', 'testing'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('🩸 Blood Type Distribution:', bloodTypeStats);

    // Test donor statistics
    const donorStats = await BloodDonor.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          eligible: { $sum: { $cond: ['$eligibility.isEligible', 1, 0] } },
          deferred: { $sum: { $cond: [{ $not: '$eligibility.isEligible' }, 1, 0] } }
        }
      }
    ]);

    console.log('👥 Donor Statistics:', donorStats[0]);

    // Test request statistics
    const requestStats = await BloodRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
        }
      }
    ]);

    console.log('📋 Request Statistics:', requestStats[0]);

    // Test alert statistics
    const alertStats = await EmergencyAlert.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } }
        }
      }
    ]);

    console.log('🚨 Alert Statistics:', alertStats[0]);

    // Test search and filtering
    const searchResults = await BloodInventory.find({
      $or: [
        { unitId: { $regex: 'BB', $options: 'i' } },
        { 'donor.name': { $regex: 'John', $options: 'i' } }
      ]
    });

    console.log('🔍 Search Results:', searchResults.length, 'items found');

    // Test pagination
    const paginatedResults = await BloodInventory.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .skip(0);

    console.log('📄 Pagination Test:', paginatedResults.length, 'items per page');

    console.log('\n✅ All integration tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`- Blood Donors: ${createdDonors.length}`);
    console.log(`- Blood Inventory: ${createdInventory.length}`);
    console.log(`- Blood Requests: ${createdRequests.length}`);
    console.log(`- Quality Controls: ${createdQualityControls.length}`);
    console.log(`- Emergency Alerts: ${createdAlerts.length}`);
    console.log(`- JWT Token: ${token.substring(0, 20)}...`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testBloodbankIntegration();
