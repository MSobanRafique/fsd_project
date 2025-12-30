// User Model Schema
// Created by: Person 3 - Database Team
// This model defines the structure for user accounts in the system

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true // Ensure unique index
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
    // Note: Passwords are hashed using bcrypt before saving
  },
  role: {
    type: String,
    enum: ['admin', 'project_manager', 'site_worker', 'client'],
    default: 'site_worker',
    required: true,
    immutable: false // Role can be changed, but we'll validate it
  },
  profilePic: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create unique index on email (case-insensitive)
userSchema.index({ email: 1 }, { unique: true });

// Ensure email is always normalized before saving
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Ensure email uniqueness (double-check before save)
userSchema.pre('save', async function(next) {
  // Only check for duplicates if email is being modified or this is a new document
  if (this.isModified('email') || this.isNew) {
    // Normalize email
    const normalizedEmail = this.email.toLowerCase().trim();
    
    // Check for existing user with same email (excluding current user)
    const existingUser = await this.constructor.findOne({ 
      email: normalizedEmail,
      _id: { $ne: this._id }
    });
    
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.code = 11000;
      return next(error);
    }
    
    // Ensure email is normalized
    this.email = normalizedEmail;
  }
  
  // Validate role is one of the allowed values
  if (this.isModified('role') && !['admin', 'project_manager', 'site_worker', 'client'].includes(this.role)) {
    return next(new Error('Invalid role specified'));
  }
  
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

