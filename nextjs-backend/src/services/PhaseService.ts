import { PhaseRepository } from '../repositories/PhaseRepository';
import { Phase } from '../types';

export class PhaseService {
  constructor(private phaseRepository: PhaseRepository) {}

  async getAllPhases(): Promise<Phase[]> {
    return this.phaseRepository.findAll();
  }

  async getPhaseById(id: string): Promise<Phase | null> {
    return this.phaseRepository.findById(id);
  }

  async createPhase(phaseData: Omit<Phase, 'id'>): Promise<Phase> {
    // Validate required fields
    if (!phaseData.name || !phaseData.projectId) {
      throw new Error('Name and projectId are required');
    }

    // Validate dates
    const startDate = new Date(phaseData.startDate);
    const endDate = new Date(phaseData.endDate);
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    // Validate order (should be positive)
    if (phaseData.order < 1) {
      throw new Error('Order must be a positive number');
    }

    // Validate status
    const validStatuses: Phase['status'][] = ['not-started', 'in-progress', 'completed'];
    if (!validStatuses.includes(phaseData.status)) {
      throw new Error('Invalid status');
    }

    return this.phaseRepository.create(phaseData);
  }

  async updatePhase(id: string, phaseData: Partial<Phase>): Promise<Phase | null> {
    const existing = await this.phaseRepository.findById(id);
    if (!existing) {
      throw new Error('Phase not found');
    }

    // Validate dates if provided
    if (phaseData.startDate && phaseData.endDate) {
      const startDate = new Date(phaseData.startDate);
      const endDate = new Date(phaseData.endDate);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    return this.phaseRepository.update(id, phaseData);
  }

  async deletePhase(id: string): Promise<boolean> {
    const existing = await this.phaseRepository.findById(id);
    if (!existing) {
      throw new Error('Phase not found');
    }

    return this.phaseRepository.delete(id);
  }

  async getPhasesByProject(projectId: string): Promise<Phase[]> {
    return this.phaseRepository.findByProjectId(projectId);
  }

  async getPhasesByStatus(status: Phase['status']): Promise<Phase[]> {
    return this.phaseRepository.findByStatus(status);
  }

  async updatePhaseStatus(id: string, status: Phase['status']): Promise<Phase | null> {
    const existing = await this.phaseRepository.findById(id);
    if (!existing) {
      throw new Error('Phase not found');
    }

    return this.phaseRepository.updateStatus(id, status);
  }

  async getNextOrderForProject(projectId: string): Promise<number> {
    return this.phaseRepository.getNextOrder(projectId);
  }

  async reorderPhases(projectId: string, phaseOrders: { phaseId: string; order: number }[]): Promise<Phase[]> {
    const updates: Promise<Phase | null>[] = [];
    
    for (const { phaseId, order } of phaseOrders) {
      updates.push(this.phaseRepository.update(phaseId, { order }));
    }

    const results = await Promise.all(updates);
    const updatedPhases = results.filter(phase => phase !== null) as Phase[];
    
    return this.phaseRepository.findByProjectId(projectId);
  }
}