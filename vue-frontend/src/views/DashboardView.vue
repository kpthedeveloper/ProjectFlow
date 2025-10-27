<!-- views/DashboardView.vue -->
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Welcome, {{ user?.name }}!</h2>
      <p>Here's an overview of your projects and tasks</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Active Projects</h3>
        <p class="stat-number">{{ activeProjectsCount }}</p>
      </div>
      <div class="stat-card">
        <h3>My Tasks</h3>
        <p class="stat-number">{{ myTasksCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Tasks Due Soon</h3>
        <p class="stat-number">{{ dueSoonTasksCount }}</p>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="recent-projects">
        
        <ProjectList 
          :projects="recentProjects"
          @create-project="showCreateModal = true"
          @view-details="handleViewProject"
          @edit-project="handleEditProject"
        />
      </div>
      
      <div class="recent-tasks">
        <h3>Recent Tasks</h3>
        <TaskList 
          :tasks="recentTasks"
          @update-status="handleStatusUpdate"
          @edit-task="handleEditTask"
        />
      </div>
    </div>

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

    <!-- Edit Task Modal -->
    <div v-if="showTaskEditModal" class="modal-overlay">
      <div class="modal">
        <TaskForm
          v-if="editingTask"
          :task="editingTask"
          @save="handleTaskSave"
          @cancel="showTaskEditModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProjectsStore } from '@/stores/projects';
import ProjectList from '@/components/projects/ProjectList.vue';
import TaskList from '@/components/tasks/TaskList.vue';
import ProjectForm from '@/components/projects/ProjectForm.vue';
import TaskForm from '@/components/tasks/TaskForm.vue';
import type { Project, Task } from '@/types';

const authStore = useAuthStore();
const projectsStore = useProjectsStore();
const router = useRouter();

const showCreateModal = ref(false);
const showTaskEditModal = ref(false);
const editingProject = ref<Project | null>(null);
const editingTask = ref<Task | null>(null);

const user = computed(() => authStore.user);
const canCreateProject = computed(() => 
  ['admin', 'manager'].includes(authStore.user?.role || '')
);

const activeProjectsCount = computed(() => 
  projectsStore.userProjects.filter(p => p.status === 'active').length
);

const myTasksCount = computed(() => 
  projectsStore.tasks.filter(t => t.assigneeId === authStore.user?.id).length
);

const dueSoonTasksCount = computed(() => 
  projectsStore.tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0 && t.assigneeId === authStore.user?.id;
  }).length
);

const recentProjects = computed(() => 
  projectsStore.userProjects.slice(0, 5)
);

const recentTasks = computed(() => 
  projectsStore.tasks
    .filter(t => t.assigneeId === authStore.user?.id)
    .slice(0, 10)
);

const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (editingProject.value) {
    // Update existing project
    projectsStore.updateProject(editingProject.value.id, projectData);
  } else {
    // Create new project
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

const handleEditTask = (task: Task) => {
  editingTask.value = task;
  showTaskEditModal.value = true;
};

const handleTaskSave = (updatedTask: Task) => {
  try {
    if (updatedTask.id) {
      const { id, ...updates } = updatedTask;
      projectsStore.updateTask(id, updates);
    }
    showTaskEditModal.value = false;
    editingTask.value = null;
  } catch (error) {
    console.error('Error updating task:', error);
  }
};

const handleStatusUpdate = (taskId: string, status: any) => {
  projectsStore.updateTaskStatus(taskId, status);
};

const closeModal = () => {
  showCreateModal.value = false;
  editingProject.value = null;
};
</script>

<style scoped>
.dashboard-header {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
  margin: 0;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.recent-projects,
.recent-tasks {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
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

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>