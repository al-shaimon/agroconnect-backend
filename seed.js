import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from './src/config/config.js';
import User from './src/app/modules/auth/auth.model.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@agroconnect.com',
    password: 'admin123',
    phone: '+880123456789',
    role: 'admin',
    location: {
      area: 'Gulshan',
      city: 'Dhaka',
    },
    isVerified: true,
    verificationStatus: 'approved',
    isActive: true,
  },
  {
    name: 'John Farmer',
    email: 'farmer@test.com',
    password: 'farmer123',
    phone: '+880198765432',
    role: 'farmer',
    location: {
      area: 'Mirpur',
      city: 'Dhaka',
    },
    isVerified: false,
    verificationStatus: 'pending',
    isActive: true,
  },
  {
    name: 'Shahed Buyer',
    email: 'buyer@test.com',
    password: 'buyer123',
    phone: '+880187654321',
    role: 'buyer',
    location: {
      area: 'Dhanmondi',
      city: 'Dhaka',
    },
    isVerified: false,
    verificationStatus: 'pending',
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB Connected');

    // Clear existing users (optional - remove this if you want to keep existing data)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create seed users
    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (!existingUser) {
        const user = await User.create(userData);
        console.log(`✅ Created ${user.role}: ${user.email} (password: ${userData.password})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Admin:');
    console.log('  Email: admin@agroconnect.com');
    console.log('  Password: admin123');
    console.log('\nFarmer:');
    console.log('  Email: farmer@test.com');
    console.log('  Password: farmer123');
    console.log('\nBuyer:');
    console.log('  Email: buyer@test.com');
    console.log('  Password: buyer123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
