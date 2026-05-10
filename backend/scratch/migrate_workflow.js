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
    console.log('Starting Workflow migration...');
    
    // Create approval_rules table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approval_rules (
        id VARCHAR(36) PRIMARY KEY,
        document_type VARCHAR(20) NOT NULL,
        rule_name VARCHAR(100) NOT NULL,
        sequence INT NOT NULL,
        required_role VARCHAR(50) NOT NULL,
        scope VARCHAR(30) DEFAULT 'department',
        specific_user_id VARCHAR(36),
        is_required BOOLEAN DEFAULT true,
        can_skip_if VARCHAR(100),
        notify_on_reach BOOLEAN DEFAULT true,
        escalate_after_days INT DEFAULT 3,
        escalate_to_role VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('approval_rules table created.');

    // Create amount_thresholds table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS amount_thresholds (
        id VARCHAR(36) PRIMARY KEY,
        document_type VARCHAR(20) NOT NULL,
        label VARCHAR(100) NOT NULL,
        min_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        max_amount DECIMAL(15,2),
        required_approvals INT DEFAULT 2,
        requires_gm BOOLEAN DEFAULT true,
        requires_board BOOLEAN DEFAULT false,
        notify_additional_roles JSON,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('amount_thresholds table created.');

    // Seed approval rules
    const rules = [
      ['PR', 'Checker Review', 1, 'checker', 'department', 2, 'gm'],
      ['PR', 'GM Approval', 2, 'gm', 'global', 3, null],
      ['PRF', 'Checker Review', 1, 'checker', 'department', 2, 'gm'],
      ['PRF', 'Authorization', 2, 'gm', 'global', 3, null],
      ['PRF', 'Finance Disbursement', 3, 'finance', 'global', 5, null],
      ['GRN', 'Storekeeper Confirmation', 1, 'storekeeper', 'global', 1, null],
      ['SIV', 'Receiver Confirmation', 1, 'storekeeper', 'global', 1, null]
    ];

    for (const [doc, name, seq, role, scope, escDays, escRole] of rules) {
      await pool.query(
        "INSERT IGNORE INTO approval_rules (id, document_type, rule_name, sequence, required_role, scope, escalate_after_days, escalate_to_role) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)",
        [doc, name, seq, role, scope, escDays, escRole]
      );
    }
    console.log('Approval rules seeded.');

    // Seed thresholds
    const thresholds = [
      ['PR', 'Small Purchase', 0, 5000, 1, false],
      ['PR', 'Medium Purchase', 5001, 50000, 2, true],
      ['PR', 'Large Purchase', 50001, 500000, 2, true],
      ['PR', 'Major Purchase', 500001, null, 3, true],
      ['PRF', 'Small Payment', 0, 10000, 2, false],
      ['PRF', 'Large Payment', 10001, null, 3, true]
    ];

    for (const [doc, lbl, min, max, req, gm] of thresholds) {
      await pool.query(
        "INSERT IGNORE INTO amount_thresholds (id, document_type, label, min_amount, max_amount, required_approvals, requires_gm, notify_additional_roles) VALUES (UUID(), ?, ?, ?, ?, ?, ?, '[]')",
        [doc, lbl, min, max, req, gm]
      );
    }
    console.log('Amount thresholds seeded.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
