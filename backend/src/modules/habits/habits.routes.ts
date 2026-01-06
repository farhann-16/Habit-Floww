import { Router } from 'express';
import * as habitsController from './habits.controller';

const router = Router();

router.get('/', habitsController.getHabits);
router.post('/', habitsController.createHabit);
router.put('/:id', habitsController.updateHabit);
router.delete('/:id', habitsController.deleteHabit);

export const habitsRoutes = router;
