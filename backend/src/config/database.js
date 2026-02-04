const { Pool } = require('pg');
require('dotenv').config();

// Database configuration for Aiven PostgreSQL
// Important: When using Aiven or other services with self-signed certificates,
// we need to explicitly set rejectUnauthorized to false
const config = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// If we have a connection string, use it but ensure SSL is configured properly
if (process.env.DATABASE_URL) {
  // Remove any existing sslmode from the connection string and add our own
  let connectionString = process.env.DATABASE_URL;

  // Remove sslmode if it exists
  connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');

  config.connectionString = connectionString;

  // Set SSL configuration for Aiven/self-signed certificates
  if (process.env.DB_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: false
    };
  }
}

const pool = new Pool(config);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Database query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query
};
