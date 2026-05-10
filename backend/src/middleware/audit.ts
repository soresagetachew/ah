import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const auditLog = (action: string, entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        pool.query(
          `INSERT INTO audit_logs (id, user_id, entity_type, entity_id, action, ip_address, old_values, new_values)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            req.user?.id || null,
            entityType,
            req.params.id || req.body.id || null,
            action,
            req.ip,
            req.body.oldValues ? JSON.stringify(req.body.oldValues) : null,
            req.body.newValues ? JSON.stringify(req.body.newValues) : null
          ]
        ).catch(err => console.error('Audit log failed', err));
      }
      return res.send(body);
    };
    next();
  };
};
