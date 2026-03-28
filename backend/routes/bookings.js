/**
 * Booking Routes
 * Handles booking creation, management, and cancellation
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

// Protected routes
router.post('/', verifyToken, bookingController.createBooking);
router.get('/', verifyToken, bookingController.getUserBookings);
router.get('/:bookingId', verifyToken, bookingController.getBookingDetails);
router.put('/:bookingId/cancel', verifyToken, bookingController.cancelBooking);

module.exports = router;
