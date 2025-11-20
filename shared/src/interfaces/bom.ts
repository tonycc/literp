/**
 * BOM管理API接口定义
 * 
 * 本接口定义了BOM（物料清单）管理模块的所有API方法，包括：
 * - BOM基础CRUD操作
 * - BOM物料项管理
 * - BOM状态管理
 * - BOM查询和搜索
 * - BOM导入导出
 * - BOM成本计算
 */

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */

import type { ApiResponse } from '../types/common';
import type {
  ProductBom,
  BomItem,
  BomFormData,
  BomItemFormData,
  BomQueryParams,
  BomListResponse,
  BomImportResult,
  BomCostSummary,
  BomCostItem,
  BomItemSyncItem,
  BomItemsSyncSummary
} from '../types/bom';

/**
 * BOM管理API接口
 */
export interface BomApi {
  // ==================== BOM基础CRUD操作 ====================
  
  /**
   * 获取BOM列表
   */
  getBoms(_params?: BomQueryParams): Promise<BomListResponse>;
  
  /**
   * 根据ID获取BOM详情
   */
  getBomById(_id: string): Promise<ApiResponse<ProductBom>>;
  
  /**
   * 创建BOM
   */
  createBom(_data: BomFormData): Promise<ApiResponse<ProductBom>>;
  
  /**
   * 更新BOM
   */
  updateBom(_id: string, _data: BomFormData): Promise<ApiResponse<ProductBom>>;
  
  /**
   * 删除BOM
   */
  deleteBom(_id: string): Promise<ApiResponse<void>>;
  
  // ==================== BOM物料项管理 ====================
  
  /**
   * 获取BOM物料项列表
   */
  getBomItems(_bomId: string): Promise<ApiResponse<BomItem[]>>;
  
  /**
   * 添加BOM物料项
   */
  addBomItem(_bomId: string, _data: BomItemFormData): Promise<ApiResponse<BomItem>>;
  
  /**
   * 更新BOM物料项
   */
  updateBomItem(_itemId: string, _data: BomItemFormData): Promise<ApiResponse<BomItem>>;
  
  /**
   * 删除BOM物料项
   */
  deleteBomItem(_itemId: string): Promise<ApiResponse<void>>;

  /**
   * 批量同步BOM物料项（事务、幂等）
   * 传入完整期望集合：包含现有项的id与更新字段，新增项不带id；未出现在集合中的现有项将被删除
   */
  syncBomItems(_bomId: string, _items: BomItemSyncItem[], _options?: { strict?: boolean }): Promise<ApiResponse<BomItemsSyncSummary>>;
  
  // ==================== BOM状态管理 ====================
  
  /**
   * 更新BOM状态
   */
  updateBomStatus(_id: string, status: 'draft' | 'active' | 'inactive' | 'archived'): Promise<ApiResponse<ProductBom>>;
  
  /**
   * 设置默认BOM
   */
  setDefaultBom(_productId: string, _bomId: string): Promise<ApiResponse<void>>;
  
  // ==================== BOM查询和搜索 ====================
  
  /**
   * 搜索BOM
   */
  searchBoms(_keyword: string, _params?: Partial<BomQueryParams>): Promise<BomListResponse>;
  
  /**
   * 获取BOM选项（用于下拉选择）
   */
  getBomOptions(_params?: { _productId?: string; activeOnly?: boolean }): Promise<ApiResponse<Array<{ id: string; code: string; name: string; version: string }>>>;
  
  /**
   * 验证BOM编码唯一性
   */
  validateBomCode(_code: string, _excludeId?: string): Promise<ApiResponse<{ isValid: boolean; message?: string }>>;
  
  // ==================== BOM导入导出 ====================
  
  /**
   * 导入BOM
   */
  importBoms(_file: File, _options?: { skipDuplicates?: boolean; updateExisting?: boolean }): Promise<ApiResponse<BomImportResult>>;
  
  /**
   * 下载BOM导入模板
   */
  downloadBomImportTemplate(): Promise<Blob>;
  
  // ==================== BOM成本计算 ====================
  
  /**
   * 计算BOM成本
   */
  calculateBomCost(_bomId: string, _options?: { includeLabor?: boolean; includeOverhead?: boolean }): Promise<ApiResponse<BomCostSummary>>;
  
  /**
   * 获取BOM成本明细
   */
  getBomCostDetails(_bomId: string): Promise<ApiResponse<BomCostItem[]>>;
}

// ==================== 导出接口 ====================

// 只导出接口定义，类型定义已在 types/bom.ts 中导出