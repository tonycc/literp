/**
 * 工序路由配置
 */

import { Router } from 'express';
import { operationController } from './operation.controller';
import { authenticateToken, requirePermissions } from '../../../shared/middleware/auth';

const router: import('express').Router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

/**
 * 工序管理路由
 */

// 获取工序列表
router.get(
  '/',
  requirePermissions(['operation:read']),
  operationController.getOperations.bind(operationController)
);

// 获取工序选项
router.get(
  '/options',
  requirePermissions(['operation:read']),
  operationController.getOperationOptions.bind(operationController)
);

// 获取工序统计信息
router.get(
  '/stats',
  requirePermissions(['operation:read']),
  operationController.getOperationStats.bind(operationController)
);

// 验证工序编码
router.post(
  '/validate-code',
  requirePermissions(['operation:create', 'operation:update']),
  operationController.validateCode.bind(operationController)
);

// 验证工序名称
router.post(
  '/validate-name',
  requirePermissions(['operation:create', 'operation:update']),
  operationController.validateName.bind(operationController)
);

// 批量操作工序
router.post(
  '/batch',
  requirePermissions(['operation:update', 'operation:delete']),
  operationController.batchOperation.bind(operationController)
);

// 创建工序
router.post(
  '/',
  requirePermissions(['operation:create']),
  operationController.createOperation.bind(operationController)
);

// 根据ID获取工序
router.get(
  '/:id',
  requirePermissions(['operation:read']),
  operationController.getOperationById.bind(operationController)
);

// 更新工序
router.put(
  '/:id',
  requirePermissions(['operation:update']),
  operationController.updateOperation.bind(operationController)
);

// 删除工序
router.delete(
  '/:id',
  requirePermissions(['operation:delete']),
  operationController.deleteOperation.bind(operationController)
);

// 切换工序状态
router.patch(
  '/:id/status',
  requirePermissions(['operation:update']),
  operationController.toggleOperationStatus.bind(operationController)
);

// 根据编码获取工序
router.get(
  '/code/:code',
  requirePermissions(['operation:read']),
  operationController.getOperationByCode.bind(operationController)
);

export { router as operationRoutes };