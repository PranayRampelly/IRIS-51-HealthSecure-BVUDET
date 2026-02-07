import mongoose from 'mongoose';
import Policy from './server/src/models/Policy.js';
import User from './server/src/models/User.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/healthsecure', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkPolicies = async () => {
  try {
    await connectDB();
    
    // Get all users
    const users = await User.find({ role: 'patient' }).select('_id firstName lastName email');
    console.log(`\n📊 Found ${users.length} patients in database`);
    
    // Check policies for each user
    for (const user of users) {
      console.log(`\n👤 Patient: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   User ID: ${user._id}`);
      
      const policies = await Policy.find({ patientId: user._id });
      console.log(`   📋 Policies: ${policies.length}`);
      
      if (policies.length > 0) {
        policies.forEach((policy, index) => {
          console.log(`   ${index + 1}. ${policy.policyName} (${policy.policyType})`);
          console.log(`      Status: ${policy.status}`);
          console.log(`      Policy Number: ${policy.policyNumber}`);
          console.log(`      Coverage: $${policy.coverageAmount?.toLocaleString()}`);
          console.log(`      Premium: $${policy.premium?.amount}/month`);
          console.log(`      Used: $${policy.usedAmount?.toLocaleString()}`);
          console.log(`      Remaining: $${policy.remainingAmount?.toLocaleString()}`);
        });
      } else {
        console.log('   ❌ No policies found');
      }
    }
    
    // Check total policies in database
    const totalPolicies = await Policy.countDocuments();
    console.log(`\n📈 Total policies in database: ${totalPolicies}`);
    
    // Check policies by status
    const activePolicies = await Policy.countDocuments({ status: 'active' });
    const inactivePolicies = await Policy.countDocuments({ status: 'inactive' });
    const expiredPolicies = await Policy.countDocuments({ status: 'expired' });
    const cancelledPolicies = await Policy.countDocuments({ status: 'cancelled' });
    
    console.log(`\n📊 Policies by status:`);
    console.log(`   Active: ${activePolicies}`);
    console.log(`   Inactive: ${inactivePolicies}`);
    console.log(`   Expired: ${expiredPolicies}`);
    console.log(`   Cancelled: ${cancelledPolicies}`);
    
    // Check policies by type
    const healthPolicies = await Policy.countDocuments({ policyType: 'Health' });
    const dentalPolicies = await Policy.countDocuments({ policyType: 'Dental' });
    const visionPolicies = await Policy.countDocuments({ policyType: 'Vision' });
    const lifePolicies = await Policy.countDocuments({ policyType: 'Life' });
    const disabilityPolicies = await Policy.countDocuments({ policyType: 'Disability' });
    
    console.log(`\n📊 Policies by type:`);
    console.log(`   Health: ${healthPolicies}`);
    console.log(`   Dental: ${dentalPolicies}`);
    console.log(`   Vision: ${visionPolicies}`);
    console.log(`   Life: ${lifePolicies}`);
    console.log(`   Disability: ${disabilityPolicies}`);
    
  } catch (error) {
    console.error('Error checking policies:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB disconnected');
  }
};

checkPolicies(); 