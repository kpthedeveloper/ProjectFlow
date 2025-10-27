import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { usersAPI } from '@/services/api';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const activeUsers = computed(() => users.value.filter(user => user.isActive));
  const inactiveUsers = computed(() => users.value.filter(user => !user.isActive));
  const userCountByRole = computed(() => {
    const count = { admin: 0, manager: 0, user: 0 };
    users.value.forEach(user => count[user.role]++);
    return count;
  });

  // Actions
  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await usersAPI.getUsers();
      users.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch users';
      console.error('Error fetching users:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await usersAPI.createUser(userData);
      users.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create user';
      console.error('Error creating user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await usersAPI.updateUser(userId, updates);
      const userIndex = users.value.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        users.value[userIndex] = response.data;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update user';
      console.error('Error updating user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await usersAPI.deleteUser(userId);
      const userIndex = users.value.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        users.value.splice(userIndex, 1);
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete user';
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleUserStatus = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const user = users.value.find(user => user.id === userId);
      if (user) {
        const response = await usersAPI.toggleUserStatus(userId, !user.isActive);
        const userIndex = users.value.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          users.value[userIndex] = response.data;
        }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to toggle user status';
      console.error('Error toggling user status:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Initialize store
  const initializeStore = async () => {
    await fetchUsers();
  };

  return {
    // State
    users,
    loading,
    error,
    
    // Getters
    activeUsers,
    inactiveUsers,
    userCountByRole,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    initializeStore
  };
});