/**
 * 路由入口文件
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
import productVariantsRoutes from '../features/business/product-variants/product-variants.routes';
import { unitRoutes } from '../features/business/unit';
import { warehouseRoutes } from '../features/business/warehouse';
import { bomRoutes } from '../features/business/bom';
import { operationRoutes } from '../features/business/operation';
import { routingRoutes } from '../features/business/routing';
import { workcenterRoutes } from '../features/business/workcenter';
import { productStockRoutes } from '../features/business/product-stock';
import productAttributeRoutes from '../features/business/product-attribute/product-attribute.routes';
import productAttributeLineRoutes from '../features/business/product-attribute-line/product-attribute-line.routes';
import { logRoutes } from '../features/communication/log';
import { notificationRoutes } from '../features/communication/notification';
import { salesOrderRoutes } from '../features/business/sales-order';
import { purchaseOrderRoutes } from '../features/business/purchase-order';
import { manufacturingOrderRoutes } from '../features/business/manufacturing-order';
import workOrderRoutes from '../features/business/work-order/work-order.routes';
import { supplierRoutes } from '../features/business/supplier';
import { supplierPriceRoutes } from '../features/business/supplier-price';
import { productionPlanRoutes } from '../features/business/production-plan/production-plan.routes';
import customerRoutes from '../features/business/customer/customer.routes';
import customerPriceListRoutes from '../features/business/customer-price-list/customer-price-list.routes';
import materialIssueRoutes from '../features/business/material-issue/material-issue.routes';
import productionReportRoutes from '../features/business/production-report/production-report.routes';
import subcontractOrderRoutes from '../features/business/subcontract-management/subcontract-order.routes';
import subcontractReceiptRoutes from '../features/business/subcontract-management/subcontract-receipt.routes';
import dictionariesRouter from './dictionaries';



const router: import('express').Router = Router();

// API 路由
router.use('/dictionaries', dictionariesRouter);
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
router.use('/product-variants', productVariantsRoutes); // 全局变体路由
router.use('/products/:productId/variants', productVariantsRoutes);
router.use('/products/:productId/attribute-lines', productAttributeLineRoutes);
router.use('/material-issue', materialIssueRoutes);
router.use('/production-report', productionReportRoutes);
router.use('/units', unitRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/boms', bomRoutes);
router.use('/operations', operationRoutes);
router.use('/routings', routingRoutes);
router.use('/workcenters', workcenterRoutes);
router.use('/product-stocks', productStockRoutes);
router.use('/product-attributes', productAttributeRoutes);
router.use('/logs', logRoutes);
router.use('/notifications', notificationRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/manufacturing-order', manufacturingOrderRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/supplier-prices', supplierPriceRoutes);
router.use('/production-plan', productionPlanRoutes);
router.use('/customers', customerRoutes);
router.use('/customer-price-lists', customerPriceListRoutes);
router.use('/subcontract-orders', subcontractOrderRoutes);
router.use('/subcontract-receipts', subcontractReceiptRoutes);

// 健康检查路由
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});


export default router;
