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
    console.log('Starting Users & Roles migration...');
    
    // Create role_permissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id VARCHAR(36) PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        permission VARCHAR(100) NOT NULL,
        is_allowed BOOLEAN DEFAULT true,
        UNIQUE(role, permission)
      )
    `);
    console.log('role_permissions table created.');

    // Create user_activity_log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        action VARCHAR(100),
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('user_activity_log table created.');

    // Update users table with extra fields
    const columnsToAdd = [
      ['force_password_change', 'BOOLEAN DEFAULT false'],
      ['deleted_at', 'TIMESTAMP NULL'],
      ['last_login', 'TIMESTAMP NULL'],
      ['failed_attempts', 'INT DEFAULT 0'],
      ['locked_until', 'TIMESTAMP NULL'],
      ['business_unit', 'VARCHAR(100) NULL']
    ];

    for (const [col, def] of columnsToAdd) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
        console.log(`Column ${col} added to users.`);
      } catch (e) {
        // console.log(`Column ${col} already exists or failed.`);
      }
    }

    // Seed permissions
    const permissions = [
      ['gm', 'pr.view_all'], ['gm', 'pr.approve'], ['gm', 'pr.reject'],
      ['gm', 'prf.view_all'], ['gm', 'prf.approve'], ['gm', 'reports.view_all'],
      ['gm', 'reports.export'], ['gm', 'dashboard.gm'],
      ['finance', 'prf.create'], ['finance', 'prf.view_all'], ['finance', 'prf.disburse'],
      ['finance', 'prf.approve'], ['finance', 'budget.manage'], ['finance', 'reports.finance'],
      ['finance', 'reports.export'],
      ['storekeeper', 'grn.create'], ['storekeeper', 'grn.view_all'],
      ['storekeeper', 'siv.create'], ['storekeeper', 'siv.view_all'],
      ['storekeeper', 'inventory.manage'], ['storekeeper', 'inventory.view'],
      ['checker', 'pr.view_dept'], ['checker', 'pr.check'], ['checker', 'pr.return'],
      ['checker', 'prf.check'],
      ['staff', 'pr.create'], ['staff', 'pr.view_own'], ['staff', 'prf.create'],
      ['staff', 'prf.view_own'],
      ['auditor', 'audit.view_all'], ['auditor', 'reports.view_all'],
      ['auditor', 'pr.view_all'], ['auditor', 'prf.view_all']
    ];

    for (const [role, perm] of permissions) {
      await pool.query(
        `INSERT IGNORE INTO role_permissions (id, role, permission, is_allowed) VALUES (UUID(), ?, ?, true)`,
        [role, perm]
      );
    }
    console.log('Permissions seeded.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
