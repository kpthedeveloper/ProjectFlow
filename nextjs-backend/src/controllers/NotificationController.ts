import { Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import type { CreateNotificationRequest, MarkAsReadRequest } from '../types/index';
import type { AuthRequest } from '../middleware/auth'; // ADD THIS IMPORT

export const NotificationController = {
  async getNotifications(req: AuthRequest, res: Response) { // CHANGED: Use AuthRequest type
    try {
      const userId = req.user?.userId; // CHANGED: userId instead of id
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const notifications = await NotificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response) { // CHANGED: Use AuthRequest
    try {
      const userId = req.user?.userId; // CHANGED: userId instead of id
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const count = await NotificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  },

  async markAsRead(req: AuthRequest, res: Response) { // CHANGED: Use AuthRequest
    try {
      const userId = req.user?.userId; // CHANGED: userId instead of id
      const { notificationIds }: MarkAsReadRequest = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({ error: 'Notification IDs array is required' });
      }

      await NotificationService.markNotificationsAsRead(notificationIds, userId);
      res.json({ message: 'Notifications marked as read' });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response) { // CHANGED: Use AuthRequest
    try {
      const userId = req.user?.userId; // CHANGED: userId instead of id
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await NotificationService.markAllNotificationsAsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  },

  async createNotification(req: AuthRequest, res: Response) { // CHANGED: Use AuthRequest
    try {
      const notificationData: CreateNotificationRequest = req.body;
      
      // Validate required fields
      if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
        return res.status(400).json({ 
          error: 'userId, type, title, and message are required' 
        });
      }

      const notification = await NotificationService.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }
};