import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateToken } from '../../../shared/middleware/auth';

const router = Router();
const productController = new ProductController();

// 应用认证中间件
router.use(authenticateToken);

/**
 * 产品路由
 */

// 创建产品
router.post('/', productController.createProduct.bind(productController));

// 获取产品列表
router.get('/', productController.getProducts.bind(productController));

// 检查产品编码是否可用 (需要在 /:id 之前定义)
router.get('/check-code/:code', productController.checkProductCode.bind(productController));

// 产品规格参数管理
router.get('/:id/specifications', productController.getProductSpecifications.bind(productController));
router.put('/:id/specifications', productController.updateProductSpecifications.bind(productController));

// 产品图片管理
router.get('/:id/images', productController.getProductImages.bind(productController));
router.post('/:id/images', productController.uploadProductImage.bind(productController));
router.delete('/:id/images/:imageId', productController.deleteProductImage.bind(productController));

// 产品文档管理
router.get('/:id/documents', productController.getProductDocuments.bind(productController));
router.post('/:id/documents', productController.uploadProductDocument.bind(productController));
router.delete('/:id/documents/:documentId', productController.deleteProductDocument.bind(productController));

// 产品导入导出
router.get('/export', productController.exportProducts.bind(productController));
router.post('/import', productController.importProducts.bind(productController));
router.get('/import/template', productController.getImportTemplate.bind(productController));

// 根据编码获取产品详情 (需要在 /:id 之前定义)
router.get('/code/:code', productController.getProductByCode.bind(productController));

// 批量删除产品 (需要在 /:id 之前定义)
router.delete('/batch', productController.batchDeleteProducts.bind(productController));

// 批量更新产品状态 (需要在 /:id 之前定义)
router.patch('/batch/status', productController.batchUpdateProductStatus.bind(productController));

// 根据ID获取产品详情
router.get('/:id', productController.getProductById.bind(productController));

// 更新产品
router.put('/:id', productController.updateProduct.bind(productController));

// 删除产品
router.delete('/:id', productController.deleteProduct.bind(productController));

// 切换产品状态
router.patch('/:id/toggle-status', productController.toggleProductStatus.bind(productController));

export default router;