// Authentication middleware
// Verifies JWT tokens and attaches user info to request
// Author: Person 2 - Backend Developer

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.error(`Auth error: User not found for token ID: ${decoded.id}`);
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }

    // Verify user ID matches token
    if (user._id.toString() !== decoded.id) {
      console.error(`Auth error: User ID mismatch. Token ID: ${decoded.id}, User ID: ${user._id}`);
      return res.status(401).json({ message: 'Token is not valid - user mismatch' });
    }

    // Attach user to request (always fresh from database)
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure user is attached to request
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify user role matches required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };

