/**
 * Booking Controller
 * Handles vehicle booking, cancellation, and booking management
 */

const pool = require('../config/database');

// Calculate GST (18% for India)
const GST_RATE = parseFloat(process.env.GST_RATE) || 0.18;

// Create Booking
const createBooking = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            vehicle_id,
            start_date,
            end_date,
            pickup_location,
            dropoff_location
        } = req.body;

        // Validation
        if (!vehicle_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID, start date, and end date are required'
            });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate >= endDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        if (startDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book for past dates'
            });
        }

        const connection = await pool.getConnection();

        try {
            // Check KYC status
            const [userRows] = await connection.query(
                'SELECT kyc_status FROM users WHERE id = ?',
                [userId]
            );
            if (userRows.length === 0 || userRows[0].kyc_status !== 'verified') {
                connection.release();
                return res.status(403).json({
                    success: false,
                    message: 'KYC verification is required before booking. Please complete your KYC from your Profile page.'
                });
            }

            // Check vehicle availability
            const [vehicle] = await connection.query(
                'SELECT * FROM vehicles WHERE id = ?',
                [vehicle_id]
            );

            if (vehicle.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehicle not found'
                });
            }

            // Check for conflicts with existing bookings
            const [conflicts] = await connection.query(
                `SELECT id FROM bookings 
                 WHERE vehicle_id = ? 
                 AND status IN ('Pending', 'Confirmed', 'Ongoing')
                 AND NOT (end_date < ? OR start_date > ?)`,
                [vehicle_id, start_date, end_date]
            );

            if (conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Vehicle is not available for selected dates'
                });
            }

            // Calculate booking details
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const basePrice = vehicle[0].price_per_day * days;
            const gstAmount = Math.round(basePrice * GST_RATE * 100) / 100;
            const totalAmount = basePrice + gstAmount;

            // Security deposit: ₹2000 for Bike/Scooter, ₹5000 for Car
            const securityDeposit = vehicle[0].type === 'Car' ? 5000 : 2000;

            // Create booking
            const [result] = await connection.query(
                `INSERT INTO bookings 
                (user_id, vehicle_id, start_date, end_date, total_days, base_price, gst_amount, total_amount, 
                 pickup_location, dropoff_location, security_deposit, deposit_status, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'Pending')`,
                [
                    userId,
                    vehicle_id,
                    start_date,
                    end_date,
                    days,
                    basePrice,
                    gstAmount,
                    totalAmount,
                    pickup_location || vehicle[0].location,
                    dropoff_location || vehicle[0].location,
                    securityDeposit
                ]
            );

            const bookingId = result.insertId;
            connection.release();

            return res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    bookingId,
                    vehicleId: vehicle_id,
                    totalDays: days,
                    basePrice,
                    gstAmount,
                    totalAmount,
                    securityDeposit,
                    status: 'Pending'
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
};

// Get User Bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId;

        const connection = await pool.getConnection();

        try {
            const [bookings] = await connection.query(
                `SELECT b.*, v.name AS vehicle_name, v.image_url, v.type AS vehicle_type 
                 FROM bookings b
                 JOIN vehicles v ON b.vehicle_id = v.id
                 WHERE b.user_id = ?
                 ORDER BY b.created_at DESC`,
                [userId]
            );

            connection.release();

            return res.status(200).json({
                success: true,
                count: bookings.length,
                data: bookings
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// Get Booking Details
const getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.userId;

        const connection = await pool.getConnection();

        try {
            const [bookings] = await connection.query(
                `SELECT b.*, v.name AS vehicle_name, v.image_url, v.type AS vehicle_type, v.price_per_day,
                        u.full_name, u.email, u.phone
                 FROM bookings b
                 JOIN vehicles v ON b.vehicle_id = v.id
                 JOIN users u ON b.user_id = u.id
                 WHERE b.id = ? AND b.user_id = ?`,
                [bookingId, userId]
            );

            connection.release();

            if (bookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: bookings[0]
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.userId;

        const connection = await pool.getConnection();

        try {
            // Get booking
            const [bookings] = await connection.query(
                'SELECT status FROM bookings WHERE id = ? AND user_id = ?',
                [bookingId, userId]
            );

            if (bookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            if (bookings[0].status === 'Cancelled' || bookings[0].status === 'Completed') {
                return res.status(400).json({
                    success: false,
                    message: `Cannot cancel ${bookings[0].status} booking`
                });
            }

            // Update status
            await connection.query(
                'UPDATE bookings SET status = ? WHERE id = ?',
                ['Cancelled', bookingId]
            );

            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully'
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingDetails,
    cancelBooking
};
