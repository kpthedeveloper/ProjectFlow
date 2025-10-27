<!-- components/projects/ProjectCard.vue -->
<template>
  <div class="project-card">
    <div class="project-header">
      <div class="project-title">
        <h4>{{ project.name }}</h4>
        <div class="project-actions-header">
          <button 
            v-if="canEditProject" 
            @click.stop="handleEdit" 
            class="btn-edit-icon"
            title="Edit Project"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
      </div>
      <span class="status-badge" :class="project.status">
        {{ project.status }}
      </span>
    </div>
    <p class="project-description">{{ project.description }}</p>
    <div class="project-meta">
      <span>Manager: {{ managerName }}</span>
      <span>Start: {{ formatDate(project.startDate) }}</span>
    </div>
    <div class="project-actions">
      <button @click.stop="handleViewDetails" class="btn-secondary">
        View Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserLookup } from '@/composables/useUserLookup';
import { useAuthStore } from '@/stores/auth';
import type { Project } from '@/types';

interface Props {
  project: Project;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'view-details': [project: Project]; // Renamed from 'edit'
  'edit-project': [project: Project];
}>();

const authStore = useAuthStore();
const { getUserNameById } = useUserLookup();

const managerName = getUserNameById(props.project.managerId);

// Check if current user can edit this project
const canEditProject = computed(() => {
  const user = authStore.user;
  if (!user) return false;
  
  // Admin can edit any project
  if (user.role === 'admin') return true;
  
  // Manager can edit their own projects
  if (user.role === 'manager' && user.id === props.project.managerId) return true;
  
  return false;
});

const handleViewDetails = () => {
  emit('view-details', props.project);
};

const handleEdit = (event: Event) => {
  event.stopPropagation(); // Prevent any parent event handlers
  emit('edit-project', props.project);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.project-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: box-shadow 0.2s;
  position: relative;
}

.project-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.project-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  margin-right: 0.5rem;
}

.project-title h4 {
  margin: 0;
  color: #1e293b;
  flex: 1;
}

.project-actions-header {
  display: flex;
  gap: 0.25rem;
}

.btn-edit-icon {
  background: transparent;
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit-icon:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.planned {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.completed {
  background: #f1f5f9;
  color: #475569;
}

.status-badge.on-hold {
  background: #fef3c7;
  color: #92400e;
}

.project-description {
  color: #64748b;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e1e5e9;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

@media (max-width: 480px) {
  .project-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .project-title {
    margin-right: 0;
  }
  
  .status-badge {
    align-self: flex-start;
  }
}
</style>