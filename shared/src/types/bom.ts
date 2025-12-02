/**
 * BOM管理相关类型定义
 * 参考产品模块的组织结构进行重新组织
 */

// ==================== 导入相关类型 ====================

import type { ProductInfo } from './product';
import type { UnitInfo } from './unit';

// ==================== 枚举类型定义 ====================

/**
 * BOM状态（与后端实际返回保持一致，使用小写字符串联合类型）
 */
export type BomStatus = 'draft' | 'active' | 'inactive' | 'archived';

/**
 * BOM类型（与前端表单选项一致，使用小写字符串联合类型）
 */
export type BomType = 'production' | 'engineering' | 'sales';

/**
 * 物料需求类型（与后端/前端使用一致，使用小写字符串联合类型）
 */
export type MaterialRequirementType = 'fixed' | 'variable' | 'optional';

// 类型别名（保持兼容性）
export type BomStatusType = BomStatus;
export type BomTypeType = BomType;
export type MaterialRequirementTypeType = MaterialRequirementType;

/**
 * 替代物料接口
 */
export interface AlternativeMaterial {
  id: string;
  materialId: string;               // 替代物料ID
  materialCode: string;             // 替代物料编码
  materialName: string;             // 替代物料名称
  substitutionRatio: number;        // 替代比例
  priority: number;                 // 优先级
  isPreferred: boolean;             // 是否首选
  remark?: string;                  // 备注
}

/**
 * BOM物料项接口
 */
export interface BomItem {
  id: string;
  bomId: string;                    // 所属BOM ID
  materialId: string;               // 物料ID
  materialCode: string;             // 物料编码
  materialName: string;             // 物料名称
  materialSpec?: string;            // 物料规格
  quantity: number;                 // 用量
  unitId: string;                   // 单位ID
  unitName?: string;                // 单位名称
  unitCost?: number;                // 单位成本（可选）
  totalCost?: number;               // 总成本（可选）
  
  scrapRate?: number;               // 损耗率 (%)
  fixedScrap?: number;              // 固定损耗
  
  // 层级信息（Odoo风格）
  level?: number;                   // 层级（可选，默认1）
  childBomId?: string;              // 子BOM ID（如果该物料有BOM）
  childBomCode?: string;            // 子BOM编码
  childBomName?: string;            // 子BOM名称
  sequence: number;                 // 序号
  
  // 需求信息
  requirementType: MaterialRequirementType; // 需求类型
  isKey: boolean;                   // 是否关键物料
  isPhantom: boolean;               // 是否虚拟件
  
  // 替代料信息
  alternativeMaterials?: AlternativeMaterial[]; // 替代料列表
  
  // 工艺信息
  processInfo?: string;             // 工艺说明
  remark?: string;                  // 备注
  
  // 有效期
  effectiveDate?: Date;             // 生效日期
  expiryDate?: Date;                // 失效日期
  
  // 审计信息
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * 工作中心接口
 */
export interface Workcenter {
  id: string;
  code: string;                     // 工作中心编码
  name: string;                     // 工作中心名称
  active: boolean;                 // 是否启用
  timeEfficiency: number;           // 时间效率(%)
  capacity: number;                // 产能
  oeeTarget: number;                // OEE目标(%)
  timeStart: number;               // 准备时间(分钟)
  timeStop: number;                // 清理时间(分钟)
  costsHour: number;               // 每小时成本
  costsHourEmployee: number;        // 每员工每小时成本
  description?: string;            // 描述
  companyId?: string;             // 公司ID
  
  // 关联信息
  operations?: RoutingWorkcenter[]; // 工序操作列表
  
  // 审计信息
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * 工艺路线工序接口
 */
export interface RoutingWorkcenter {
  id: string;
  routingId: string;                // 关联的工艺路线ID
  workcenterId: string;             // 关联的工作中心ID
  name: string;                     // 工序名称
  sequence: number;                 // 序号
  timeMode: string;                // 时间计算模式
  timeCycleManual: number;         // 手动设置的周期时间
  batch: boolean;                   // 是否批量处理
  batchSize: number;               // 批量大小
  worksheetType?: string;         // 工作表类型
  worksheetLink?: string;          // 工作表链接
  description?: string;            // 描述
  
  // 关联信息
  routing?: Routing;               // 关联的工艺路线
  workcenter?: Workcenter;         // 关联的工作中心
}

/**
 * 工艺路线接口
 */
export interface Routing {
  id: string;
  code: string;                     // 工艺路线编码
  name: string;                     // 工艺路线名称
  active: boolean;                  // 是否启用
  description?: string;            // 描述
  companyId?: string;              // 公司ID
  
  // 关联信息
  operations?: RoutingWorkcenter[]; // 工序操作列表
  boms?: ProductBom[];              // 关联的BOM列表
  
