<!-- views/TasksView.vue -->
<template>
  <div class="tasks-view">
    <div class="view-header">
      <h2>My Tasks</h2>
      <p>Manage your assigned tasks</p>
    </div>
    
    <TaskList 
      :tasks="myTasks"
      @update-status="handleStatusUpdate"
      @edit-task="handleEditTask"
    />

    <!-- Edit Task Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <TaskForm
          v-if="editingTask"
          :task="editingTask"
          @save="handleTaskSave"
          @cancel="showEditModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProjectsStore } from '@/stores/projects';
import { useAuthStore } from '@/stores/auth';
import TaskList from '@/components/tasks/TaskList.vue';
import TaskForm from '@/components/tasks/TaskForm.vue';
import type { Task } from '@/types';

const projectsStore = useProjectsStore();
const authStore = useAuthStore();

const showEditModal = ref(false);
const editingTask = ref<Task | null>(null);

const myTasks = computed(() => {
  return projectsStore.tasks.filter(task => task.assigneeId === authStore.user?.id);
});

const handleStatusUpdate = (taskId: string, status: any) => {
  projectsStore.updateTaskStatus(taskId, status);
};

const handleEditTask = (task: Task) => {
  editingTask.value = task;
  showEditModal.value = true;
};

const handleTaskSave = (updatedTask: Task) => {
  try {
    // If updateTask expects two arguments (taskId and updates)
    if (updatedTask.id) {
      // Extract the ID and the rest of the properties
      const { id, ...updates } = updatedTask;
      projectsStore.updateTask(id, updates);
    }
    showEditModal.value = false;
    editingTask.value = null;
  } catch (error) {
    console.error('Error updating task:', error);
  }
};
</script>

<style scoped>
.tasks-view {
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
  max-width: 600px;
  max-height: 90vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 2rem;
}
</style>