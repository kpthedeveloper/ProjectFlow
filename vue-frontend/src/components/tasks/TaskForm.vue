<!-- components/tasks/TaskForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="task-form">
      <h3>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h3>
      
      <div class="form-group">
        <label for="taskTitle">Title *</label>
        <input
          id="taskTitle"
          v-model="form.title"
          type="text"
          required
          placeholder="Enter task title"
        />
      </div>
      
      <div class="form-group">
        <label for="taskDescription">Description</label>
        <textarea
          id="taskDescription"
          v-model="form.description"
          rows="3"
          placeholder="Enter task description"
        ></textarea>
      </div>
  
      <div class="form-row">
        <div class="form-group">
          <label for="taskProject">Project *</label>
          <select 
            id="taskProject" 
            v-model="form.projectId" 
            required
            :disabled="!!autoFillProjectId"
          >
            <option value="">Select Project</option>
            <option 
              v-for="project in availableProjects" 
              :key="project.id" 
              :value="project.id"
            >
              {{ project.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="taskPhase">Phase *</label>
          <select 
            id="taskPhase" 
            v-model="form.phaseId" 
            required
            :disabled="!!autoFillPhaseId"
          >
            <option value="">Select Phase</option>
            <option 
              v-for="phase in availablePhases" 
              :key="phase.id" 
              :value="phase.id"
            >
              {{ phase.name }} ({{ phase.projectName }})
            </option>
          </select>
        </div>
      </div>
  
      <div class="form-row">
        <div class="form-group">
          <label for="taskAssignee">Assignee *</label>
          <select 
            id="taskAssignee" 
            v-model="form.assigneeId" 
            required
            :disabled="!canAssignToOthers"
          >
            <option value="">Select Assignee</option>
            <option 
              v-for="user in availableUsers" 
              :key="user.id" 
              :value="user.id"
            >
              {{ user.name }} ({{ user.role }})
            </option>
          </select>
          <p v-if="!canAssignToOthers" class="helper-text">
            Tasks will be assigned to you
          </p>
        </div>
        
        <div class="form-group">
          <label for="taskPriority">Priority</label>
          <select id="taskPriority" v-model="form.priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
  
      <div class="form-row">
        <div class="form-group">
          <label for="taskDueDate">Due Date</label>
          <input
            id="taskDueDate"
            v-model="form.dueDate"
            type="date"
          />
        </div>
        
        <div class="form-group">
          <label for="taskEstimatedHours">Estimated Hours</label>
          <input
            id="taskEstimatedHours"
            v-model="form.estimatedHours"
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
          />
        </div>
      </div>
  
      <div class="form-group">
        <label for="taskStatus">Status</label>
        <select id="taskStatus" v-model="form.status">
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>
  
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {{ isEditing ? 'Update Task' : 'Create Task' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useProjectsStore } from '@/stores/projects';
  import { useUsersStore } from '@/stores/users';
  import type { Task, Project, Phase } from '@/types';
  
  interface Props {
    task?: Task;
    autoFillProjectId?: string;
    autoFillPhaseId?: string;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits<{
    submit: [data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>];
    cancel: [];
  }>();
  
  const authStore = useAuthStore();
  const projectsStore = useProjectsStore();
  const usersStore = useUsersStore();
  
  const isEditing = ref(!!props.task);
  
  // Check if current user can assign tasks to others
  const canAssignToOthers = computed(() => {
    const user = authStore.user;
    return user?.role === 'admin' || user?.role === 'manager';
  });
  
  // Available projects for selection
  const availableProjects = computed(() => {
    const user = authStore.user;
    if (user?.role === 'admin') {
      return projectsStore.projects;
    }
    return projectsStore.userProjects;
  });
  
  // Available phases based on selected project
  const availablePhases = computed(() => {
    if (!form.value.projectId) return [];
    
    const phases = projectsStore.phases
      .filter(phase => phase.projectId === form.value.projectId)
      .sort((a, b) => a.order - b.order);
    
    // Add project name to phases for better display
    return phases.map(phase => {
      const project = projectsStore.projects.find(p => p.id === phase.projectId);
      return {
        ...phase,
        projectName: project?.name || 'Unknown Project'
      };
    });
  });
  
  // Available users for assignment
  const availableUsers = computed(() => {
    if (canAssignToOthers.value) {
      return usersStore.users.filter(user => user.isActive);
    } else {
      // Regular users can only assign to themselves
      const currentUser = authStore.user;
      return currentUser ? [currentUser] : [];
    }
  });
  
  // Initialize form
  const form = ref({
    title: '',
    description: '',
    projectId: props.autoFillProjectId || '',
    phaseId: props.autoFillPhaseId || '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    assigneeId: canAssignToOthers.value ? '' : (authStore.user?.id || ''),
    reporterId: authStore.user?.id || '',
    dueDate: '',
    estimatedHours: 0
  });
  
  // Watch for task prop changes (for editing)
  watch(() => props.task, (newTask) => {
    if (newTask) {
      form.value = {
        title: newTask.title,
        description: newTask.description,
        projectId: newTask.projectId,
        phaseId: newTask.phaseId,
        status: newTask.status,
        priority: newTask.priority,
        assigneeId: newTask.assigneeId,
        reporterId: newTask.reporterId,
        dueDate: newTask.dueDate,
        estimatedHours: newTask.estimatedHours || 0
      };
      isEditing.value = true;
    } else {
      // Reset for new tasks
      form.value = {
        title: '',
        description: '',
        projectId: props.autoFillProjectId || '',
        phaseId: props.autoFillPhaseId || '',
        status: 'todo',
        priority: 'medium',
        assigneeId: canAssignToOthers.value ? '' : (authStore.user?.id || ''),
        reporterId: authStore.user?.id || '',
        dueDate: '',
        estimatedHours: 0
      };
      isEditing.value = false;
    }
  }, { immediate: true });
  
  // Watch for auto-fill changes
  watch(() => props.autoFillProjectId, (newProjectId) => {
    if (newProjectId && !isEditing.value) {
      form.value.projectId = newProjectId;
    }
  });
  
  watch(() => props.autoFillPhaseId, (newPhaseId) => {
    if (newPhaseId && !isEditing.value) {
      form.value.phaseId = newPhaseId;
    }
  });
  
  // Auto-set assignee for regular users
  watch(() => authStore.user, (user) => {
    if (user && !canAssignToOthers.value && !isEditing.value) {
      form.value.assigneeId = user.id;
      form.value.reporterId = user.id;
    }
  });
  
  const handleSubmit = () => {
    // Ensure reporter is set to current user
    const finalReporterId = authStore.user?.id || form.value.reporterId;
    
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: form.value.title,
      description: form.value.description,
      projectId: form.value.projectId,
      phaseId: form.value.phaseId,
      status: form.value.status,
      priority: form.value.priority,
      assigneeId: form.value.assigneeId,
      reporterId: finalReporterId,
      dueDate: form.value.dueDate,
      estimatedHours: form.value.estimatedHours
    };
    
    emit('submit', taskData);
    
    if (!isEditing.value) {
      // Reset form for new tasks
      form.value = {
        title: '',
        description: '',
        projectId: props.autoFillProjectId || '',
        phaseId: props.autoFillPhaseId || '',
        status: 'todo',
        priority: 'medium',
        assigneeId: canAssignToOthers.value ? '' : (authStore.user?.id || ''),
        reporterId: authStore.user?.id || '',
        dueDate: '',
        estimatedHours: 0
      };
    }
  };
  </script>
  
  <style scoped>
  .task-form {
    max-width: 600px;
  }
  
  .task-form h3 {
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
  
  .helper-text {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
    font-style: italic;
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