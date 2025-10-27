// types/index.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  department?: string;
  position?: string;
  requiresPasswordChange?: boolean; // ADDED
}
  
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface Task {
  id: string;
  phaseId: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId: string;
  reporterId: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[]; // Add comments array
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'mention' | 'assignment' | 'task_update' | 'phase_update' | 'project_update' | 'general';
  title: string;
  message: string;
  read: boolean;
  data?: any; // Additional data like taskId, projectId, etc.
  targetUrl?: string; // ADD THIS LINE
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: AppNotification['type'];
  title: string;
  message: string;
  targetUrl?: string; // ADD THIS LINE
  data?: any;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}