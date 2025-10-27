<!-- components/users/UserList.vue -->
<template>
    <div class="user-list">
      <div class="user-list-header">
        <h3>Users ({{ users.length }})</h3>
        <div class="header-actions">
          <div class="filters">
            <select v-model="roleFilter" class="filter-select">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
            <select v-model="statusFilter" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button @click="$emit('create-user')" class="btn-primary">
            Add User
          </button>
        </div>
      </div>
  
      <div class="users-grid">
        <UserCard
          v-for="user in filteredUsers"
          :key="user.id"
          :user="user"
          @edit="(u) => $emit('edit-user', u)"
          @toggle-status="(id) => $emit('toggle-status', id)"
          @delete="(id) => $emit('delete-user', id)"
        />
      </div>
  
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <p>No users found matching your filters.</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { User } from '@/types';
  import UserCard from './UserCard.vue';
  
  interface Props {
    users: User[];
  }
  
  // Define props and emits at the top level, only once
  const props = defineProps<Props>();
  defineEmits<{
    'create-user': [];
    'edit-user': [user: User];
    'toggle-status': [userId: string];
    'delete-user': [userId: string];
  }>();
  
  const roleFilter = ref('');
  const statusFilter = ref('');
  
  const filteredUsers = computed(() => {
    return props.users.filter(user => {
      const roleMatch = !roleFilter.value || user.role === roleFilter.value;
      const statusMatch = !statusFilter.value || 
        (statusFilter.value === 'active' && user.isActive) ||
        (statusFilter.value === 'inactive' && !user.isActive);
      return roleMatch && statusMatch;
    });
  });
  </script>
  
  <style scoped>
  .user-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .filters {
    display: flex;
    gap: 0.5rem;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 1px solid #e1e5e9;
    border-radius: 0.25rem;
    background: white;
    font-size: 0.875rem;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    white-space: nowrap;
  }
  
  .users-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #64748b;
    background: white;
    border-radius: 0.5rem;
    border: 2px dashed #e2e8f0;
  }
  
  @media (max-width: 768px) {
    .user-list-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .header-actions {
      justify-content: space-between;
    }
    
    .users-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>