import mongoose from 'mongoose';
import User from './src/models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const recreateTestAdmin = async () => {
  try {
    console.log('🔧 Recreating test admin user...');
    
    // Delete existing admin user
    await User.deleteOne({ email: 'admin@healthsecure.com' });
    console.log('🗑️ Deleted existing admin user');
    
    // Create new admin user (password will be hashed by the pre-save hook)
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@healthsecure.com',
      password: 'AdminPass123!', // Will be hashed automatically
      role: 'admin',
      phone: '+1234567890',
      isEmailVerified: true,
      isActive: true,
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'AS',
        zipCode: '12345',
        country: 'USA'
      }
    });
    
    await adminUser.save();
    
    console.log('✅ Test admin user recreated successfully!');
    console.log('Email: admin@healthsecure.com');
    console.log('Password: AdminPass123!');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error recreating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

recreateTestAdmin(); 