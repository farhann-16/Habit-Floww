import { Router } from 'express';
import { firebaseAuth } from './middleware/firebaseAuth';
import { habitsRoutes } from './modules/habits/habits.routes';
import { habitLogsRoutes } from './modules/habitLogs/habitLogs.routes';
import { calendarRoutes } from './modules/calendar/calendar.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';
import { exportRoutes } from './modules/export/export.routes';
import { supportRoutes } from './modules/support/support.routes';
import goalsRoutes from './modules/goals/goals.routes';

const router = Router();

// Apply auth middleware to all API routes
router.use(firebaseAuth);

router.use('/habits', habitsRoutes);
router.use('/habit-logs', habitLogsRoutes);
router.use('/calendar', calendarRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);
router.use('/support', supportRoutes);
router.use('/goals', goalsRoutes);

// Placeholder for routes
router.get('/test-auth', (req, res) => {
    res.json({ message: 'Authenticated', user: req.user });
});

export const routes = router;
