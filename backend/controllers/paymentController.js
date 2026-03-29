/**
 * Payment Controller
 * Handles Razorpay payment integration
 */

const crypto = require('crypto');
const pool = require('../config/database');
const { getRazorpay } = require('../config/razorpay');

// Create Razorpay Order for Booking
const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { booking_id } = req.body;

        if (!booking_id) {
            return res.status(400).json({ success: false, message: 'Booking ID is required' });
        }

        const connection = await pool.getConnection();
        try {
            const [bookings] = await connection.query(
                'SELECT id, total_amount, status FROM bookings WHERE id = ? AND user_id = ?',
                [booking_id, userId]
            );
            connection.release();

            if (bookings.length === 0) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            const booking = bookings[0];
            if (booking.status !== 'Pending') {
                return res.status(400).json({ success: false, message: 'Booking is not in pending status' });
            }

            // Create Razorpay order (amount in paise)
            const order = await getRazorpay().orders.create({
                amount: Math.round(booking.total_amount * 100),
                currency: 'INR',
                receipt: `booking_${booking_id}`,
                notes: { booking_id: String(booking_id), user_id: String(userId) }
            });

            return res.json({
                success: true,
                data: {
                    order_id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    key_id: process.env.RAZORPAY_KEY_ID
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order' });
    }
};

// Verify Razorpay Payment & Confirm Booking
const verifyPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
            return res.status(400).json({ success: false, message: 'Missing payment verification data' });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
        }

        const connection = await pool.getConnection();
        try {
            // Insert payment record
            const [paymentResult] = await connection.query(
                `INSERT INTO payments (booking_id, user_id, payment_method, amount, transaction_id, status)
                 VALUES (?, ?, 'Razorpay', (SELECT total_amount FROM bookings WHERE id = ?), ?, 'Success')`,
                [booking_id, userId, booking_id, razorpay_payment_id]
            );

            // Confirm booking
                await connection.query(
                    "UPDATE bookings SET status = 'Confirmed' WHERE id = ? AND user_id = ?",
                [booking_id, userId]
            );

            connection.release();

            return res.json({
                success: true,
                message: 'Payment verified & booking confirmed!',
                data: {
                    paymentId: paymentResult.insertId,
                    transactionId: razorpay_payment_id,
                    status: 'Success',
                    bookingStatus: 'Confirmed'
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};

// Get Razorpay Key (public route for frontend)
const getKey = (req, res) => {
    res.json({ success: true, key_id: process.env.RAZORPAY_KEY_ID });
};

// Get Payment History
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const connection = await pool.getConnection();

        try {
            const [payments] = await connection.query(
                `SELECT p.*, b.total_amount as booking_amount, v.name as vehicle_name
                 FROM payments p
                 JOIN bookings b ON p.booking_id = b.id
                 JOIN vehicles v ON b.vehicle_id = v.id
                 WHERE p.user_id = ?
                 ORDER BY p.payment_date DESC`,
                [userId]
            );

            connection.release();

            return res.status(200).json({
                success: true,
                count: payments.length,
                data: payments
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getKey,
    getPaymentHistory
};
