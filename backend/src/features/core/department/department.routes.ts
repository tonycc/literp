import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticateToken, requireRoles } from '../../../shared/middleware';

const router = Router();
const departmentController = new DepartmentController();

// 应用认证中间件到所有路由
router.use(authenticateToken);

/**
 * @route GET /api/departments
 * @desc 获取部门列表
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/',
  requireRoles(['系统管理员']),
  departmentController.getDepartments
);

/**
 * @route GET /api/departments/tree
 * @desc 获取部门树形结构
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/tree',
  requireRoles(['系统管理员']),
  departmentController.getDepartmentTree
);

/**
 * @route GET /api/departments/stats
 * @desc 获取部门统计信息
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/stats',
  requireRoles(['系统管理员']),
  departmentController.getDepartmentStats
);

/**
 * @route GET /api/departments/:id
 * @desc 获取部门详情
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/:id',
  requireRoles(['系统管理员']),
  departmentController.getDepartmentById
);

/**
 * @route POST /api/departments
 * @desc 创建部门
 * @access Private (需要系统管理员权限)
 */
router.post(
  '/',
  requireRoles(['系统管理员']),
  departmentController.createDepartment
);

/**
 * @route PUT /api/departments/:id
 * @desc 更新部门
 * @access Private (需要系统管理员权限)
 */
router.put(
  '/:id',
  requireRoles(['系统管理员']),
  departmentController.updateDepartment
);

/**
 * @route DELETE /api/departments/:id
 * @desc 删除部门
 * @access Private (需要系统管理员权限)
 */
router.delete(
  '/:id',
  requireRoles(['系统管理员']),
  departmentController.deleteDepartment
);

/**
 * @route GET /api/departments/:id/members
 * @desc 获取部门成员列表
 * @access Private (需要系统管理员权限)
 */
router.get(
  '/:id/members',
  requireRoles(['系统管理员']),
  departmentController.getDepartmentMembers
);

/**
 * @route POST /api/departments/:id/members
 * @desc 分配用户到部门
 * @access Private (需要系统管理员权限)
 */
router.post(
  '/:id/members',
  requireRoles(['系统管理员']),
  departmentController.assignUserToDepartment
);

/**
 * @route PUT /api/departments/:id/members/:userId
 * @desc 更新用户部门信息
 * @access Private (需要系统管理员权限)
 */
router.put(
  '/:id/members/:userId',
  requireRoles(['系统管理员']),
  departmentController.updateUserDepartment
);

/**
 * @route DELETE /api/departments/members/:membershipId
 * @desc 从部门移除用户
 * @access Private (需要系统管理员权限)
 */
router.delete(
  '/members/:membershipId',
  requireRoles(['系统管理员']),
  departmentController.removeUserFromDepartment
);

export default router;