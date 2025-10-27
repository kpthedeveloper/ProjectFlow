<template>
    <div class="reset-password-view">
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>Set New Password</h1>
            <p>Enter your new password below.</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="form">
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
            
            <div v-if="message" class="success-message">
              {{ message }}
            </div>
            
            <button 
              type="submit" 
              class="submit-button"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading">Resetting...</span>
              <span v-else>Reset Password</span>
            </button>
          </form>
          
          <div class="back-to-login">
            <router-link to="/login">← Back to Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  
  const form = ref({
    newPassword: '',
    confirmPassword: ''
  });
  const loading = ref(false);
  const error = ref('');
  const message = ref('');
  const token = ref('');
  
  const isFormValid = computed(() => {
    return form.value.newPassword && 
           form.value.confirmPassword &&
           form.value.newPassword === form.value.confirmPassword &&
           form.value.newPassword.length >= 8 &&
           /[A-Z]/.test(form.value.newPassword) &&
           /[a-z]/.test(form.value.newPassword) &&
           /\d/.test(form.value.newPassword);
  });
  
  onMounted(() => {
    token.value = route.query.token as string;
    if (!token.value) {
      error.value = 'Invalid reset link. Please request a new password reset.';
    }
  });
  
  const handleSubmit = async () => {
    if (!token.value) {
      error.value = 'Invalid reset link. Please request a new password reset.';
      return;
    }
  
    loading.value = true;
    error.value = '';
  
    try {
      await authStore.resetPassword(token.value, form.value.newPassword);
      message.value = 'Password has been reset successfully! Redirecting to login...';
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to reset password';
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .reset-password-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }
  
  .container {
    width: 100%;
    max-width: 400px;
  }
  
  .card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .header h1 {
    color: #1f2937;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .header p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
  }
  
  .form {
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
  
  .success-message {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    text-align: center;
  }
  
  .submit-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }
  
  .submit-button:hover:not(:disabled) {
    background: #2563eb;
  }
  
  .submit-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .back-to-login {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .back-to-login a {
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  .back-to-login a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 640px) {
    .card {
      padding: 1.5rem;
    }
  }
  </style>