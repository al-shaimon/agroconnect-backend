// Simple MongoDB Connection Test
// Run this to verify your MONGODB_URI is correct
// Usage: node test-db-connection.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');

// Check if MONGODB_URI exists
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in .env file');
  console.log('\nPlease add MONGODB_URI to your .env file');
  process.exit(1);
}

console.log('✅ MONGODB_URI found in environment');
console.log('📍 Attempting to connect...\n');

// Attempt connection
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Connected');
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('📦 Database:', mongoose.connection.name);
    console.log('\n✨ Your MongoDB connection is working correctly!');
    console.log('This same configuration will work in Vercel.\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ FAILED! MongoDB Connection Error');
    console.error('Error Message:', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your MONGODB_URI format');
    console.log('2. Verify MongoDB Atlas network access allows your IP');
    console.log('3. Check username/password are correct');
    console.log('4. Ensure database user has proper permissions\n');
    process.exit(1);
  });
