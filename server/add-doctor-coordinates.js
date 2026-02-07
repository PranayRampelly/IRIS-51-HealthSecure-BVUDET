import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample coordinates for common Indian cities
const cityCoordinates = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 }
};

async function addDoctorCoordinates() {
  try {
    console.log('🔧 Adding coordinates to existing doctors...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`📊 Found ${doctors.length} doctors`);

    let updatedCount = 0;
    
    for (const doctor of doctors) {
      try {
        let coordinates = null;
        
        // Try to extract city from location address
        if (doctor.location?.address) {
          const address = doctor.location.address.toLowerCase();
          
          // Find matching city
          for (const [city, coords] of Object.entries(cityCoordinates)) {
            if (address.includes(city.toLowerCase())) {
              coordinates = coords;
              break;
            }
          }
        }
        
        // If no city match, try address.city field
        if (!coordinates && doctor.location?.city) {
          const city = doctor.location.city;
          if (cityCoordinates[city]) {
            coordinates = cityCoordinates[city];
          }
        }
        
        // If still no coordinates, use Mumbai as default (since most doctors seem to be from there)
        if (!coordinates) {
          coordinates = cityCoordinates['Mumbai'];
          console.log(`📍 Using default coordinates (Mumbai) for doctor: ${doctor.firstName} ${doctor.lastName}`);
        }
        
        // Update doctor with coordinates
        await User.updateOne(
          { _id: doctor._id },
          {
            $set: {
              'location.lat': coordinates.lat,
              'location.lng': coordinates.lng
            }
          }
        );
        
        console.log(`✅ Updated ${doctor.firstName} ${doctor.lastName} with coordinates: ${coordinates.lat}, ${coordinates.lng}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating doctor ${doctor._id}:`, error.message);
      }
    }

    console.log(`\n📊 Coordinates update completed!`);
    console.log(`✅ Updated ${updatedCount} out of ${doctors.length} doctors`);

    // Verify the updates
    const doctorsWithCoordinates = await User.find({
      role: 'doctor',
      'location.lat': { $ne: 0 },
      'location.lng': { $ne: 0 }
    });
    
    console.log(`📍 Doctors with coordinates: ${doctorsWithCoordinates.length}`);
    
    // Show sample updated doctor
    if (doctorsWithCoordinates.length > 0) {
      const sampleDoctor = doctorsWithCoordinates[0];
      console.log(`\n🏥 Sample updated doctor:`);
      console.log(`   Name: ${sampleDoctor.firstName} ${sampleDoctor.lastName}`);
      console.log(`   Location: ${sampleDoctor.location.address}`);
      console.log(`   Coordinates: ${sampleDoctor.location.lat}, ${sampleDoctor.location.lng}`);
    }

  } catch (error) {
    console.error('❌ Error adding coordinates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addDoctorCoordinates();












