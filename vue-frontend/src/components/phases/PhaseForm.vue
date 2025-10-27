<!-- components/phases/PhaseForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="phase-form">
      <h3>{{ isEditing ? 'Edit Phase' : 'Create New Phase' }}</h3>
      
      <div class="form-group">
        <label for="phaseName">Phase Name *</label>
        <input
          id="phaseName"
          v-model="form.name"
          type="text"
          required
          placeholder="Enter phase name"
        />
      </div>
      
      <div class="form-group">
        <label for="phaseDescription">Description</label>
        <textarea
          id="phaseDescription"
          v-model="form.description"
          rows="3"
          placeholder="Enter phase description"
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="phaseStartDate">Start Date *</label>
          <input
            id="phaseStartDate"
            v-model="form.startDate"
            type="date"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="phaseEndDate">End Date *</label>
          <input
            id="phaseEndDate"
            v-model="form.endDate"
            type="date"
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="phaseStatus">Status</label>
        <select id="phaseStatus" v-model="form.status">
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
  
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {{ isEditing ? 'Update Phase' : 'Create Phase' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { Phase } from '@/types';
  
  interface Props {
    phase?: Phase;
    projectId?: string;
    nextOrder?: number;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits<{
    submit: [data: Omit<Phase, 'id'>];
    cancel: [];
  }>();
  
  const isEditing = ref(!!props.phase);
  
  const form = ref({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'not-started' as Phase['status'],
    order: props.nextOrder || 1,
    projectId: props.projectId || ''
  });
  
  // Watch for phase prop changes (for editing)
  watch(() => props.phase, (newPhase) => {
    if (newPhase) {
      form.value = {
        name: newPhase.name,
        description: newPhase.description,
        startDate: newPhase.startDate,
        endDate: newPhase.endDate,
        status: newPhase.status,
        order: newPhase.order,
        projectId: newPhase.projectId
      };
      isEditing.value = true;
    } else {
      // Reset for new phases
      form.value = {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'not-started',
        order: props.nextOrder || 1,
        projectId: props.projectId || ''
      };
      isEditing.value = false;
    }
  }, { immediate: true });
  
  // Watch for projectId changes
  watch(() => props.projectId, (newProjectId) => {
    if (newProjectId) {
      form.value.projectId = newProjectId;
    }
  });
  
  // Watch for nextOrder changes
  watch(() => props.nextOrder, (newOrder) => {
    if (newOrder && !isEditing.value) {
      form.value.order = newOrder;
    }
  });
  
  const handleSubmit = () => {
    const phaseData: Omit<Phase, 'id'> = {
      name: form.value.name,
      description: form.value.description,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      status: form.value.status,
      order: form.value.order,
      projectId: form.value.projectId
    };
    
    emit('submit', phaseData);
    
    if (!isEditing.value) {
      // Reset form for new phases
      form.value = {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'not-started',
        order: (props.nextOrder || 1) + 1,
        projectId: props.projectId || ''
      };
    }
  };
  </script>
  
  <style scoped>
  .phase-form {
    max-width: 600px;
  }
  
  .phase-form h3 {
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