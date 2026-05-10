import { pool } from '../src/config/database';

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Create settings table
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

    // Add old_values and new_values to audit_logs if they don't exist
    // MySQL doesn't have "ADD COLUMN IF NOT EXISTS" easily in one line without procedure, 
    // so we try and catch.
    try {
      await pool.query(`ALTER TABLE audit_logs ADD COLUMN old_values JSON`);
      console.log('Column old_values added to audit_logs.');
    } catch (e) {
      console.log('Column old_values likely already exists.');
    }

    try {
      await pool.query(`ALTER TABLE audit_logs ADD COLUMN new_values JSON`);
      console.log('Column new_values added to audit_logs.');
    } catch (e) {
      console.log('Column new_values likely already exists.');
    }

    // Insert some default settings
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
