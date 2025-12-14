import { Router } from 'express';
import { DefectController } from './defect.controller';
import { authenticateToken, requirePermissions } from '../../../shared/middleware/auth';

const router: import('express').Router = Router();
const controller = new DefectController();

// 所有接口都需要鉴权
router.use(authenticateToken);

router.get('/', requirePermissions(['defect:read']), controller.getList.bind(controller));
router.get('/active', requirePermissions(['defect:read']), controller.getActiveList.bind(controller));
router.post('/', requirePermissions(['defect:create']), controller.create.bind(controller));
router.put('/:id', requirePermissions(['defect:update']), controller.update.bind(controller));
router.delete('/:id', requirePermissions(['defect:delete']), controller.delete.bind(controller));

export default router;
