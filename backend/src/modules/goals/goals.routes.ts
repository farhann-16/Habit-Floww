import { Router } from 'express';
import * as goalController from './goals.controller';

const router = Router();

// Routes (auth is handled by main router)
router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.delete('/:id', goalController.deleteGoal);

router.get('/:id/logs', goalController.getGoalLogs);
router.post('/:id/logs', goalController.addGoalLog);

export default router;
