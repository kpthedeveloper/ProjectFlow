<!-- components/users/UserCard.vue -->
<template>
    <div class="user-card" :class="{ inactive: !user.isActive }">
      <div class="user-header">
        <div class="user-avatar">
          <div class="avatar-placeholder">
            {{ user.name.split(' ').map(n => n[0]).join('') }}
          </div>
        </div>
        <div class="user-info">
          <h4 class="user-name">{{ user.name }}</h4>
          <p class="user-email">{{ user.email }}</p>
          <div class="user-meta">
            <span class="role-badge" :class="user.role">{{ user.role }}</span>
            <span class="status-badge" :class="user.isActive ? 'active' : 'inactive'">
              {{ user.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
  
      <div class="user-details">
        <div class="detail-item">
          <span class="label">Department:</span>
          <span class="value">{{ user.department || 'Not specified' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Position:</span>
          <span class="value">{{ user.position || 'Not specified' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Last Login:</span>
          <span class="value">{{ formatLastLogin(user.lastLogin) }}</span>
        </div>
      </div>
  
      <div class="user-actions">
        <button @click="$emit('edit', user)" class="btn-edit" title="Edit user">
          Edit
        </button>
        <button 
          @click="$emit('toggle-status', user.id)" 
          :class="user.isActive ? 'btn-deactivate' : 'btn-activate'"
          :title="user.isActive ? 'Deactivate user' : 'Activate user'"
        >
          {{ user.isActive ? 'Deactivate' : 'Activate' }}
        </button>
        <button 
          v-if="user.role !== 'admin'" 
          @click="$emit('delete', user.id)" 
          class="btn-delete"
          title="Delete user"
        >
          Delete
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { User } from '@/types';
  
  interface Props {
    user: User;
  }
  
  defineProps<Props>();
  defineEmits<{
    edit: [user: User];
    'toggle-status': [userId: string];
    delete: [userId: string];
  }>();
  
  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    return new Date(lastLogin).toLocaleDateString();
  };
  </script>
  
  <style scoped>
  .user-card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 0.5rem;
    padding: 1.5rem;
    transition: all 0.2s;
  }
  
  .user-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .user-card.inactive {
    opacity: 0.6;
    background: #f8fafc;
  }
  
  .user-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .avatar-placeholder {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.125rem;
  }
  
  .user-info {
    flex: 1;
  }
  
  .user-name {
    margin: 0 0 0.25rem 0;
    color: #1e293b;
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  .user-email {
    margin: 0 0 0.5rem 0;
    color: #64748b;
    font-size: 0.875rem;
  }
  
  .user-meta {
    display: flex;
    gap: 0.5rem;
  }
  
  .role-badge,
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .role-badge.admin {
    background: #fef3c7;
    color: #92400e;
  }
  
  .role-badge.manager {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .role-badge.user {
    background: #dcfce7;
    color: #166534;
  }
  
  .status-badge.active {
    background: #dcfce7;
    color: #166534;
  }
  
  .status-badge.inactive {
    background: #f1f5f9;
    color: #64748b;
  }
  
  .user-details {
    margin-bottom: 1.5rem;
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .detail-item:last-child {
    border-bottom: none;
  }
  
  .label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
  }
  
  .value {
    font-size: 0.875rem;
    color: #1e293b;
  }
  
  .user-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .user-actions button {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
    flex: 1;
    min-width: 80px;
  }
  
  .btn-edit {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .btn-edit:hover {
    background: #bfdbfe;
  }
  
  .btn-activate {
    background: #dcfce7;
    color: #166534;
  }
  
  .btn-activate:hover {
    background: #bbf7d0;
  }
  
  .btn-deactivate {
    background: #fef3c7;
    color: #92400e;
  }
  
  .btn-deactivate:hover {
    background: #fde68a;
  }
  
  .btn-delete {
    background: #fee2e2;
    color: #dc2626;
  }
  
  .btn-delete:hover {
    background: #fecaca;
  }
  </style>