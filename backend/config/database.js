/**
 * Database Configuration
 * MySQL connection setup for Vehicle Rental System
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Build pool config — supports DATABASE_URL or individual env vars
let poolConfig;

if (process.env.DATABASE_URL) {
    poolConfig = {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
    };
} else {
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'vehicle_rental_db',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

const pool = mysql.createPool(poolConfig);

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✓ MySQL Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
    });

module.exports = pool;
