<!-- components/layout/AppLayout.vue -->
<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <h1 class="logo">ProjectFlow</h1>
          <nav class="nav">
            <router-link to="/dashboard">Dashboard</router-link>
            <router-link to="/projects">Projects</router-link>
            <router-link v-if="canAccessTasks" to="/tasks">My Tasks</router-link>
            <router-link v-if="canManageUsers" to="/users">Users</router-link>
          </nav>
          <div class="user-menu">
            <!-- Notifications -->
            <div class="notifications" @click="toggleNotifications">
              <div class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span v-if="unreadCount > 0" class="notification-badge">
                  {{ unreadCount > 99 ? '99+' : unreadCount }}
                </span>
              </div>
              
              <!-- Notifications Dropdown -->
              <div v-if="showNotifications" class="notifications-dropdown">
                <div class="notifications-header">
                  <h3>Notifications</h3>
                  <button @click="handleMarkAllAsRead" class="mark-all-read">
                    Mark all as read
                  </button>
                </div>
                <div class="notifications-list">
                  <div v-if="notifications.length === 0" class="no-notifications">
                    No new notifications
                  </div>
                  <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    :class="['notification-item', { unread: !notification.read }]"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-content">
                      <p class="notification-message">{{ notification.message }}</p>
                      <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                    </div>
                    <button 
                      v-if="!notification.read"
                      @click.stop="handleMarkAsRead(notification.id)"
                      class="mark-read-btn"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Info -->
            <div class="user-info">
              <div class="user-details">
                <span class="user-name">{{ user?.name }}</span>
                <span class="user-role">{{ formatUserRole(user?.role) }}</span>
              </div>
              <button @click="logout" class="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="app-main">
      <div class="container">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'; // ADDED watch import
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import type { AppNotification } from '@/types'; // ADD THIS IMPORT

const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();

const showNotifications = ref(false);

// Use real notifications from store
const notifications = computed(() => notificationsStore.notifications);
const unreadCount = computed(() => notificationsStore.unreadCount);

const user = computed(() => authStore.user);
const canAccessTasks = computed(() => ['user', 'manager', 'admin'].includes(authStore.user?.role || ''));
const canManageUsers = computed(() => ['admin'].includes(authStore.user?.role || ''));

onMounted(async () => {
  // Initialize notifications if user is authenticated
  if (authStore.isAuthenticated) {
    await notificationsStore.initialize();
  }
  
  document.addEventListener('click', handleClickOutside);
});

// Watch for authentication changes to load notifications
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await notificationsStore.initialize();
  }
});

// Methods
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const handleMarkAsRead = async (notificationId: string) => {
  await notificationsStore.markAsRead([notificationId]);
};

const handleMarkAllAsRead = async () => {
  await notificationsStore.markAllAsRead();
};

const handleNotificationClick = (notification: AppNotification) => {
  handleMarkAsRead(notification.id);
  if (notification.targetUrl) {
    router.push(notification.targetUrl);
  }
  showNotifications.value = false;
};

const formatTime = (dateString: string): string => { // CHANGED parameter type
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const formatUserRole = (role: string | undefined): string => {
  const roleMap: { [key: string]: string } = {
    admin: 'Administrator',
    manager: 'Project Manager',
    user: 'Team Member'
  };
  return roleMap[role || 'user'] || role || 'User';
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Close notifications when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.notifications')) {
    showNotifications.value = false;
  }
};

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  padding: 1rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  color: #3b82f6;
  margin: 0;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav a {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
}

.nav a.router-link-active {
  color: #3b82f6;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Notifications Styles */
.notifications {
  position: relative;
  cursor: pointer;
}

.notification-icon {
  position: relative;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.notification-icon:hover {
  background-color: #f8fafc;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 0.75rem;
  min-width: 1.25rem;
  height: 1.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 0.5rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.notifications-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.mark-all-read {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.mark-all-read:hover {
  background-color: #f1f5f9;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #374151;
}

.notification-time {
  font-size: 0.75rem;
  color: #64748b;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.mark-read-btn:hover {
  background-color: #f0fdf4;
}

/* User Info Styles */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: capitalize;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.logout-btn:hover {
  background: #dc2626;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.app-main {
  padding: 2rem 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-dropdown {
    width: 320px;
    right: -50px;
  }
  
  .header-content {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}
</style>