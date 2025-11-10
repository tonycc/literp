/**
 * BOM服务
 */

import apiClient from '../../../shared/services/api';
import type {
  ProductBom,
  BomItem,
  BomItemFormData,
  BomQueryParams,
  BomListResponse,
  BomFormData,
  BomImportResult,
  BomCostSummary,
  BomCostItem,
  BackendBomData,
  ApiResponse,
  BomApi,
  BomType,
  BomStatus
} from '@zyerp/shared';

// ==================== 本地辅助函数 ====================
// 使用显式字符串比较的类型守卫，避免不安全断言
function isBomType(value: string): value is BomType {
  return value === 'production' || value === 'engineering' || value === 'sales';
}

function isBomStatus(value: string): value is BomStatus {
  return value === 'draft' || value === 'active' || value === 'inactive' || value === 'archived';
}

function toBomType(value: unknown): BomType {
  const normalized = String(value).toLowerCase();
  return isBomType(normalized) ? (normalized as BomType) : ('production' as BomType);
}

function toBomStatus(value: unknown): BomStatus {
  const normalized = String(value).toLowerCase();
  return isBomStatus(normalized) ? (normalized as BomStatus) : ('draft' as BomStatus);
}

// 统一将后端的 BackendBomData 转换为前端的 ProductBom
function toProductBom(bom: BackendBomData): ProductBom {
  return {
    id: bom.id,
    code: bom.code,
    name: bom.name,
    productId: bom.productId,
    productCode: bom.product?.code || '',
    productName: bom.product?.name || '',
    type: toBomType(bom.type),
    version: bom.version,
    status: toBomStatus(bom.status),
    isDefault: bom.isDefault,
    baseQuantity: bom.baseQuantity,
    baseUnitId: bom.baseUnitId,
    baseUnitName: bom.baseUnit?.name || '',
    routingId: bom.routingId,
    routingCode: bom.routing?.code || '',
    routingName: bom.routing?.name || '',
    effectiveDate: new Date(bom.effectiveDate),
    expiryDate: bom.expiryDate ? new Date(bom.expiryDate) : undefined,
    description: bom.description,
    remark: bom.remark,
    approvedBy: bom.approvedBy,
    approvedAt: bom.approvedAt ? new Date(bom.approvedAt) : undefined,
    createdBy: bom.createdBy,
    updatedBy: bom.updatedBy,
    createdAt: new Date(bom.createdAt),
    updatedAt: new Date(bom.updatedAt),
  };
}

// 简单类型守卫：判断 data 是否为后端返回的原始BOM数据
function isBackendBomData(data: unknown): data is BackendBomData {
  const d = data as Partial<BackendBomData>;
  return !!d && typeof d === 'object' && typeof d.effectiveDate === 'string' && typeof d.createdAt === 'string';
}

// 物料项需求类型转换（显式比较避免不必要断言）
function toRequirementType(value: unknown): BomItem['requirementType'] {
  const v = String(value ?? '').toLowerCase();
  return v === 'fixed' || v === 'variable' || v === 'optional'
    ? (v as BomItem['requirementType'])
    : ('fixed' as BomItem['requirementType']);
}

