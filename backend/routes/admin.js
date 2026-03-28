/**
 * Admin Routes
 * Handles admin-specific operations
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

// Protected admin routes
router.get('/dashboard', verifyAdmin, adminController.getDashboardStats);
router.get('/vehicles', verifyAdmin, adminController.getAllVehicles);
router.post('/vehicles', verifyAdmin, upload.single('image'), adminController.addVehicle);
router.put('/vehicles/:vehicleId', verifyAdmin, upload.single('image'), adminController.editVehicle);
router.delete('/vehicles/:vehicleId', verifyAdmin, adminController.deleteVehicle);
router.get('/bookings', verifyAdmin, adminController.getAllBookings);

module.exports = router;
