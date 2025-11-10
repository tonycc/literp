/**
 * 日志路由
 */

import { Router } from 'express';
import { authenticateToken, requireRoles } from '../../../shared/middleware/auth';
import {
  getSystemLogs,
  getAuditLogs,
  getLogStats,
  cleanupLogs,
} from './log.controller';

const router = Router();

// 所有日志路由都需要认证
router.use(authenticateToken);

// 获取系统日志 - 需要管理员权限
router.get('/system', requireRoles(['系统管理员']), getSystemLogs);

// 获取审计日志 - 需要管理员权限
router.get('/audit', requireRoles(['系统管理员']), getAuditLogs);

// 获取日志统计 - 需要管理员权限
router.get('/stats', requireRoles(['系统管理员']), getLogStats);

// 清理过期日志 - 需要管理员权限
router.post('/cleanup', requireRoles(['系统管理员']), cleanupLogs);

export default router;