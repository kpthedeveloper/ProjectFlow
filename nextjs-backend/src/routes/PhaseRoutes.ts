import { Router } from 'express';
import { PhaseController } from '../controllers/PhaseController';
import { PhaseService } from '../services/PhaseService';
import { PhaseRepository } from '../repositories/PhaseRepository';
import { authenticateToken, requireAnyAuthenticated } from '../middleware/auth';

const router = Router();

const phaseRepository = new PhaseRepository();
const phaseService = new PhaseService(phaseRepository);
const phaseController = new PhaseController(phaseService);

// Apply authentication to all phase routes
router.use(authenticateToken);

// Basic CRUD routes
router.get('/', phaseController.getAllPhases);
router.get('/:id', phaseController.getPhaseById);
router.post('/', requireAnyAuthenticated, phaseController.createPhase);
router.put('/:id', requireAnyAuthenticated, phaseController.updatePhase);
router.delete('/:id', requireAnyAuthenticated, phaseController.deletePhase);

// Phase-specific routes
router.get('/project/:projectId', phaseController.getPhasesByProject);
router.get('/status/:status', phaseController.getPhasesByStatus);
router.patch('/:id/status', requireAnyAuthenticated, phaseController.updatePhaseStatus);
router.get('/project/:projectId/next-order', phaseController.getNextOrder);
router.patch('/project/:projectId/reorder', requireAnyAuthenticated, phaseController.reorderPhases);

export default router;