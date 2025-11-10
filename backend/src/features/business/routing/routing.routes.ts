/**
 * 工艺路线路由配置
 */

import { Router } from 'express';
import { routingController } from './routing.controller';
import { authenticateToken, requirePermissions } from '../../../shared/middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

/**
 * 工艺路线管理路由
 */

// 获取工艺路线列表
router.get(
  '/',
  requirePermissions(['routing:read']),
  routingController.getRoutings.bind(routingController)
);

// 获取工艺路线选项
router.get(
  '/options',
  requirePermissions(['routing:read']),
  routingController.getRoutingOptions.bind(routingController)
);

// 验证工艺路线编码
router.post(
  '/validate-code',
  requirePermissions(['routing:create', 'routing:update']),
  routingController.validateCode.bind(routingController)
);

// 创建工艺路线
router.post(
  '/',
  requirePermissions(['routing:create']),
  routingController.createRouting.bind(routingController)
);

// 根据ID获取工艺路线
router.get(
  '/:id',
  requirePermissions(['routing:read']),
  routingController.getRoutingById.bind(routingController)
);

// 更新工艺路线
router.put(
  '/:id',
  requirePermissions(['routing:update']),
  routingController.updateRouting.bind(routingController)
);

// 删除工艺路线
router.delete(
  '/:id',
  requirePermissions(['routing:delete']),
  routingController.deleteRouting.bind(routingController)
);

// 切换工艺路线状态
router.patch(
  '/:id/status',
  requirePermissions(['routing:update']),
  routingController.toggleRoutingStatus.bind(routingController)
);

// 根据编码获取工艺路线
router.get(
  '/code/:code',
  requirePermissions(['routing:read']),
  routingController.getRoutingByCode.bind(routingController)
);

// 获取指定工艺路线的工序列表
router.get(
  '/:id/operations',
  requirePermissions(['routing:read']),
  routingController.getRoutingOperations.bind(routingController)
);

export { router as routingRoutes };