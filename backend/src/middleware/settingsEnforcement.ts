import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { settingsService } from '../services/settingsService';
import { pool } from '../config/database';

export const enforceSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Maintenance Mode Check
    const isMaintenance = await settingsService.isEnabled('maintenance_mode');
    
    // We only block if it's maintenance mode and user is NOT a System Admin
    // Note: req.user might not be set yet if this runs before authenticate
    const isAdmin = req.user?.role === 'System Admin';

    if (isMaintenance && !isAdmin && !req.path.includes('/auth/login') && !req.path.includes('/settings/public') && !req.path.includes('/auth/status')) {
      return res.status(503).json({ 
        message: await settingsService.getSetting('maintenance_message', 'System is currently under maintenance. Please try again later.'),
        maintenance: true 
      });
    }

    // 2. Rate Limiting Check (if login attempt)
    if (req.path.includes('/auth/login') && req.method === 'POST') {
      const { email } = req.body;
      if (email) {
        const maxAttempts = await settingsService.getNumber('max_login_attempts', 5);
        const { rows } = await pool.query('SELECT failed_login_attempts FROM users WHERE email = ?', [email]);
        if (rows.length > 0 && rows[0].failed_login_attempts >= maxAttempts) {
           return res.status(403).json({ message: 'Account locked due to too many failed attempts. Please contact an administrator.' });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Settings enforcement error:', error);
    next(); // Fallback to allowing request if settings check fails
  }
};
