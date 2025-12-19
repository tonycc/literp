import { Router } from 'express';
import { SalesReceiptController } from './sales-receipt.controller';
import { authenticateToken } from '../../../shared/middleware/auth';
import { validateRequest } from '../../../shared/middleware/validation';
import Joi from 'joi';

const controller = new SalesReceiptController();
const router: Router = Router();

// 验证规则
const createSchema = Joi.object({
  salesOrderId: Joi.string().required().messages({ 
    'string.empty': '销售订单ID不能为空', 
    'any.required': '销售订单ID不能为空' 
  }),
  salesOrderNo: Joi.string().required().messages({ 
    'string.empty': '销售订单号不能为空', 
    'any.required': '销售订单号不能为空' 
  }),
  customerName: Joi.string().required().messages({ 
    'string.empty': '客户名称不能为空', 
    'any.required': '客户名称不能为空' 
  }),
  receiptDate: Joi.string().isoDate().required(),
  handler: Joi.string().allow('', null).optional(),
  remarks: Joi.string().allow('', null).optional(),
  items: Joi.array().items(Joi.object({
    salesOrderItemId: Joi.string().required(),
    productId: Joi.string().required(),
    productName: Joi.string().required(),
    productCode: Joi.string().required(),
    quantity: Joi.number().min(0.0001).required().messages({ 'number.min': '数量必须大于0' }),
    unitPrice: Joi.number().required(),
    amount: Joi.number().required(),
    warehouseId: Joi.string().allow('', null).optional(),
    remarks: Joi.string().allow('', null).optional()
  })).min(1).required().messages({ 'array.min': '至少包含一项明细' })
});

const updateSchema = Joi.object({
  receiptDate: Joi.string().isoDate().optional(),
  handler: Joi.string().allow('', null).optional(),
  remarks: Joi.string().allow('', null).optional(),
  items: Joi.array().items(Joi.object({
    salesOrderItemId: Joi.string().required(),
    productId: Joi.string().required(),
    productName: Joi.string().required(),
    productCode: Joi.string().required(),
    quantity: Joi.number().min(0.0001).required(),
    unitPrice: Joi.number().required(),
    amount: Joi.number().required(),
    warehouseId: Joi.string().allow('', null).optional(),
    remarks: Joi.string().allow('', null).optional()
  })).optional()
});

// 路由定义
router.get('/', authenticateToken, controller.getList);
router.get('/:id', authenticateToken, controller.getById);
router.post('/', authenticateToken, validateRequest(createSchema), controller.create);
router.put('/:id', authenticateToken, validateRequest(updateSchema), controller.update);
router.post('/:id/confirm', authenticateToken, controller.confirm);
router.post('/:id/cancel', authenticateToken, controller.cancel);
router.delete('/:id', authenticateToken, controller.delete);

export default router;
