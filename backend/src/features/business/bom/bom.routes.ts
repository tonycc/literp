import { Router } from 'express';
import { BomController } from './bom.controller';
import { authenticateToken } from '../../../shared/middleware/auth';

const router = Router();
const bomController = new BomController();

// 应用认证中间件
router.use(authenticateToken);

/**
 * BOM路由
 */

// 创建BOM
router.post('/', bomController.createBom.bind(bomController));

// 获取BOM列表
router.get('/', bomController.getBoms.bind(bomController));

// 检查BOM编码是否可用
router.get('/check-code/:code', bomController.checkBomCode.bind(bomController));

// BOM物料项管理
router.get('/:id/items', bomController.getBomItems.bind(bomController));
router.post('/:id/items', bomController.addBomItem.bind(bomController));
router.put('/items/:itemId', bomController.updateBomItem.bind(bomController));
router.delete('/items/:itemId', bomController.deleteBomItem.bind(bomController));

// BOM导入导出
router.get('/export', bomController.exportBoms.bind(bomController));
router.post('/import', bomController.importBoms.bind(bomController));
router.get('/import/template', bomController.getImportTemplate.bind(bomController));

// 根据编码获取BOM详情
router.get('/code/:code', bomController.getBomByCode.bind(bomController));

// 批量删除BOM
router.delete('/batch', bomController.batchDeleteBoms.bind(bomController));

// 批量更新BOM状态
router.patch('/batch/status', bomController.batchUpdateBomStatus.bind(bomController));

// 根据ID获取BOM详情
router.get('/:id', bomController.getBomById.bind(bomController));

// 更新BOM
router.put('/:id', bomController.updateBom.bind(bomController));

// 删除BOM
router.delete('/:id', bomController.deleteBom.bind(bomController));

// 切换BOM状态
router.patch('/:id/toggle-status', bomController.toggleBomStatus.bind(bomController));

// 设置默认BOM
router.patch('/:id/set-default', bomController.setDefaultBom.bind(bomController));

// BOM版本比较
router.post('/:id/compare/:targetId', bomController.compareBoms.bind(bomController));

// BOM成本计算
router.post('/:id/calculate-cost', bomController.calculateBomCost.bind(bomController));

export default router;