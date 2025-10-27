import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { CommentService } from '../services/CommentService';
import { CommentRepository } from '../repositories/CommentRepository';
import { authenticateToken, requireAnyAuthenticated } from '../middleware/auth';

const router = Router();

const commentRepository = new CommentRepository();
const commentService = new CommentService(commentRepository);
const commentController = new CommentController(commentService);

// Apply authentication to all comment routes
router.use(authenticateToken);

// Basic CRUD routes
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getCommentById);
router.post('/', requireAnyAuthenticated, commentController.createComment);
router.put('/:id', requireAnyAuthenticated, commentController.updateComment);
router.delete('/:id', requireAnyAuthenticated, commentController.deleteComment);

// Comment-specific routes
router.get('/task/:taskId', commentController.getCommentsByTask);
router.get('/user/:userId', commentController.getCommentsByUser);
router.get('/date-range/all', commentController.getCommentsByDateRange);
router.get('/task/:taskId/count', commentController.getCommentCountByTask);
router.get('/recent/all', commentController.getRecentComments);

// Bulk operations
router.delete('/task/:taskId/all', requireAnyAuthenticated, commentController.deleteCommentsByTask);

export default router;