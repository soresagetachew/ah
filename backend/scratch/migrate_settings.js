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
    console.log('Starting migration...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        group_name VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Settings table created/verified.');

    try {
      await pool.query(`ALTER TABLE audit_logs ADD COLUMN old_values JSON`);
      console.log('Column old_values added.');
    } catch (e) {}

    try {
      await pool.query(`ALTER TABLE audit_logs ADD COLUMN new_values JSON`);
      console.log('Column new_values added.');
    } catch (e) {}

    const defaultSettings = [
      ['ORG_NAME', 'African Holding Group', 'organization'],
      ['CURRENCY', 'ETB', 'organization'],
      ['TAX_RATE', '15', 'organization'],
      ['PR_THRESHOLD_CHECKER', '5000', 'procurement'],
      ['PR_THRESHOLD_GM', '50000', 'procurement'],
      ['SESSION_TIMEOUT', '60', 'security'],
      ['PASSWORD_MIN_LENGTH', '8', 'security']
    ];

    for (const [key, val, group] of defaultSettings) {
      await pool.query(
        `INSERT IGNORE INTO settings (id, setting_key, setting_value, group_name) VALUES (UUID(), ?, ?, ?)`,
        [key, val, group]
      );
    }
    console.log('Default settings inserted.');
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
