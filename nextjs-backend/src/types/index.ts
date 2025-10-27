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
  requiresPasswordChange?: boolean;
  
  // Authentication fields
  passwordHash: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  resetToken?: string;
  resetTokenExpires?: string;
  loginAttempts: number;
  lockUntil?: string;
}

// Add new types for password reset
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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
  comments?: Comment[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  user: Omit<User, 'passwordHash' | 'refreshToken'>;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'assignment' | 'task_update' | 'phase_update' | 'project_update' | 'general';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  target_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  targetUrl?: string;
  data?: any;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}