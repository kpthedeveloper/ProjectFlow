import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticateToken } from '../middleware/auth'; // CHANGED: authenticateToken instead of authenticate

const router = Router();

// All notification routes require authentication
router.use(authenticateToken); // CHANGED: Use authenticateToken

// GET /api/notifications - Get all notifications for current user
router.get('/', NotificationController.getNotifications);

// GET /api/notifications/unread/count - Get unread count for current user
router.get('/unread/count', NotificationController.getUnreadCount);

// PATCH /api/notifications/mark-read - Mark specific notifications as read
router.patch('/mark-read', NotificationController.markAsRead);

// PATCH /api/notifications/mark-all-read - Mark all notifications as read for current user
router.patch('/mark-all-read', NotificationController.markAllAsRead);

// POST /api/notifications - Create a new notification (for internal use)
router.post('/', NotificationController.createNotification);

export default router;