import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';

export class TaskController {
  constructor(private taskService: TaskService) {}

  getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskData = req.body;
      const task = await this.taskService.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const taskData = req.body;
      const task = await this.taskService.updateTask(id, taskData);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.taskService.deleteTask(id);
      
      if (!success) {
        res.status(404).json({ error: 'Task not found' });
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

  getTasksByProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const tasks = await this.taskService.getTasksByProject(projectId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTasksByPhase = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phaseId } = req.params;
      const tasks = await this.taskService.getTasksByPhase(phaseId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTasksByAssignee = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assigneeId } = req.params;
      const tasks = await this.taskService.getTasksByAssignee(assigneeId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTasksByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const tasks = await this.taskService.getTasksByStatus(status as any);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTasksByPriority = async (req: Request, res: Response): Promise<void> => {
    try {
      const { priority } = req.params;
      const tasks = await this.taskService.getTasksByPriority(priority as any);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const task = await this.taskService.updateTaskStatus(id, status);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  updateTaskAssignee = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;
      const task = await this.taskService.updateTaskAssignee(id, assigneeId);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getOverdueTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.getOverdueTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateActualHours = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { actualHours } = req.body;
      const task = await this.taskService.updateActualHours(id, actualHours);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getTaskStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.query;
      const statistics = await this.taskService.getTaskStatistics(
        projectId as string | undefined
      );
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}