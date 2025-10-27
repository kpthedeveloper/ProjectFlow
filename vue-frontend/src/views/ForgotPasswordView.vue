<template>
    <div class="forgot-password-view">
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>Reset Your Password</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="Enter your email address"
                :disabled="loading"
              >
            </div>
            
            <div v-if="message" class="success-message">
              {{ message }}
            </div>
            
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <button 
              type="submit" 
              class="submit-button"
              :disabled="loading || !email"
            >
              <span v-if="loading">Sending...</span>
              <span v-else>Send Reset Link</span>
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
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  
  const authStore = useAuthStore();
  const email = ref('');
  const loading = ref(false);
  const message = ref('');
  const error = ref('');
  
  const handleSubmit = async () => {
    loading.value = true;
    error.value = '';
    message.value = '';
  
    try {
      await authStore.forgotPassword(email.value);
      message.value = 'If an account with that email exists, a password reset link has been sent.';
      email.value = '';
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to send reset link';
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .forgot-password-view {
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
    line-height: 1.5;
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
  
  .success-message {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    text-align: center;
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