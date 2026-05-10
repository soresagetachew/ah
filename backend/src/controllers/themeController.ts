import { Request, Response } from 'express';
import { pool } from '../config/database';
import { settingsService } from '../services/settingsService';
import { sseService } from '../services/sseService';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/theme/config
 * PUBLIC - Fetches flattened theme configuration
 */
export const getThemeConfig = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getAllSettings();
    
    const cssVariables: Record<string, string> = {
      '--color-primary': settings['theme_color_primary'] || '#0F172A',
      '--color-primary-hover': settings['theme_color_primary_hover'] || '#1E293B',
      '--color-accent': settings['theme_color_accent'] || '#3B82F6',
      '--color-accent-hover': settings['theme_color_accent_hover'] || '#2563EB',
      '--color-accent-light': settings['theme_color_accent_light'] || '#EFF6FF',
      '--color-success': settings['theme_color_success'] || '#10B981',
      '--color-success-light': settings['theme_color_success_light'] || '#ECFDF5',
      '--color-warning': settings['theme_color_warning'] || '#F59E0B',
      '--color-warning-light': settings['theme_color_warning_light'] || '#FFFBEB',
      '--color-danger': settings['theme_color_danger'] || '#EF4444',
      '--color-danger-light': settings['theme_color_danger_light'] || '#FEF2F2',
      '--color-sidebar-bg': settings['theme_color_sidebar_bg'] || '#0F172A',
      '--color-sidebar-text': settings['theme_color_sidebar_text'] || '#94A3B8',
      '--color-sidebar-active': settings['theme_color_sidebar_active'] || '#3B82F6',
      '--color-sidebar-hover': settings['theme_color_sidebar_hover'] || 'rgba(255,255,255,0.1)',
      '--color-page-bg': settings['theme_color_page_bg'] || '#F8FAFC',
      '--color-card-bg': settings['theme_color_card_bg'] || '#FFFFFF',
      '--color-border': settings['theme_color_border'] || '#E2E8F0',
      '--color-text-primary': settings['theme_color_text_primary'] || '#0F172A',
      '--color-text-secondary': settings['theme_color_text_secondary'] || '#64748B',
      '--color-text-muted': settings['theme_color_text_muted'] || '#94A3B8',
      '--font-family': settings['theme_font_family'] || 'Inter, sans-serif',
      '--font-size-base': (settings['theme_font_size_base'] || '14') + 'px',
      '--font-weight-normal': settings['theme_font_weight_normal'] || '400',
      '--font-weight-medium': settings['theme_font_weight_medium'] || '500',
      '--font-weight-bold': settings['theme_font_weight_bold'] || '600',
      '--radius-sm': (settings['theme_border_radius_sm'] || '8') + 'px',
      '--radius-md': (settings['theme_border_radius_md'] || '12') + 'px',
      '--radius-lg': (settings['theme_border_radius_lg'] || '16') + 'px',
      '--radius-xl': (settings['theme_border_radius_xl'] || '20') + 'px',
      '--sidebar-width': (settings['theme_sidebar_width'] || '240') + 'px',
      '--sidebar-collapsed-width': (settings['theme_sidebar_collapsed_width'] || '64') + 'px',
      '--card-shadow': settings['theme_card_shadow'] || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      '--card-shadow-hover': settings['theme_card_shadow_hover'] || '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    };

    const brand = {
      companyName: settings['brand_company_name'] || 'African Holding Group',
      tagline: settings['brand_company_tagline'] || 'Building Tomorrow Together',
      logoUrl: settings['brand_logo_url'] || '',
      logoDarkUrl: settings['brand_logo_dark_url'] || '',
      faviconUrl: settings['brand_favicon_url'] || '',
      logoWidth: Number(settings['brand_logo_width']) || 160,
      loginBgType: settings['brand_login_bg_type'] || 'gradient',
      loginBgColor: settings['brand_login_bg_color'] || '#0F172A',
      loginBgColorEnd: settings['brand_login_bg_color_end'] || '#1E3A5F',
      loginBgImageUrl: settings['brand_login_bg_image_url'] || '',
      loginCardPosition: settings['brand_login_card_position'] || 'center',
    };

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({
      cssVariables,
      brand,
      features: {
        darkModeEnabled: settings['theme_dark_mode_enabled'] === 'true',
        defaultMode: settings['theme_default_mode'] || 'light',
      },
      activePreset: settings['theme_active_preset'] || 'default',
      version: Date.now().toString(),
    });
  } catch (error) {
    console.error('Failed to fetch theme config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/theme/presets
 * Admin Only
 */
export const getPresets = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM theme_presets ORDER BY is_builtin DESC, label ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching presets' });
  }
};

