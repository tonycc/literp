import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ProductStockController } from './product-stock.controller';

const router: import('express').Router = Router();
const controller = new ProductStockController();

// 应用认证中间件
router.use(authenticateToken);

// 只读接口：按变体维度库存(VariantStock)聚合生成的产品库存摘要
// 写入请使用 /products/:productId/variants/:variantId/stock/adjust
// 获取库存列表
router.get('/', controller.getProductStocks.bind(controller));

export default router;
