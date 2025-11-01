import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Cache the connection to reuse in serverless functions
let cachedConnection = null;

const connectDB = async () => {
  // Check if MongoDB URI is configured
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    throw new Error('Database configuration error: MONGODB_URI not found');
  }

  // If we have a cached connection and it's ready, return it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // If mongoose is already connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection in progress...');
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => {
        cachedConnection = mongoose.connection;
        resolve(cachedConnection);
      });
      mongoose.connection.once('error', reject);
    });
  }

  try {
    console.log('🔄 Establishing new MongoDB connection...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 connection
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    cachedConnection = null; // Clear cache on error

    // In serverless, don't exit the process
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
