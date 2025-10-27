<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Project Management</h1>
          <p>Sign in to your account</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="Enter your email"
              :disabled="authStore.isLoading"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="Enter your password"
              :disabled="authStore.isLoading"
            >
          </div>
          
          <div class="forgot-password-link">
            <router-link to="/forgot-password">Forgot your password?</router-link>
          </div>
          
          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>
          
          <button 
            type="submit" 
            class="login-button"
            :disabled="authStore.isLoading || !email || !password"
          >
            <span v-if="authStore.isLoading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </form>
        
        <div class="demo-credentials">
          <h3>Demo Credentials</h3>
          <p><strong>Admin:</strong> admin@company.com / Password123!</p>
          <p><strong>Manager:</strong> manager@company.com / Password123!</p>
          <p><strong>User:</strong> user@company.com / Password123!</p>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <ChangePasswordModal 
      v-if="showChangePasswordModal"
      @success="handlePasswordChangeSuccess"
      @cancel="handlePasswordChangeCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal.vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showChangePasswordModal = ref(false);

const handleLogin = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value
  });
  
  if (success) {
    // Check if password change is required - this should be set by the backend
    if (authStore.requiresPasswordChange) {
      showChangePasswordModal.value = true;
    } else {
      router.push('/dashboard');
    }
  }
};

const handlePasswordChangeSuccess = () => {
  showChangePasswordModal.value = false;
  // The requiresPasswordChange flag should now be false after successful password change
  router.push('/dashboard');
};

const handlePasswordChangeCancel = () => {
  // Log user out if they cancel password change
  authStore.logout();
  showChangePasswordModal.value = false;
  // Clear form
  email.value = '';
  password.value = '';
};

// Clear error when user starts typing
watch([email, password], () => {
  if (authStore.error) {
    authStore.clearError();
  }
});
</script>

<style scoped>
/* Your existing styles remain the same */
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1.875rem;
  font-weight: 700;
}

.login-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.login-form {
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
  background: white;
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

.forgot-password-link {
  text-align: center;
  margin-top: -0.5rem;
}

.forgot-password-link a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-password-link a:hover {
  text-decoration: underline;
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

.login-button {
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
  height: 3rem;
}

.login-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.demo-credentials {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.demo-credentials h3 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 600;
  text-align: center;
}

.demo-credentials p {
  margin: 0.5rem 0;
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

/* Responsive design */
@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .login-view {
    padding: 0.5rem;
  }
}
</style>  