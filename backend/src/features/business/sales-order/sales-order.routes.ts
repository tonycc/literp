import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { SalesOrderController } from './sales-order.controller';

const router: import('express').Router = Router();
const salesOrderController = new SalesOrderController();

// 应用认证中间件
router.use(authenticateToken);

// 获取销售订单列表
router.get('/', salesOrderController.getSalesOrders.bind(salesOrderController));

// 获取销售订单详情
router.get('/:id', salesOrderController.getSalesOrderById.bind(salesOrderController));

// 获取销售订单明细项
router.get('/:id/items', salesOrderController.getSalesOrderItems.bind(salesOrderController));

// 创建销售订单
router.post('/', salesOrderController.createSalesOrder.bind(salesOrderController));

// 更新销售订单
router.put('/:id', salesOrderController.updateSalesOrder.bind(salesOrderController));

// 删除销售订单
router.delete('/:id', salesOrderController.deleteSalesOrder.bind(salesOrderController));

export default router;