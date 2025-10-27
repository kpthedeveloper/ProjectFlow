<!-- views/ProjectsView.vue -->
<!-- views/ProjectsView.vue -->
<template>
  <div class="projects-view">
    <div class="view-header">
      <h2>Projects</h2>
      <p>Manage and track all your projects</p>
    </div>
    
    <ProjectList 
      :projects="projectsStore.userProjects"
      @create-project="showCreateModal = true"
      @view-details="handleViewProject"
      @edit-project="handleEditProject"
    />
    
    <!-- Create/Edit Project Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        
        <ProjectForm 
          :project="editingProject"
          @submit="handleCreateProject"
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import { useAuthStore } from '@/stores/auth';
import ProjectList from '@/components/projects/ProjectList.vue';
import ProjectForm from '@/components/projects/ProjectForm.vue';
import type { Project } from '@/types';

const projectsStore = useProjectsStore();
onMounted(() => {
  projectsStore.initializeStore();
});
const authStore = useAuthStore();
const router = useRouter();

const showCreateModal = ref(false);
const editingProject = ref<Project | null>(null);

const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (editingProject.value) {
    projectsStore.updateProject(editingProject.value.id, projectData);
  } else {
    projectsStore.createProject(projectData);
  }
  closeModal();
};

const handleViewProject = (project: Project) => {
  router.push(`/projects/${project.id}`);
};

const handleEditProject = (project: Project) => {
  editingProject.value = project;
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  editingProject.value = null;
};
</script>

<style scoped>
/* Your existing styles remain the same */
</style>

<style scoped>
.projects-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 2rem;
}

.view-header h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.view-header p {
  color: #64748b;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
}
</style>