import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { productionPlanController } from './production-plan.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticateToken);

// 生产计划预览
router.post('/preview', productionPlanController.preview.bind(productionPlanController));

export { router as productionPlanRoutes };