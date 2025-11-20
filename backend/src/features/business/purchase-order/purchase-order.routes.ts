import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { PurchaseOrderController } from './purchase-order.controller';

const router: import('express').Router = Router();
const purchaseOrderController = new PurchaseOrderController();

// 应用认证中间件
router.use(authenticateToken);

// 获取采购订单列表
router.get('/', purchaseOrderController.getPurchaseOrders.bind(purchaseOrderController));

// 获取采购订单详情
router.get('/:id', purchaseOrderController.getPurchaseOrderById.bind(purchaseOrderController));

// 创建采购订单
router.post('/', purchaseOrderController.createPurchaseOrder.bind(purchaseOrderController));

// 更新采购订单
router.put('/:id', purchaseOrderController.updatePurchaseOrder.bind(purchaseOrderController));

// 删除采购订单
router.delete('/:id', purchaseOrderController.deletePurchaseOrder.bind(purchaseOrderController));

export default router;