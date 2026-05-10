import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { passwordPolicy } from '../services/passwordPolicy';
import { settingsService } from '../services/settingsService';
import { logSecurityEvent, hashToken, checkIfNewDevice, detectDeviceType, parseUserAgent } from '../services/securityService';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Read lockout settings from LIVE cache
    const maxAttempts = await settingsService.getNumber('max_login_attempts', 5);
    const lockoutMinutes = await settingsService.getNumber('lockout_duration_minutes', 15);

    // 2. Find user
    const result = await pool.query(
      `SELECT u.*, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = ? AND u.deleted_at IS NULL`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      // Don't reveal if email exists
      await logSecurityEvent(null, 'login_failed', req.ip || '', `Login attempt for unknown email: ${email}`, 'warning');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Check maintenance mode
    const inMaintenance = await settingsService.isEnabled('maintenance_mode');
    if (inMaintenance && user.role !== 'System Admin') {
      return res.status(503).json({
        error: 'MAINTENANCE',
        message: await settingsService.getSetting('maintenance_message', 'System is currently under maintenance. Please try again later.'),
        maintenance: true
      });
    }

    // 4. Check if account is active
    if (!user.is_active) {
      await logSecurityEvent(user.id, 'login_failed', req.ip || '', 'Login attempt on inactive account', 'warning');
      return res.status(401).json({ message: 'Your account has been deactivated. Contact your administrator.' });
    }

    // 5. Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 1000 / 60);
      await logSecurityEvent(user.id, 'login_blocked_locked', req.ip || '', `Login blocked — account locked for ${minutesLeft} more minutes`, 'critical');
      return res.status(423).json({
        error: 'ACCOUNT_LOCKED',
        message: `Your account is locked due to too many failed attempts. Please try again in ${minutesLeft} minute(s) or contact your administrator.`,
        lockedUntil: user.locked_until,
        minutesRemaining: minutesLeft
      });
    }

    // 6. Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      const remainingAttempts = maxAttempts - newAttempts;

      if (newAttempts >= maxAttempts) {
        // LOCK THE ACCOUNT
        const lockUntil = lockoutMinutes === -1
          ? null // permanent lock
          : new Date(Date.now() + lockoutMinutes * 60 * 1000);

        await pool.query(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
          [newAttempts, lockUntil, user.id]
        );

        await logSecurityEvent(user.id, 'account_locked', req.ip || '', `Account locked after ${newAttempts} failed attempts`, 'critical');

        // (In a real app, send email here)

        return res.status(423).json({
          error: 'ACCOUNT_LOCKED',
          message: lockoutMinutes === -1
            ? 'Your account has been locked permanently. Please contact your administrator.'
            : `Too many failed attempts. Account locked for ${lockoutMinutes} minutes.`
        });
      }

      // Not yet locked — increment counter and warn
      await pool.query('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [newAttempts, user.id]);
      await logSecurityEvent(user.id, 'login_failed', req.ip || '', `Failed login attempt ${newAttempts}/${maxAttempts}`, 'warning');

      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        attemptsRemaining: remainingAttempts,
        warning: remainingAttempts <= 2 ? `Warning: ${remainingAttempts} attempt(s) remaining before lockout.` : undefined
      });
    }

    // 7. Password valid — reset failed attempts
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW(), last_login_ip = ? WHERE id = ?',
      [req.ip, user.id]
    );

    // 8. Check password expiry
    const expiry = await passwordPolicy.checkExpiry(user);
    if (expiry.expired) {
       const tempToken = jwt.sign({ id: user.id, role: user.role, mustChangePassword: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
       return res.json({ 
         mustChangePassword: true, 
         message: 'Your password has expired. Please set a new password.', 
         token: tempToken,
         user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
       });
    }

    // 9. Check force_password_change flag
    if (user.force_password_change) {
       const tempToken = jwt.sign({ id: user.id, role: user.role, mustChangePassword: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
       return res.json({ mustChangePassword: true, token: tempToken });
    }

    // 10. Check new device
    const detectNewDevice = await settingsService.isEnabled('detect_new_device_login');
    if (detectNewDevice) {
      const isNewDevice = await checkIfNewDevice(user.id, req.ip || '', req.headers['user-agent']);
      if (isNewDevice) {
        // (Send email notification here)
      }
    }

    // 11. Create Session
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      business_unit: user.business_unit
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    const sessionTimeout = await settingsService.getNumber('session_timeout_minutes', 30);
    const expiresAt = new Date(Date.now() + sessionTimeout * 60 * 1000);

    await pool.query(
      'INSERT INTO active_sessions (id, user_id, token_hash, ip_address, user_agent, device_type, created_at, last_active, expires_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)',
      [require('uuid').v4(), user.id, hashToken(token), req.ip || '', req.headers['user-agent'] || '', detectDeviceType(req.headers['user-agent']), expiresAt]
    );

    await logSecurityEvent(user.id, 'login_success', req.ip || '', 'Successful login');

    // Remove password from response
    delete user.password_hash;

    const darkModeEnabled = await settingsService.isEnabled('theme_dark_mode_enabled');

    const response: any = { 
      token, 
      user: { ...user, theme_dark_mode_enabled: darkModeEnabled }, 
      sessionExpiresAt: expiresAt,
      passwordExpiryWarning: expiry.daysRemaining && expiry.daysRemaining <= 7 ? `Password expires in ${expiry.daysRemaining} days` : undefined
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, department_id, business_unit, is_active, theme_mode, created_at 
       FROM users WHERE id = ? AND is_active = true`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    const timeoutMinutes = await settingsService.getNumber('session_timeout_minutes', 30);
    const darkModeEnabled = await settingsService.isEnabled('theme_dark_mode_enabled');
    
    res.json({ ...user, session_timeout_minutes: timeoutMinutes, theme_dark_mode_enabled: darkModeEnabled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    tokenBlacklist.add(token);
  }
  res.json({ message: 'Logged out successfully' });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const result = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const user = result.rows[0];
    
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    const validation = await passwordPolicy.validate(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const reuseCheck = await passwordPolicy.checkReuse(req.user.id, newPassword);
    if (reuseCheck.reused) {
      return res.status(400).json({ message: reuseCheck.message });
    }
    
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE users SET password_hash = ?, password_changed_at = NOW() WHERE id = ?', [newHash, req.user.id]);
    await passwordPolicy.addToHistory(req.user.id, newHash);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { themeMode } = req.body;
    
    if (!['light', 'dark', 'system'].includes(themeMode)) {
      return res.status(400).json({ message: 'Invalid theme mode' });
    }

    const darkModeEnabled = await settingsService.isEnabled('theme_dark_mode_enabled');
    if (!darkModeEnabled && themeMode !== 'light') {
      return res.status(403).json({ message: 'Dark mode is currently disabled by administrator' });
    }

    await pool.query('UPDATE users SET theme_mode = ? WHERE id = ?', [themeMode, req.user.id]);
    
    res.json({ success: true, themeMode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const ping = async (req: AuthRequest, res: Response) => {
  // sessionTimeout middleware already updates last_active
  res.json({ success: true, timestamp: new Date().toISOString() });
};
