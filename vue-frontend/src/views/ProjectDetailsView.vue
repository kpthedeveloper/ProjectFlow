<template>
  <div class="project-details-view">
    <div class="view-header">
      <div class="header-content">
        <div>
          <h2>{{ project?.name }}</h2>
          <p>{{ project?.description }}</p>
          <div class="manager-display" v-if="manager">
            <span class="manager-label">Project Manager:</span>
            <div class="manager-details">
              <div class="manager-avatar">
                {{ manager.name.split(' ').map(n => n[0]).join('') }}
              </div>
              <div class="manager-info">
                <span class="manager-name">{{ manager.name }}</span>
                <span class="manager-role">{{ manager.role }}</span>
              </div>
            </div>
          </div>
          <div v-else class="manager-display">
            <span class="manager-label">Project Manager:</span>
            <span class="manager-not-found">Unknown Manager</span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            v-if="canManageProject" 
            @click="handleEditProject" 
            class="btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Project
          </button>
          <button @click="router.back()" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Back to Projects
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="project" class="project-content">
      <div class="project-overview">
        <div class="overview-grid">
          <div class="overview-card">
            <h4>Project Status</h4>
            <span class="status-badge large" :class="project.status">
              {{ project.status }}
            </span>
          </div>
          <div class="overview-card">
            <h4>Timeline</h4>
            <p>Start: {{ formatDate(project.startDate) }}</p>
            <p>End: {{ formatDate(project.endDate) }}</p>
          </div>
          <div class="overview-card">
            <h4>Progress</h4>
            <div class="progress-stats">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              </div>
              <span class="progress-text">{{ progressPercentage }}% Complete</span>
            </div>
          </div>
          <div class="overview-card">
            <h4>Project Details</h4>
            <p>Created: {{ formatDate(project.createdAt) }}</p>
            <p>Last Updated: {{ formatDate(project.updatedAt) }}</p>
          </div>
        </div>
      </div>

      <div class="project-sections">
        <div class="phases-section">
          <div class="section-header">
            <h3>Project Phases</h3>
            <button 
              v-if="canManageProject" 
              @click="handleAddPhase" 
              class="btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Add Phase
            </button>
          </div>
          
          <DraggablePhaseList
            :phases="projectPhases"
            :can-manage-phases="canManageProject"
            :get-phase-task-count="getPhaseTaskCount"
            @reorder-phases="handleReorderPhases"
            @edit-phase="handleEditPhase"
            @delete-phase="handleDeletePhase"
            @create-task="handleAddTask"
          />
          
          <div v-if="projectPhases.length === 0" class="empty-state">
            <p>No phases defined for this project yet.</p>
            <button v-if="canManageProject" @click="handleAddPhase" class="btn-primary">
              Create First Phase
            </button>
          </div>
        </div>

        <div class="tasks-section">
          <div class="section-header">
            <h3>Project Tasks</h3>
            <button @click="handleAddTask()" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Add Task
            </button>
          </div>
          <TaskList 
            :tasks="projectTasks"
            @update-status="handleStatusUpdate"
            @edit-task="handleEditTask"
          />
          <div v-if="projectTasks.length === 0" class="empty-state">
            <p>No tasks created for this project yet.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <div class="not-found-content">
        <h3>Project Not Found</h3>
        <p>The project you're looking for doesn't exist or you don't have access to it.</p>
        <button @click="router.push('/projects')" class="btn-primary">
          Back to Projects
        </button>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <ProjectForm 
          :project="project"
          @submit="handleUpdateProject"
          @cancel="showEditModal = false"
        />
      </div>
    </div>

    <!-- Phase Create/Edit Modal -->
    <div v-if="showPhaseModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingPhase ? 'Edit Phase' : 'Create New Phase' }}</h3>
        <PhaseForm
          :phase="editingPhase"
          :project-id="project?.id"
          :next-order="projectPhases.length + 1"
          @submit="handlePhaseSubmit"
          @cancel="closePhaseModal"
        />
      </div>
    </div>

    <!-- Delete Phase Confirmation Modal -->
    <div v-if="showDeletePhaseModal" class="modal-overlay">
      <div class="modal">
        <div class="delete-confirmation">
          <h3>Delete Phase</h3>
          <p>Are you sure you want to delete phase "{{ phaseToDelete?.name }}"? This will also delete all tasks in this phase and cannot be undone.</p>
          <div class="confirmation-actions">
            <button @click="showDeletePhaseModal = false" class="btn-secondary">
              Cancel
            </button>
            <button @click="confirmDeletePhase" class="btn-danger">
              Delete Phase
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Create/Edit Modal -->
    <div v-if="showTaskModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h3>
        <TaskForm
          :task="editingTask"
          :auto-fill-project-id="taskProjectId"
          :auto-fill-phase-id="taskPhaseId"
          @submit="handleTaskSubmit"
          @cancel="closeTaskModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '@/stores/projects';
import { useAuthStore } from '@/stores/auth';
import { useUserLookup } from '@/composables/useUserLookup';
import TaskList from '@/components/tasks/TaskList.vue';
import ProjectForm from '@/components/projects/ProjectForm.vue';
import DraggablePhaseList from '@/components/phases/DraggablePhaseList.vue';
import PhaseForm from '@/components/phases/PhaseForm.vue';
import TaskForm from '@/components/tasks/TaskForm.vue';
import type { Project, Phase, Task } from '@/types';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();
const { getUserById } = useUserLookup();

