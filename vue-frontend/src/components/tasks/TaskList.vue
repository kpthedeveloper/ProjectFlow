<!-- components/tasks/TaskList.vue -->
<template>
  <div class="task-list">
    <div class="task-filters">
      <select v-model="statusFilter" class="filter-select">
        <option value="">All Status</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="review">Review</option>
        <option value="completed">Completed</option>
      </select>
      
      <select v-model="priorityFilter" class="filter-select">
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </div>
    
    <div class="tasks">
      <TaskItem 
        v-for="task in filteredTasks" 
        :key="task.id" 
        :task="task" 
        @update-status="(id, status) => $emit('update-status', id, status)"
        @edit-task="(task) => $emit('edit-task', task)"
      />
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { Task } from '@/types';
  import TaskItem from '@/components/tasks/TaskItem.vue';
  
  interface Props {
    tasks: Task[];
  }
  
  const props = defineProps<Props>();
  defineEmits<{
    'update-status': [taskId: string, status: Task['status']];
    'edit-task': [task: Task];
  }>();
  
  const statusFilter = ref('');
  const priorityFilter = ref('');
  
  const filteredTasks = computed(() => {
    return props.tasks.filter(task => {
      const statusMatch = !statusFilter.value || task.status === statusFilter.value;
      const priorityMatch = !priorityFilter.value || task.priority === priorityFilter.value;
      return statusMatch && priorityMatch;
    });
  });
  </script>
  
  <style scoped>
  .task-filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 1px solid #e1e5e9;
    border-radius: 0.25rem;
    background: white;
  }
  
  .tasks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  </style>