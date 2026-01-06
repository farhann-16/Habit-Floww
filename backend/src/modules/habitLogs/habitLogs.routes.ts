import { Router } from 'express';
import * as habitLogsController from './habitLogs.controller';

const router = Router();

router.get('/', habitLogsController.getHabitLogs);
router.patch('/toggle', habitLogsController.toggleHabitLog);

export const habitLogsRoutes = router;
