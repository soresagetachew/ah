const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ahg_procurement',
});

async function migrate() {
  try {
    console.log('Starting Security infrastructure migration...');
    
    // Update users table
    const columnsToAdd = [
      ['failed_login_attempts', 'INT DEFAULT 0'],
      ['locked_until', 'TIMESTAMP NULL'],
      ['last_login_ip', 'VARCHAR(45)'],
      ['password_changed_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'],
      ['two_factor_enabled', 'BOOLEAN DEFAULT false'],
      ['two_factor_secret', 'VARCHAR(100)']
    ];

    for (const [col, def] of columnsToAdd) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
        console.log(`Column ${col} added to users.`);
      } catch (e) {
        // console.log(`Column ${col} already exists or failed.`);
      }
    }

    // Create active_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS active_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_type VARCHAR(30),
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);
    console.log('active_sessions table created.');

    // Create security_events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_events (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        event_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        description TEXT,
        severity VARCHAR(10) DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('security_events table created.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
