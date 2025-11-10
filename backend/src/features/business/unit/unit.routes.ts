import { Router } from 'express';
import { UnitController } from './unit.controller';
import { authenticateToken, requireRoles } from '../../../shared/middleware';

const router = Router();
const unitController = new UnitController();

// 应用认证中间件到所有路由
router.use(authenticateToken);

/**
 * @route GET /api/units/options
 * @desc 获取单位选项列表（用于下拉选择）
 * @access Private
 */
router.get(
  '/options',
  unitController.getUnitOptions
);

/**
 * @route GET /api/units/categories
 * @desc 获取单位分类列表
 * @access Private
 */
router.get(
  '/categories',
  unitController.getUnitCategories
);

/**
 * @route GET /api/units
 * @desc 获取单位列表
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/',
  requireRoles(['系统管理员']),
  unitController.getUnits
);

/**
 * @route GET /api/units/:id
 * @desc 获取单位详情
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/:id',
  requireRoles(['系统管理员']),
  unitController.getUnitById
);

/**
 * @route POST /api/units
 * @desc 创建单位
 * @access Private (需要系统管理员权限)
 */
router.post(
  '/',
  requireRoles(['系统管理员']),
  unitController.createUnit
);

/**
 * @route PUT /api/units/:id
 * @desc 更新单位
 * @access Private (需要系统管理员权限)
 */
router.put(
  '/:id',
  requireRoles(['系统管理员']),
  unitController.updateUnit
);

/**
 * @route DELETE /api/units/:id
 * @desc 删除单位
 * @access Private (需要系统管理员权限)
 */
router.delete(
  '/:id',
  requireRoles(['系统管理员']),
  unitController.deleteUnit
);

export default router;