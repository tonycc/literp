/**
 * 权限路由
 */

import { Router } from 'express';
import { permissionController } from './permission.controller';
import { authenticateToken, requireRoles } from '../../../shared/middleware';

const router = Router();

// 所有权限路由都需要认证
router.use(authenticateToken);

// 权限管理路由 - 需要管理员权限
router.get('/', requireRoles(['系统管理员']), permissionController.getPermissions.bind(permissionController));
router.get('/all', requireRoles(['系统管理员']), permissionController.getAllPermissions.bind(permissionController));
router.get('/resource/:resource', requireRoles(['系统管理员']), permissionController.getPermissionsByResource.bind(permissionController));
router.get('/:id', requireRoles(['系统管理员']), permissionController.getPermissionById.bind(permissionController));
router.post('/', requireRoles(['系统管理员']), permissionController.createPermission.bind(permissionController));
router.put('/:id', requireRoles(['系统管理员']), permissionController.updatePermission.bind(permissionController));
router.delete('/:id', requireRoles(['系统管理员']), permissionController.deletePermission.bind(permissionController));

export default router;