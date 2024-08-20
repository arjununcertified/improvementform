const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'demo_db1',
    password: process.env.DB_PASSWORD || 'arjun',
    port: process.env.DB_PORT || 7351, // Default PostgreSQL port
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to the database', err.stack);
    } else {
        console.log('Connected to the database');
    }
});

module.exports = pool;
