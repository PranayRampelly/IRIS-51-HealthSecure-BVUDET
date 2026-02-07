import mongoose from 'mongoose';
import EmergencyAlert from './src/models/EmergencyAlert.js';
import EmergencyResponse from './src/models/EmergencyResponse.js';

async function testEmergencyAlerts() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    console.log('🚨 Testing Emergency Alert System...\n');

    // Test 1: Create a new emergency alert
    console.log('1. Creating emergency alert...');
    const newAlert = new EmergencyAlert({
      patientId: new mongoose.Types.ObjectId(),
      alertType: 'medical',
      severity: 'high',
      description: 'Test emergency alert - chest pain',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Delhi coordinates
      },
      contactInfo: {
        phone: '+91-9876543210',
        email: 'emergency@test.com'
      },
      status: 'active',
      assignedTo: new mongoose.Types.ObjectId(),
      hospitalId: new mongoose.Types.ObjectId()
    });

    await newAlert.save();
    console.log('✅ Emergency alert created successfully');
    console.log('   - Alert ID:', newAlert._id);
    console.log('   - Type:', newAlert.alertType);
    console.log('   - Severity:', newAlert.severity);
    console.log('   - Status:', newAlert.status);

    // Test 2: Find active alerts
    console.log('\n2. Finding active alerts...');
    const activeAlerts = await EmergencyAlert.find({ status: 'active' });
    console.log(`✅ Found ${activeAlerts.length} active alerts`);

    // Test 3: Update alert status
    console.log('\n3. Updating alert status...');
    const updatedAlert = await EmergencyAlert.findByIdAndUpdate(
      newAlert._id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    console.log('✅ Alert status updated to:', updatedAlert.status);

    // Test 4: Create emergency response
    console.log('\n4. Creating emergency response...');
    const newResponse = new EmergencyResponse({
      alertId: newAlert._id,
      responderId: new mongoose.Types.ObjectId(),
      responseType: 'ambulance',
      status: 'dispatched',
      estimatedArrival: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      notes: 'Ambulance dispatched to location'
    });

    await newResponse.save();
    console.log('✅ Emergency response created successfully');
    console.log('   - Response ID:', newResponse._id);
    console.log('   - Type:', newResponse.responseType);
    console.log('   - Status:', newResponse.status);

    // Test 5: Find responses by alert
    console.log('\n5. Finding responses for alert...');
    const responses = await EmergencyResponse.find({ alertId: newAlert._id });
    console.log(`✅ Found ${responses.length} responses for alert`);

    // Test 6: Test alert statistics
    console.log('\n6. Testing alert statistics...');
    const alertStats = await EmergencyAlert.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('✅ Alert statistics:', alertStats);

    // Test 7: Test location-based queries
    console.log('\n7. Testing location-based queries...');
    const nearbyAlerts = await EmergencyAlert.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [77.2090, 28.6139]
          },
          $maxDistance: 10000 // 10km
        }
      }
    });
    console.log(`✅ Found ${nearbyAlerts.length} alerts within 10km`);

    // Cleanup
    console.log('\n8. Cleaning up test data...');
    await EmergencyAlert.findByIdAndDelete(newAlert._id);
    await EmergencyResponse.findByIdAndDelete(newResponse._id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testEmergencyAlerts();
