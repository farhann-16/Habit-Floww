import { Router } from 'express';
import * as exportController from './export.controller';

const router = Router();

router.get('/csv', exportController.exportCsv);

export const exportRoutes = router;
