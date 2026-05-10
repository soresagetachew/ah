import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

import { pool } from '../config/database';

export const checkPermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // System Admin always has full access
    if (req.user.role === 'System Admin') {
      return next();
    }

    try {
      const { rows } = await pool.query(
        'SELECT is_allowed FROM role_permissions WHERE role = ? AND permission = ?',
        [req.user.role, permission]
      );

      if (rows.length > 0 && rows[0].is_allowed) {
        return next();
      }

      return res.status(403).json({ message: `Forbidden: Missing permission [${permission}]` });
    } catch (error) {
      console.error('RBAC check error:', error);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
};

export const checkRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};
