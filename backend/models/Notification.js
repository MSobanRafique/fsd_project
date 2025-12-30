// Notification Model Schema
// Database Team - Person 3
// Stores system notifications for users

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  type: {
    type: String,
    enum: ['task_assigned', 'deadline_reminder', 'material_alert', 'project_update', 'system', 'other'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedType: {
    type: String,
    enum: ['project', 'task', 'material', 'expense', 'document'],
    default: null
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

