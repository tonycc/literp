/**
 * 认证路由
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateToken } from '../../../shared/middleware';

const router = Router();

// 公开路由
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// 需要认证的路由
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

export default router;