<!-- components/phases/DraggablePhaseList.vue -->
<template>
    <div class="draggable-phase-list">
      <div 
        v-for="phase in phases" 
        :key="phase.id"
        class="phase-item"
        :class="[
          `status-${phase.status}`,
          { 'dragging': draggedItem?.id === phase.id },
          { 'drag-over': dragOverItem?.id === phase.id && draggedItem?.id !== phase.id }
        ]"
        draggable="true"
        @dragstart="handleDragStart(phase, $event)"
        @dragend="handleDragEnd"
        @dragover="handleDragOver(phase, $event)"
        @dragenter="handleDragEnter(phase, $event)"
        @dragleave="handleDragLeave"
        @drop="handleDrop(phase, $event)"
      >
        <div class="phase-drag-handle" title="Drag to reorder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>
        
        <div class="phase-info">
          <div class="phase-header">
            <h5>{{ phase.name }}</h5>
            <div class="phase-actions">
              <button 
                v-if="canManagePhases" 
                @click="$emit('edit-phase', phase)" 
                class="btn-edit"
                title="Edit phase"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                v-if="canManagePhases" 
                @click="$emit('delete-phase', phase.id)" 
                class="btn-delete"
                title="Delete phase"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="phase-description">{{ phase.description }}</p>
          <div class="phase-meta">
            <span class="phase-dates">{{ formatDate(phase.startDate) }} - {{ formatDate(phase.endDate) }}</span>
            <span class="phase-status" :class="phase.status">{{ formatPhaseStatus(phase.status) }}</span>
          </div>
          <div class="phase-tasks">
  <span class="tasks-count">
    {{ getPhaseTaskCount(phase.id) }} tasks
  </span>
  <button 
    v-if="canManagePhases" 
    @click="$emit('create-task', phase.id)" 
    class="btn-add-task"
    title="Add task to this phase"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12h14"></path>
    </svg>
  </button>
</div>
        </div>
      </div>
  
      <div v-if="phases.length === 0" class="empty-state">
        <p>No phases defined for this project yet.</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import type { Phase } from '@/types';
  
  interface Props {
    phases: Phase[];
    canManagePhases: boolean;
    getPhaseTaskCount: (phaseId: string) => number;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits<{
    'reorder-phases': [phases: Phase[]];
    'edit-phase': [phase: Phase];
    'delete-phase': [phaseId: string];
    'create-task': [phaseId: string];
  }>();
  
  const draggedItem = ref<Phase | null>(null);
  const dragOverItem = ref<Phase | null>(null);
  
  const handleDragStart = (phase: Phase, event: DragEvent) => {
    if (!props.canManagePhases) {
      event.preventDefault();
      return;
    }
    
    draggedItem.value = phase;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', phase.id);
    }
    setTimeout(() => {
      if (event.target) {
        (event.target as HTMLElement).classList.add('dragging');
      }
    }, 0);
  };
  
  const handleDragEnd = () => {
    draggedItem.value = null;
    dragOverItem.value = null;
  };
  
  const handleDragOver = (phase: Phase, event: DragEvent) => {
    if (!props.canManagePhases || !draggedItem.value) return;
    
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };
  
  const handleDragEnter = (phase: Phase, event: DragEvent) => {
    if (!props.canManagePhases || !draggedItem.value || phase.id === draggedItem.value.id) return;
    
    dragOverItem.value = phase;
  };
  
  const handleDragLeave = () => {
    // Don't clear dragOverItem here to maintain visual feedback during drag
  };
  
  const handleDrop = (targetPhase: Phase, event: DragEvent) => {
    event.preventDefault();
    
    if (!props.canManagePhases || !draggedItem.value || targetPhase.id === draggedItem.value.id) {
      return;
    }
  
    const draggedPhase = draggedItem.value;
    const phasesCopy = [...props.phases];
    
    // Remove dragged item from array
    const draggedIndex = phasesCopy.findIndex(p => p.id === draggedPhase.id);
    phasesCopy.splice(draggedIndex, 1);
    
    // Find target index and insert dragged item
    const targetIndex = phasesCopy.findIndex(p => p.id === targetPhase.id);
    phasesCopy.splice(targetIndex, 0, draggedPhase);
    
    // Update order numbers
    const reorderedPhases = phasesCopy.map((phase, index) => ({
      ...phase,
      order: index + 1
    }));
    
    emit('reorder-phases', reorderedPhases);
    draggedItem.value = null;
    dragOverItem.value = null;
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
  .draggable-phase-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .phase-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.2s;
    border-left: 4px solid #e5e7eb;
    background: white;
    cursor: grab;
  }
  
  .phase-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .phase-item.dragging {
    opacity: 0.5;
    cursor: grabbing;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .phase-item.drag-over {
    border-color: #3b82f6;
    background: #f0f9ff;
    transform: translateY(2px);
  }
  
  .phase-item.status-completed {
    border-left-color: #10b981;
    background: #f0fdf4;
  }
  
  .phase-item.status-in-progress {
    border-left-color: #3b82f6;
    background: #eff6ff;
  }
  
  .phase-item.status-not-started {
    border-left-color: #6b7280;
    background: #f9fafb;
  }
  
  .phase-drag-handle {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    color: #9ca3af;
    cursor: grab;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }
  
  .phase-drag-handle:hover {
    color: #6b7280;
    background: #f3f4f6;
  }
  
  .phase-drag-handle:active {
    cursor: grabbing;
  }
  
  .phase-info {
    flex: 1;
  }
  
  .phase-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }
  
  .phase-header h5 {
    margin: 0;
    color: #1e293b;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .phase-actions {
    display: flex;
    gap: 0.25rem;
  }
  
  .btn-edit,
  .btn-delete {
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
  
  .btn-edit:hover {
    color: #3b82f6;
    background: #f1f5f9;
  }
  
  .btn-delete:hover {
    color: #ef4444;
    background: #fef2f2;
  }
  
  .phase-description {
    margin: 0 0 1rem 0;
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  
  .phase-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  .phase-status {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
    text-transform: capitalize;
    font-size: 0.75rem;
  }
  
  .phase-status.not-started {
    background: #f3f4f6;
    color: #6b7280;
  }
  
  .phase-status.in-progress {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .phase-status.completed {
    background: #dcfce7;
    color: #166534;
  }
  
  .phase-tasks {
    display: flex;
    justify-content: flex-end;
  }
  
  .tasks-count {
    font-size: 0.75rem;
    color: #6b7280;
    background: #f8fafc;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
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
    margin: 0;
  }
  
  /* Disable dragging when not allowed */
  .phase-item:not(.can-drag) {
    cursor: not-allowed;
  }
  
  .phase-item:not(.can-drag) .phase-drag-handle {
    cursor: not-allowed;
    opacity: 0.3;
  }

  .btn-add-task {
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

.btn-add-task:hover {
  color: #10b981;
  background: #f0fdf4;
}

.phase-tasks {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
  </style>