const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ahg_procurement'
    });
    console.log('Successfully connected to the database.');
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', rows);
    await connection.end();
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
  }
}

testConnection();
