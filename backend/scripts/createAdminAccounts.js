const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-accommodation';

const adminAccounts = [
  {
    email: 'admin1@findroom.com',
    password: 'Admin123!@#',
    name: 'Admin 1',
    role: 'admin'
  },
  {
    email: 'admin2@findroom.com',
    password: 'Admin123!@#',
    name: 'Admin 2',
    role: 'admin'
  },
  {
    email: 'admin3@findroom.com',
    password: 'Admin123!@#',
    name: 'Admin 3',
    role: 'admin'
  }
];

async function createAdminAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    for (const adminData of adminAccounts) {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        console.log(`⚠️  Admin ${adminData.email} already exists. Skipping...`);
        continue;
      }

      // Create new admin
      const admin = new User(adminData);
      await admin.save();
      console.log(`✅ Created admin: ${adminData.email}`);
    }

    console.log('\n✅ All admin accounts created successfully!');
    console.log('\n📋 Admin Login Credentials:');
    adminAccounts.forEach((admin, index) => {
      console.log(`\nAdmin ${index + 1}:`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: ${admin.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin accounts:', error);
    process.exit(1);
  }
}

createAdminAccounts();

