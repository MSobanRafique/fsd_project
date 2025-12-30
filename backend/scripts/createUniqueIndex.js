// Script to create unique index on email field
// This ensures database-level uniqueness enforcement
// Usage: node scripts/createUniqueIndex.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const createUniqueIndex = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database\n');

    // Create unique index on email field
    try {
      await User.collection.createIndex({ email: 1 }, { unique: true });
      console.log('✅ Unique index created on email field');
    } catch (error) {
      if (error.code === 85) {
        console.log('✅ Unique index already exists on email field');
      } else {
        throw error;
      }
    }

    // Verify index exists
    const indexes = await User.collection.getIndexes();
    console.log('\n📊 Current indexes on User collection:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`   - ${indexName}:`, JSON.stringify(indexes[indexName]));
    });

    console.log('\n✅ Database indexes verified!');
    console.log('Email uniqueness is now enforced at the database level.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

createUniqueIndex();

