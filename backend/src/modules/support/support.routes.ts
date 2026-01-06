import { Router } from 'express';
import * as supportController from './support.controller';

const router = Router();

router.post('/contact', supportController.sendSupportMessage);

export const supportRoutes = router;
