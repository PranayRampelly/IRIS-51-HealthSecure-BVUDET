import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (retryCount = 0, maxRetries = 3) => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('Neither MONGODB_URI nor MONGO_URI are defined in environment variables');
    }

    if (retryCount > 0) {
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Exponential backoff, max 10s
      console.log(`🔄 Attempting to connect to MongoDB... (Attempt ${retryCount}/${maxRetries}) using ${uri.startsWith('mongodb+srv') ? 'Atlas' : 'Local'}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true
    };

    const conn = await mongoose.connect(uri, options);

    // Log connection details
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Handle connection errors
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);

    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying connection... (${retryCount + 1}/${maxRetries})`);
      return connectDB(retryCount + 1, maxRetries);
    } else {
      console.error('❌ Failed to connect to MongoDB after maximum retries');
      console.error('Please check your MONGODB_URI environment variable');
      throw error;
    }
  }
};

export default connectDB; 