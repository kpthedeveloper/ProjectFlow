import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { TaskService } from '../services/TaskService';
import { TaskRepository } from '../repositories/TaskRepository';
import { authenticateToken, requireAnyAuthenticated } from '../middleware/auth';

const router = Router();

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

// Apply authentication to all task routes
router.use(authenticateToken);

// Basic CRUD routes
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', requireAnyAuthenticated, taskController.createTask);
router.put('/:id', requireAnyAuthenticated, taskController.updateTask);
router.delete('/:id', requireAnyAuthenticated, taskController.deleteTask);

// Task-specific routes
router.get('/project/:projectId', taskController.getTasksByProject);
router.get('/phase/:phaseId', taskController.getTasksByPhase);
router.get('/assignee/:assigneeId', taskController.getTasksByAssignee);
router.get('/status/:status', taskController.getTasksByStatus);
router.get('/priority/:priority', taskController.getTasksByPriority);
router.get('/overdue/all', taskController.getOverdueTasks);
router.get('/statistics/summary', taskController.getTaskStatistics);

// Update operations
router.patch('/:id/status', requireAnyAuthenticated, taskController.updateTaskStatus);
router.patch('/:id/assignee', requireAnyAuthenticated, taskController.updateTaskAssignee);
router.patch('/:id/actual-hours', requireAnyAuthenticated, taskController.updateActualHours);

export default router;