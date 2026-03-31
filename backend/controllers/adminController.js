/**
 * Admin Controller
 * Handles admin-specific operations like vehicle management and dashboard
 */

const pool = require('../config/database');

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            // Total users
            const [userCount] = await connection.query(
                "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
            );

            // Total bookings
            const [bookingCount] = await connection.query(
                'SELECT COUNT(*) as count FROM bookings'
            );

            // Total vehicles
            const [vehicleCount] = await connection.query(
                'SELECT COUNT(*) as count FROM vehicles'
            );

            // Revenue (from successful payments)
            const [revenue] = await connection.query(
                "SELECT SUM(amount) as total FROM payments WHERE status = 'Success'"
            );

            // Completed bookings
            const [completedBookings] = await connection.query(
                "SELECT COUNT(*) as count FROM bookings WHERE status = 'Completed'"
            );

            // Pending bookings
            const [pendingBookings] = await connection.query(
                "SELECT COUNT(*) as count FROM bookings WHERE status = 'Pending'"
            );

            connection.release();

            return res.status(200).json({
                success: true,
                data: {
                    totalUsers: userCount[0].count,
                    totalBookings: bookingCount[0].count,
                    totalVehicles: vehicleCount[0].count,
                    totalRevenue: revenue[0].total || 0,
                    completedBookings: completedBookings[0].count,
                    pendingBookings: pendingBookings[0].count
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            error: error.message
        });
    }
};

// Add Vehicle
const addVehicle = async (req, res) => {
    try {
        const {
            name,
            type,
            fuel_type,
            price_per_day,
            location,
            registration_number,
            capacity,
            description
        } = req.body;

        // Use uploaded file path or fallback to body image_url
        const image_url = req.file
            ? `/uploads/vehicles/${req.file.filename}`
            : req.body.image_url || null;

        // Validation
        if (!name || !type || !fuel_type || !price_per_day || !location) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing'
            });
        }

        const connection = await pool.getConnection();

        try {
            const [result] = await connection.query(
                `INSERT INTO vehicles 
                (name, type, fuel_type, price_per_day, location, image_url, registration_number, capacity, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    type,
                    fuel_type,
                    price_per_day,
                    location,
                    image_url,
                    registration_number,
                    capacity,
                    description
                ]
            );

            connection.release();

            return res.status(201).json({
                success: true,
                message: 'Vehicle added successfully',
                data: {
                    id: result.insertId,
                    name,
                    type,
                    fuel_type,
                    price_per_day
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Add vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add vehicle',
            error: error.message
        });
    }
};

// Edit Vehicle
const editVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const {
            name,
            type,
            fuel_type,
            price_per_day,
            location,
            availability_status,
            description
        } = req.body;

        // Use uploaded file path or fallback to body image_url
        const image_url = req.file
            ? `/uploads/vehicles/${req.file.filename}`
            : req.body.image_url || null;

        const connection = await pool.getConnection();

        try {
            await connection.query(
                `UPDATE vehicles 
                 SET name = COALESCE(?, name),
                     type = COALESCE(?, type),
                     fuel_type = COALESCE(?, fuel_type),
                     price_per_day = COALESCE(?, price_per_day),
                     location = COALESCE(?, location),
                     availability_status = COALESCE(?, availability_status),
                     image_url = COALESCE(?, image_url),
                     description = COALESCE(?, description)
                 WHERE id = ?`,
                [
                    name,
                    type,
                    fuel_type,
                    price_per_day,
                    location,
                    availability_status,
                    image_url,
                    description,
                    vehicleId
                ]
            );

            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Vehicle updated successfully'
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Edit vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to edit vehicle',
            error: error.message
        });
    }
};

// Delete Vehicle
const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const connection = await pool.getConnection();

        try {
            const [result] = await connection.query(
                'DELETE FROM vehicles WHERE id = ?',
                [vehicleId]
            );

            connection.release();

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehicle not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Vehicle deleted successfully'
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle',
            error: error.message
        });
    }
};

// Get All Bookings (Admin)
const getAllBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = `SELECT b.*, v.name AS vehicle_name, u.full_name AS user_name, u.email, u.phone
                    FROM bookings b
                    JOIN vehicles v ON b.vehicle_id = v.id
                    JOIN users u ON b.user_id = u.id
                    WHERE 1=1`;
        const params = [];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        query += ' ORDER BY b.created_at DESC';

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const connection = await pool.getConnection();

        try {
            const [bookings] = await connection.query(query, params);

            // Get total count for pagination
            const [countResult] = await connection.query(
                'SELECT COUNT(*) as total FROM bookings'
            );

            connection.release();

            return res.status(200).json({
                success: true,
                data: bookings,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// Get All Vehicles (Admin - includes unavailable)
const getAllVehicles = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [vehicles] = await connection.query(
                'SELECT * FROM vehicles ORDER BY created_at DESC'
            );

            connection.release();

            return res.status(200).json({
                success: true,
                count: vehicles.length,
                data: vehicles
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get all vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles',
            error: error.message
        });
    }
};

// Get KYC Applications (Admin)
const getKYCApplications = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `SELECT id, full_name, email, phone, aadhaar_number, driving_license, pan_number,
                     address, permanent_address, city, emergency_contact_name, emergency_contact_phone,
                     profile_photo, selfie_photo, dl_photo, aadhaar_photo, id_with_selfie_photo,
                     kyc_status, kyc_remarks, verified, created_at
                     FROM users WHERE role = 'user'`;
        const params = [];
        if (status) {
            query += ' AND kyc_status = ?';
            params.push(status);
        } else {
            query += " AND kyc_status IN ('submitted', 'verified', 'rejected')";
        }
        query += ' ORDER BY FIELD(kyc_status, "submitted", "rejected", "verified"), updated_at DESC';

        const connection = await pool.getConnection();
        try {
            const [users] = await connection.query(query, params);
            connection.release();
            return res.json({ success: true, data: users });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get KYC applications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch KYC applications' });
    }
};

// Approve / Reject KYC (Admin)
const updateKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, remarks } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be verified or rejected' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.query(
                'UPDATE users SET kyc_status = ?, kyc_remarks = ?, verified = ? WHERE id = ?',
                [status, remarks || null, status === 'verified', userId]
            );
            connection.release();
            return res.json({ success: true, message: `KYC ${status} successfully` });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Update KYC status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update KYC status' });
    }
};

module.exports = {
    getDashboardStats,
    addVehicle,
    editVehicle,
    deleteVehicle,
    getAllBookings,
    getAllVehicles,
    getKYCApplications,
    updateKYCStatus
};
