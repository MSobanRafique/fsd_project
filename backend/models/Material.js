// Material Resource Model
// Person 3 - Database Team
// Manages construction materials and resources

const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['cement', 'steel', 'brick', 'wood', 'electrical', 'plumbing', 'paint', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'tons', 'bags', 'pieces', 'meters', 'liters', 'sqft', 'other']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  supplier: {
    name: {
      type: String,
      default: ''
    },
    contact: {
      type: String,
      default: ''
    }
  },
  costPerUnit: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'low_stock', 'out_of_stock', 'ordered'],
    default: 'available'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  minThreshold: {
    type: Number,
    default: 10,
    min: 0
  }
}, {
  timestamps: true
});

materialSchema.index({ project: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ status: 1 });

module.exports = mongoose.model('Material', materialSchema);

