import mongoose from 'mongoose';
import User from './src/models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestAdmin = async () => {
  try {
    console.log('🔧 Creating test admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@healthsecure.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@healthsecure.com');
      console.log('Password: AdminPass123!');
      
      // Update the existing admin to ensure it's verified
      existingAdmin.isEmailVerified = true;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Admin user updated and verified');
      return;
    }
    
    // Create admin user (password will be hashed by the pre-save hook)
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
    
    console.log('✅ Test admin user created successfully!');
    console.log('Email: admin@healthsecure.com');
    console.log('Password: AdminPass123!');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestAdmin(); 