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
    console.log('Starting Audit & Health infrastructure migration...');
    
    // Create error_logs table for system health monitoring
    await pool.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id VARCHAR(36) PRIMARY KEY,
        level VARCHAR(10) DEFAULT 'error', -- 'error' | 'fatal' | 'warn'
        message TEXT NOT NULL,
        stack TEXT,
        path VARCHAR(255),
        method VARCHAR(10),
        user_id VARCHAR(36),
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('error_logs table created.');

    // Add maintenance_mode setting if not present
    await pool.query(`
      INSERT IGNORE INTO system_settings (id, \`key\`, value, data_type, category, label, description)
      VALUES (UUID(), 'maintenance_mode', 'false', 'boolean', 'system', 'Maintenance Mode', 'If enabled, only admins can log in')
    `);
    console.log('maintenance_mode setting ensured.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
