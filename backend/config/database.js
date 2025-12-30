// Database connection configuration
// Created by: Person 2 (Backend Team)
// Supports both MongoDB Atlas (cloud) and local MongoDB

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connectionType = mongoURI.includes('mongodb+srv://') ? 'MongoDB Atlas' : 'Local MongoDB';
    console.log(`${connectionType} Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

