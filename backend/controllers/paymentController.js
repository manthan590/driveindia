/**
 * Payment Controller
 * UPI QR Code payment flow (manual confirmation)
 */

const pool = require('../config/database');

const UPI_ID = 'mparab046@oksbi';
const UPI_NAME = 'Manthan Parab';

// Initiate payment — return UPI details for QR code
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

            const refId = 'DI' + Date.now() + Math.floor(Math.random() * 1000);

            return res.json({
                success: true,
                data: {
                    upi_id: UPI_ID,
                    upi_name: UPI_NAME,
                    amount: booking.total_amount,
                    ref_id: refId,
                    booking_id: booking.id
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

// Confirm payment (user confirms after UPI payment)
const verifyPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { booking_id, transaction_id } = req.body;

        if (!booking_id || !transaction_id) {
            return res.status(400).json({ success: false, message: 'Booking ID and UPI Transaction ID are required' });
        }

        // Validate transaction ID format (12-digit UTR or alphanumeric 8-22 chars)
        const txnId = transaction_id.trim();
        if (!/^[A-Za-z0-9]{8,22}$/.test(txnId)) {
            return res.status(400).json({ success: false, message: 'Invalid Transaction ID. Enter a valid 8-22 character alphanumeric UTR/Transaction ID.' });
        }

        const connection = await pool.getConnection();
        try {
            const [bookings] = await connection.query(
                'SELECT id, total_amount, status FROM bookings WHERE id = ? AND user_id = ?',
                [booking_id, userId]
            );

            if (bookings.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            if (bookings[0].status !== 'Pending') {
                connection.release();
                return res.status(400).json({ success: false, message: 'Booking is already processed' });
            }

            // Insert payment record
            const [paymentResult] = await connection.query(
                `INSERT INTO payments (booking_id, user_id, payment_method, amount, transaction_id, status)
                 VALUES (?, ?, 'UPI', ?, ?, 'Success')`,
                [booking_id, userId, bookings[0].total_amount, transaction_id]
            );

            // Confirm booking
            await connection.query(
                "UPDATE bookings SET status = 'Confirmed' WHERE id = ? AND user_id = ?",
                [booking_id, userId]
            );

            connection.release();

            return res.json({
                success: true,
                message: 'Payment confirmed & booking confirmed!',
                data: {
                    paymentId: paymentResult.insertId,
                    transactionId: transaction_id,
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
        res.status(500).json({ success: false, message: 'Payment confirmation failed' });
    }
};

// Get UPI info (public route)
const getKey = (req, res) => {
    res.json({ success: true, upi_id: UPI_ID, upi_name: UPI_NAME });
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
            return res.status(200).json({ success: true, count: payments.length, data: payments });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
    }
};

module.exports = { createOrder, verifyPayment, getKey, getPaymentHistory };
