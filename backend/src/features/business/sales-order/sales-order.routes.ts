import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { SalesOrderController } from './sales-order.controller';

const router = Router();
const salesOrderController = new SalesOrderController();

// 应用认证中间件
router.use(authenticateToken);

// 获取销售订单列表
router.get('/', salesOrderController.getSalesOrders.bind(salesOrderController));

// 获取销售订单详情
router.get('/:id', salesOrderController.getSalesOrderById.bind(salesOrderController));

export default router;