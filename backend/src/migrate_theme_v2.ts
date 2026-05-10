import { pool } from './backend/src/config/database';
import { v4 as uuidv4 } from 'uuid';

async function migrate() {
  try {
    console.log('🚀 Starting Theme Engine Migration...');

    // 1. Create theme_presets table if not exists
    await pool.query(`
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
    console.log('✅ theme_presets table ready.');

    // 2. Insert Theme Settings into system_settings
    const settings = [
      // BRAND IDENTITY
      ['brand_company_name', 'African Holding Share Company', 'string', 'brand', 'Company Name', 'Displayed in header, PDF documents, and emails', 0],
      ['brand_company_tagline', 'Building Tomorrow Together', 'string', 'brand', 'Tagline', 'Short tagline shown below company name in login screen', 0],
      ['brand_logo_url', '', 'string', 'brand', 'Logo URL', 'Full logo image URL (PNG/SVG, transparent background)', 0],
      ['brand_logo_dark_url', '', 'string', 'brand', 'Dark Logo URL', 'Logo for dark backgrounds (sidebar, PDF header)', 0],
      ['brand_favicon_url', '', 'string', 'brand', 'Favicon URL', 'Browser tab icon (ICO/PNG, 32x32)', 0],
      ['brand_logo_width', '160', 'number', 'brand', 'Logo Max Width (px)', 'Maximum width of logo in header area', 0],
      
      // COLOR PALETTE
      ['theme_color_primary', '#0F172A', 'string', 'theme', 'Primary Color', 'Main brand color — used for sidebar, buttons, headers', 0],
      ['theme_color_primary_hover', '#1E293B', 'string', 'theme', 'Primary Hover', 'Hover state of primary color elements', 0],
      ['theme_color_accent', '#3B82F6', 'string', 'theme', 'Accent / CTA Color', 'Call-to-action buttons, links, active states', 0],
      ['theme_color_accent_hover', '#2563EB', 'string', 'theme', 'Accent Hover', 'Hover state for accent colored elements', 0],
      ['theme_color_accent_light', '#EFF6FF', 'string', 'theme', 'Accent Light', 'Light tint of accent for backgrounds and badges', 0],
      ['theme_color_success', '#10B981', 'string', 'theme', 'Success Color', 'Approved status, positive indicators', 0],
      ['theme_color_warning', '#F59E0B', 'string', 'theme', 'Warning Color', 'Pending, returned, budget warnings', 0],
      ['theme_color_danger', '#EF4444', 'string', 'theme', 'Danger Color', 'Rejected, errors, delete actions', 0],
      ['theme_color_sidebar_bg', '#0F172A', 'string', 'theme', 'Sidebar Background', 'Background color of the navigation sidebar', 0],
      ['theme_color_sidebar_text', '#94A3B8', 'string', 'theme', 'Sidebar Text', 'Default text color in sidebar nav items', 0],
      ['theme_color_sidebar_active', '#3B82F6', 'string', 'theme', 'Sidebar Active Item', 'Color of active/selected sidebar nav item', 0],
      ['theme_color_sidebar_hover', 'rgba(255,255,255,0.1)', 'string', 'theme', 'Sidebar Hover', 'Background of hovered sidebar items', 0],
      ['theme_color_page_bg', '#F8FAFC', 'string', 'theme', 'Page Background', 'Main content area background', 0],
      ['theme_color_text_primary', '#0F172A', 'string', 'theme', 'Primary Text', 'Main body text color', 0],
      ['theme_color_text_secondary', '#64748B', 'string', 'theme', 'Secondary Text', 'Subtitles, labels, helper text', 0],
      
      // TYPOGRAPHY
      ['theme_font_family', 'Inter', 'string', 'theme', 'Font Family', 'Primary font options', 0],
      ['theme_font_size_base', '14', 'number', 'theme', 'Base Font Size (px)', 'Base size for scaling', 0],
      
      // SHAPE
      ['theme_border_radius_md', '12', 'number', 'theme', 'Medium Radius (px)', 'Default border radius', 0],
      ['theme_sidebar_width', '240', 'number', 'theme', 'Sidebar Width (px)', 'Width when expanded', 0],
    ];

    for (const [key, value, type, category, label, desc, sensitive] of settings) {
      await pool.query(`
        INSERT INTO system_settings (\`key\`, value, data_type, category, label, description, is_sensitive)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE value = VALUES(value), label = VALUES(label), description = VALUES(description)
      `, [key, value, type, category, label, desc, sensitive]);
    }
    console.log('✅ Theme settings seeded.');

    // 3. Seed presets
    const presets = [
      { name: 'default', label: 'African Holding Classic', desc: 'The default deep navy and blue theme', preview: {primary:'#0F172A', accent:'#3B82F6', sidebar:'#0F172A', page_bg:'#F8FAFC'}, settings: {theme_color_primary:'#0F172A', theme_color_accent:'#3B82F6', theme_color_sidebar_bg:'#0F172A', theme_color_page_bg:'#F8FAFC'} },
      { name: 'emerald', label: 'Forest Green', desc: 'Professional green theme', preview: {primary:'#064E3B', accent:'#10B981', sidebar:'#064E3B', page_bg:'#F0FDF9'}, settings: {theme_color_primary:'#064E3B', theme_color_accent:'#10B981', theme_color_sidebar_bg:'#064E3B', theme_color_page_bg:'#F0FDF9'} },
      { name: 'royal', label: 'Royal Purple', desc: 'Deep purple executive theme', preview: {primary:'#3B0764', accent:'#8B5CF6', sidebar:'#3B0764', page_bg:'#FAF5FF'}, settings: {theme_color_primary:'#3B0764', theme_color_accent:'#8B5CF6', theme_color_sidebar_bg:'#3B0764', theme_color_page_bg:'#FAF5FF'} },
    ];

    for (const p of presets) {
      await pool.query(`
        INSERT INTO theme_presets (id, name, label, description, is_builtin, preview_colors, settings)
        VALUES (?, ?, ?, ?, true, ?, ?)
        ON DUPLICATE KEY UPDATE label = VALUES(label), settings = VALUES(settings)
      `, [uuidv4(), p.name, p.label, p.desc, JSON.stringify(p.preview), JSON.stringify(p.settings)]);
    }
    console.log('✅ Theme presets seeded.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
