// 导入相关类型
import { UnitInfo } from './unit';
import { WarehouseInfo } from './warehouse';
import { ProductCategoryInfo } from './productCategory';

/**
 * 产品类型枚举
 */
export enum ProductType {
  RAW_MATERIAL = 'raw_material',           // 原材料
  SEMI_FINISHED_PRODUCT = 'semi_finished_product', // 半成品
  FINISHED_PRODUCT = 'finished_product'    // 成品
}

/**
 * 产品状态枚举
 */
export enum ProductStatus {
  ACTIVE = 'active',     // 启用
  INACTIVE = 'inactive', // 停用
  DRAFT = 'draft'        // 草稿
}

/**
 * 获取方式枚举
 */
export enum AcquisitionMethod {
  PURCHASE = 'purchase',     // 采购
  PRODUCTION = 'production', // 生产
  OUTSOURCING = 'outsourcing' // 外协
}

/**
 * 规格参数类型枚举
 */
export enum SpecificationType {
  TEXT = 'text',         // 文本
  NUMBER = 'number',     // 数字
  SELECT = 'select',     // 选择
  BOOLEAN = 'boolean'    // 布尔值
}

/**
 * 产品规格参数接口
 */
export interface ProductSpecification {
  id: string;
  productId: string;      // 产品ID
  name: string;           // 参数名称
  value: string;          // 参数值
  unit?: string;          // 参数单位
  type: SpecificationType; // 参数类型
  options?: string;       // 选项（当type为select时，JSON格式）
  required: boolean;      // 是否必填
  sortOrder: number;      // 排序
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 产品辅助单位接口
 */
export interface ProductAlternativeUnit {
  id: string;
  productId: string;      // 产品ID
  unitId: string;         // 辅助单位ID
  conversionRate: number; // 与主单位的换算比率
  isDefault: boolean;     // 是否为默认辅助单位
  createdAt: Date;
  updatedAt: Date;
  unit?: UnitInfo;        // 单位信息
}

/**
 * 产品图片接口
 */
export interface ProductImage {
  id: string;
  productId: string;      // 产品ID
  url: string;            // 图片URL
  altText?: string;       // 图片描述
  sortOrder: number;      // 排序
  isPrimary: boolean;     // 是否为主图
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 产品文档接口
 */
export interface ProductDocument {
  id: string;
  productId: string;      // 产品ID
  name: string;           // 文档名称
  url: string;            // 文档URL
  type?: string;          // 文档类型
  size?: number;          // 文件大小（字节）
  sortOrder: number;      // 排序
  createdAt: Date;
  updatedAt: Date;
}



/**
 * 产品信息接口
 */
export interface ProductInfo {
  id: string;
  code: string;                    // 产品编码（唯一）
  name: string;                    // 产品名称
  type: ProductType;               // 产品属性（原材料、半成品、成品）
  categoryId: string;              // 产品分类ID
  unitId: string;                  // 主单位ID
  defaultWarehouseId?: string;            // 默认仓库ID
  status: ProductStatus;           // 产品状态
  acquisitionMethod: AcquisitionMethod; // 获取方式
  
  specification?: string;          // 产品规格
  model?: string;                  // 型号
  barcode?: string;                // 条形码
  qrCode?: string;                 // 二维码
  
  // 成本信息
  standardCost?: number;           // 标准成本
  averageCost?: number;            // 平均成本
  latestCost?: number;             // 最新成本
  
  // 库存信息
  safetyStock?: number;            // 安全库存
  safetyStockMin?: number;         // 安全库存下限
  safetyStockMax?: number;         // 安全库存上限
  minStock?: number;               // 最小库存
  maxStock?: number;               // 最大库存
  reorderPoint?: number;           // 再订货点
  
  // 描述信息
  description?: string;            // 产品描述
  remark?: string;                 // 备注
  
  // 状态信息
  isActive: boolean;               // 是否启用
  
  // 审计信息
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;                 // 版本号
  