  // 审计信息
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * 产品BOM主接口
 */
export interface ProductBom {
  id: string;
  code: string;                     // BOM编码
  name: string;                     // BOM名称
  productId: string;                // 产品ID
  variantId?: string;               // 变体ID（可选，变体级BOM时使用）
  productCode: string;              // 产品编码
  productName: string;              // 产品名称
  
  // BOM基本信息
  type: BomType;                    // BOM类型
  version: string;                  // 版本号
  status: BomStatus;                // 状态
  isDefault: boolean;               // 是否默认BOM
  
  // 数量和单位
  baseQuantity: number;             // 基准数量
  baseUnitId: string;               // 基准单位ID
  baseUnitName?: string;            // 基准单位名称
  
  // 工艺路线
  routingId?: string;               // 关联的工艺路线ID
  routingCode?: string;             // 关联的工艺路线编码
  routingName?: string;             // 关联的工艺路线名称
  
  // 有效期
  effectiveDate: Date;              // 生效日期
  expiryDate?: Date;                // 失效日期
  
  // 描述信息
  description?: string;             // 描述
  remark?: string;                  // 备注
  
  // BOM物料项
  items?: BomItem[];                // BOM物料项
  
  // 审计信息
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  approvedBy?: string;              // 审批人
  approvedAt?: Date;                // 审批时间
  
  // 关联信息
  product?: ProductInfo;            // 产品信息
  baseUnit?: UnitInfo;              // 基准单位信息
  routing?: Routing;                // 工艺路线信息
  childBomCount?: number;
}

/**
 * BOM表单数据接口
 */
export interface BomFormData {
  code?: string;                    // BOM编码（新增时可选，编辑时必填）
  name: string;                     // BOM名称
  productId?: string;               // 产品ID（与variantId二选一，传variantId可不传产品ID）
  variantId?: string;               // 变体ID（可选，指定为变体级BOM）
  type: BomType;                    // BOM类型
  version: string;                  // 版本号
  status: BomStatus;                // 状态
  isDefault: boolean;               // 是否默认BOM
  baseQuantity: number;             // 基准数量
  baseUnitId: string;               // 基准单位ID
  routingId?: string;               // 工艺路线ID
  effectiveDate: Date;              // 生效日期
  expiryDate?: Date;                // 失效日期
  description?: string;             // 描述
  remark?: string;                  // 备注
  
  // BOM物料项（表单数据格式）
  items?: Omit<BomItem, 'id' | 'bomId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[];
}

/**
 * BOM物料项表单数据接口
 */
export interface BomItemFormData {
  materialId?: string;              // 物料产品ID（与materialVariantId二选一）
  materialVariantId?: string;       // 物料变体ID（可选）
  quantity: number;                 // 用量
  unitId: string;                   // 单位ID
  sequence: number;                 // 序号
  requirementType: MaterialRequirementType; // 需求类型
  isKey: boolean;                   // 是否关键物料
  isPhantom: boolean;               // 是否虚拟件
  scrapRate?: number;               // 损耗率 (%)
  fixedScrap?: number;              // 固定损耗
  processInfo?: string;             // 工艺说明
  remark?: string;                  // 备注
  effectiveDate?: Date;             // 生效日期
  expiryDate?: Date;                // 失效日期
  childBomId?: string;              // 子BOM ID
  
  // 替代料信息（表单数据格式）
  alternativeMaterials?: Omit<AlternativeMaterial, 'id'>[];
}

/**
 * 批量同步物料项输入项（允许携带现有项ID以实现幂等与差异识别）
 */
export type BomItemSyncItem = BomItemFormData & { id?: string };

/**
 * 批量同步结果汇总
 */
export interface BomItemsSyncSummary {
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
}

/**
 * BOM查询参数接口
 */
export interface BomQueryParams {
  page?: number;                    // 页码
  pageSize?: number;                // 每页数量
  keyword?: string;                 // 关键词搜索
  code?: string;                    // BOM编码
  name?: string;                    // BOM名称
  productId?: string;               // 产品ID
  variantId?: string;               // 变体ID（可选）
  type?: BomType;                   // BOM类型
  status?: BomStatus;               // 状态
  version?: string;                 // 版本
  isDefault?: boolean;              // 是否默认
  routingId?: string;               // 工艺路线ID
  
  // 日期范围查询
  effectiveDateFrom?: Date;         // 生效日期起
  effectiveDateTo?: Date;           // 生效日期止
  
  // 排序
  sortField?: string;               // 排序字段
  sortOrder?: 'asc' | 'desc';       // 排序方向
}

/**
 * BOM列表响应接口
 */
export interface BomListResponse {
  success: boolean;
  data: ProductBom[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
  timestamp: Date;
}

/**
 * BOM导入数据接口
 */
export interface BomImportData {
  bomCode?: string;                 // BOM编码
  bomName: string;                  // BOM名称
  productCode: string;              // 产品编码
  type: string;                     // BOM类型字符串
  version: string;                  // 版本号
  baseQuantity: number;             // 基准数量
  baseUnit: string;                 // 基准单位名称
  
