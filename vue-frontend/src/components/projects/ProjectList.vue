<!-- components/projects/ProjectList.vue -->
<template>
  <div class="project-list">
    <div class="project-list-header">
      <h3>Projects</h3>
      <button 
        v-if="canCreateProject" 
        @click="$emit('create-project')" 
        class="btn-primary"
      >
        Create Project
      </button>
    </div>
    
    <div class="projects-grid">
      <ProjectCard 
        v-for="project in projects" 
        :key="project.id" 
        :project="project" 
        @view-details="(p) => $emit('view-details', p)"
        @edit-project="(p) => $emit('edit-project', p)"
      />
    </div>

    <div v-if="projects.length === 0" class="empty-state">
      <p>No projects found. Create your first project to get started!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { Project } from '@/types';
import ProjectCard from './ProjectCard.vue';

interface Props {
  projects: Project[];
}

defineProps<Props>();
defineEmits<{
  'create-project': [];
  'view-details': [project: Project];
  'edit-project': [project: Project];
}>();

const authStore = useAuthStore();
const canCreateProject = computed(() => 
  ['admin', 'manager'].includes(authStore.user?.role || '')
);
</script>

<style scoped>
.project-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.projects-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  background: white;
  border-radius: 0.5rem;
  border: 2px dashed #e2e8f0;
  margin-top: 1rem;
}
</style>