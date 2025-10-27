import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project, Phase, Task, TaskComment } from '@/types';
import { useAuthStore } from './auth';
import { projectAPI, phaseAPI, taskAPI, commentAPI } from '@/services/api';

type CreateCommentData = Omit<TaskComment, 'id' | 'createdAt' | 'updatedAt'>;

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([]);
  const phases = ref<Phase[]>([]);
  const tasks = ref<Task[]>([]);
  const comments = ref<TaskComment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const userProjects = computed(() => {
    const authStore = useAuthStore();
    if (authStore.user?.role === 'admin') {
      return projects.value;
    }
    return projects.value.filter(project =>
      project.managerId === authStore.user?.id ||
      tasks.value.some(task => task.assigneeId === authStore.user?.id && task.projectId === project.id)
    );
  });

  // Project Actions
  const fetchProjects = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await projectAPI.getProjects();
      projects.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch projects';
      console.error('Error fetching projects:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await projectAPI.createProject(projectData);
      projects.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create project';
      console.error('Error creating project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await projectAPI.updateProject(projectId, updates);
      const projectIndex = projects.value.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        projects.value[projectIndex] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update project';
      console.error('Error updating project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProject = async (projectId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await projectAPI.deleteProject(projectId);
      const projectIndex = projects.value.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        projects.value.splice(projectIndex, 1);
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete project';
      console.error('Error deleting project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Phase Actions
  const fetchPhasesByProject = async (projectId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await phaseAPI.getPhasesByProject(projectId);
      phases.value = phases.value.filter(phase => phase.projectId !== projectId);
      phases.value.push(...response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch phases';
      console.error('Error fetching phases:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPhase = async (phaseData: Omit<Phase, 'id'>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await phaseAPI.createPhase(phaseData);
      phases.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create phase';
      console.error('Error creating phase:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePhase = async (phaseId: string, updates: Partial<Phase>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await phaseAPI.updatePhase(phaseId, updates);
      const phaseIndex = phases.value.findIndex(p => p.id === phaseId);
      if (phaseIndex !== -1) {
        phases.value[phaseIndex] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update phase';
      console.error('Error updating phase:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePhase = async (phaseId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await phaseAPI.deletePhase(phaseId);
      const phaseIndex = phases.value.findIndex(p => p.id === phaseId);
      if (phaseIndex !== -1) {
        phases.value.splice(phaseIndex, 1);
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete phase';
      console.error('Error deleting phase:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reorderPhases = async (reorderedPhases: Phase[]) => {
    loading.value = true;
    error.value = null;
    try {
      const projectId = reorderedPhases[0]?.projectId;
      if (!projectId) {
        throw new Error('Project ID is required for reordering');
      }

      const orders = reorderedPhases.map((phase, index) => ({
        phaseId: phase.id,
        order: index + 1
      }));

      const response = await phaseAPI.reorderPhases(projectId, orders);
      
      phases.value = phases.value.filter(phase => phase.projectId !== projectId);
      phases.value.push(...response.data);
      
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to reorder phases';
      console.error('Error reordering phases:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getNextOrderForProject = async (projectId: string): Promise<number> => {
    try {
      const response = await phaseAPI.getNextOrder(projectId);
      return response.data.nextOrder;
    } catch (err: any) {
      console.error('Error getting next order:', err);
      const projectPhases = phases.value.filter(phase => phase.projectId === projectId);
      return projectPhases.length === 0 ? 1 : Math.max(...projectPhases.map(phase => phase.order)) + 1;
    }
  };

  // Task Actions
  const fetchTasksByProject = async (projectId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await taskAPI.getTasksByProject(projectId);
      tasks.value = tasks.value.filter(task => task.projectId !== projectId);
      tasks.value.push(...response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch tasks';
      console.error('Error fetching tasks:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTasksByPhase = async (phaseId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await taskAPI.getTasksByPhase(phaseId);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch phase tasks';
      console.error('Error fetching phase tasks:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await taskAPI.createTask(taskData);
      tasks.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create task';
      console.error('Error creating task:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await taskAPI.updateTask(taskId, updates);
      const taskIndex = tasks.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update task';
      console.error('Error updating task:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await taskAPI.updateTaskStatus(taskId, status);
      const taskIndex = tasks.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update task status';
      console.error('Error updating task status:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTask = async (taskId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await taskAPI.deleteTask(taskId);
      const taskIndex = tasks.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks.value.splice(taskIndex, 1);
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete task';
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Comment Actions
  const fetchCommentsByTask = async (taskId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await commentAPI.getCommentsByTask(taskId);
      comments.value = comments.value.filter(comment => comment.taskId !== taskId);
      comments.value.push(...response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch comments';
      console.error('Error fetching comments:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addComment = async (commentData: CreateCommentData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await commentAPI.createComment(commentData);
      comments.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create comment';
      console.error('Error creating comment:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await commentAPI.updateComment(commentId, { content });
      const commentIndex = comments.value.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        comments.value[commentIndex] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update comment';
      console.error('Error updating comment:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteComment = async (commentId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await commentAPI.deleteComment(commentId);
      const commentIndex = comments.value.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        comments.value.splice(commentIndex, 1);
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete comment';
      console.error('Error deleting comment:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getTaskComments = async (taskId: string) => {
    try {
      const response = await commentAPI.getCommentsByTask(taskId);
      comments.value = comments.value.filter(comment => comment.taskId !== taskId);
      comments.value.push(...response.data);
      return response.data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (err: any) {
      console.error('Error fetching task comments:', err);
      return comments.value
        .filter(comment => comment.taskId === taskId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  };

  const getCommentCountByTask = async (taskId: string): Promise<number> => {
    try {
      const response = await commentAPI.getCommentCountByTask(taskId);
      return response.data.count;
    } catch (err: any) {
      console.error('Error fetching comment count:', err);
      return comments.value.filter(comment => comment.taskId === taskId).length;
    }
  };

  // Initialize store
  const initializeStore = async () => {
    try {
      await fetchProjects();
      
      // Fetch phases and tasks for each project
      for (const project of projects.value) {
        await fetchPhasesByProject(project.id);
        await fetchTasksByProject(project.id);
      }
    } catch (error) {
      console.error('Error initializing store:', error);
    }
  };

  return {
    // State
    projects,
    phases,
    tasks,
    comments,
    loading,
    error,
    
    // Getters
    userProjects,
    
    // Project Actions
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    initializeStore,
    
    // Phase Actions
    fetchPhasesByProject,
    createPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
    getNextOrderForProject,
    
    // Task Actions
    fetchTasksByProject,
    fetchTasksByPhase,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    
    // Comment Actions
    fetchCommentsByTask,
    addComment,
    updateComment,
    deleteComment,
    getTaskComments,
    getCommentCountByTask,
  };
});