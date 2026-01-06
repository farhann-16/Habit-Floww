import { Router } from 'express';
import * as calendarController from './calendar.controller';

const router = Router();

router.get('/week', calendarController.getWeeklyCalendar);
router.get('/month', calendarController.getMonthlyCalendar);

export const calendarRoutes = router;
