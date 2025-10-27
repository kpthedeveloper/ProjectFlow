import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { PasswordController } from '../controllers/PasswordController';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const passwordController = new PasswordController(userService);

// Public routes
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', passwordController.forgotPassword);
router.post('/reset-password', passwordController.resetPassword);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/change-password', authenticateToken, passwordController.changePassword);

export default router;