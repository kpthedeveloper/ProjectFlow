import { ProjectRepository } from '../repositories/ProjectRepository';
import { Project } from '../types';

export class ProjectService {
  constructor(private projectRepository: ProjectRepository) {}

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepository.findById(id);
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    if (!projectData.name || !projectData.managerId) {
      throw new Error('Name and managerId are required');
    }

    const startDate = new Date(projectData.startDate);
    const endDate = new Date(projectData.endDate);
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    return this.projectRepository.create(projectData);
  }

  async updateProject(id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    const existing = await this.projectRepository.findById(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    if (projectData.startDate && projectData.endDate) {
      const startDate = new Date(projectData.startDate);
      const endDate = new Date(projectData.endDate);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    return this.projectRepository.update(id, projectData);
  }

  async deleteProject(id: string): Promise<boolean> {
    const existing = await this.projectRepository.findById(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    return this.projectRepository.delete(id);
  }

  async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    return this.projectRepository.findByStatus(status);
  }

  async getProjectsByManager(managerId: string): Promise<Project[]> {
    return this.projectRepository.findByManager(managerId);
  }
}