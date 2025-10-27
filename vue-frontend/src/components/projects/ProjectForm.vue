<!-- components/projects/ProjectForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="project-form">
    <h3>{{ isEditing ? 'Edit Project' : 'Create New Project' }}</h3>
    
    <div class="form-group">
      <label for="name">Project Name *</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        placeholder="Enter project name"
      />
    </div>
    
    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        placeholder="Enter project description"
      ></textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label for="startDate">Start Date *</label>
        <input
          id="startDate"
          v-model="form.startDate"
          type="date"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="endDate">End Date *</label>
        <input
          id="endDate"
          v-model="form.endDate"
          type="date"
          required
        />
      </div>
    </div>
    
    <div class="form-group">
      <label for="status">Status</label>
      <select id="status" v-model="form.status">
        <option value="planned">Planned</option>
        <option value="active">Active</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <!-- Show current user as manager for new projects -->
    <div v-if="!isEditing" class="manager-info">
      <label>Project Manager</label>
      <div class="current-manager">
        <div class="manager-avatar">
          {{ currentUser?.name?.split(' ').map(n => n[0]).join('') }}
        </div>
        <div class="manager-details">
          <span class="manager-name">{{ currentUser?.name }}</span>
          <span class="manager-role">{{ currentUser?.role }}</span>
        </div>
      </div>
      <p class="helper-text">You are the project manager for this project</p>
    </div>

    <!-- Show manager selection for admins when editing -->
    <div v-if="isEditing && authStore.user?.role === 'admin'" class="form-group">
      <label for="manager">Project Manager</label>
      <select id="manager" v-model="form.managerId">
        <option v-for="user in managers" :key="user.id" :value="user.id">
          {{ user.name }} ({{ user.role }})
        </option>
      </select>
    </div>

    <!-- Show current manager info for non-admin editors -->
    <div v-if="isEditing && authStore.user?.role !== 'admin'" class="manager-info">
      <label>Project Manager</label>
      <div class="current-manager">
        <div class="manager-avatar">
          {{ currentManager?.name?.split(' ').map(n => n[0]).join('') }}
        </div>
        <div class="manager-details">
          <span class="manager-name">{{ currentManager?.name }}</span>
          <span class="manager-role">{{ currentManager?.role }}</span>
        </div>
      </div>
      <p class="helper-text">Only administrators can change the project manager</p>
    </div>
    
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn-secondary">
        Cancel
      </button>
      <button type="submit" class="btn-primary">
        {{ isEditing ? 'Update Project' : 'Create Project' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import type { Project } from '@/types';

interface Props {
  project?: Project;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>];
  cancel: [];
}>();

const authStore = useAuthStore();
const usersStore = useUsersStore();

const isEditing = ref(!!props.project);
const currentUser = computed(() => authStore.user);

// Initialize form
const form = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'planned' as Project['status'],
  managerId: ''
});

// Get list of managers for admin assignment
const managers = computed(() => {
  return usersStore.users.filter(user => 
    user.role === 'admin' || user.role === 'manager'
  );
});

// Get current manager info for display
const currentManager = computed(() => {
  return usersStore.users.find(user => user.id === form.value.managerId);
});

// Set current user as manager when component mounts for new projects
onMounted(() => {
  if (!isEditing.value && currentUser.value) {
    form.value.managerId = currentUser.value.id;
  }
});

// Watch for user prop changes (for editing)
watch(() => props.project, (newProject) => {
  if (newProject) {
    form.value = {
      name: newProject.name,
      description: newProject.description,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      status: newProject.status,
      managerId: newProject.managerId
    };
    isEditing.value = true;
  } else {
    // Reset to current user for new projects
    form.value.managerId = currentUser.value?.id || '';
    isEditing.value = false;
  }
}, { immediate: true });

const handleSubmit = () => {
  // For new projects, always set current user as manager
  // For editing, use the form's managerId (admins can change it, others keep original)
  const finalManagerId = isEditing.value ? form.value.managerId : (currentUser.value?.id || '');
  
  const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
    name: form.value.name,
    description: form.value.description,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    status: form.value.status,
    managerId: finalManagerId
  };
  
  emit('submit', projectData);
  
  if (!isEditing.value) {
    // Reset form for new projects
    form.value = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planned',
      managerId: currentUser.value?.id || ''
    };
  }
};
</script>

<style scoped>
.project-form {
  max-width: 600px;
}

.project-form h3 {
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.manager-info {
  margin-bottom: 1rem;
}

.manager-info label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.current-manager {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}

.manager-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.manager-details {
  display: flex;
  flex-direction: column;
}

.manager-name {
  font-weight: 600;
  color: #1e293b;
}

.manager-role {
  font-size: 0.875rem;
  color: #64748b;
  text-transform: capitalize;
}

.helper-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #4b5563;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>