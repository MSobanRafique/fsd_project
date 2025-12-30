// Authentication Routes
// Person 2 - Backend Developer

const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, deleteAccount, getUsers, changePassword, adminCreateUser, adminDeleteUser } = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/users', auth, getUsers);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.delete('/account', auth, deleteAccount);

// Admin-only user management
router.post('/admin/users', auth, authorize('admin'), adminCreateUser);
router.delete('/admin/users/:id', auth, authorize('admin'), adminDeleteUser);

module.exports = router;

