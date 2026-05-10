import { pool } from '../config/database';

interface Setting {
  key: string;
  value: string;
  category: string;
}

class SettingsService {
  private cache: Map<string, string> = new Map();
  private lastFetch: number = 0;
  private CACHE_TTL = 60000; // 60 seconds

  async getSetting(key: string, defaultValue: string = ''): Promise<string> {
    await this.refreshCacheIfNeeded();
    return this.cache.get(key) || defaultValue;
  }

  async getSettingsByCategory(category: string): Promise<Record<string, string>> {
    await this.refreshCacheIfNeeded();
    const result: Record<string, string> = {};
    // This is a bit inefficient if we have many settings, but for system settings it's fine
    // Alternatively, we could store by category in the cache too
    const { rows } = await pool.query('SELECT `key`, value FROM system_settings WHERE category = ?', [category]);
    rows.forEach((row: any) => {
      result[row.key] = row.value;
    });
    return result;
  }

  async getAllSettings(): Promise<Record<string, string>> {
    await this.refreshCacheIfNeeded();
    const result: Record<string, string> = {};
    this.cache.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  async refreshCache(): Promise<void> {
    try {
      const { rows } = await pool.query('SELECT `key`, value FROM system_settings');
      this.cache.clear();
      rows.forEach((row: any) => {
        this.cache.set(row.key, row.value);
      });
      this.lastFetch = Date.now();
    } catch (error) {
      console.error('Failed to refresh settings cache:', error);
    }
  }

  private async refreshCacheIfNeeded(): Promise<void> {
    if (Date.now() - this.lastFetch > this.CACHE_TTL || this.cache.size === 0) {
      await this.refreshCache();
    }
  }

  // Boolean helper
  async isEnabled(key: string): Promise<boolean> {
    const val = await this.getSetting(key, 'false');
    return val === 'true' || val === '1' || val === 'yes';
  }

  // Number helper
  async getNumber(key: string, defaultValue: number = 0): Promise<number> {
    const val = await this.getSetting(key);
    const num = Number(val);
    return isNaN(num) ? defaultValue : num;
  }
}

export const settingsService = new SettingsService();
