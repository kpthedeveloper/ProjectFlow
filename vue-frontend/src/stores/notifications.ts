// stores/notifications.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { notificationsAPI } from '@/services/api';
import type { AppNotification } from '@/types'; // CHANGED

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<AppNotification[]>([]); // CHANGED
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  );

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  );

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.read)
  );

  // Actions
  const fetchNotifications = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await notificationsAPI.getNotifications();
      notifications.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch notifications';
      console.error('Error fetching notifications:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = async (notificationIds: string[]): Promise<void> => {
    try {
      await notificationsAPI.markAsRead(notificationIds);
      
      // Update local state
      notifications.value = notifications.value.map(notification =>
        notificationIds.includes(notification.id)
          ? { ...notification, read: true }
          : notification
      );
    } catch (err: any) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    const unreadIds = unreadNotifications.value.map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const addNotification = (notification: AppNotification): void => { // CHANGED
    notifications.value.unshift(notification);
  };

  const clearError = (): void => {
    error.value = null;
  };

  // Initialize - fetch notifications when store is created
  const initialize = async (): Promise<void> => {
    await fetchNotifications();
  };

  return {
    // State
    notifications,
    isLoading,
    error,
    
    // Computed
    unreadCount,
    unreadNotifications,
    readNotifications,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearError,
    initialize
  };
});