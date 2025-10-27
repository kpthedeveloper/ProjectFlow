import axios from 'axios';
import type { Phase, Project, Task, User, TaskComment, LoginRequest, AppNotification,CreateNotificationRequest } from '@/types';

const API_BASE_URL = 'http://localhost:60000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't redirect for logout endpoint
    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/logout')) {
      // Token expired or invalid
      const authStore = await import('@/stores/auth');
      authStore.useAuthStore().logout();
      
      // Redirect to login if we're not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const userAPI = {
  login: (credentials: LoginRequest) => api.post<{ user: User; message: string }>('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<{ user: User }>('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', data),
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
  verifyResetToken: (token: string) => 
    api.post('/auth/verify-reset-token', { token }),
};

// User Management API methods
export const usersAPI = {
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => 
    api.post<User>('/users', userData),
  updateUser: (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) => 
    api.put<User>(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  toggleUserStatus: (id: string, isActive: boolean) =>
    api.patch<User>(`/users/${id}/${isActive ? 'activate' : 'deactivate'}`),
  getUserByEmail: (email: string) => api.get<User>(`/users/email/${email}`),
  getUsersByRole: (role: string) => api.get<User[]>(`/users/role/${role}`),
  
  // REMOVED DUPLICATE AUTH METHODS FROM HERE
};

// Project API methods
export const projectAPI = {
  getProjects: () => api.get<Project[]>('/projects'),
  getProject: (id: string) => api.get<Project>(`/projects/${id}`),
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Project>('/projects', projectData),
  updateProject: (id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt'>>) => 
    api.put<Project>(`/projects/${id}`, projectData),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  getProjectsByStatus: (status: Project['status']) => 
    api.get<Project[]>(`/projects/status/${status}`),
  getProjectsByManager: (managerId: string) => 
    api.get<Project[]>(`/projects/manager/${managerId}`),
};

// Phase API methods
export const phaseAPI = {
  getPhases: () => api.get<Phase[]>('/phases'),
  getPhase: (id: string) => api.get<Phase>(`/phases/${id}`),
  createPhase: (phaseData: Omit<Phase, 'id'>) => 
    api.post<Phase>('/phases', phaseData),
  updatePhase: (id: string, phaseData: Partial<Phase>) => 
    api.put<Phase>(`/phases/${id}`, phaseData),
  deletePhase: (id: string) => api.delete(`/phases/${id}`),
  getPhasesByProject: (projectId: string) => 
    api.get<Phase[]>(`/phases/project/${projectId}`),
  getPhasesByStatus: (status: Phase['status']) => 
    api.get<Phase[]>(`/phases/status/${status}`),
  updatePhaseStatus: (id: string, status: Phase['status']) => 
    api.patch<Phase>(`/phases/${id}/status`, { status }),
  getNextOrder: (projectId: string) => 
    api.get<{ nextOrder: number }>(`/phases/project/${projectId}/next-order`),
  reorderPhases: (projectId: string, orders: { phaseId: string; order: number }[]) => 
    api.patch<Phase[]>(`/phases/project/${projectId}/reorder`, { orders }),
};

// Task API methods
export const taskAPI = {
  getTasks: () => api.get<Task[]>('/tasks'),
  getTask: (id: string) => api.get<Task>(`/tasks/${id}`),
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Task>('/tasks', taskData),
  updateTask: (id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>) => 
    api.put<Task>(`/tasks/${id}`, taskData),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  getTasksByProject: (projectId: string) => 
    api.get<Task[]>(`/tasks/project/${projectId}`),
  getTasksByPhase: (phaseId: string) => 
    api.get<Task[]>(`/tasks/phase/${phaseId}`),
  getTasksByAssignee: (assigneeId: string) => 
    api.get<Task[]>(`/tasks/assignee/${assigneeId}`),
  getTasksByStatus: (status: Task['status']) => 
    api.get<Task[]>(`/tasks/status/${status}`),
  getTasksByPriority: (priority: Task['priority']) => 
    api.get<Task[]>(`/tasks/priority/${priority}`),
  updateTaskStatus: (id: string, status: Task['status']) => 
    api.patch<Task>(`/tasks/${id}/status`, { status }),
  updateTaskAssignee: (id: string, assigneeId: string) => 
    api.patch<Task>(`/tasks/${id}/assignee`, { assigneeId }),
  updateActualHours: (id: string, actualHours: number) => 
    api.patch<Task>(`/tasks/${id}/actual-hours`, { actualHours }),
  getOverdueTasks: () => api.get<Task[]>('/tasks/overdue/all'),
  getTaskStatistics: (projectId?: string) => 
    api.get<any>(`/tasks/statistics/summary${projectId ? `?projectId=${projectId}` : ''}`),
};

// Comment API methods
export const commentAPI = {
  getComments: () => api.get<TaskComment[]>('/comments'),
  getComment: (id: string) => api.get<TaskComment>(`/comments/${id}`),
  createComment: (commentData: Omit<TaskComment, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<TaskComment>('/comments', commentData),
  updateComment: (id: string, commentData: Partial<Omit<TaskComment, 'id' | 'createdAt'>>) => 
    api.put<TaskComment>(`/comments/${id}`, commentData),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  getCommentsByTask: (taskId: string) => 
    api.get<TaskComment[]>(`/comments/task/${taskId}`),
  getCommentsByUser: (userId: string) => 
    api.get<TaskComment[]>(`/comments/user/${userId}`),
  getCommentCountByTask: (taskId: string) => 
    api.get<{ taskId: string; count: number }>(`/comments/task/${taskId}/count`),
  getRecentComments: (limit?: number) => 
    api.get<TaskComment[]>(`/comments/recent/all${limit ? `?limit=${limit}` : ''}`),
  deleteCommentsByTask: (taskId: string) => 
    api.delete<{ deletedCount: number; message: string }>(`/comments/task/${taskId}/all`),
};

// Notification API methods
export const notificationsAPI = {
  getNotifications: () => api.get<AppNotification[]>('/notifications'), // CHANGED
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread/count'),
  markAsRead: (notificationIds: string[]) => 
    api.patch('/notifications/mark-read', { notificationIds }),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  createNotification: (notificationData: CreateNotificationRequest) => // FIXED
    api.post<AppNotification>('/notifications', notificationData), // CHANGED
};

export default api;