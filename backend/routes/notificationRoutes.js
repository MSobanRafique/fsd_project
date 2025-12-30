// Notification Routes
// Person 2 - Backend Team

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.route('/')
  .get(auth, getNotifications);

router.route('/mark-all-read')
  .put(auth, markAllAsRead);

router.route('/:id')
  .put(auth, markAsRead)
  .delete(auth, deleteNotification);

module.exports = router;

