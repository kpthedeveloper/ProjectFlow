import { pool } from '../config/database';
import type { Notification, CreateNotificationRequest } from '../types/index';

export const NotificationRepository = {
  async create(notificationData: CreateNotificationRequest): Promise<Notification> {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data, target_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      notificationData.userId,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.data || null,
      notificationData.targetUrl || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByUserId(userId: string): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND read = false 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    if (notificationIds.length === 0) return;
    
    const placeholders = notificationIds.map((_, index) => `$${index + 2}`).join(',');
    const query = `
      UPDATE notifications 
      SET read = true 
      WHERE id IN (${placeholders}) AND user_id = $1
    `;
    const values = [userId, ...notificationIds];
    
    await pool.query(query, values);
  },

  async markAllAsRead(userId: string): Promise<void> {
    const query = `
      UPDATE notifications 
      SET read = true 
      WHERE user_id = $1 AND read = false
    `;
    await pool.query(query, [userId]);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) FROM notifications 
      WHERE user_id = $1 AND read = false
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  },

  async delete(notificationId: string, userId: string): Promise<void> {
    const query = 'DELETE FROM notifications WHERE id = $1 AND user_id = $2';
    await pool.query(query, [notificationId, userId]);
  }
};