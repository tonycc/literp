import { Router } from 'express';
import { WarehouseController } from './warehouse.controller';
import { authenticateToken, requireRoles } from '../../../shared/middleware';

const router = Router();
const warehouseController = new WarehouseController();

// 应用认证中间件到所有路由
router.use(authenticateToken);

/**
 * @route GET /api/warehouses/options
 * @desc 获取仓库选项列表（用于下拉选择）
 * @access Private
 */
router.get(
  '/options',
  warehouseController.getWarehouseOptions
);

/**
 * @route GET /api/warehouses/types
 * @desc 获取仓库类型列表
 * @access Private
 */
router.get(
  '/types',
  warehouseController.getWarehouseTypes
);

/**
 * @route GET /api/warehouses
 * @desc 获取仓库列表
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/',
  requireRoles(['系统管理员']),
  warehouseController.getWarehouses
);

/**
 * @route GET /api/warehouses/:id
 * @desc 获取仓库详情
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/:id',
  requireRoles(['系统管理员']),
  warehouseController.getWarehouseById
);

/**
 * @route POST /api/warehouses
 * @desc 创建仓库
 * @access Private (需要系统管理员权限)
 */
router.post(
  '/',
  requireRoles(['系统管理员']),
  warehouseController.createWarehouse
);

/**
 * @route PUT /api/warehouses/:id
 * @desc 更新仓库
 * @access Private (需要系统管理员权限)
 */
router.put(
  '/:id',
  requireRoles(['系统管理员']),
  warehouseController.updateWarehouse
);

/**
 * @route DELETE /api/warehouses/:id
 * @desc 删除仓库
 * @access Private (需要系统管理员权限)
 */
router.delete(
  '/:id',
  requireRoles(['系统管理员']),
  warehouseController.deleteWarehouse
);

export default router;