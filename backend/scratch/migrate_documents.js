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
    console.log('Starting Document Settings migration...');
    
    // Create document_sequences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_sequences (
        document_type VARCHAR(20) PRIMARY KEY, -- 'PR' | 'GRN' | 'SIV' | 'PRF'
        prefix VARCHAR(10) NOT NULL,
        last_number INT DEFAULT 0,
        padding INT DEFAULT 4,
        include_year BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('document_sequences table created.');

    // Seed sequences
    const sequences = [
      ['PR', 'PR', 0, 4, true],
      ['GRN', 'GRN', 0, 4, true],
      ['SIV', 'SIV', 0, 4, true],
      ['PRF', 'PRF', 0, 4, true]
    ];

    for (const [type, pref, last, pad, year] of sequences) {
      await pool.query(
        "INSERT IGNORE INTO document_sequences (document_type, prefix, last_number, padding, include_year) VALUES (?, ?, ?, ?, ?)",
        [type, pref, last, pad, year]
      );
    }
    console.log('Document sequences seeded.');

    // Seed PDF and Rule settings into system_settings
    const docSettings = [
      ['pdf_show_logo', 'true', 'boolean', 'documents', 'Show Logo on PDF', 'Display company logo in header'],
      ['pdf_header_color', '#0F172A', 'string', 'documents', 'PDF Header Color', 'Hex color for PDF headers'],
      ['pdf_page_size', 'A4', 'string', 'documents', 'Page Size', 'A4 | Letter | Legal'],
      ['pdf_watermark_text', '', 'string', 'documents', 'Watermark Text', 'Confidential, Draft, etc.'],
      ['pr_min_items', '1', 'number', 'rules', 'Min Items per PR', 'Minimum items required'],
      ['pr_max_items', '50', 'number', 'rules', 'Max Items per PR', 'Maximum items allowed'],
      ['grn_require_invoice', 'true', 'boolean', 'rules', 'Require Invoice', 'Require invoice attachment for GRN'],
      ['prf_require_grn', 'true', 'boolean', 'rules', 'Require GRN', 'Require linked GRN for payment']
    ];

    for (const [key, val, type, cat, lbl, desc] of docSettings) {
      await pool.query(
        "INSERT IGNORE INTO system_settings (id, `key`, value, data_type, category, label, description) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
        [key, val, type, cat, lbl, desc]
      );
    }
    console.log('System settings for documents seeded.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
