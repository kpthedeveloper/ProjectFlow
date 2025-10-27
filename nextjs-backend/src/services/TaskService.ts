import { TaskRepository } from '../repositories/TaskRepository';
import { Task } from '../types';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    // Validate required fields
    if (!taskData.title || !taskData.projectId || !taskData.phaseId) {
      throw new Error('Title, projectId, and phaseId are required');
    }

    // Validate dates
    const dueDate = new Date(taskData.dueDate);
    if (dueDate <= new Date()) {
      throw new Error('Due date must be in the future');
    }

    // Validate status
    const validStatuses: Task['status'][] = ['todo', 'in-progress', 'review', 'completed'];
    if (!validStatuses.includes(taskData.status)) {
      throw new Error('Invalid status');
    }

    // Validate priority
    const validPriorities: Task['priority'][] = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(taskData.priority)) {
      throw new Error('Invalid priority');
    }

    // Validate estimated hours
    if (taskData.estimatedHours <= 0) {
      throw new Error('Estimated hours must be positive');
    }

    return this.taskRepository.create(taskData);
  }

  async updateTask(id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new Error('Task not found');
    }

    // Validate due date if provided
    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      if (dueDate <= new Date()) {
        throw new Error('Due date must be in the future');
      }
    }

    // Validate estimated hours if provided
    if (taskData.estimatedHours && taskData.estimatedHours <= 0) {
      throw new Error('Estimated hours must be positive');
    }

    return this.taskRepository.update(id, taskData);
  }

  async deleteTask(id: string): Promise<boolean> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new Error('Task not found');
    }

    return this.taskRepository.delete(id);
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.taskRepository.findByProjectId(projectId);
  }

  async getTasksByPhase(phaseId: string): Promise<Task[]> {
    return this.taskRepository.findByPhaseId(phaseId);
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return this.taskRepository.findByAssignee(assigneeId);
  }

  async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    return this.taskRepository.findByStatus(status);
  }

  async getTasksByPriority(priority: Task['priority']): Promise<Task[]> {
    return this.taskRepository.findByPriority(priority);
  }

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task | null> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new Error('Task not found');
    }

    return this.taskRepository.updateStatus(id, status);
  }

  async updateTaskAssignee(id: string, assigneeId: string): Promise<Task | null> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new Error('Task not found');
    }

    return this.taskRepository.updateAssignee(id, assigneeId);
  }

  async getOverdueTasks(): Promise<Task[]> {
    return this.taskRepository.getOverdueTasks();
  }

  async updateActualHours(id: string, actualHours: number): Promise<Task | null> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new Error('Task not found');
    }

    if (actualHours < 0) {
      throw new Error('Actual hours cannot be negative');
    }

    return this.taskRepository.update(id, { actualHours });
  }

  async getTaskStatistics(projectId?: string): Promise<{
    total: number;
    byStatus: Record<Task['status'], number>;
    byPriority: Record<Task['priority'], number>;
    totalEstimatedHours: number;
    totalActualHours: number;
  }> {
    let tasks = await this.getAllTasks();
    
    if (projectId) {
      tasks = tasks.filter(task => task.projectId === projectId);
    }

    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Task['status'], number>);

    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Task['priority'], number>);

    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      totalEstimatedHours,
      totalActualHours,
    };
  }
}