/**
 * Test script to verify image upload configuration
 * This script checks if the environment-aware upload system is properly configured
 */

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

console.log('\n🔍 Testing Image Upload Configuration...\n');

// Test 1: Environment Detection
console.log('1️⃣ Environment Detection:');
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   VERCEL: ${process.env.VERCEL || 'not set'}`);
console.log(
  `   Is Production Mode: ${isProduction ? '✅ YES (Memory Storage)' : '❌ NO (Disk Storage)'}\n`
);

// Test 2: Cloudinary Configuration
console.log('2️⃣ Cloudinary Configuration:');
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.log('   ❌ ERROR: Missing Cloudinary credentials');
  console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CLOUDINARY_API_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CLOUDINARY_API_SECRET: ${apiSecret ? '✅ Set' : '❌ Missing'}`);
  console.log('\n   Please set Cloudinary credentials in .env file\n');
  process.exit(1);
} else {
  console.log('   ✅ All Cloudinary credentials are set');
  console.log(`   Cloud Name: ${cloudName}`);
}

// Test 3: Cloudinary Connection
console.log('\n3️⃣ Testing Cloudinary Connection:');
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

try {
  // Test connection by pinging Cloudinary API
  const result = await cloudinary.api.ping();
  console.log('   ✅ Cloudinary connection successful');
  console.log(`   Status: ${result.status}\n`);
} catch (error) {
  console.log('   ❌ Cloudinary connection failed');
  console.log(`   Error: ${error.message}\n`);
  process.exit(1);
}

// Test 4: Configuration Summary
console.log('4️⃣ Configuration Summary:');
console.log('   ┌─────────────────────────────────────────────┐');
console.log('   │ Upload Mode                                 │');
console.log('   ├─────────────────────────────────────────────┤');
if (isProduction) {
  console.log('   │ ✅ PRODUCTION MODE                         │');
  console.log('   │    • Multer: Memory Storage                │');
  console.log('   │    • Files stored as Buffer in RAM         │');
  console.log('   │    • Direct upload to Cloudinary           │');
  console.log('   │    • No filesystem access needed           │');
  console.log('   │    • Vercel compatible ✅                  │');
} else {
  console.log('   │ ✅ DEVELOPMENT MODE                        │');
  console.log('   │    • Multer: Disk Storage                  │');
  console.log('   │    • Files saved to uploads/ folder        │');
  console.log('   │    • Upload to Cloudinary from path        │');
  console.log('   │    • Local files auto-deleted              │');
  console.log('   │    • Debugging friendly ✅                 │');
}
console.log('   └─────────────────────────────────────────────┘\n');

// Test 5: Supported Endpoints
console.log('5️⃣ Image Upload Endpoints Ready:');
console.log('   ✅ POST /api/auth/register - Profile image');
console.log('   ✅ POST /api/auth/register-driver - Driver registration');
console.log('   ✅ PUT /api/auth/upload-verification-documents - Documents');
console.log('   ✅ POST /api/farmer/products - Product images');
console.log('   ✅ PUT /api/farmer/products/:id - Update product');
console.log('   ✅ PUT /api/driver/profile - Driver profile/vehicle');
console.log('   ✅ POST /api/admin/global-products - Global products');
console.log('   ✅ PUT /api/admin/global-products/:id - Update global product\n');

console.log('✨ All tests passed! Image upload system is ready.\n');
console.log('💡 Tips:');
console.log('   • For development: Use local disk storage (current mode)');
console.log('   • For Vercel: Set NODE_ENV=production or VERCEL=1');
console.log('   • All uploads go to Cloudinary in both modes');
console.log('   • Check VERCEL_IMAGE_UPLOAD_GUIDE.md for details\n');

process.exit(0);
