import type { BomFormData, BomItemFormData, BomQueryParams } from '@shared/types/bom';
import type { User, JwtPayload } from '@shared/types/auth';
import { BomCrudService } from './services/BomCrudService';
import { BomItemService } from './services/BomItemService';
import { BomVersionService } from './services/BomVersionService';
import { BomCostService, type BomCostSummary } from './services/BomCostService';
import { BomImportExportService } from './services/BomImportExportService';
import type { BomTreeNode } from '@shared/types/bom';

/**
 * BOM服务协调器
 * 整合各个子服务，提供统一的业务接口
 */
export class BomService {
  private bomCrudService: BomCrudService;
  private bomItemService: BomItemService;
  private bomVersionService: BomVersionService;
  private bomCostService: BomCostService;
  private bomImportExportService: BomImportExportService;

  constructor() {
    this.bomCrudService = new BomCrudService();
    this.bomItemService = new BomItemService();
    this.bomVersionService = new BomVersionService();
    this.bomCostService = new BomCostService();
    this.bomImportExportService = new BomImportExportService();
  }

  // ==================== BOM基础CRUD操作 ====================
  
  /**
   * 创建BOM
   */
  async createBom(bomData: BomFormData, userPayload: JwtPayload) {
    return this.bomCrudService.createBom(bomData, userPayload);
  }

  /**
   * 获取BOM列表
   */
  async getBoms(query: BomQueryParams) {
    return this.bomCrudService.getBoms(query);
  }

  /**
   * 检查BOM编码是否可用
   */
  async isBomCodeAvailable(code: string) {
    return this.bomCrudService.isBomCodeAvailable(code);
  }

  /**
   * 根据编码获取BOM
   */
  async getBomByCode(code: string) {
    return this.bomCrudService.getBomByCode(code);
  }

  /**
   * 根据ID获取BOM
   */
  async getBomById(id: string) {
    return this.bomCrudService.getBomById(id);
  }

  /**
   * 更新BOM
   */
  async updateBom(id: string, bomData: BomFormData, user: User) {
    return this.bomCrudService.updateBom(id, bomData, user);
  }

  /**
   * 删除BOM
   */
  // eslint-disable-next-line no-unused-vars
  async deleteBom(id: string, _user: User) {
    return this.bomCrudService.deleteBom(id);
  }

  // ==================== BOM物料项管理 ====================

  /**
   * 获取BOM物料项列表
   */
  async getBomItems(bomId: string) {
    return this.bomItemService.getBomItems(bomId);
  }

  async getBomTree(bomId: string): Promise<BomTreeNode> {
    return this.buildBomTree(bomId);
  }

  private async buildBomTree(bomId: string): Promise<BomTreeNode> {
    const res = await this.bomCrudService.getBomById(bomId) as { success: boolean; data?: any };
    if (!res.success || !res.data) {
      throw new Error('BOM不存在');
    }
    const bom = res.data;
    const root: BomTreeNode = {
      id: bom.id,
      code: bom.code,
      name: bom.name,
      quantity: typeof bom.baseQuantity === 'number' ? bom.baseQuantity : 1,
      unit: bom.baseUnit?.name,
      type: 'bom',
      isPhantom: false,
      children: []
    };

    const items = Array.isArray(bom.items) ? bom.items : [];
    for (const it of items) {
      const materialId = it.material?.id ?? it.materialVariant?.id ?? '';
      const materialCode = it.material?.code ?? it.materialVariant?.code ?? '';
      const materialName = it.material?.name ?? it.materialVariant?.name ?? '';
      const child: BomTreeNode = {
        id: materialId,
        code: materialCode,
        name: materialName,
        quantity: typeof it.quantity === 'number' ? it.quantity : 0,
        unit: it.unit?.name,
        type: 'material',
        isPhantom: !!it.isPhantom
      };
      if (it.childBom?.id) {
        const sub = await this.buildBomTree(it.childBom.id);
        child.children = sub.children;
      }
      root.children!.push(child);
    }

    return root;
  }

  /**
   * 添加BOM物料项
   */
  async addBomItem(bomId: string, itemData: BomItemFormData, user: User) {
    return this.bomItemService.addBomItem(bomId, itemData, user);
  }

  /**
   * 更新BOM物料项
   */
  async updateBomItem(itemId: string, itemData: BomItemFormData, user: User) {
    return this.bomItemService.updateBomItem(itemId, itemData, user);
  }

  /**
   * 删除BOM物料项
   */
  async deleteBomItem(itemId: string) {
    return this.bomItemService.deleteBomItem(itemId);
  }

  /**
   * 批量同步BOM物料项
   */
  async syncBomItems(bomId: string, items: (BomItemFormData & { id?: string })[], user: User) {
    return this.bomItemService.syncBomItems(bomId, items, user);
  }
  /**
   * 批量删除BOM物料项
   */
  // eslint-disable-next-line no-unused-vars
  async batchDeleteBomItems(itemIds: string[], _user: User) {
    return this.bomItemService.batchDeleteBomItems(itemIds);
  }

