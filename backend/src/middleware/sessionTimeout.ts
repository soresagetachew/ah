import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { settingsService } from '../services/settingsService';
import { pool } from '../config/database';
import crypto from 'crypto';

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const logSecurityEvent = async (userId: string, event: string, ip: string, details: string) => {
  try {
    await pool.query(
      'INSERT INTO security_events (id, user_id, event_type, ip_address, description) VALUES (?, ?, ?, ?, ?)',
      [require('uuid').v4(), userId, event, ip, details]
    );
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const enforceSessionTimeout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];
  const tokenHash = hashToken(token);

  // Get timeout from live settings cache
  const timeoutMinutes = await settingsService.getNumber('session_timeout_minutes', 30);

  // Check session in active_sessions table
  const { rows } = await pool.query(
    'SELECT * FROM active_sessions WHERE token_hash = ?', 
    [tokenHash]
  );

  if (rows.length === 0) {
    return res.status(401).json({
      error: 'SESSION_EXPIRED',
      message: 'Your session has expired. Please log in again.'
    });
  }

  const session = rows[0];
  const lastActive = new Date(session.last_active);
  const minutesSinceActive = (Date.now() - lastActive.getTime()) / 1000 / 60;

  if (minutesSinceActive > timeoutMinutes) {
    // Delete session from DB (hard logout)
    await pool.query('DELETE FROM active_sessions WHERE token_hash = ?', [tokenHash]);
    
    // Log security event
    await logSecurityEvent(
      session.user_id,
      'session_expired',
      req.ip || '',
      `Session expired after ${timeoutMinutes} minutes of inactivity`
    );

    return res.status(401).json({
      error: 'SESSION_EXPIRED',
      message: `Session expired after ${timeoutMinutes} minutes of inactivity.`
    });
  }

  // Update last_active timestamp (keep session alive on activity)
  await pool.query(
    'UPDATE active_sessions SET last_active = NOW() WHERE token_hash = ?',
    [tokenHash]
  );

  next();
};
