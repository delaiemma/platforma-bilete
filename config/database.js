/**
 * PostgreSQL database connection pool configuration
 * @module config/database
 */

const { Pool } = require('pg');

/**
 * PostgreSQL connection pool instance
 * @type {Pool}
 * @description Configured with connection parameters for the ticket database
 */
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ticket',
    password: '1q2w3e',
    port: 5432,
});

pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

module.exports = pool;
