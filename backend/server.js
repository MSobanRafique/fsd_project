// BuildWise Backend Server
// Main server file
// Created by: Person 2 - Backend Developer

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config();

// Connect to database (async, will be cached after first connection)
connectDB().catch((err) => {
  console.error('Initial database connection attempt failed:', err);
});

// Create uploads directory if it doesn't exist (only for local dev)
// Vercel serverless functions use /tmp for writable storage
const uploadsDir = process.env.VERCEL 
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// CORS configuration - allow Netlify frontend
const corsOptions = {
  origin: [
    'https://dreamy-croquembouche-f7c369.netlify.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to ensure database is connected (for serverless)
app.use('/api', async (req, res, next) => {
  // Skip health check
  if (req.path === '/health') {
    return next();
  }
  
  // Check mongoose connection state: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (error) {
      return res.status(503).json({ 
        message: 'Database connection not available', 
        error: error.message 
      });
    }
  }
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BuildWise API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Export for Vercel serverless functions
module.exports = app;

// Only listen if running locally (not on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

