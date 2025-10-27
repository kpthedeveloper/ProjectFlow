import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

// Apply authentication to all project routes
router.use(authenticateToken);

// Basic CRUD routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', requireManagerOrAdmin, projectController.createProject);
router.put('/:id', requireManagerOrAdmin, projectController.updateProject);
router.delete('/:id', requireManagerOrAdmin, projectController.deleteProject);
router.get('/status/:status', projectController.getProjectsByStatus);
router.get('/manager/:managerId', projectController.getProjectsByManager);

export default router;