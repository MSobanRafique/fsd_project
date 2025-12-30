// Database Clear Script
// This script deletes all data from all collections for fresh testing
// Usage: node scripts/clearDatabase.js

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

// Import all models to ensure collections exist
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Material = require('../models/Material');
const Expense = require('../models/Expense');
const Document = require('../models/Document');
const Notification = require('../models/Notification');

const clearDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Get confirmation (in production, you'd want to add a confirmation prompt)
    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('Collections to be cleared:');
    console.log('  - Users');
    console.log('  - Projects');
    console.log('  - Tasks');
    console.log('  - Materials');
    console.log('  - Expenses');
    console.log('  - Documents');
    console.log('  - Notifications\n');

    // Delete all documents from each collection
    const collections = [
      { name: 'Users', model: User },
      { name: 'Projects', model: Project },
      { name: 'Tasks', model: Task },
      { name: 'Materials', model: Material },
      { name: 'Expenses', model: Expense },
      { name: 'Documents', model: Document },
      { name: 'Notifications', model: Notification }
    ];

    const results = {};

    for (const collection of collections) {
      try {
        const result = await collection.model.deleteMany({});
        results[collection.name] = result.deletedCount;
        console.log(`✓ Deleted ${result.deletedCount} documents from ${collection.name}`);
      } catch (error) {
        console.error(`✗ Error deleting ${collection.name}:`, error.message);
        results[collection.name] = 'Error';
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('─────────────────────────────────────');
    for (const [collection, count] of Object.entries(results)) {
      console.log(`  ${collection}: ${count} documents deleted`);
    }
    console.log('─────────────────────────────────────');
    console.log('\n✅ Database cleared successfully!');
    console.log('You can now start fresh testing.\n');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Run the script
clearDatabase();

