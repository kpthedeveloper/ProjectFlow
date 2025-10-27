<template>
    <div class="change-password-modal">
      <div class="modal-overlay" @click="handleCancel">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Change Your Password</h2>
            <p>You must change your password before continuing.</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="password-form">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                v-model="form.currentPassword"
                type="password"
                required
                placeholder="Enter current password"
                :disabled="loading"
              >
            </div>
            
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                id="newPassword"
                v-model="form.newPassword"
                type="password"
                required
                placeholder="Enter new password"
                :disabled="loading"
              >
              <div class="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li :class="{ 'valid': form.newPassword.length >= 8 }">At least 8 characters</li>
                  <li :class="{ 'valid': /[A-Z]/.test(form.newPassword) }">One uppercase letter</li>
                  <li :class="{ 'valid': /[a-z]/.test(form.newPassword) }">One lowercase letter</li>
                  <li :class="{ 'valid': /\d/.test(form.newPassword) }">One number</li>
                </ul>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                placeholder="Confirm new password"
                :disabled="loading"
              >
              <div v-if="form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword" 
                   class="error-text">
                Passwords do not match
              </div>
            </div>
            
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <div class="modal-actions">
              <button 
                type="button" 
                @click="handleCancel"
                class="btn-secondary"
                :disabled="loading"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn-primary"
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading">Changing...</span>
                <span v-else>Change Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  
  const emit = defineEmits<{
    success: [];
    cancel: [];
  }>();
  
  const authStore = useAuthStore();
  
  const form = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const loading = ref(false);
  const error = ref('');
  
  const isFormValid = computed(() => {
    return form.value.currentPassword && 
           form.value.newPassword && 
           form.value.confirmPassword &&
           form.value.newPassword === form.value.confirmPassword &&
           form.value.newPassword.length >= 8 &&
           /[A-Z]/.test(form.value.newPassword) &&
           /[a-z]/.test(form.value.newPassword) &&
           /\d/.test(form.value.newPassword);
  });
  
  const handleSubmit = async () => {
    loading.value = true;
    error.value = '';
  
    try {
      await authStore.changePassword(form.value.currentPassword, form.value.newPassword);
      emit('success');
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to change password';
    } finally {
      loading.value = false;
    }
  };
  
  const handleCancel = () => {
    if (!loading.value) {
      emit('cancel');
    }
  };
  </script>
  
  <style scoped>
  .change-password-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    width: 100%;
    max-width: 450px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  .modal-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .modal-header h2 {
    color: #1f2937;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .modal-header p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
  }
  
  .password-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group label {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }
  
  .form-group input {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .form-group input:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .password-requirements {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .password-requirements p {
    margin: 0 0 0.25rem 0;
    font-weight: 500;
  }
  
  .password-requirements ul {
    margin: 0;
    padding-left: 1.25rem;
  }
  
  .password-requirements li {
    color: #6b7280;
    transition: color 0.2s;
  }
  
  .password-requirements li.valid {
    color: #10b981;
  }
  
  .error-text {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    text-align: center;
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }
  
  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .btn-secondary {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }
  
  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 640px) {
    .modal-content {
      padding: 1.5rem;
    }
    
    .modal-actions {
      flex-direction: column;
    }
  }
  </style>