// Script to check for duplicate users by email
// Usage: node scripts/checkDuplicateUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const checkDuplicateUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database\n');

    // Find all users
    const users = await User.find().select('email role name _id');
    
    // Group by email (case-insensitive)
    const emailMap = new Map();
    
    users.forEach(user => {
      const emailKey = user.email.toLowerCase().trim();
      if (!emailMap.has(emailKey)) {
        emailMap.set(emailKey, []);
      }
      emailMap.get(emailKey).push({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    });

    // Find duplicates
    const duplicates = [];
    emailMap.forEach((userList, email) => {
      if (userList.length > 1) {
        duplicates.push({ email, users: userList });
      }
    });

    if (duplicates.length === 0) {
      console.log('✅ No duplicate users found!');
      console.log(`Total users: ${users.length}`);
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate email(s):\n`);
      
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Email: ${dup.email}`);
        dup.users.forEach((user, uIndex) => {
          console.log(`   User ${uIndex + 1}:`);
          console.log(`      ID: ${user._id}`);
          console.log(`      Name: ${user.name}`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Role: ${user.role}`);
        });
        console.log('');
      });

      console.log('\n⚠️  WARNING: Duplicate users found!');
      console.log('You should delete duplicate accounts to prevent login issues.');
      console.log('Keep the account with the correct role and delete the others.\n');
    }

    // Show all users by role
    console.log('\n📊 Users by Role:');
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

checkDuplicateUsers();

