/**
 * Payment Routes
 * UPI QR Code payment flow
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Public
router.get('/key', paymentController.getKey);

// Protected routes
router.post('/create-order', verifyToken, paymentController.createOrder);
router.post('/verify', verifyToken, paymentController.verifyPayment);
router.get('/history', verifyToken, paymentController.getPaymentHistory);

module.exports = router;
