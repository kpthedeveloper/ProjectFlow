import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Apply authentication to all user routes
router.use(authenticateToken);

// Basic CRUD routes
router.get('/', requireAdmin, userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', requireAdmin, userController.createUser);
router.put('/:id', userController.updateUser); // Users can update their own profile
router.delete('/:id', requireAdmin, userController.deleteUser);

// User-specific routes
router.get('/email/:email', userController.getUserByEmail);
router.get('/role/:role', requireAdmin, userController.getUsersByRole);
router.patch('/:id/deactivate', requireAdmin, userController.deactivateUser);
router.patch('/:id/activate', requireAdmin, userController.activateUser);

export default router;