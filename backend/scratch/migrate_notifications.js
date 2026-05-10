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
    console.log('Starting Notification Settings migration...');
    
    // Create notification_rules table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_rules (
        id VARCHAR(36) PRIMARY KEY,
        event_type VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(150) NOT NULL,
        description TEXT,
        in_app_enabled BOOLEAN DEFAULT true,
        email_enabled BOOLEAN DEFAULT true,
        sms_enabled BOOLEAN DEFAULT false,
        notify_roles JSON,
        notify_requester BOOLEAN DEFAULT true,
        notify_next_approver BOOLEAN DEFAULT true,
        email_subject_template TEXT,
        email_body_template TEXT,
        sms_template TEXT
      )
    `);
    console.log('notification_rules table created.');

    // Seed notification rules
    const rules = [
      ['pr.submitted', 'PR Submitted for Approval', 'When a PR is submitted by staff', true, true],
      ['pr.checked', 'PR Reviewed by Checker', 'When checker approves or returns a PR', true, true],
      ['pr.approved', 'PR Approved by GM', 'When GM gives final approval', true, true],
      ['pr.rejected', 'PR Rejected', 'When a PR is rejected at any stage', true, true],
      ['pr.returned', 'PR Returned for Revision', 'When a PR is returned to requester', true, true],
      ['pr.escalated', 'PR Approval Escalated', 'When approval is auto-escalated due to inactivity', true, true],
      ['grn.created', 'GRN Created', 'When storekeeper records goods receipt', true, false],
      ['grn.variance', 'GRN Quantity Variance', 'When received quantity differs from PR', true, true],
      ['siv.issued', 'Items Issued from Store', 'When storekeeper issues items to department', true, false],
      ['prf.submitted', 'Payment Request Submitted', 'When payment request is submitted', true, true],
      ['prf.approved', 'Payment Request Approved', 'When payment is finally approved', true, true],
      ['prf.disbursed', 'Payment Disbursed', 'When finance confirms disbursement', true, true],
      ['budget.warning', 'Budget Threshold Warning', 'When dept spend reaches warning threshold', true, true],
      ['budget.exceeded', 'Budget Exceeded', 'When dept spend exceeds allocated budget', true, true],
      ['inventory.low_stock', 'Low Stock Alert', 'When item falls below minimum stock level', true, false],
      ['inventory.out_of_stock', 'Out of Stock Alert', 'When item reaches zero stock', true, true],
      ['user.created', 'New User Created', 'When admin creates a new user account', true, true],
      ['user.locked', 'Account Locked', 'When an account is locked due to failed logins', true, true],
      ['security.new_device', 'New Device Login', 'When user logs in from unrecognized device', true, true]
    ];

    for (const [event, label, desc, inApp, email] of rules) {
      await pool.query(
        "INSERT IGNORE INTO notification_rules (id, event_type, label, description, in_app_enabled, email_enabled, notify_roles) VALUES (UUID(), ?, ?, ?, ?, ?, '[]')",
        [event, label, desc, inApp, email]
      );
    }
    console.log('Notification rules seeded.');

    // Seed SMTP and SMS settings into system_settings
    const nSettings = [
      ['smtp_host', 'smtp.gmail.com', 'string', 'notifications', 'SMTP Host', 'Host for sending emails'],
      ['smtp_port', '587', 'number', 'notifications', 'SMTP Port', 'Port for SMTP (587 for TLS, 465 for SSL)'],
      ['smtp_user', '', 'string', 'notifications', 'SMTP Username', 'Email account for sending'],
      ['smtp_pass', '', 'string', 'notifications', 'SMTP Password', 'Password for SMTP (Stored encrypted)', true],
      ['smtp_from_name', 'African Holding Procurement', 'string', 'notifications', 'From Name', 'Name shown in From field'],
      ['smtp_from_email', 'noreply@africanholding.com', 'string', 'notifications', 'From Email', 'Email shown in From field'],
      ['sms_provider', 'disabled', 'string', 'notifications', 'SMS Provider', 'disabled | twilio | ethiotelecom'],
      ['sms_twilio_sid', '', 'string', 'notifications', 'Twilio Account SID', 'SID from Twilio dashboard'],
      ['sms_twilio_token', '', 'string', 'notifications', 'Twilio Auth Token', 'Token from Twilio dashboard', true]
    ];

    for (const [key, val, type, cat, lbl, desc, sensitive] of nSettings) {
      await pool.query(
        "INSERT IGNORE INTO system_settings (id, `key`, value, data_type, category, label, description, is_sensitive) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)",
        [key, val, type, cat, lbl, desc, sensitive || false]
      );
    }
    console.log('Notification system settings seeded.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
