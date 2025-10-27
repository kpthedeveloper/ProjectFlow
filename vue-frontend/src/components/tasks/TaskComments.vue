<!-- components/tasks/TaskComments.vue -->
<template>
  <div class="task-comments">
    <div class="comments-header">
      <h4>Comments</h4>
      <button @click="$emit('close')" class="btn-close" title="Close comments">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="comments-list" ref="commentsList">
      <div v-if="loading" class="loading-comments">
        <p>Loading comments...</p>
      </div>
      
      <div 
        v-else
        v-for="taskComment in comments" 
        :key="taskComment.id" 
        class="comment-item"
      >
        <div class="comment-header">
          <div class="comment-author">
            <div class="author-avatar">
              {{ getCommentAuthor(taskComment.userId)?.name?.split(' ').map(n => n[0]).join('') || 'U' }}
            </div>
            <div class="author-info">
              <span class="author-name">{{ getCommentAuthor(taskComment.userId)?.name || 'Unknown User' }}</span>
              <span class="comment-date">{{ formatDate(taskComment.createdAt) }}</span>
            </div>
          </div>
          <button 
            v-if="canDeleteComment(taskComment)" 
            @click="handleDeleteComment(taskComment.id)" 
            class="btn-delete-comment"
            title="Delete comment"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <div class="comment-content">
          {{ taskComment.content }}
        </div>
      </div>

      <div v-if="!loading && comments.length === 0" class="no-comments">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    </div>

    <div class="add-comment">
      <textarea
        v-model="newComment"
        placeholder="Add a comment..."
        rows="3"
        @keydown.ctrl.enter="addNewComment"
      ></textarea>
      <div class="comment-actions">
        <small class="helper-text">Press Ctrl+Enter to submit</small>
        <button 
          @click="addNewComment" 
          :disabled="!newComment.trim() || addingComment" 
          class="btn-primary"
        >
          {{ addingComment ? 'Adding...' : 'Add Comment' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useProjectsStore } from '@/stores/projects';
import { useUsersStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import type { TaskComment } from '@/types';

interface Props {
  taskId: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const projectsStore = useProjectsStore();
const usersStore = useUsersStore();
const authStore = useAuthStore();

const newComment = ref('');
const commentsList = ref<HTMLElement>();
const loading = ref(false);
const addingComment = ref(false);
const comments = ref<TaskComment[]>([]);

const getCommentAuthor = (userId: string) => {
  return usersStore.users.find(user => user.id === userId);
};

const canDeleteComment = (comment: TaskComment) => {
  const user = authStore.user;
  return user?.id === comment.userId || user?.role === 'admin';
};

const addNewComment = async () => {
  if (!newComment.value.trim() || addingComment.value) return;

  const user = authStore.user;
  if (!user) return;

  addingComment.value = true;
  try {
    await projectsStore.addComment({
      taskId: props.taskId,
      userId: user.id,
      content: newComment.value.trim()
    });

    newComment.value = '';
    
    // Refresh comments after adding
    await loadComments();
    
    // Scroll to bottom after adding comment
    await nextTick();
    if (commentsList.value) {
      commentsList.value.scrollTop = commentsList.value.scrollHeight;
    }
  } catch (error) {
    console.error('Failed to add comment:', error);
  } finally {
    addingComment.value = false;
  }
};

const handleDeleteComment = async (commentId: string) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    try {
      await projectsStore.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const loadComments = async () => {
  loading.value = true;
  try {
    const fetchedComments = await projectsStore.getTaskComments(props.taskId);
    comments.value = fetchedComments;
  } catch (error) {
    console.error('Failed to load comments:', error);
    comments.value = [];
  } finally {
    loading.value = false;
  }
};

// Auto-scroll to bottom when comments change
watch(comments, async () => {
  await nextTick();
  if (commentsList.value) {
    commentsList.value.scrollTop = commentsList.value.scrollHeight;
  }
});

// Load comments when component mounts
onMounted(() => {
  loadComments();
});

// Reload comments when taskId changes
watch(() => props.taskId, () => {
  loadComments();
});
</script>

<style scoped>
.task-comments {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: white;
  border-radius: 0.5rem;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 0.5rem 0.5rem 0 0;
}

.comments-header h4 {
  margin: 0;
  color: #1e293b;
}

.btn-close {
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

.btn-close:hover {
  color: #ef4444;
  background: #fef2f2;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-comments {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.comment-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fafafa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
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
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #64748b;
}

.btn-delete-comment {
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
  opacity: 0;
}

.comment-item:hover .btn-delete-comment {
  opacity: 1;
}

.btn-delete-comment:hover {
  color: #ef4444;
  background: #fef2f2;
}

.comment-content {
  color: #374151;
  line-height: 1.5;
  white-space: pre-wrap;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-comments p {
  margin: 0;
  font-style: italic;
}

.add-comment {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 0 0 0.5rem 0.5rem;
}

.add-comment textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 60px;
}

.add-comment textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.helper-text {
  color: #6b7280;
  font-size: 0.75rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background: #2563eb;
}
</style>