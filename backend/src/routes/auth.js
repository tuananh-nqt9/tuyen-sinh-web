const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

// Admin routes
router.get('/users', auth, authController.getAllUsers);
router.post('/admin', auth, authController.createAdmin);
router.put('/users/:id', auth, authController.updateUser);

module.exports = router;