const showEditModal = ref(false);
const showPhaseModal = ref(false);
const showDeletePhaseModal = ref(false);
const showTaskModal = ref(false);
const editingPhase = ref<Phase | null>(null);
const phaseToDelete = ref<Phase | null>(null);
const editingTask = ref<Task | null>(null);
const taskProjectId = ref<string>('');
const taskPhaseId = ref<string>('');

const project = computed<Project | undefined>(() => {
  return projectsStore.projects.find(p => p.id === route.params.id);
});

// Use the composable to get manager details
const manager = getUserById(project.value?.managerId || '');

// Check if current user can manage this project
const canManageProject = computed(() => {
  if (!project.value) return false;
  const user = authStore.user;
  return user?.role === 'admin' || user?.id === project.value.managerId;
});

const projectPhases = computed(() => {
  if (!project.value) return [];
  return projectsStore.phases
    .filter(phase => phase.projectId === project.value?.id)
    .sort((a, b) => a.order - b.order);
});

const projectTasks = computed(() => {
  if (!project.value) return [];
  return projectsStore.tasks.filter(task => task.projectId === project.value?.id);
});

const progressPercentage = computed(() => {
  const totalTasks = projectTasks.value.length;
  const completedTasks = projectTasks.value.filter(task => task.status === 'completed').length;
  
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
});

const getPhaseTaskCount = (phaseId: string) => {
  return projectTasks.value.filter(task => task.phaseId === phaseId).length;
};

// Fetch phases and tasks when component mounts or project changes
onMounted(async () => {
  if (project.value) {
    await projectsStore.fetchPhasesByProject(project.value.id);
    await projectsStore.fetchTasksByProject(project.value.id);
  }
});

watch(() => project.value, async (newProject) => {
  if (newProject) {
    await projectsStore.fetchPhasesByProject(newProject.id);
    await projectsStore.fetchTasksByProject(newProject.id);
  }
});

const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
  await projectsStore.updateTaskStatus(taskId, status);
};

const handleEditProject = () => {
  showEditModal.value = true;
};

const handleUpdateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (project.value) {
    await projectsStore.updateProject(project.value.id, projectData);
    showEditModal.value = false;
  }
};

// Phase Management Functions
const handleAddPhase = () => {
  editingPhase.value = null;
  showPhaseModal.value = true;
};

const handleEditPhase = (phase: Phase) => {
  editingPhase.value = phase;
  showPhaseModal.value = true;
};

const handleDeletePhase = (phaseId: string) => {
  const phase = projectPhases.value.find(p => p.id === phaseId);
  if (phase) {
    phaseToDelete.value = phase;
    showDeletePhaseModal.value = true;
  }
};

const handlePhaseSubmit = async (phaseData: Omit<Phase, 'id'>) => {
  if (editingPhase.value) {
    await projectsStore.updatePhase(editingPhase.value.id, phaseData);
  } else {
    await projectsStore.createPhase(phaseData);
  }
  closePhaseModal();
};

const handleReorderPhases = async (reorderedPhases: Phase[]) => {
  await projectsStore.reorderPhases(reorderedPhases);
};

const confirmDeletePhase = async () => {
  if (phaseToDelete.value) {
    await projectsStore.deletePhase(phaseToDelete.value.id);
    showDeletePhaseModal.value = false;
    phaseToDelete.value = null;
  }
};

const closePhaseModal = () => {
  showPhaseModal.value = false;
  editingPhase.value = null;
};

// Task Management Functions
const handleAddTask = (phaseId?: string) => {
  editingTask.value = null;
  taskProjectId.value = project.value?.id || '';
  taskPhaseId.value = phaseId || '';
  showTaskModal.value = true;
};

const handleEditTask = (task: Task) => {
  editingTask.value = task;
  taskProjectId.value = task.projectId;
  taskPhaseId.value = task.phaseId;
  showTaskModal.value = true;
};

const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (editingTask.value) {
    await projectsStore.updateTask(editingTask.value.id, taskData);
  } else {
    await projectsStore.createTask(taskData);
  }
  closeTaskModal();
};

const closeTaskModal = () => {
  showTaskModal.value = false;
  editingTask.value = null;
  taskProjectId.value = '';
  taskPhaseId.value = '';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatPhaseStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'completed': 'Completed'
  };
  return statusMap[status] || status;
};
</script>

<style scoped>
.project-details-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-content h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.header-content p {
  color: #64748b;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.6;
}

.manager-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 0 0;
}

.manager-label {
  color: #64748b;
  font-size: 0.875rem;
  white-space: nowrap;
}

.manager-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.manager-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.manager-info {
  display: flex;
  flex-direction: column;
}

.manager-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.manager-role {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: capitalize;
}

.manager-not-found {
  font-style: italic;
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Header Actions with proper spacing */
.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

/* Icon styling */
.btn-primary svg,
.btn-secondary svg {
  flex-shrink: 0;
}

.project-overview {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.overview-card h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.overview-card p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.status-badge.large {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
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

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.project-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.phases-section,
.tasks-section {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  border: 2px dashed #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
}

.empty-state p {
  margin: 0 0 1rem 0;
}

.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.not-found-content {
  text-align: center;
  max-width: 400px;
}

.not-found-content h3 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.not-found-content p {
  color: #64748b;
  margin-bottom: 2rem;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
}

.delete-confirmation {
  text-align: center;
}

.delete-confirmation h3 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.delete-confirmation p {
  color: #64748b;
  margin-bottom: 2rem;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-danger {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.btn-danger:hover {
  background: #b91c1c;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .project-sections {
    grid-template-columns: 1fr;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .manager-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .modal {
    padding: 1.5rem;
  }
}
</style>