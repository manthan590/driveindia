/**
 * Database Configuration
 * MySQL connection setup for Vehicle Rental System
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Build pool config — supports DATABASE_URL or individual env vars
let poolConfig;
let configSource = 'defaults';

const mysqlUrl = process.env.MYSQL_URL || process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;

if (mysqlUrl) {
    try {
        const url = new URL(mysqlUrl);
        const isMySqlProtocol = url.protocol === 'mysql:' || url.protocol === 'mysql2:';

        if (isMySqlProtocol) {
            const parsedPort = Number.parseInt(url.port, 10);
            poolConfig = {
                host: url.hostname,
                port: Number.isInteger(parsedPort) ? parsedPort : 3306,
                user: decodeURIComponent(url.username || ''),
                password: decodeURIComponent(url.password || ''),
                database: url.pathname.replace(/^\/+/, ''),
                waitForConnections: true,
                connectionLimit: 5,
                queueLimit: 0,
                ssl: { rejectUnauthorized: false }
            };
            configSource = 'DATABASE_URL';
        } else {
            console.warn(`⚠ DATABASE_URL has unsupported protocol "${url.protocol}". Expected mysql:// — falling back to DB_* env vars.`);
        }
    } catch (e) {
        console.warn(`⚠ DATABASE_URL is not a valid URL — falling back to DB_* env vars.`);
    }
}

if (!poolConfig) {
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT) || 3306;

    if (process.env.NODE_ENV === 'production' && host === 'localhost') {
        console.warn(
            '⚠ DB_HOST is "localhost" in production. ' +
            'Set DATABASE_URL=mysql://user:pass@host:3306/dbname or configure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT.'
        );
    }

    poolConfig = {
        host,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'vehicle_rental_db',
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    // Enable SSL for remote DB hosts (required by Aiven and most cloud MySQL providers)
    if (host !== 'localhost' && host !== '127.0.0.1') {
        poolConfig.ssl = { rejectUnauthorized: false };
    }

    configSource = `DB_* env vars (${host}:${port})`;
}

console.log(`Database config: ${configSource}`);

const pool = mysql.createPool(poolConfig);

async function ensureSchema() {
    const targetDbName = process.env.DB_NAME || poolConfig.database || 'defaultdb';

    const [tables] = await pool.query(
        "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
        [targetDbName]
    );

    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema_cloud.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Execute statements one-by-one so we don't need multiStatements enabled.
    const statements = sql
        .split(';')
        .map(chunk => chunk
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            .trim())
        .filter(Boolean);

    if (tables[0].c === 0) {
        console.log('⚠ users table not found. Initializing schema...');
        for (const statement of statements) {
            await pool.query(statement);
        }
        console.log('✓ Database schema initialized successfully');
    } else {
        // Tables exist — still run seed statements so image_url / data fixes are applied
        const seedStatements = statements.filter(s =>
            s.toUpperCase().startsWith('INSERT') || s.toUpperCase().startsWith('UPDATE')
        );
        for (const statement of seedStatements) {
            await pool.query(statement).catch(() => {}); // ignore duplicate/constraint errors
        }
        console.log('✓ Database seed data refreshed');
    }
}

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✓ MySQL Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error(`✗ Database connection failed [${poolConfig.host}:${poolConfig.port}]:`, err.message);
        if (err.message.includes('out of range') || err.message.includes('offset')) {
            console.error(
                '  → This usually means the server at that host:port is not MySQL/MariaDB.\n' +
                '  → Set DATABASE_URL=mysql://user:pass@your-mysql-host:3306/dbname\n' +
                '  → Or set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT env vars.'
            );
        }
    });

pool.ensureSchema = ensureSchema;

module.exports = pool;
