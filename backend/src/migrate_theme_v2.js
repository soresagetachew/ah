const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ahg_procurement'
  });

  try {
    console.log('🚀 Starting Theme Engine Migration (JS)...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS theme_presets (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(100) NOT NULL,
        description TEXT,
        is_builtin BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT false,
        preview_colors JSON NOT NULL,
        settings JSON NOT NULL,
        created_by CHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const settings = [
      ['brand_company_name', 'African Holding Share Company', 'string', 'brand', 'Company Name', 'Displayed in header', 0],
      ['brand_company_tagline', 'Building Tomorrow Together', 'string', 'brand', 'Tagline', 'Login tagline', 0],
      ['theme_color_primary', '#0F172A', 'string', 'theme', 'Primary Color', 'Main brand color', 0],
      ['theme_color_accent', '#3B82F6', 'string', 'theme', 'Accent Color', 'CTA color', 0],
      ['theme_color_sidebar_bg', '#0F172A', 'string', 'theme', 'Sidebar BG', 'Sidebar background', 0],
      ['theme_color_sidebar_text', '#94A3B8', 'string', 'theme', 'Sidebar Text', 'Sidebar text color', 0],
      ['theme_color_sidebar_active_bg', 'rgba(59, 130, 246, 0.1)', 'string', 'theme', 'Sidebar Active BG', 'Active background', 0],
      ['theme_color_sidebar_active_text', '#3B82F6', 'string', 'theme', 'Sidebar Active Text', 'Active text color', 0],
      ['theme_color_page_bg', '#F8FAFC', 'string', 'theme', 'Page Background', 'Main page background', 0],
      ['theme_font_family', 'Inter, sans-serif', 'string', 'theme', 'Font Family', 'Primary font', 0],
      ['theme_border_radius', '0.75rem', 'string', 'theme', 'Border Radius', 'Default UI radius', 0],
    ];

    for (const [key, value, type, category, label, desc, sensitive] of settings) {
      await connection.query(`
        INSERT INTO system_settings (id, \`key\`, value, data_type, category, label, description, is_sensitive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE value = VALUES(value)
      `, [uuidv4(), key, value, type, category, label, desc, sensitive]);
    }

    console.log('✅ Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
