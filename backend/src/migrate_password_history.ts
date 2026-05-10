import { pool } from './backend/src/config/database';

async function migrate() {
  try {
    console.log('Creating password_history table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_history (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_user_created (user_id, created_at DESC)
      )
    `);
    console.log('Table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