  /**
   * 复制BOM物料项
   */
  async copyBomItems(sourceBomId: string, targetBomId: string, user: User) {
    return this.bomItemService.copyBomItems(sourceBomId, targetBomId, user);
  }

  // ==================== BOM版本管理 ====================

  /**
   * 创建BOM版本
   */
  async createBomVersion(bomId: string, versionData: any, user: User) {
    return this.bomVersionService.createBomVersion(bomId, versionData, user);
  }

  /**
   * 获取BOM版本列表
   */
  async getBomVersions(bomId: string) {
    return this.bomVersionService.getBomVersions(bomId);
  }

  /**
   * 比较BOM版本
   */
  async compareBoms(id: string, targetId: string) {
    return this.bomVersionService.compareBomVersions(id, targetId);
  }

  /**
   * 设置默认版本
   */
  async setDefaultBom(id: string, user: User) {
    return this.bomVersionService.setDefaultVersion(id, user);
  }

  /**
   * 删除BOM版本
   */
  // eslint-disable-next-line no-unused-vars
  async deleteBomVersion(versionId: string, _user: User) {
    return this.bomVersionService.deleteBomVersion(versionId);
  }

  /**
   * 激活BOM版本
   */
  async activateBomVersion(versionId: string, user: User) {
    return this.bomVersionService.activateBomVersion(versionId, user);
  }

  /**
   * 归档BOM版本
   */
  async archiveBomVersion(versionId: string, user: User) {
    return this.bomVersionService.archiveBomVersion(versionId, user);
  }

  // ==================== BOM成本计算 ====================

  /**
   * 计算BOM成本
   */
  async calculateBomCost(id: string, user?: User): Promise<{ success: boolean; data?: BomCostSummary; message?: string }> {
    if (user) {
      return this.bomCostService.calculateBomCost(id, user);
    }
    return this.bomCostService.getBomCostDetail(id);
  }

  /**
   * 获取BOM成本明细
   */
  async getBomCostDetail(bomId: string): Promise<{ success: boolean; data?: BomCostSummary; message?: string }> {
    return this.bomCostService.getBomCostDetail(bomId);
  }

  /**
   * 批量计算BOM成本
   */
  async batchCalculateBomCost(bomIds: string[], user: User) {
    return this.bomCostService.batchCalculateBomCost(bomIds, user);
  }

  /**
   * 比较BOM成本
   */
  async compareBomCost(bomId1: string, bomId2: string) {
    return this.bomCostService.compareBomCost(bomId1, bomId2);
  }

  /**
   * 获取成本分析报告
   */
  async getCostAnalysisReport(bomId: string) {
    return this.bomCostService.getCostAnalysisReport(bomId);
  }

  /**
   * 更新物料成本
   */
  async updateMaterialCost(materialId: string, newCost: number, user: User) {
    return this.bomCostService.updateMaterialCost(materialId, newCost, user);
  }

  // ==================== BOM批量操作 ====================

  /**
   * 批量删除BOM
   */
  // eslint-disable-next-line no-unused-vars
  async batchDeleteBoms(ids: string[], _user: User) {
    try {
      const results = [];
      for (const id of ids) {
        const result = await this.bomCrudService.deleteBom(id);
        results.push({ id, success: result.success, message: result.message });
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return {
        success: true,
        data: results,
        message: `批量删除完成：成功${successCount}个，失败${failCount}个`
      };
    } catch (error) {
      console.error('批量删除BOM失败:', error);
      return { success: false, message: '批量删除BOM失败' };
    }
  }

  /**
   * 批量更新BOM状态
   */
  async batchUpdateBomStatus(ids: string[], status: string, user: User) {
    try {
      const results = [];
      for (const id of ids) {
        const bomData = { status } as BomFormData;
        const result = await this.bomCrudService.updateBom(id, bomData, user);
        results.push({ id, success: result.success, message: result.message });
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return {
        success: true,
        data: results,
        message: `批量更新状态完成：成功${successCount}个，失败${failCount}个`
      };
    } catch (error) {
      console.error('批量更新BOM状态失败:', error);
      return { success: false, message: '批量更新BOM状态失败' };
    }
  }

  /**
   * 切换BOM状态
   */
  async toggleBomStatus(id: string, user: User) {
    try {
      const bom = await this.bomCrudService.getBomById(id);
      if (!bom.success || !bom.data) {
        return { success: false, message: 'BOM不存在' };
      }

      const currentStatus = bom.data.status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const bomData = { status: newStatus } as BomFormData;
      return this.bomCrudService.updateBom(id, bomData, user);
    } catch (error) {
      console.error('切换BOM状态失败:', error);
      return { success: false, message: '切换BOM状态失败' };
    }
  }

  // ==================== 导入导出功能 ====================

  /**
   * 导出BOM数据
   */
  async exportBoms(query: any) {
    return this.bomImportExportService.exportBoms(query);
  }

  /**
   * 导入BOM数据
   */
  async importBoms(filePath: string, user: User) {
    return this.bomImportExportService.importBoms(filePath, user);
  }

  /**
   * 获取导入模板
   */
  async getImportTemplate() {
    return this.bomImportExportService.getImportTemplate();
  }
}