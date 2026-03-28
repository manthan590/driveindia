/**
 * Subscription Routes
 */

const express = require('express');
const router = express.Router();
const subController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');

router.get('/plans', subController.getPlans);
router.post('/create-order', verifyToken, subController.createSubscriptionOrder);
router.post('/verify', verifyToken, subController.verifySubscription);
router.get('/my-subscription', verifyToken, subController.getMySubscription);
router.put('/cancel', verifyToken, subController.cancelSubscription);

module.exports = router;
