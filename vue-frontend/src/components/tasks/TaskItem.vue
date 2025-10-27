<!-- components/tasks/TaskItem.vue -->
<template>
  <div class="task-item" :class="`priority-${task.priority}`">
    <div class="task-main">
      <div class="task-info">
        <div class="task-header">
          <h5 class="task-title">{{ task.title }}</h5>
          <div class="task-actions-header">
            <button @click="showComments = true" class="btn-comments" title="View comments">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
                </path>
              </svg>
              <span v-if="commentCount > 0" class="comment-count">{{ commentCount }}</span>
            </button>
            <button v-if="canEditTask" @click="$emit('edit-task', task)" class="btn-edit-task" title="Edit task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>
        <p class="task-description">{{ task.description }}</p>

        <div class="task-meta">
          <span class="due-date">Due: {{ formatDate(task.dueDate) }}</span>
          <span class="estimated-hours">{{ task.estimatedHours }}h</span>
        </div>
      </div>

      <div class="task-actions">
        <select :value="task.status" @change="onStatusChange($event)" class="status-select"
          :disabled="!canUpdateStatus">
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    <div class="task-tags">
      <span class="priority-tag">{{ task.priority }}</span>
      <span class="status-tag">{{ task.status }}</span>
      <div class="assignee-info">
        <div class="assignee-avatar">
          {{assignee?.name?.split(' ').map(n => n[0]).join('') || 'U'}}
        </div>
        <span class="metadata-value">{{ assignee?.name || 'Unassigned' }}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-value">{{ phaseName }}</span>
      </div>
    </div>

    <!-- Comments Modal -->
    <div v-if="showComments" class="modal-overlay">
      <div class="modal">
        <TaskComments :task-id="task.id" @close="showComments = false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useProjectsStore } from '@/stores/projects';
import { useUsersStore } from '@/stores/users';
import TaskComments from './TaskComments.vue';
import type { Task, TaskComment } from '@/types';

interface Props {
  task: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update-status': [taskId: string, status: Task['status']];
  'edit-task': [task: Task];
}>();

const authStore = useAuthStore();
const projectsStore = useProjectsStore();
const usersStore = useUsersStore();
const showComments = ref(false);

// Add a ref to store comments
const taskComments = ref<TaskComment[]>([]);

// Load comments when component mounts or task changes
const loadComments = async () => {
  try {
    taskComments.value = await projectsStore.getTaskComments(props.task.id);
  } catch (error) {
    console.error('Failed to load comments:', error);
    taskComments.value = [];
  }
};

// Load comments when component mounts
onMounted(() => {
  loadComments();
});

// Watch for task changes and reload comments
watch(() => props.task.id, (newTaskId) => {
  loadComments();
});

// Get phase information
const phaseName = computed(() => {
  const phase = projectsStore.phases.find(p => p.id === props.task.phaseId);
  return phase?.name || 'Unknown Phase';
});

// Get assignee information
const assignee = computed(() => {
  return usersStore.users.find(user => user.id === props.task.assigneeId);
});

// Check if current user can edit this task
const canEditTask = computed(() => {
  const user = authStore.user;
  if (!user) return false;

  // Admin can edit any task
  if (user.role === 'admin') return true;

  // Manager can edit tasks in their projects
  if (user.role === 'manager') {
    const project = projectsStore.projects.find(p => p.id === props.task.projectId);
    return project?.managerId === user.id;
  }

  // User can edit their own tasks
  return props.task.assigneeId === user.id || props.task.reporterId === user.id;
});

// Check if current user can update task status
const canUpdateStatus = computed(() => {
  const user = authStore.user;
  if (!user) return false;

  // Admin and managers can update any task status
  if (user.role === 'admin' || user.role === 'manager') return true;

  // Users can only update status of tasks assigned to them
  return props.task.assigneeId === user.id;
});

// Update commentCount to use the local comments
const commentCount = computed(() => {
  return taskComments.value.length;
});

const onStatusChange = (event: Event) => {
  if (!canUpdateStatus.value) return;

  const target = event.target as HTMLSelectElement;
  emit('update-status', props.task.id, target.value as Task['status']);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
/* Your existing styles remain unchanged */
.task-item {
  background: white;
  border-left: 4px solid #e1e5e9;
  padding: 1rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.task-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-item.priority-low {
  border-left-color: #10b981;
}

.task-item.priority-medium {
  border-left-color: #3b82f6;
}

.task-item.priority-high {
  border-left-color: #f59e0b;
}

.task-item.priority-critical {
  border-left-color: #ef4444;
}

.task-main {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.task-info {
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.task-title {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 600;
  flex: 1;
}

.task-actions-header {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.btn-comments,
.btn-edit-task {
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
  position: relative;
}

.btn-comments:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

.btn-edit-task:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

.comment-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.task-description {
  margin: 0 0 0.75rem 0;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.due-date,
.estimated-hours {
  font-size: 0.75rem;
}

.task-actions {
  display: flex;
  align-items: center;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 0.25rem;
  background: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.status-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.status-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8fafc;
}

/* Task Tags Grid Layout */
.task-tags {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0;
}

.priority-tag,
.status-tag,
.assignee-info,
.metadata-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 500;
  min-height: 24px;
  text-align: center;
}

.priority-tag {
  background: #f1f5f9;
  color: #475569;
  text-transform: capitalize;
}

.status-tag {
  background: #e2e8f0;
  color: #475569;
  text-transform: capitalize;
}

.assignee-info {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.metadata-item {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.assignee-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  font-weight: 600;
  flex-shrink: 0;
}

.metadata-value {
  font-size: 0.625rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Priority-specific styles */
.priority-tag.priority-low {
  background: #d1fae5;
  color: #065f46;
}

.priority-tag.priority-medium {
  background: #dbeafe;
  color: #1e40af;
}

.priority-tag.priority-high {
  background: #fef3c7;
  color: #92400e;
}

.priority-tag.priority-critical {
  background: #fee2e2;
  color: #991b1b;
}

/* Status-specific styles */
.status-tag.status-todo {
  background: #f3f4f6;
  color: #6b7280;
}

.status-tag.status-in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-tag.status-review {
  background: #fef3c7;
  color: #92400e;
}

.status-tag.status-completed {
  background: #d1fae5;
  color: #065f46;
}

/* Modal styles */
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
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Responsive design */
@media (max-width: 768px) {
  .task-tags {
    grid-template-columns: 1fr 1fr;
    gap: 0.375rem;
  }
}

@media (max-width: 640px) {
  .task-main {
    flex-direction: column;
    gap: 0.75rem;
  }

  .task-actions {
    align-self: flex-end;
  }

  .task-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-actions-header {
    align-self: flex-end;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .task-item {
    padding: 0.75rem;
  }

  .task-tags {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .priority-tag,
  .status-tag,
  .assignee-info,
  .metadata-item {
    font-size: 0.75rem;
    padding: 0.5rem;
    justify-content: flex-start;
  }
}
</style>