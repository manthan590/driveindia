const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const sqlPath = path.join(__dirname, '..', '..', 'database', 'schema_cloud.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  await conn.query(sql);

  const [tables] = await conn.query(
    "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
    [process.env.DB_NAME]
  );

  const [admins] = await conn.query(
    "SELECT COUNT(*) AS c FROM users WHERE email = 'admin@driveindia.com'"
  );

  console.log('users table exists:', tables[0].c === 1);
  console.log('admin seed exists:', admins[0].c >= 1);

  await conn.end();
}

run().catch((err) => {
  console.error('Schema init failed:', err.message);
  process.exit(1);
});
