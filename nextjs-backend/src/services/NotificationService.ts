import { NotificationRepository } from '../repositories/NotificationRepository';
import type { Notification, CreateNotificationRequest } from '../types/index';

export const NotificationService = {
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    return await NotificationRepository.create(notificationData);
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await NotificationRepository.findByUserId(userId);
  },

  async getUserUnreadNotifications(userId: string): Promise<Notification[]> {
    return await NotificationRepository.findUnreadByUserId(userId);
  },

  async markNotificationsAsRead(notificationIds: string[], userId: string): Promise<void> {
    await NotificationRepository.markAsRead(notificationIds, userId);
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await NotificationRepository.markAllAsRead(userId);
  },

  async getUnreadCount(userId: string): Promise<number> {
    return await NotificationRepository.getUnreadCount(userId);
  },

  // Helper methods for common notification scenarios
  async notifyTaskAssignment(task: any, assigneeId: string): Promise<Notification> {
    return await this.createNotification({
      userId: assigneeId,
      type: 'assignment',
      title: 'New Task Assignment',
      message: `You have been assigned to task: ${task.title}`,
      targetUrl: `/tasks/${task.id}`,
      data: { taskId: task.id, projectId: task.projectId }
    });
  },

  async notifyTaskUpdate(task: any, updaterId: string): Promise<Notification> {
    return await this.createNotification({
      userId: task.assigneeId,
      type: 'task_update',
      title: 'Task Updated',
      message: `Task "${task.title}" has been updated`,
      targetUrl: `/tasks/${task.id}`,
      data: { taskId: task.id, updatedBy: updaterId }
    });
  },

  async notifyTaskCompletion(task: any, managerId: string): Promise<Notification> {
    return await this.createNotification({
      userId: managerId,
      type: 'task_update',
      title: 'Task Completed',
      message: `Task "${task.title}" has been completed by ${task.assigneeName}`,
      targetUrl: `/tasks/${task.id}`,
      data: { taskId: task.id, assigneeId: task.assigneeId }
    });
  },

  async notifyPhaseUpdate(phase: any, projectManagerId: string): Promise<Notification> {
    return await this.createNotification({
      userId: projectManagerId,
      type: 'phase_update',
      title: 'Phase Updated',
      message: `Phase "${phase.name}" has been updated`,
      targetUrl: `/projects/${phase.projectId}`,
      data: { phaseId: phase.id, projectId: phase.projectId }
    });
  }
};