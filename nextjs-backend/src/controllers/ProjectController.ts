import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = await this.projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectData = req.body;
      const project = await this.projectService.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const projectData = req.body;
      const project = await this.projectService.updateProject(id, projectData);
      
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.projectService.deleteProject(id);
      
      if (!success) {
        res.status(404).json({ error: 'Project not found' });
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

  getProjectsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const projects = await this.projectService.getProjectsByStatus(status as any);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getProjectsByManager = async (req: Request, res: Response): Promise<void> => {
    try {
      const { managerId } = req.params;
      const projects = await this.projectService.getProjectsByManager(managerId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}