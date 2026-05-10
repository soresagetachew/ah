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
    console.log('Starting Budget & Org migration...');
    
    // Create budget_allocations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budget_allocations (
        id VARCHAR(36) PRIMARY KEY,
        entity_type VARCHAR(20) NOT NULL,
        entity_id VARCHAR(36) NOT NULL,
        fiscal_year VARCHAR(9) NOT NULL,
        allocated_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
        created_by VARCHAR(36),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE(entity_type, entity_id, fiscal_year)
      )
    `);
    console.log('budget_allocations table created.');

    // Add budget field to departments and projects if missing
    const tableUpdates = [
      ['departments', 'budget', 'DECIMAL(15,2) DEFAULT 0'],
      ['projects', 'budget', 'DECIMAL(15,2) DEFAULT 0'],
      ['projects', 'code', 'VARCHAR(50) UNIQUE'],
      ['projects', 'business_unit', 'VARCHAR(100)'],
      ['projects', 'department_id', 'VARCHAR(36)'],
      ['projects', 'location', 'VARCHAR(255)'],
      ['projects', 'start_date', 'DATE'],
      ['projects', 'end_date', 'DATE'],
      ['projects', 'description', 'TEXT'],
      ['projects', 'is_active', 'BOOLEAN DEFAULT true'],
      ['projects', 'manager_id', 'VARCHAR(36)']
    ];

    for (const [table, col, def] of tableUpdates) {
      try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
        console.log(`Column ${col} added to ${table}.`);
      } catch (e) {
        // Already exists
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
