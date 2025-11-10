/**
 * 系统设置路由
 */

import { Router } from 'express';
import { authenticateToken, requireRoles } from '../../../shared/middleware/auth';
import { validateRequest, updateSettingsSchema } from '../../../shared/middleware/validation';
import {
  getSettings,
  updateSettings,
  resetSettings,
} from './settings.controller';

const router = Router();

// 路由定义 - 只有管理员可以访问设置
router.get('/', authenticateToken, requireRoles(['系统管理员']), getSettings);
router.put('/', authenticateToken, requireRoles(['系统管理员']), validateRequest(updateSettingsSchema), updateSettings);
router.post('/reset', authenticateToken, requireRoles(['系统管理员']), resetSettings);

export default router;