  // 物料项信息
  materialCode: string;             // 物料编码
  materialName: string;             // 物料名称
  quantity: number;                 // 用量
  unit: string;                     // 单位名称
  sequence: number;                 // 序号
  requirementType: string;          // 需求类型字符串
  isKey: boolean;                   // 是否关键物料
  isPhantom: boolean;               // 是否虚拟件
  
  [key: string]: any;               // 支持自定义字段
}

/**
 * BOM导入结果接口
 */
export interface BomImportResult {
  total: number;                    // 总数
  success: number;                  // 成功数
  failed: number;                   // 失败数
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: any;
  }>;
  successData: ProductBom[];        // 成功导入的数据
  failedData: BomImportData[];      // 失败的数据
}

/**
 * BOM导出数据接口
 */
export interface BomExportData {
  code: string;                     // BOM编码
  name: string;                     // BOM名称
  productCode: string;              // 产品编码
  productName: string;              // 产品名称
  type: string;                     // BOM类型
  version: string;                  // 版本号
  status: string;                   // 状态
  isDefault: boolean;               // 是否默认BOM
  baseQuantity: number;             // 基准数量
  baseUnitName: string;             // 基准单位名称
  routingCode?: string;             // 工艺路线编码
  routingName?: string;             // 工艺路线名称
  effectiveDate: string;            // 生效日期
  expiryDate?: string;              // 失效日期
  description?: string;             // 描述
  remark?: string;                  // 备注
  createdAt: string;                // 创建时间
  updatedAt: string;                // 更新时间
}

/**
 * BOM树节点（母子结构展示）
 */
export interface BomTreeNode {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit?: string;
  type?: string;
  isPhantom?: boolean;
  children?: BomTreeNode[];
}

/**
 * 后端返回的BOM数据结构（原始格式）
 * 用于前端服务层进行数据转换
 */
export interface BackendBomData {
  id: string;
  code: string;
  name: string;
  productId: string;
  type: string;                     // 后端存储的字符串值
  version: string;
  status: string;                   // 后端存储的字符串值
  isDefault: boolean;
  baseQuantity: number;
  baseUnitId: string;
  routingId?: string;
  effectiveDate: string;            // 后端返回的日期字符串
  expiryDate?: string;              // 后端返回的日期字符串
  description?: string;
  remark?: string;
  approvedBy?: string;
  approvedAt?: string;              // 后端返回的日期字符串
  createdBy: string;
  updatedBy: string;
  createdAt: string;                // 后端返回的日期字符串
  updatedAt: string;                // 后端返回的日期字符串
  
  // 关联对象（后端返回的嵌套结构）
  product?: { 
    code: string; 
    name: string; 
  };
  baseUnit?: { 
    name: string; 
    symbol: string; 
  };
  routing?: { 
    code: string; 
    name: string; 
  };
}

/**
 * BOM成本项接口
 */
export interface BomCostItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  level: number;
  sequence: number;
  costType?: 'material' | 'labor' | 'overhead';
  supplier?: string;
  lastUpdated?: string;
  children?: BomCostItem[];
}

/**
 * BOM成本汇总接口
 */
export interface BomCostSummary {
  bomId: string;
  bomCode: string;
  bomName: string;
  baseQuantity: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalCost: number;
  costPerUnit: number;
  profitMargin?: number;
  sellingPrice?: number;
  calculatedAt: Date;
  calculatedBy: string;
  items: BomCostItem[];
}

/**
 * 成本分析接口
 */
export interface CostAnalysis {
  costByCategory: {
    category: string;
    cost: number;
    percentage: number;
  }[];
  costTrend: {
    date: string;
    cost: number;
  }[];
  topCostItems: {
    item: string;
    cost: number;
    percentage: number;
  }[];
}

/**
 * BOM成本计算参数接口
 */
export interface BomCostCalculationParams {
  bomId: string;
  bomCode?: string;
  version?: string;
  calculationDate?: Date;
  includeLabor?: boolean;
  includeOverhead?: boolean;
  laborCostRate?: number;
  overheadCostRate?: number;
}

/**
 * BOM成本计算接口
 */
export interface BomCostCalculation {
  bomId: string;
  baseQuantity: number;
  calculatedAt: Date;
  calculatedBy: string;
}

/**
 * BOM版本比较接口
 */
export interface BomVersionComparison {
  oldVersion: ProductBom;
  newVersion: ProductBom;
  differences: BomDifference[];
}

/**
 * BOM差异接口
 */
export interface BomDifference {
  type: 'added' | 'removed' | 'modified';
  field: string;
  oldValue?: any;
  newValue?: any;
  itemId?: string;
  materialCode?: string;
  materialName?: string;
}

/**
 * BOM复制选项接口
 */
export interface BomCopyOptions {
  copyItems: boolean;               // 是否复制物料项
  copyAlternatives: boolean;        // 是否复制替代料
  newVersion?: string;              // 新版本号
  newEffectiveDate?: Date;          // 新生效日期
}
