// Database connection configuration
// Created by: Person 2 (Backend Team)
// Supports both MongoDB Atlas (cloud) and local MongoDB

const mongoose = require('mongoose');

// Cache the connection to reuse in serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Reuse existing connection if available
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
        const connectionType = mongoURI.includes('mongodb+srv://') ? 'MongoDB Atlas' : 'Local MongoDB';
        console.log(`${connectionType} Connected: ${mongoose.connection.host}`);
        console.log(`Database: ${mongoose.connection.name}`);
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`Database Connection Error: ${error.message}`);
    // Don't exit in serverless - let the function handle the error
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;