/**
 * POST /api/theme/presets/apply/:presetName
 */
export const applyPreset = async (req: any, res: Response) => {
  const { presetName } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM theme_presets WHERE name = ?', [presetName]);
    const preset = rows[0];
    if (!preset) return res.status(404).json({ message: 'Preset not found' });

    const settings = typeof preset.settings === 'string' ? JSON.parse(preset.settings) : preset.settings;

    // 1. Bulk update settings
    for (const [key, value] of Object.entries(settings)) {
      await pool.query('UPDATE system_settings SET value = ?, updated_by = ? WHERE `key` = ?', [String(value), req.user.id, key]);
    }
    
    // 2. Set active preset
    await pool.query('UPDATE system_settings SET value = ?, updated_by = ? WHERE `key` = ?', [presetName, req.user.id, 'theme_active_preset']);

    await settingsService.refreshCache();
    
    // 3. Notify all clients
    sseService.broadcast('theme_updated', { type: 'theme:updated', version: Date.now().toString() });

    res.json({ message: `Preset ${presetName} applied successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to apply preset' });
  }
};

/**
 * POST /api/theme/presets
 * Save current theme as new preset
 */
export const savePreset = async (req: any, res: Response) => {
  const { name, label, description } = req.body;
  try {
    const { rows: themeSettings } = await pool.query("SELECT `key`, value FROM system_settings WHERE category = 'theme'");
    const settings: Record<string, string> = {};
    themeSettings.forEach((s: any) => settings[s.key] = s.value);

    // Pick a few colors for preview
    const preview = {
      primary: settings['theme_color_primary'] || '#0F172A',
      accent: settings['theme_color_accent'] || '#3B82F6',
      sidebar: settings['theme_color_sidebar_bg'] || '#0F172A',
      page_bg: settings['theme_color_page_bg'] || '#F8FAFC'
    };

    const id = uuidv4();
    await pool.query(
      'INSERT INTO theme_presets (id, name, label, description, is_builtin, preview_colors, settings, created_by) VALUES (?, ?, ?, ?, false, ?, ?, ?)',
      [id, name, label, description, JSON.stringify(preview), JSON.stringify(settings), req.user.id]
    );

    res.json({ message: 'Preset saved', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save preset' });
  }
};

/**
 * DELETE /api/theme/presets/:id
 */
export const deletePreset = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM theme_presets WHERE id = ?', [id]);
    const preset = rows[0];
    if (!preset) return res.status(404).json({ message: 'Preset not found' });
    if (preset.is_builtin) return res.status(400).json({ message: 'Cannot delete built-in presets' });

    const activePreset = await settingsService.getSetting('theme_active_preset');
    if (activePreset === preset.name) return res.status(400).json({ message: 'Cannot delete active preset' });

    await pool.query('DELETE FROM theme_presets WHERE id = ?', [id]);
    res.json({ message: 'Preset deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete preset' });
  }
};

/**
 * Logo Upload Placeholder (Real implementation requires multer)
 */
export const uploadLogo = async (req: any, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const type = req.body.type || 'logo'; // logo, logo_dark, favicon
  const url = `${req.protocol}://${req.get('host')}/uploads/brand/${req.file.filename}`;
  
  const keyMap: any = {
    'logo': 'brand_logo_url',
    'logo_dark': 'brand_logo_dark_url',
    'favicon': 'brand_favicon_url'
  };

  await pool.query('UPDATE system_settings SET value = ?, updated_by = ? WHERE `key` = ?', [url, req.user.id, keyMap[type]]);
  await settingsService.refreshCache();
  
  sseService.broadcast('theme_updated', { type: 'theme:updated' });
  res.json({ url });
};
