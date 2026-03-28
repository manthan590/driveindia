/**
 * Authentication Controller
 * Handles user registration, login, and JWT token management
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role: role },
        process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
};

// Hash Password
const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

// Register User
const register = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            confirm_password,
            aadhaar_number,
            driving_license,
            city
        } = req.body;

        // Validation
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Get connection from pool
        const connection = await pool.getConnection();

        try {
            // Check if user already exists
            const [existingUser] = await connection.query(
                'SELECT id FROM users WHERE email = ? OR phone = ?',
                [email, phone]
            );

            if (existingUser.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email or phone already exists'
                });
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Insert user
            const [result] = await connection.query(
                `INSERT INTO users 
                (full_name, email, phone, password, aadhaar_number, driving_license, city, role, verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'user', FALSE)`,
                [full_name, email, phone, hashedPassword, aadhaar_number, driving_license, city]
            );

            const userId = result.insertId;
            const token = generateToken(userId, 'user');

            // Release connection
            connection.release();

            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: userId,
                    full_name,
                    email,
                    phone,
                    role: 'user',
                    token
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login User
const login = async (req, res) => {
    try {
        const { email_or_phone, password } = req.body;

        // Validation
        if (!email_or_phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/Phone and password are required'
            });
        }

        const connection = await pool.getConnection();

        try {
            // Find user
            const [users] = await connection.query(
                'SELECT id, full_name, email, phone, password, role FROM users WHERE email = ? OR phone = ?',
                [email_or_phone, email_or_phone]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const user = users[0];

            // Compare password
            const isPasswordValid = await comparePassword(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const token = generateToken(user.id, user.role);

            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    token
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const connection = await pool.getConnection();

        try {
            const [users] = await connection.query(
                `SELECT id, full_name, email, phone, aadhaar_number, 
                        driving_license, address, city, role, verified, profile_photo, created_at 
                 FROM users WHERE id = ?`,
                [userId]
            );

            connection.release();

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: users[0]
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

// Update User Profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { full_name, phone, city, address, driving_license } = req.body;

        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE users SET full_name = ?, phone = ?, city = ?, address = ?, driving_license = ? WHERE id = ?`,
                [full_name, phone, city, address, driving_license, userId]
            );
            connection.release();

            return res.json({ success: true, message: 'Profile updated successfully' });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const connection = await pool.getConnection();
        try {
            const [users] = await connection.query('SELECT password FROM users WHERE id = ?', [userId]);
            if (users.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const isValid = await comparePassword(current_password, users[0].password);
            if (!isValid) {
                connection.release();
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }

            const hashed = await hashPassword(new_password);
            await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
            connection.release();

            return res.json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
    }
};

// Upload Profile Photo
const uploadPhoto = async (req, res) => {
    try {
        const userId = req.userId;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const photoUrl = `/uploads/profiles/${req.file.filename}`;
        const connection = await pool.getConnection();
        try {
            await connection.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photoUrl, userId]);
            connection.release();
            return res.json({ success: true, message: 'Photo uploaded', data: { photo_url: photoUrl } });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload photo', error: error.message });
    }
};

// Verify Aadhaar (simulated)
const verifyAadhaar = async (req, res) => {
    try {
        const userId = req.userId;
        const { aadhaar_number } = req.body;

        if (!aadhaar_number || aadhaar_number.length !== 12 || !/^\d{12}$/.test(aadhaar_number)) {
            return res.status(400).json({ success: false, message: 'Invalid Aadhaar number. Must be 12 digits.' });
        }

        // Simulate verification (2 seconds delay, 95% success rate for demo)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const verified = Math.random() < 0.95;

        const connection = await pool.getConnection();
        try {
            await connection.query(
                'UPDATE users SET aadhaar_number = ?, verified = ? WHERE id = ?',
                [aadhaar_number, verified, userId]
            );
            connection.release();

            if (verified) {
                return res.json({ success: true, message: 'Aadhaar verified successfully', data: { verified: true } });
            } else {
                return res.json({ success: false, message: 'Aadhaar verification failed. Please try again.' });
            }
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Aadhaar verify error:', error);
        res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getUserProfile,
    updateProfile,
    changePassword,
    uploadPhoto,
    verifyAadhaar
};
