/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const profileUpload = require('../config/profileUpload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getUserProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/change-password', verifyToken, authController.changePassword);
router.post('/upload-photo', verifyToken, profileUpload.single('photo'), authController.uploadPhoto);
router.post('/verify-aadhaar', verifyToken, authController.verifyAadhaar);

module.exports = router;