// 后端物料项粗略类型（日期为字符串）
type RoughBomItem = Omit<BomItem, 'requirementType' | 'effectiveDate' | 'expiryDate' | 'createdAt' | 'updatedAt'> & {
  // 后端可能返回字符串或缺失层级
  level?: number | string | null;
  requirementType?: string;
  effectiveDate?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeBomItem(raw: RoughBomItem): BomItem {
  // 处理层级，默认回退为 1（无 any）
  const lv = raw.level;
  let parsedLevel = 1;
  if (typeof lv === 'number' && Number.isFinite(lv)) {
    parsedLevel = lv;
  } else if (typeof lv === 'string') {
    const n = Number(lv);
    parsedLevel = Number.isFinite(n) ? n : 1;
  }

  return {
    ...raw,
    level: parsedLevel,
    requirementType: toRequirementType(raw.requirementType),
    effectiveDate: raw.effectiveDate ? new Date(raw.effectiveDate) : undefined,
    expiryDate: raw.expiryDate ? new Date(raw.expiryDate) : undefined,
    // createdAt/updatedAt 在后端通常为字符串，这里转换为 Date；若缺失则以当前时间填充
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  } as BomItem;
}


class BomService implements BomApi {
  private readonly baseUrl = '/boms';

  // ==================== BOM基础CRUD操作 ====================

  /**
   * 获取BOM列表
   */
  async getBoms(params?: BomQueryParams): Promise<BomListResponse> {
    // 后端分页响应：{ success, data: { data: BackendBomData[], total, page, pageSize, totalPages }, message, timestamp }
    const response = await apiClient.get<
      ApiResponse<
        | {
            data: BackendBomData[];
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
          }
        | BackendBomData[]
      >
    >(this.baseUrl, { params });

    const payload = response.data?.data;

    let rawList: BackendBomData[] = [];
    let pagination = {
      total: 0,
      page: 1,
      pageSize: 0,
      totalPages: 1,
    };

    if (Array.isArray(payload)) {
      rawList = payload;
      pagination = {
        total: rawList.length,
        page: 1,
        pageSize: rawList.length,
        totalPages: 1,
      };
    } else if (payload) {
      const p = payload as {
        data: BackendBomData[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
      rawList = Array.isArray(p.data) ? p.data : [];
      pagination = {
        total: p.total ?? rawList.length,
        page: p.page ?? 1,
        pageSize: p.pageSize ?? rawList.length,
        totalPages: p.totalPages ?? 1,
      };
    }

    const transformedData: ProductBom[] = rawList.map(toProductBom);

    return {
      success: response.data.success,
      data: transformedData,
      pagination,
      message: response.data.message,
      timestamp: new Date(response.data.timestamp),
    };
  }

  /**
   * 根据ID获取BOM详情
   */
  async getBomById(id: string): Promise<ApiResponse<ProductBom>> {
    const response = await apiClient.get<ApiResponse<BackendBomData | ProductBom>>(`${this.baseUrl}/${id}`);
    const outer = response.data;
    const data = outer.data;
    const mapped = isBackendBomData(data) ? toProductBom(data) : (data as ProductBom);
    return {
      success: outer.success,
      data: mapped,
      message: outer.message,
      timestamp: outer.timestamp,
    };
  }
  
  /**
   * 创建BOM
   */
  async createBom(data: BomFormData): Promise<ApiResponse<ProductBom>> {
    const response = await apiClient.post<ApiResponse<BackendBomData | ProductBom>>(this.baseUrl, data);
    const outer = response.data;
    const mapped = isBackendBomData(outer.data) ? toProductBom(outer.data) : (outer.data as ProductBom);
    return {
      success: outer.success,
      data: mapped,
      message: outer.message,
      timestamp: outer.timestamp,
    };
  }
  
  /**
   * 更新BOM
   */
  async updateBom(id: string, data: BomFormData): Promise<ApiResponse<ProductBom>> {
    const response = await apiClient.put<ApiResponse<BackendBomData | ProductBom>>(`${this.baseUrl}/${id}`, data);
    const outer = response.data;
    const mapped = isBackendBomData(outer.data) ? toProductBom(outer.data) : (outer.data as ProductBom);
    return {
      success: outer.success,
      data: mapped,
      message: outer.message,
      timestamp: outer.timestamp,
    };
  }
  
  /**
   * 删除BOM
   */
  async deleteBom(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // ==================== BOM物料项管理 ====================

  /**
   * 获取BOM物料项列表
   */
  async getBomItems(bomId: string): Promise<ApiResponse<BomItem[]>> {
    // 兼容双层 data 包裹的返回结构，并转换日期与枚举
    const response = await apiClient.get<
      ApiResponse<RoughBomItem[] | { success?: boolean; data: RoughBomItem[] }>
    >(`${this.baseUrl}/${bomId}/items`);
    const outer = response.data;

    type BomItemsPayload = RoughBomItem[] | { data: RoughBomItem[] } | undefined;
    const payload = outer?.data as BomItemsPayload;

    const rawItems: RoughBomItem[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? (payload!.data as RoughBomItem[])
        : [];

    const items: BomItem[] = rawItems.map(normalizeBomItem);

    return {
      success: outer.success,
      data: items,
      message: outer.message,
      timestamp: outer.timestamp,
    };
  }

  /**
   * 获取包含层级的BOM物料项（递归展开 childBomId），并扁平化返回
   */
  async getBomItemsFlattened(
    bomId: string,
    options?: { includeSubBomRefs?: boolean }
  ): Promise<ApiResponse<BomItem[]>> {
    const visited = new Set<string>();
    const collected: BomItem[] = [];

    const traverse = async (currentBomId: string, level: number) => {
      if (visited.has(currentBomId)) return;
      visited.add(currentBomId);

      const res = await this.getBomItems(currentBomId);
      const direct = res.data || [];
      const withLevel = direct.map(item => ({ ...item, level }));
      collected.push(...withLevel);

      for (const item of withLevel) {
        if (item.childBomId) {
          await traverse(item.childBomId, level + 1);
        }
      }
    };

    await traverse(bomId, 1);

    // 默认不显示子BOM引用行，仅显示叶子物料，避免视觉上的“重复”
    const filtered = (options?.includeSubBomRefs ? collected : collected.filter(i => !i.childBomId));
    // 按物料项ID去重，防止异常数据导致重复展示
    const seen = new Set<string>();
    const unique: BomItem[] = [];
    for (const it of filtered) {
      const id = String(it.id);
      if (!seen.has(id)) {
        unique.push(it);
        seen.add(id);
      }
    }

    return {
      success: true,
      data: unique,
      message: 'flattened',
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * 添加BOM物料项
   */
  async addBomItem(bomId: string, data: BomItemFormData): Promise<ApiResponse<BomItem>> {
    const response = await apiClient.post<ApiResponse<BomItem>>(`${this.baseUrl}/${bomId}/items`, data);
    return response.data;
  }
  
  /**
   * 更新BOM物料项
   */
  async updateBomItem(itemId: string, data: BomItemFormData): Promise<ApiResponse<BomItem>> {
    const response = await apiClient.put<ApiResponse<BomItem>>(`${this.baseUrl}/items/${itemId}`, data);
    return response.data;
  }
  
  /**
   * 删除BOM物料项
   */
  async deleteBomItem(itemId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/items/${itemId}`);
    return response.data;
  }

  // ==================== BOM状态管理 ====================

  /**
   * 更新BOM状态
   */
  async updateBomStatus(id: string, status: 'draft' | 'active' | 'inactive' | 'archived'): Promise<ApiResponse<ProductBom>> {
    const response = await apiClient.patch<ApiResponse<BackendBomData | ProductBom>>(`${this.baseUrl}/${id}/status`, { status });
    const outer = response.data;
    const mapped = isBackendBomData(outer.data) ? toProductBom(outer.data) : (outer.data as ProductBom);
    return {
      success: outer.success,
      data: mapped,
      message: outer.message,
      timestamp: outer.timestamp,
    };
  }

  /**
   * 设置默认BOM
   */
  async setDefaultBom(productId: string, bomId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`${this.baseUrl}/${bomId}/set-default`, { productId });
    return response.data;
  }

  // ==================== BOM查询和搜索 ====================

  /**
   * 搜索BOM
   */
  async searchBoms(keyword: string, params?: Partial<BomQueryParams>): Promise<BomListResponse> {
    const searchParams = { ...params, keyword };
    return this.getBoms(searchParams as BomQueryParams);
  }

  /**
   * 获取BOM选项（用于下拉选择）
   */
  async getBomOptions(params?: { _productId?: string; activeOnly?: boolean }): Promise<ApiResponse<Array<{ id: string; code: string; name: string; version: string }>>> {
    // 后端未提供 /boms/options 路由，这里通过列表接口转换为选项
    const query: BomQueryParams = {};
    if (params?._productId) query.productId = params._productId;
    if (params?.activeOnly) {
      // 使用类型安全的转换，避免直接赋字符串导致的类型不匹配
      query.status = toBomStatus('active');
    }
    // 提高上限避免漏选项
    query.page = 1;
    query.pageSize = 200;

    const list = await this.getBoms(query);
    const options = (list.data || []).map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      version: b.version,
    }));

    return {
      success: list.success,
      data: options,
      message: list.message,
      // 统一为字符串时间戳以兼容 ApiResponse 类型
      timestamp: (list.timestamp instanceof Date ? list.timestamp.toISOString() : String(list.timestamp)) as unknown as string,
    };
  }

  /**
   * 验证BOM编码唯一性
   */
  async validateBomCode(code: string, excludeId?: string): Promise<ApiResponse<{ isValid: boolean; message?: string }>> {
    const response = await apiClient.get<ApiResponse<{ isValid: boolean; message?: string }>>(`${this.baseUrl}/validate-code`, {
      params: { code, excludeId }
    });
    return response.data;
  }

  // ==================== BOM导入导出 ====================

  /**
   * 导入BOM
   */
  async importBoms(file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }): Promise<ApiResponse<BomImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    
    const response = await apiClient.post<ApiResponse<BomImportResult>>(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * 下载BOM导入模板
   */
  async downloadBomImportTemplate(): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/import/template`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ==================== BOM成本计算 ====================

  /**
   * 计算BOM成本
   */
  async calculateBomCost(bomId: string, options?: { includeLabor?: boolean; includeOverhead?: boolean }): Promise<ApiResponse<BomCostSummary>> {
    const response = await apiClient.post<ApiResponse<BomCostSummary>>(`${this.baseUrl}/${bomId}/calculate-cost`, options || {});
    return response.data;
  }

  /**
   * 获取BOM成本明细
   */
  async getBomCostDetails(bomId: string): Promise<ApiResponse<BomCostItem[]>> {
    const response = await apiClient.get<ApiResponse<BomCostItem[]>>(`${this.baseUrl}/${bomId}/cost-details`);
    return response.data;
  }
}

export const bomService = new BomService();
export default bomService;