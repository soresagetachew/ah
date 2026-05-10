import { pool } from '../config/database';
import { EventEmitter } from 'events';

export const notificationEmitter = new EventEmitter();

export const createNotification = async (userId: string, title: string, message: string, documentType?: string, documentId?: string) => {
  const notificationId = require('uuid').v4();
  await pool.query(
    `INSERT INTO notifications (id, user_id, title, message, document_type, document_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [notificationId, userId, title, message, documentType || null, documentId || null]
  );
  
  const notification = { id: notificationId, user_id: userId, title, message, document_type: documentType, document_id: documentId, is_read: false, created_at: new Date() };
  notificationEmitter.emit(`notification:${userId}`, notification);
  return notification;
};

export const getUserNotifications = async (userId: string, limit = 20) => {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return result.rows;
};

export const getUnreadCount = async (userId: string) => {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

export const markAsRead = async (id: string, userId: string) => {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
};

export const markAllAsRead = async (userId: string) => {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = ?`,
    [userId]
  );
};
