/**
 * 仪表板路由
 */

import { Router } from 'express';
import { getStats, getSystemStatus } from './dashboard.controller';
import { authenticateToken, requireRoles } from '../../../shared/middleware/auth';

const router = Router();

// 获取统计数据
router.get('/stats', authenticateToken, requireRoles(['系统管理员', '普通用户']), getStats);

// 获取系统状态
router.get('/system-status', authenticateToken, requireRoles(['系统管理员']), getSystemStatus);

export default router;