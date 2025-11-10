/**
 * 角色路由
 */

import { Router } from 'express';
import { roleController } from './role.controller';
import { authenticateToken, requireRoles } from '../../../shared/middleware';

const router = Router();

// 所有角色路由都需要认证
router.use(authenticateToken);

// 角色管理路由 - 需要管理员权限
router.get('/', requireRoles(['系统管理员']), roleController.getRoles.bind(roleController));
router.get('/:id', requireRoles(['系统管理员']), roleController.getRoleById.bind(roleController));
router.post('/', requireRoles(['系统管理员']), roleController.createRole.bind(roleController));
router.put('/:id', requireRoles(['系统管理员']), roleController.updateRole.bind(roleController));
router.delete('/:id', requireRoles(['系统管理员']), roleController.deleteRole.bind(roleController));

// 角色权限管理路由 - 需要管理员权限
router.post('/:id/permissions', requireRoles(['系统管理员']), roleController.assignPermissions.bind(roleController));
router.get('/:id/permissions', requireRoles(['系统管理员']), roleController.getRolePermissions.bind(roleController));

export default router;