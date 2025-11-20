import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { productionPlanController } from './production-plan.controller';

const router: import('express').Router = Router();

// 所有路由需要认证
router.use(authenticateToken);

// 生产计划预览
router.post('/preview', productionPlanController.preview.bind(productionPlanController));
// 新增生产计划
router.post('/', productionPlanController.create.bind(productionPlanController));
// 生产计划列表
router.get('/', productionPlanController.list.bind(productionPlanController));
// 获取生产计划详情
router.get('/:id', productionPlanController.getById.bind(productionPlanController));
// 确认/取消
router.post('/:id/confirm', productionPlanController.confirm.bind(productionPlanController));
router.post('/:id/cancel', productionPlanController.cancel.bind(productionPlanController));
router.post('/:id/generate-manufacturing-orders', productionPlanController.generateManufacturingOrders.bind(productionPlanController));
// 删除生产计划
router.delete('/:id', productionPlanController.remove.bind(productionPlanController));

export { router as productionPlanRoutes };