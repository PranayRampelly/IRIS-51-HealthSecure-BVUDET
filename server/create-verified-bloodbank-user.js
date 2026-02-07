import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function createVerifiedBloodBankUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    const email = 'test.bloodbank@example.com';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists:', existingUser.email);
      console.log('  - Role:', existingUser.role);
      console.log('  - Verified:', existingUser.isEmailVerified);
      console.log('  - Active:', existingUser.isActive);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('TestPass123!', saltRounds);

    // Create verified bloodbank user
    const bloodBankUser = new User({
      firstName: 'Test',
      lastName: 'BloodBank',
      email: email,
      password: hashedPassword,
      role: 'bloodbank',
      isEmailVerified: true,
      isActive: true,
      profileComplete: false,
      bloodBankName: 'Test Blood Bank',
      bloodBankType: 'Standalone Blood Bank',
      bloodBankLicense: 'BB123456',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      phone: '+91-9876543210',
      emergencyContact: '+91-9876543211',
      bloodBankCapacity: {
        totalUnits: 1000,
        refrigeratedUnits: 800,
        frozenUnits: 100,
        plateletUnits: 50,
        plasmaUnits: 50
      },
      bloodBankStaff: {
        medicalOfficers: 5,
        technicians: 10,
        nurses: 8,
        supportStaff: 12
      },
      bloodBankOperatingHours: {
        startTime: '08:00',
        endTime: '20:00',
        emergency24x7: true
      },
      bloodBankWorkingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      bloodBankTestingCapabilities: {
        bloodGrouping: true,
        crossMatching: true,
        infectiousDiseaseTesting: true,
        compatibilityTesting: true,
        antibodyScreening: true,
        dnaTesting: false,
        rareBloodTypeTesting: false
      },
      bloodBankEmergencyServices: {
        emergencyBloodSupply: true,
        traumaCenterSupport: true,
        disasterResponse: true,
        helicopterService: false
      },
      bloodBankTechnology: {
        automatedTesting: true,
        barcodeSystem: true,
        inventoryManagement: true,
        qualityControl: true,
        donorManagement: true,
        bloodTracking: true
      }
    });

    await bloodBankUser.save();
    console.log('✅ Verified bloodbank user created successfully!');
    console.log('  - Email:', bloodBankUser.email);
    console.log('  - Role:', bloodBankUser.role);
    console.log('  - Verified:', bloodBankUser.isEmailVerified);
    console.log('  - Active:', bloodBankUser.isActive);
    console.log('  - Profile Complete:', bloodBankUser.profileComplete);

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createVerifiedBloodBankUser();
