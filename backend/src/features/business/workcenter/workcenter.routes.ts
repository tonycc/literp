/**
 * 工作中心路由配置
 */

import { Router } from 'express';
import { workcenterController } from './workcenter.controller';
import { authenticateToken, requirePermissions } from '../../../shared/middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

/**
 * 工作中心管理路由
 */

// 获取工作中心列表
router.get(
  '/',
  requirePermissions(['workcenter:read']),
  workcenterController.getWorkcenters.bind(workcenterController)
);

// 获取工作中心选项
router.get(
  '/options',
  requirePermissions(['workcenter:read']),
  workcenterController.getWorkcenterOptions.bind(workcenterController)
);

// 验证工作中心编码
router.post(
  '/validate-code',
  requirePermissions(['workcenter:create', 'workcenter:update']),
  workcenterController.validateCode.bind(workcenterController)
);

// 创建工作中心
router.post(
  '/',
  requirePermissions(['workcenter:create']),
  workcenterController.createWorkcenter.bind(workcenterController)
);

// 根据ID获取工作中心
router.get(
  '/:id',
  requirePermissions(['workcenter:read']),
  workcenterController.getWorkcenterById.bind(workcenterController)
);

// 更新工作中心
router.put(
  '/:id',
  requirePermissions(['workcenter:update']),
  workcenterController.updateWorkcenter.bind(workcenterController)
);

// 删除工作中心
router.delete(
  '/:id',
  requirePermissions(['workcenter:delete']),
  workcenterController.deleteWorkcenter.bind(workcenterController)
);

// 切换工作中心状态
router.patch(
  '/:id/status',
  requirePermissions(['workcenter:update']),
  workcenterController.toggleWorkcenterStatus.bind(workcenterController)
);

// 根据编码获取工作中心
router.get(
  '/code/:code',
  requirePermissions(['workcenter:read']),
  workcenterController.getWorkcenterByCode.bind(workcenterController)
);

// 更新车间成员
router.put(
  '/:id/members',
  requirePermissions(['workcenter:update']),
  workcenterController.updateTeamMembers.bind(workcenterController)
);

// 获取车间成员
router.get(
  '/:id/members',
  requirePermissions(['workcenter:read']),
  workcenterController.getTeamMembers.bind(workcenterController)
);

// 更新排班信息
router.put(
  '/:id/schedule',
  requirePermissions(['workcenter:update']),
  workcenterController.updateShiftSchedule.bind(workcenterController)
);

// 获取排班信息
router.get(
  '/:id/schedule',
  requirePermissions(['workcenter:read']),
  workcenterController.getShiftSchedule.bind(workcenterController)
);

export default router;