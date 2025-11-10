/**
 * 用户路由
 */

import { Router } from 'express';
import { userController } from './user.controller';
import { authenticateToken, requireRoles, requirePermissions } from '../../../shared/middleware';

const router = Router();

// 所有用户路由都需要认证
router.use(authenticateToken);

// 用户管理路由 - 需要管理员权限
router.post('/', requireRoles(['系统管理员']), userController.createUser.bind(userController));
router.get('/', requirePermissions(['user:read']), userController.getUsers.bind(userController));
router.get('/:id', requirePermissions(['user:read']), userController.getUserById.bind(userController));
router.put('/:id', requireRoles(['系统管理员']), userController.updateUser.bind(userController));
router.delete('/:id', requireRoles(['系统管理员']), userController.deleteUser.bind(userController));
router.patch('/:id/status', requireRoles(['系统管理员']), userController.updateUserStatus.bind(userController));

export default router;