<!-- components/users/UserForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="user-form">
      <h3>{{ isEditing ? 'Edit User' : 'Create New User' }}</h3>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Full Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Enter full name"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Enter email address"
          />
        </div>
        
        <div class="form-group">
          <label for="role">Role *</label>
          <select id="role" v-model="form.role" required>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="department">Department</label>
          <input
            id="department"
            v-model="form.department"
            type="text"
            placeholder="Enter department"
          />
        </div>
        
        <div class="form-group">
          <label for="position">Position</label>
          <input
            id="position"
            v-model="form.position"
            type="text"
            placeholder="Enter position"
          />
        </div>
        
        <div class="form-group full-width">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.isActive"
            />
            <span class="checkmark"></span>
            Active User
          </label>
          <p class="helper-text">Inactive users cannot access the system</p>
        </div>
      </div>
  
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {{ isEditing ? 'Update User' : 'Create User' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { User } from '@/types';
  
  interface Props {
    user?: User;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits<{
    submit: [data: Omit<User, 'id' | 'createdAt'>];
    cancel: [];
  }>();
  
  const isEditing = ref(!!props.user);
  
  const form = ref({
    name: '',
    email: '',
    role: 'user' as User['role'],
    department: '',
    position: '',
    isActive: true
  });
  
  // Watch for user prop changes (for editing)
  watch(() => props.user, (newUser) => {
    if (newUser) {
      form.value = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department || '',
        position: newUser.position || '',
        isActive: newUser.isActive
      };
      isEditing.value = true;
    }
  }, { immediate: true });
  
  const handleSubmit = () => {
    const userData: Omit<User, 'id' | 'createdAt'> = {
      ...form.value,
      avatar: undefined // You can add avatar upload later
    };
    
    emit('submit', userData);
    
    if (!isEditing.value) {
      // Reset form only for new users
      form.value = {
        name: '',
        email: '',
        role: 'user',
        department: '',
        position: '',
        isActive: true
      };
    }
  };
  </script>
  
  <style scoped>
  .user-form {
    max-width: 600px;
  }
  
  .user-form h3 {
    margin-bottom: 1.5rem;
    color: #1e293b;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }
  
  .form-group input,
  .form-group select {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
  }
  
  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
  }
  
  .helper-text {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  
  .btn-secondary {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  
  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>