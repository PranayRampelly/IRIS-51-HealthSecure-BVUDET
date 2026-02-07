import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkAdminUser = async () => {
  try {
    console.log('🔍 Checking admin user in database...');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@healthsecure.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('ID:', adminUser._id);
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('isActive:', adminUser.isActive);
    console.log('isEmailVerified:', adminUser.isEmailVerified);
    console.log('Password hash:', adminUser.password.substring(0, 20) + '...');
    
    // Test password comparison
    const testPassword = 'AdminPass123!';
    const isMatch = await adminUser.comparePassword(testPassword);
    console.log('Password match:', isMatch);
    
    // Test direct bcrypt comparison
    const directMatch = await bcrypt.compare(testPassword, adminUser.password);
    console.log('Direct bcrypt match:', directMatch);
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkAdminUser(); 