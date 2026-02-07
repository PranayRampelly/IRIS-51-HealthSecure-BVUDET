import mongoose from 'mongoose';
import User from '../src/models/User.js';
import HospitalDepartment from '../src/models/HospitalDepartment.js';
import BedManagement from '../src/models/BedManagement.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleHospitals = [
  {
    hospitalName: 'SL RAHEJA Hospital',
    hospitalType: 'Specialty Hospital',
    location: {
      street: 'Raheja Rugnalaya Marg',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      coordinates: { lat: 19.076, lng: 72.8777 }
    },
    phone: '+91 22 1234 5678',
    email: 'info@slraheja.com',
    emergencyContact: '+91 22 9999 9999',
    rating: 4.8,
    bio: 'SL Raheja Hospital – A Fortis Associate, is a renowned multispeciality hospital located in Mumbai. Known for excellence in oncology, diabetes care, and advanced surgical procedures.',
    specialties: ['Cardiology', 'Neurology', 'Emergency Medicine', 'General Surgery', 'Orthopedics', 'Dermatology', 'Pediatrics', 'Oncology'],
    facilities: ['MRI & CT Scan', 'Cardiac Catheterization Lab', 'ICU & NICU', 'Operating Theaters', 'Emergency Department', 'Pharmacy', 'Laboratory', 'Blood Bank'],
    services: ['24/7 Emergency Care', 'Advanced Cardiac Care', 'Neurological Surgery', 'Orthopedic Surgery', 'Cancer Treatment', 'Pediatric Care', 'Diagnostic Imaging', 'Laboratory Services'],
    insuranceAccepted: ['Medicare', 'Blue Cross', 'Cigna', 'Medicaid', 'Aetna', 'UnitedHealth'],
    operatingHours: '24/7 Emergency Services, OPD: 8:00 AM - 8:00 PM',
    traumaLevel: 'I',
    accreditations: ['JCI', 'NABH', 'ISO 9001:2015'],
    certifications: ['Stroke Center', 'Heart Center', 'Trauma Center'],
    qualityStandards: ['Patient Safety', 'Infection Control', 'Quality Management'],
    paymentMethods: ['Cash', 'Credit Card', 'Insurance', 'Digital Payments'],
    emergencyServices: {
      traumaCenter: true,
      strokeCenter: true,
      heartCenter: true,
      burnUnit: false,
      neonatalICU: true,
      pediatricICU: true,
      ambulanceService: true,
      helicopterService: true
    },
    technology: {
      mri: true,
      ctScan: true,
      xray: true,
      ultrasound: true,
      endoscopy: true,
      laparoscopy: true,
      roboticSurgery: true,
      telemedicine: true
    },
    medicalStaff: {
      doctors: 85,
      nurses: 150,
      specialists: 25,
      technicians: 45,
      supportStaff: 120
    },
    ambulanceServices: {
      available: true,
      fleetSize: 8,
      responseTime: '8 minutes',
      coverageArea: 'Mumbai and surrounding areas',
      specialEquipment: ['Ventilator', 'Oxygen Supply', 'ECG Machine', 'First Aid Kit', 'Defibrillator']
    }
  },
  {
    hospitalName: 'Apollo Hospitals',
    hospitalType: 'General Hospital',
    location: {
      street: '154/11, Bannerghatta Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    phone: '+91 80 2630 4050',
    email: 'info@apollohospitals.com',
    emergencyContact: '+91 80 2630 4051',
    rating: 4.6,
    bio: 'Apollo Hospitals is one of the largest healthcare groups in Asia with a network of hospitals across India. Known for world-class healthcare services and advanced medical technology.',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry'],
    facilities: ['Advanced Cardiac Unit', 'Neurology Department', 'Orthopedic Center', 'Cancer Center', 'Pediatric ICU', 'Maternity Ward', 'Dermatology Clinic', 'Psychiatry Unit'],
    services: ['Cardiac Surgery', 'Neurological Procedures', 'Joint Replacement', 'Cancer Treatment', 'Child Care', 'Women Health', 'Skin Care', 'Mental Health'],
    insuranceAccepted: ['Medicare', 'Blue Cross', 'Cigna', 'Medicaid', 'Aetna', 'UnitedHealth', 'Apollo Health Insurance'],
    operatingHours: '24/7 Emergency Services, OPD: 7:00 AM - 9:00 PM',
    traumaLevel: 'II',
    accreditations: ['JCI', 'NABH', 'ISO 9001:2015'],
    certifications: ['Stroke Center', 'Heart Center'],
    qualityStandards: ['Patient Safety', 'Infection Control', 'Quality Management'],
    paymentMethods: ['Cash', 'Credit Card', 'Insurance', 'Digital Payments'],
    emergencyServices: {
      traumaCenter: true,
      strokeCenter: true,
      heartCenter: true,
      burnUnit: false,
      neonatalICU: true,
      pediatricICU: true,
      ambulanceService: true,
      helicopterService: false
    },
    technology: {
      mri: true,
      ctScan: true,
      xray: true,
      ultrasound: true,
      endoscopy: true,
      laparoscopy: true,
      roboticSurgery: false,
      telemedicine: true
    },
    medicalStaff: {
      doctors: 120,
      nurses: 200,
      specialists: 35,
      technicians: 60,
      supportStaff: 150
    },
    ambulanceServices: {
      available: true,
      fleetSize: 12,
      responseTime: '10 minutes',
      coverageArea: 'Bangalore and surrounding areas',
      specialEquipment: ['Ventilator', 'Oxygen Supply', 'ECG Machine', 'First Aid Kit', 'Defibrillator', 'Patient Monitor']
    }
  },
      {
      hospitalName: 'Fortis Hospital',
      hospitalType: 'Specialty Hospital',
    location: {
      street: '154/9, Bannerghatta Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    phone: '+91 80 6621 4444',
    email: 'info@fortishealthcare.com',
    emergencyContact: '+91 80 6621 4445',
    rating: 4.4,
    bio: 'Fortis Healthcare is a leading integrated healthcare delivery service provider in India. The healthcare verticals of the company primarily comprise hospitals, diagnostics and day care specialty facilities.',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry'],
    facilities: ['Cardiac Center', 'Neurology Institute', 'Orthopedic Center', 'Oncology Center', 'Pediatric Center', 'Women Health Center', 'Dermatology Center', 'Mental Health Center'],
    services: ['Interventional Cardiology', 'Neurological Surgery', 'Joint Replacement', 'Cancer Care', 'Child Care', 'Women Health', 'Skin Care', 'Mental Health'],
    insuranceAccepted: ['Medicare', 'Blue Cross', 'Cigna', 'Medicaid', 'Aetna', 'UnitedHealth', 'Fortis Health Insurance'],
    operatingHours: '24/7 Emergency Services, OPD: 8:00 AM - 8:00 PM',
    traumaLevel: 'II',
    accreditations: ['JCI', 'NABH', 'ISO 9001:2015'],
    certifications: ['Stroke Center', 'Heart Center'],
    qualityStandards: ['Patient Safety', 'Infection Control', 'Quality Management'],
    paymentMethods: ['Cash', 'Credit Card', 'Insurance', 'Digital Payments'],
    emergencyServices: {
      traumaCenter: true,
      strokeCenter: true,
      heartCenter: true,
      burnUnit: false,
      neonatalICU: true,
      pediatricICU: true,
      ambulanceService: true,
      helicopterService: false
    },
    technology: {
      mri: true,
      ctScan: true,
      xray: true,
      ultrasound: true,
      endoscopy: true,
      laparoscopy: true,
      roboticSurgery: true,
      telemedicine: true
    },
    medicalStaff: {
      doctors: 95,
      nurses: 180,
      specialists: 30,
      technicians: 50,
      supportStaff: 130
    },
    ambulanceServices: {
      available: true,
      fleetSize: 10,
      responseTime: '12 minutes',
      coverageArea: 'Bangalore and surrounding areas',
      specialEquipment: ['Ventilator', 'Oxygen Supply', 'ECG Machine', 'First Aid Kit', 'Defibrillator', 'Patient Monitor', 'Infusion Pump']
    }
  },
      {
      hospitalName: 'Manipal Hospital',
      hospitalType: 'Teaching Hospital',
    location: {
      street: '98, HAL Airport Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    phone: '+91 80 2502 4444',
    email: 'info@manipalhospitals.com',
    emergencyContact: '+91 80 2502 4445',
    rating: 4.7,
    bio: 'Manipal Hospitals is one of India\'s leading healthcare networks with a legacy of over 60 years. It is known for providing world-class healthcare services and medical education.',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry', 'Emergency Medicine'],
    facilities: ['Advanced Cardiac Center', 'Neurology Institute', 'Orthopedic Center', 'Oncology Center', 'Pediatric Center', 'Women Health Center', 'Dermatology Center', 'Mental Health Center', 'Emergency Department'],
    services: ['Cardiac Surgery', 'Neurological Procedures', 'Joint Replacement', 'Cancer Treatment', 'Child Care', 'Women Health', 'Skin Care', 'Mental Health', 'Emergency Care'],
    insuranceAccepted: ['Medicare', 'Blue Cross', 'Cigna', 'Medicaid', 'Aetna', 'UnitedHealth', 'Manipal Health Insurance'],
    operatingHours: '24/7 Emergency Services, OPD: 7:00 AM - 9:00 PM',
    traumaLevel: 'I',
    accreditations: ['JCI', 'NABH', 'ISO 9001:2015'],
    certifications: ['Stroke Center', 'Heart Center', 'Trauma Center'],
    qualityStandards: ['Patient Safety', 'Infection Control', 'Quality Management'],
    paymentMethods: ['Cash', 'Credit Card', 'Insurance', 'Digital Payments'],
    emergencyServices: {
      traumaCenter: true,
      strokeCenter: true,
      heartCenter: true,
      burnUnit: true,
      neonatalICU: true,
      pediatricICU: true,
      ambulanceService: true,
      helicopterService: true
    },
    technology: {
      mri: true,
      ctScan: true,
      xray: true,
      ultrasound: true,
      endoscopy: true,
      laparoscopy: true,
      roboticSurgery: true,
      telemedicine: true
    },
    medicalStaff: {
      doctors: 150,
      nurses: 250,
      specialists: 40,
      technicians: 70,
      supportStaff: 180
    },
    ambulanceServices: {
      available: true,
      fleetSize: 15,
      responseTime: '7 minutes',
      coverageArea: 'Bangalore and surrounding areas',
      specialEquipment: ['Ventilator', 'Oxygen Supply', 'ECG Machine', 'First Aid Kit', 'Defibrillator', 'Patient Monitor', 'Infusion Pump', 'Transport Ventilator']
    }
  },
  {
    hospitalName: 'Narayana Health',
    hospitalType: 'Specialty Hospital',
    location: {
      street: '258/A, Bommasandra Industrial Area',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    phone: '+91 80 2783 5000',
    email: 'info@narayanahealth.org',
    emergencyContact: '+91 80 2783 5001',
    rating: 4.5,
    bio: 'Narayana Health is one of India\'s largest healthcare service providers with a network of hospitals across the country. Known for affordable healthcare and cardiac care excellence.',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry'],
    facilities: ['Cardiac Center', 'Neurology Department', 'Orthopedic Center', 'Oncology Center', 'Pediatric ICU', 'Maternity Ward', 'Dermatology Clinic', 'Psychiatry Unit'],
    services: ['Cardiac Surgery', 'Neurological Procedures', 'Joint Replacement', 'Cancer Treatment', 'Child Care', 'Women Health', 'Skin Care', 'Mental Health'],
    insuranceAccepted: ['Medicare', 'Blue Cross', 'Cigna', 'Medicaid', 'Aetna', 'UnitedHealth', 'Narayana Health Insurance'],
    operatingHours: '24/7 Emergency Services, OPD: 8:00 AM - 8:00 PM',
    traumaLevel: 'II',
    accreditations: ['JCI', 'NABH', 'ISO 9001:2015'],
    certifications: ['Stroke Center', 'Heart Center'],
    qualityStandards: ['Patient Safety', 'Infection Control', 'Quality Management'],
    paymentMethods: ['Cash', 'Credit Card', 'Insurance', 'Digital Payments'],
    emergencyServices: {
      traumaCenter: true,
      strokeCenter: true,
      heartCenter: true,
      burnUnit: false,
      neonatalICU: true,
      pediatricICU: true,
      ambulanceService: true,
      helicopterService: false
    },
    technology: {
      mri: true,
      ctScan: true,
      xray: true,
      ultrasound: true,
      endoscopy: true,
      laparoscopy: true,
      roboticSurgery: false,
      telemedicine: true
    },
    medicalStaff: {
      doctors: 110,
      nurses: 190,
      specialists: 32,
      technicians: 55,
      supportStaff: 140
    },
    ambulanceServices: {
      available: true,
      fleetSize: 11,
      responseTime: '9 minutes',
      coverageArea: 'Bangalore and surrounding areas',
      specialEquipment: ['Ventilator', 'Oxygen Supply', 'ECG Machine', 'First Aid Kit', 'Defibrillator', 'Patient Monitor']
    }
  }
];

const sampleDepartments = [
  { name: 'Emergency', currentWaitTime: 15 },
  { name: 'Cardiology', currentWaitTime: 25 },
  { name: 'Neurology', currentWaitTime: 20 },
  { name: 'Orthopedics', currentWaitTime: 30 },
  { name: 'Pediatrics', currentWaitTime: 18 },
  { name: 'Oncology', currentWaitTime: 35 },
  { name: 'Surgery', currentWaitTime: 22 },
  { name: 'Dermatology', currentWaitTime: 12 }
];

const sampleBeds = [
  { bedNumber: '101', roomNumber: '101', wing: 'A', bedType: 'general', status: 'available', floor: 1 },
  { bedNumber: '102', roomNumber: '101', wing: 'A', bedType: 'general', status: 'occupied', floor: 1 },
  { bedNumber: '201', roomNumber: '201', wing: 'B', bedType: 'icu', status: 'available', floor: 2 },
  { bedNumber: '202', roomNumber: '201', wing: 'B', bedType: 'icu', status: 'occupied', floor: 2 },
  { bedNumber: '301', roomNumber: '301', wing: 'C', bedType: 'emergency', status: 'available', floor: 3 },
  { bedNumber: '302', roomNumber: '301', wing: 'C', bedType: 'emergency', status: 'occupied', floor: 3 }
];

async function populateHospitals() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing hospital data
    await User.deleteMany({ role: 'hospital' });
    await HospitalDepartment.deleteMany({});
    await BedManagement.deleteMany({});
    console.log('Cleared existing hospital data');

    // Create hospitals
    const createdHospitals = [];
    for (const hospitalData of sampleHospitals) {
      // Transform location data to match User model structure
      const { location, ...otherData } = hospitalData;
      const hospital = new User({
        ...otherData,
        role: 'hospital',
        isActive: true,
        email: hospitalData.email,
        phone: hospitalData.phone,
        password: 'hashedPassword123', // In real scenario, this would be properly hashed
        firstName: hospitalData.hospitalName.split(' ')[0] || 'Hospital',
        lastName: hospitalData.hospitalName.split(' ').slice(1).join(' ') || 'Admin',
        licenseNumber: `HOSP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        // Transform location to match User model structure
        address: {
          street: location.street,
          city: location.city,
          state: location.state,
          country: location.country,
          zipCode: location.pincode || '000000'
        },
        location: {
          lat: location.coordinates?.lat || 0,
          lng: location.coordinates?.lng || 0,
          city: location.city,
          state: location.state,
          pincode: location.pincode || '000000',
          address: `${location.street}, ${location.city}, ${location.state}` // Convert to string
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedHospital = await hospital.save();
      createdHospitals.push(savedHospital);
      console.log(`Created hospital: ${savedHospital.hospitalName}`);

      // Create departments for this hospital
      for (const deptData of sampleDepartments) {
        const totalBeds = Math.floor(Math.random() * 50) + 20;
        const availableBeds = Math.floor(totalBeds * 0.7);
        const occupiedBeds = Math.floor(totalBeds * 0.25);
        const reservedBeds = totalBeds - availableBeds - occupiedBeds;
        
        const department = new HospitalDepartment({
          hospital: savedHospital._id,
          name: deptData.name,
          description: `${deptData.name} department providing specialized care`,
          currentWaitTime: deptData.currentWaitTime,
          capacity: {
            totalBeds: totalBeds,
            availableBeds: availableBeds,
            occupiedBeds: occupiedBeds,
            reservedBeds: reservedBeds
          },
          status: 'operational'
        });
        await department.save();
      }

      // Get departments for this hospital
      const departments = await HospitalDepartment.find({ hospital: savedHospital._id });
      
      // Create beds for this hospital
      for (const bedData of sampleBeds) {
        // Assign bed to a random department
        const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
        
        const bed = new BedManagement({
          hospital: savedHospital._id,
          department: randomDepartment._id,
          bedNumber: bedData.bedNumber,
          roomNumber: bedData.roomNumber,
          floor: bedData.floor,
          wing: bedData.wing,
          bedType: bedData.bedType,
          status: bedData.status,
          specifications: {
            isElectric: true,
            hasMonitoring: bedData.bedType === 'icu',
            hasVentilator: bedData.bedType === 'icu',
            hasOxygen: true,
            hasCallButton: true,
            hasTV: true,
            hasWiFi: true,
            isWheelchairAccessible: true
          },
          pricing: {
            dailyRate: bedData.bedType === 'icu' ? 5000 : 2000,
            insuranceAccepted: ['Medicare', 'Blue Cross', 'Cigna'],
            selfPayDiscount: 10
          }
        });
        await bed.save();
      }
    }

    console.log(`Successfully created ${createdHospitals.length} hospitals with departments and beds`);
    console.log('Database population completed!');

  } catch (error) {
    console.error('Error populating hospitals:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateHospitals(); 