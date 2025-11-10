/**
 * 路由入口文件 - 临时版本，用于调试
 */

import { Router } from 'express';
// 使用新的feature结构导入路由
import { authRoutes } from '../features/core/auth';
import { userRoutes } from '../features/core/user';
import { roleRoutes } from '../features/core/role';
import { permissionRoutes } from '../features/core/permission';
import { departmentRoutes } from '../features/core/department';
import { settingsRoutes } from '../features/business/settings';
import { dashboardRoutes } from '../features/business/dashboard';
import { fileRoutes } from '../features/business/file';
import { productCategoryRoutes } from '../features/business/product-category';
import { productRoutes } from '../features/business/product';
import { unitRoutes } from '../features/business/unit';
import { warehouseRoutes } from '../features/business/warehouse';
import { bomRoutes } from '../features/business/bom';
import { operationRoutes } from '../features/business/operation';
import { routingRoutes } from '../features/business/routing';
import { workcenterRoutes } from '../features/business/workcenter';
import { logRoutes } from '../features/communication/log';

const router = Router();

// API 路由
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/departments', departmentRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/uploads', fileRoutes);
router.use('/product-categories', productCategoryRoutes);
router.use('/products', productRoutes);
router.use('/units', unitRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/boms', bomRoutes);
router.use('/operations', operationRoutes);
router.use('/routings', routingRoutes);
router.use('/workcenters', workcenterRoutes);
router.use('/logs', logRoutes);

// 健康检查路由
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 临时排除通知路由
// router.use('/', notificationRoutes);

export default router;