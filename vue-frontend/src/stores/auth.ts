// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userAPI } from '@/services/api';
import type { User, LoginRequest } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const requiresPasswordChange = ref(false);
  const initialized = ref(false); // ADD THIS

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isManager = computed(() => user.value?.role === 'manager' || isAdmin.value);
  
  const setUser = (userData: User) => {
    user.value = userData;
    error.value = null;
  };
  
  const setError = (message: string) => {
    error.value = message;
  };
  
  const clearError = () => {
    error.value = null;
  };
  
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await userAPI.login(credentials);
      
      // ADD DETAILED LOGGING
      console.log('=== LOGIN DEBUG INFO ===');
      console.log('Full API response:', response.data);
      console.log('User object:', response.data.user);
      console.log('requiresPasswordChange from API:', response.data.user.requiresPasswordChange);
      console.log('User object keys:', Object.keys(response.data.user));
      
      user.value = response.data.user;
      
      // Set requiresPasswordChange from the user object
      requiresPasswordChange.value = user.value?.requiresPasswordChange || false;
      
      console.log('AuthStore requiresPasswordChange:', requiresPasswordChange.value);
      console.log('Should show password modal:', requiresPasswordChange.value);
      console.log('=== END DEBUG INFO ===');
      
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  const logout = async (): Promise<void> => {
    isLoading.value = true;
    
    try {
      await userAPI.logout();
    } catch (err: any) {
      console.log('Logout note:', err.response?.data?.error || 'User not authenticated');
    } finally {
      user.value = null;
      requiresPasswordChange.value = false;
      isLoading.value = false;
    }
  };
  
  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await userAPI.getCurrentUser();
      user.value = response.data.user;
      requiresPasswordChange.value = user.value?.requiresPasswordChange || false;
      return true;
    } catch (err) {
      user.value = null;
      requiresPasswordChange.value = false;
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await userAPI.changePassword({ currentPassword, newPassword });
      requiresPasswordChange.value = false; // Clear the flag
      
      // Update local user state
      if (user.value) {
        user.value.requiresPasswordChange = false;
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to change password';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await userAPI.forgotPassword(email);
    } catch (err: any) {
      console.log('Forgot password request:', err.response?.data?.error || 'Request processed');
    } finally {
      isLoading.value = false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await userAPI.resetPassword(token, newPassword);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to reset password';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const verifyResetToken = async (token: string): Promise<boolean> => {
    try {
      await userAPI.verifyResetToken(token);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Invalid or expired reset token';
      return false;
    }
  };
  
  const initialize = async (): Promise<boolean> => {
    try {
      const success = await checkAuth();
      console.log('Auth initialization completed:', success);
      initialized.value = true; // MARK AS INITIALIZED
      return success;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      initialized.value = true; // STILL MARK AS INITIALIZED EVEN ON ERROR
      return false;
    }
  };
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isManager,
    requiresPasswordChange,
    initialized: computed(() => initialized.value), // EXPORT AS COMPUTED
    setUser,
    setError,
    clearError,
    login,
    logout,
    checkAuth,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyResetToken,
    initialize
  };
});