// Document Model Schema
// Person 3 - Database Developer
// Manages project documents, blueprints, and files

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  category: {
    type: String,
    enum: ['blueprint', 'contract', 'invoice', 'photo', 'report', 'other'],
    default: 'other'
  },
  version: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

documentSchema.index({ project: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Document', documentSchema);