  // 关联数据
  unit?: UnitInfo;                 // 主单位信息
  warehouse?: WarehouseInfo;       // 默认仓库信息
  category?: ProductCategoryInfo;  // 产品类别信息
  specifications?: ProductSpecification[]; // 详细规格参数
  alternativeUnits?: ProductAlternativeUnit[]; // 辅助计量单位
  images?: ProductImage[];         // 产品图片
  documents?: ProductDocument[];   // 相关文档
}



/**
 * 产品表单数据接口
 * 根据前端表单实际字段调整
 */
export interface ProductFormData {
  // 基本信息 - 必填字段
  code?: string;                       // 产品编码（新增时可选，编辑时必填）
  name: string;                        // 产品名称
  type: ProductType;                   // 产品属性
  categoryId: string;                  // 产品类目
  specification: string;               // 产品规格（前端表单中为必填）
  unitId: string;                      // 计量单位
  defaultWarehouseId: string;          // 默认仓库（前端表单中为必填）
  acquisitionMethod: AcquisitionMethod; // 获取方式
  status: ProductStatus;               // 产品状态
  
  // 基本信息 - 可选字段
  model?: string;                      // 产品型号
  barcode?: string;                    // 条形码
  qrCode?: string;                     // 二维码
  
  // 成本与库存信息
  standardCost?: number;               // 标准成本
  averageCost?: number;                // 平均成本
  latestCost?: number;                 // 最新成本
  safetyStock?: number;                // 安全库存
  safetyStockMin?: number;             // 安全库存下限
  safetyStockMax?: number;             // 安全库存上限
  minStock?: number;                   // 最小库存
  maxStock?: number;                   // 最大库存
  reorderPoint?: number;               // 再订货点
  
  // 详细信息
  description?: string;                // 产品描述
  remark?: string;                     // 备注
  
  // 系统字段
  isActive?: boolean;                  // 是否启用
  
  // 关联数据（文件上传等）
  specifications?: Omit<ProductSpecification, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
  alternativeUnits?: Omit<ProductAlternativeUnit, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[];
  images?: any[];                      // 产品图片（文件上传格式）
  documents?: any[];                   // 相关文档（文件上传格式）
}

/**
 * 产品查询参数接口
 */
export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  code?: string;
  name?: string;
  type?: ProductType;
  categoryId?: string;
  unitId?: string;
  defaultWarehouseId?: string;
  status?: ProductStatus;
  acquisitionMethod?: AcquisitionMethod;
  isActive?: boolean;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 产品列表响应接口
 */
export interface ProductListResponse {
  success: boolean;
  data: ProductInfo[];
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
 * 产品导入数据接口
 */
export interface ProductImportData {
  code?: string;
  name: string;
  type: string;                    // 产品类型字符串
  categoryPath: string;            // 分类路径，如：电子产品/手机
  unitName: string;                // 单位名称
  warehouseName?: string;          // 仓库名称
  status?: string;                 // 状态字符串
  acquisitionMethod?: string;      // 获取方式字符串
  specification?: string;          // 产品规格
  model?: string;
  barcode?: string;
  qrCode?: string;
  standardCost?: number;
  averageCost?: number;
  latestCost?: number;
  safetyStock?: number;
  safetyStockMin?: number;
  safetyStockMax?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  description?: string;
  remark?: string;
  isActive?: boolean;
  [key: string]: any;              // 支持自定义字段
}

/**
 * 产品导入结果接口
 */
export interface ProductImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: any;
  }>;
  successData: ProductInfo[];
  failedData: ProductImportData[];
}

/**
 * 产品导出数据接口
 */
export interface ProductExportData {
  code: string;
  name: string;
  type: string;
  categoryPath: string;
  unitName: string;
  warehouseName?: string;
  status: string;
  acquisitionMethod: string;
  specification?: string;
  model?: string;
  barcode?: string;
  qrCode?: string;
  standardCost?: number;
  averageCost?: number;
  latestCost?: number;
  safetyStock?: number;
  safetyStockMin?: number;
  safetyStockMax?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  description?: string;
  remark?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}