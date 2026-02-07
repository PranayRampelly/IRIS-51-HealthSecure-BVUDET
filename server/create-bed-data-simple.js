import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import BedManagement from './src/models/BedManagement.js';
import HospitalDepartment from './src/models/HospitalDepartment.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createSampleBedData = async () => {
  try {
    console.log('🚀 Creating sample bed data...');

    // Get hospitals
    const hospitals = await User.find({ role: 'hospital', isActive: true });
    
    if (hospitals.length === 0) {
      console.log('❌ No hospitals found. Please create hospitals first.');
      return;
    }

    console.log(`🏥 Found ${hospitals.length} hospitals`);

    // Create departments for each hospital
    const departments = [
      { name: 'General Medicine', description: 'General medical care and treatment' },
      { name: 'Cardiology', description: 'Heart and cardiovascular care' },
      { name: 'Neurology', description: 'Brain and nervous system care' },
      { name: 'Orthopedics', description: 'Bone and joint care' },
      { name: 'Pediatrics', description: 'Children\'s medical care' },
      { name: 'ICU', description: 'Intensive Care Unit' },
      { name: 'Emergency', description: 'Emergency medical care' },
      { name: 'Surgery', description: 'Surgical procedures' }
    ];

    const createdDepartments = [];
    for (const hospital of hospitals) {
      for (const deptData of departments) {
        const existingDept = await HospitalDepartment.findOne({
          hospital: hospital._id,
          name: deptData.name
        });

        if (!existingDept) {
          const department = new HospitalDepartment({
            hospital: hospital._id,
            name: deptData.name,
            description: deptData.description,
            isActive: true,
            capacity: {
              totalBeds: Math.floor(Math.random() * 50) + 20, // 20-70 beds
              availableBeds: Math.floor(Math.random() * 30) + 10, // 10-40 available
              occupiedBeds: Math.floor(Math.random() * 20) + 5, // 5-25 occupied
              reservedBeds: Math.floor(Math.random() * 10) + 2 // 2-12 reserved
            }
          });
          await department.save();
          createdDepartments.push(department);
          console.log(`✅ Created department: ${deptData.name} for ${hospital.hospitalName}`);
        } else {
          createdDepartments.push(existingDept);
          console.log(`ℹ️  Department already exists: ${deptData.name} for ${hospital.hospitalName}`);
        }
      }
    }

    console.log(`📋 Created/found ${createdDepartments.length} departments`);

    // Create beds for each hospital
    const bedTypes = ['general', 'semi-private', 'private', 'icu', 'emergency'];
    const bedTypePrices = {
      'general': { min: 1500, max: 3000 },
      'semi-private': { min: 3000, max: 5000 },
      'private': { min: 5000, max: 8000 },
      'icu': { min: 8000, max: 15000 },
      'emergency': { min: 2000, max: 4000 }
    };

    let totalBedsCreated = 0;

    for (const hospital of hospitals) {
      const hospitalDepartments = createdDepartments.filter(dept => 
        dept.hospital.toString() === hospital._id.toString()
      );

      // Create 20-50 beds per hospital
      const bedCount = Math.floor(Math.random() * 31) + 20; // 20-50 beds
      
      for (let i = 1; i <= bedCount; i++) {
        const bedType = bedTypes[Math.floor(Math.random() * bedTypes.length)];
        const department = hospitalDepartments[Math.floor(Math.random() * hospitalDepartments.length)];
        const floor = Math.floor(Math.random() * 5) + 1; // 1-5 floors
        const wing = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
        const roomNumber = `${floor}${wing}${String(i).padStart(2, '0')}`;
        
        const priceRange = bedTypePrices[bedType];
        const dailyRate = Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) + priceRange.min;
        
        // Random status (80% available, 20% occupied)
        const status = Math.random() < 0.8 ? 'available' : 'occupied';
        
        const bed = new BedManagement({
          bedNumber: `BED-${String(i).padStart(3, '0')}`,
          hospital: hospital._id,
          department: department._id,
          roomNumber,
          floor,
          wing,
          bedType,
          status,
          specifications: {
            isElectric: bedType === 'icu' || bedType === 'private',
            hasMonitoring: bedType === 'icu' || bedType === 'emergency',
            hasVentilator: bedType === 'icu',
            hasOxygen: true,
            hasCallButton: true,
            hasTV: bedType === 'private' || bedType === 'semi-private',
            hasWiFi: true,
            isWheelchairAccessible: true
          },
          pricing: {
            dailyRate,
            insuranceAccepted: ['General Insurance', 'Health Plus', 'MediCare', 'Family Health'],
            selfPayDiscount: Math.floor(Math.random() * 10) // 0-10% discount
          },
          maintenance: {
            lastCleaned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last 7 days
            nextCleaning: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000), // Within next 3 days
            lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
            nextMaintenance: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000) // Within next 90 days
          },
          coordinates: {
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100),
            floor
          }
        });

        await bed.save();
        totalBedsCreated++;
      }

      console.log(`🛏️  Created ${bedCount} beds for ${hospital.hospitalName}`);
    }

    console.log(`\n🎉 Successfully created ${totalBedsCreated} beds across ${hospitals.length} hospitals`);
    
    // Display summary
    const bedStats = await BedManagement.aggregate([
      {
        $group: {
          _id: { hospital: '$hospital', status: '$status' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.hospital',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      {
        $group: {
          _id: '$_id.hospital',
          hospitalName: { $first: '$hospital.hospitalName' },
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      }
    ]);

    console.log('\n📊 Bed Statistics by Hospital:');
    bedStats.forEach(stat => {
      console.log(`\n🏥 ${stat.hospitalName[0]}:`);
      stat.statuses.forEach(status => {
        console.log(`  ${status.status}: ${status.count} beds`);
      });
    });

  } catch (error) {
    console.error('❌ Error creating sample bed data:', error);
  }
};

const main = async () => {
  await connectDB();
  await createSampleBedData();
  await mongoose.disconnect();
  console.log('\n✅ Sample bed data creation completed');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});