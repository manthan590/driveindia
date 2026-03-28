/**
 * Vehicle Routes
 * Handles vehicle listing and details
 */

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken } = require('../middleware/auth');

// Public routes (no authentication required for browsing)
router.get('/', vehicleController.getVehicles);
router.get('/locations', vehicleController.getLocations);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:vehicleId/available-dates', vehicleController.getAvailableDates);

module.exports = router;
