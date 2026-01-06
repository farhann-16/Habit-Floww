import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router();

router.get('/summary', analyticsController.getAnalyticsSummary);
router.get('/habits', analyticsController.getAnalyticsHabits);
router.get('/trends', analyticsController.getAnalyticsTrends);

export const analyticsRoutes = router;
