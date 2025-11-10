import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { ProductStockController } from './product-stock.controller';

const router = Router();
const controller = new ProductStockController();

// 应用认证中间件
router.use(authenticateToken);

// 获取库存列表
router.get('/', controller.getProductStocks.bind(controller));

export default router;