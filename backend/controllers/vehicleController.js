/**
 * Vehicle Controller
 * Handles vehicle listing, filtering, and details
 */

const pool = require('../config/database');

// Get All Vehicles with Filters
const getVehicles = async (req, res) => {
    try {
        const { type, fuel_type, location, min_price, max_price, sort } = req.query;

        let query = 'SELECT * FROM vehicles WHERE 1=1';
        const params = [];

        // Apply filters
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        if (fuel_type) {
            query += ' AND fuel_type = ?';
            params.push(fuel_type);
        }
        if (location) {
            query += ' AND location = ?';
            params.push(location);
        }
        if (min_price) {
            query += ' AND price_per_day >= ?';
            params.push(min_price);
        }
        if (max_price) {
            query += ' AND price_per_day <= ?';
            params.push(max_price);
        }

        // Always show available vehicles
        query += ' AND availability_status = TRUE';

        // Apply sorting
        if (sort === 'price_asc') {
            query += ' ORDER BY price_per_day ASC';
        } else if (sort === 'price_desc') {
            query += ' ORDER BY price_per_day DESC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        const connection = await pool.getConnection();

        try {
            const [vehicles] = await connection.query(query, params);
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
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles',
            error: error.message
        });
    }
};

// Get Vehicle Details
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        try {
            const [vehicles] = await connection.query(
                'SELECT * FROM vehicles WHERE id = ?',
                [id]
            );

            connection.release();

            if (vehicles.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehicle not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: vehicles[0]
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle',
            error: error.message
        });
    }
};

// Get Available Dates for a Vehicle
const getAvailableDates = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { month, year } = req.query;

        const connection = await pool.getConnection();

        try {
            // Get all bookings for this vehicle
            const [bookings] = await connection.query(
                `SELECT start_date, end_date FROM bookings 
                 WHERE vehicle_id = ? AND status != 'Cancelled'`,
                [vehicleId]
            );

            connection.release();

            // Calculate booked dates
            const bookedDates = [];
            bookings.forEach(booking => {
                let currentDate = new Date(booking.start_date);
                const endDate = new Date(booking.end_date);

                while (currentDate <= endDate) {
                    bookedDates.push(currentDate.toISOString().split('T')[0]);
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });

            return res.status(200).json({
                success: true,
                vehicleId,
                bookedDates,
                availableDates: 'All dates not in bookedDates array'
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get available dates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available dates',
            error: error.message
        });
    }
};

// Get Available Locations
const getLocations = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        try {
            const [locations] = await connection.query(
                'SELECT DISTINCT location FROM vehicles ORDER BY location'
            );

            connection.release();

            return res.status(200).json({
                success: true,
                data: locations.map(l => l.location)
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch locations',
            error: error.message
        });
    }
};

module.exports = {
    getVehicles,
    getVehicleById,
    getAvailableDates,
    getLocations
};
