import { Request, Response } from 'express';
import { PhaseService } from '../services/PhaseService';

export class PhaseController {
  constructor(private phaseService: PhaseService) {}

  getAllPhases = async (req: Request, res: Response): Promise<void> => {
    try {
      const phases = await this.phaseService.getAllPhases();
      res.json(phases);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getPhaseById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const phase = await this.phaseService.getPhaseById(id);
      
      if (!phase) {
        res.status(404).json({ error: 'Phase not found' });
        return;
      }
      
      res.json(phase);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createPhase = async (req: Request, res: Response): Promise<void> => {
    try {
      const phaseData = req.body;
      const phase = await this.phaseService.createPhase(phaseData);
      res.status(201).json(phase);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  updatePhase = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const phaseData = req.body;
      const phase = await this.phaseService.updatePhase(id, phaseData);
      
      if (!phase) {
        res.status(404).json({ error: 'Phase not found' });
        return;
      }
      
      res.json(phase);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  deletePhase = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.phaseService.deletePhase(id);
      
      if (!success) {
        res.status(404).json({ error: 'Phase not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getPhasesByProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const phases = await this.phaseService.getPhasesByProject(projectId);
      res.json(phases);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getPhasesByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const phases = await this.phaseService.getPhasesByStatus(status as any);
      res.json(phases);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updatePhaseStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const phase = await this.phaseService.updatePhaseStatus(id, status);
      
      if (!phase) {
        res.status(404).json({ error: 'Phase not found' });
        return;
      }
      
      res.json(phase);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getNextOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const nextOrder = await this.phaseService.getNextOrderForProject(projectId);
      res.json({ nextOrder });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  reorderPhases = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { orders } = req.body;
      
      if (!Array.isArray(orders)) {
        res.status(400).json({ error: 'Orders must be an array' });
        return;
      }

      const phases = await this.phaseService.reorderPhases(projectId, orders);
      res.json(phases);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}