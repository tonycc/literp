/**
 * 产品类别路由配置
 */

import { Router } from 'express';
import { productCategoryController } from './product-category.controller';
import { authenticateToken, requirePermissions } from '../../../shared/middleware/auth';

const router: import('express').Router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

/**
 * 产品类别管理路由
 */

// 获取产品类别列表
router.get(
  '/',
  requirePermissions(['product_category:read']),
  productCategoryController.getCategories.bind(productCategoryController)
);

// 获取产品类别树
router.get(
  '/tree',
  requirePermissions(['product_category:read']),
  productCategoryController.getCategoryTree.bind(productCategoryController)
);

// 获取产品类别选项
router.get(
  '/options',
  requirePermissions(['product_category:read']),
  productCategoryController.getCategoryOptions.bind(productCategoryController)
);

// 获取产品类别统计信息
router.get(
  '/stats',
  requirePermissions(['product_category:read']),
  productCategoryController.getCategoryStats.bind(productCategoryController)
);

// 生成类别编码
router.post(
  '/generate-code',
  requirePermissions(['product_category:create']),
  productCategoryController.generateCode.bind(productCategoryController)
);

// 验证类别编码
router.post(
  '/validate-code',
  requirePermissions(['product_category:create', 'product_category:update']),
  productCategoryController.validateCode.bind(productCategoryController)
);

// 批量操作产品类别
router.post(
  '/batch',
  requirePermissions(['product_category:update', 'product_category:delete']),
  productCategoryController.batchOperation.bind(productCategoryController)
);

// 创建产品类别
router.post(
  '/',
  requirePermissions(['product_category:create']),
  productCategoryController.createCategory.bind(productCategoryController)
);

// 根据ID获取产品类别
router.get(
  '/:id',
  requirePermissions(['product_category:read']),
  productCategoryController.getCategoryById.bind(productCategoryController)
);

// 更新产品类别
router.put(
  '/:id',
  requirePermissions(['product_category:update']),
  productCategoryController.updateCategory.bind(productCategoryController)
);

// 删除产品类别
router.delete(
  '/:id',
  requirePermissions(['product_category:delete']),
  productCategoryController.deleteCategory.bind(productCategoryController)
);

// 切换产品类别状态
router.patch(
  '/:id/status',
  requirePermissions(['product_category:update']),
  productCategoryController.toggleCategoryStatus.bind(productCategoryController)
);

// 根据编码获取产品类别
router.get(
  '/code/:code',
  requirePermissions(['product_category:read']),
  productCategoryController.getCategoryByCode.bind(productCategoryController)
);

export default router;