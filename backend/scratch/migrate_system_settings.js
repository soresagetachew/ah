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
    console.log('Starting system_settings migration...');
    
    // Create system_settings table
    // MySQL uses VARCHAR(36) for UUIDs usually, and auto-increment or UUID() function
    // The prompt says PRIMARY KEY DEFAULT gen_random_uuid(), but MySQL uses UUID()
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(36) PRIMARY KEY,
        \`key\` VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        data_type VARCHAR(20) NOT NULL DEFAULT 'string',
        category VARCHAR(50) NOT NULL,
        label VARCHAR(150) NOT NULL,
        description TEXT,
        is_sensitive BOOLEAN DEFAULT false,
        updated_by VARCHAR(36),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('system_settings table created.');

    const seedData = [
      ['company_name', 'African Holding Share Company', 'string', 'general', 'Company Name', 'Official company name shown on all documents'],
      ['company_phone', '+251 911 34 59 03', 'string', 'general', 'Primary Phone', 'Shown on PDF documents'],
      ['company_tin', '0000755117', 'string', 'general', 'TIN Number', 'Tax identification number'],
      ['company_address', 'Addis Ababa, Ethiopia', 'string', 'general', 'Company Address', 'Full company address'],
      ['default_currency', 'ETB', 'string', 'general', 'Default Currency', 'Currency used across the system'],
      ['fiscal_year_start', '07', 'string', 'general', 'Fiscal Year Start Month', 'Month number when fiscal year begins (Ethiopian: July=07)'],
      ['pr_serial_prefix', 'PR', 'string', 'documents', 'PR Serial Prefix', 'Prefix for Purchase Requisition numbers'],
      ['grn_serial_prefix', 'GRN', 'string', 'documents', 'GRN Serial Prefix', 'Prefix for Goods Receiving Note numbers'],
      ['siv_serial_prefix', 'SIV', 'string', 'documents', 'SIV Serial Prefix', 'Prefix for Store Issued Voucher numbers'],
      ['prf_serial_prefix', 'PRF', 'string', 'documents', 'PRF Serial Prefix', 'Prefix for Payment Request numbers'],
      ['pr_low_budget_warn_pct', '80', 'number', 'workflow', 'Budget Warning Threshold %', 'Warn when department spend reaches this % of budget'],
      ['pr_budget_block_pct', '100', 'number', 'workflow', 'Budget Block Threshold %', 'Block submission when spend exceeds this % of budget'],
      ['approval_escalation_days', '3', 'number', 'workflow', 'Escalation After (days)', 'Auto-escalate pending approvals after this many days'],
      ['grn_variance_warn_pct', '5', 'number', 'workflow', 'GRN Variance Warning %', 'Flag GRN if quantity differs from PR by more than this %'],
      ['session_timeout_minutes', '30', 'number', 'security', 'Session Timeout (minutes)', 'Auto-logout after inactivity'],
      ['max_login_attempts', '5', 'number', 'security', 'Max Login Attempts', 'Lock account after this many failed logins'],
      ['lockout_duration_minutes', '15', 'number', 'security', 'Lockout Duration (minutes)', 'How long account stays locked after max attempts'],
      ['require_2fa_roles', '["admin","gm","finance"]', 'json', 'security', 'Require 2FA for Roles', 'Roles that must use two-factor authentication'],
      ['smtp_host', '', 'string', 'notifications', 'SMTP Host', 'Email server host'],
      ['smtp_port', '587', 'number', 'notifications', 'SMTP Port', 'Email server port'],
      ['smtp_user', '', 'string', 'notifications', 'SMTP Username', 'Email server username'],
      ['smtp_password', '', 'string', 'notifications', 'SMTP Password', 'Email server password (stored encrypted)'],
      ['smtp_from_email', 'noreply@africanholding.com', 'string', 'notifications', 'From Email', 'Sender email address for system emails'],
      ['sms_enabled', 'false', 'boolean', 'notifications', 'SMS Notifications', 'Enable SMS notifications for approvals'],
      ['sms_api_key', '', 'string', 'notifications', 'SMS API Key', 'API key for SMS gateway'],
      ['backup_enabled', 'true', 'boolean', 'system', 'Auto Backup', 'Enable automatic daily database backup'],
      ['backup_retention_days', '30', 'number', 'system', 'Backup Retention (days)', 'How many days to keep backups'],
      ['maintenance_mode', 'false', 'boolean', 'system', 'Maintenance Mode', 'When enabled, only admins can access the system']
    ];

    for (const [key, val, type, cat, lbl, desc] of seedData) {
      await pool.query(
        `INSERT IGNORE INTO system_settings (id, \`key\`, value, data_type, category, label, description) VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
        [key, val, type, cat, lbl, desc]
      );
    }
    console.log('System settings seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
