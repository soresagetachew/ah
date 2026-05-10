import { pool } from '../config/database';
import crypto from 'crypto';

export const logSecurityEvent = async (userId: string | null, event: string, ip: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
  try {
    await pool.query(
      'INSERT INTO security_events (id, user_id, event_type, ip_address, description, severity) VALUES (?, ?, ?, ?, ?, ?)',
      [require('uuid').v4(), userId, event, ip, details, severity]
    );
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const checkIfNewDevice = async (userId: string, ip: string, userAgent: string | undefined): Promise<boolean> => {
  const { rows } = await pool.query(
    'SELECT id FROM active_sessions WHERE user_id = ? AND ip_address = ? AND user_agent = ? LIMIT 1',
    [userId, ip, userAgent || '']
  );
  return rows.length === 0;
};

export const detectDeviceType = (userAgent: string | undefined): string => {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
};

export const parseUserAgent = (userAgent: string | undefined): string => {
  if (!userAgent) return 'Unknown Device';
  // Simple parser
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  return 'Web Browser';
};
