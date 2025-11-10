/**
 * 产品类目维护相关类型定义
 */

/**
 * 产品类目信息接口
 */
export interface ProductCategoryInfo {
  id: string;
  name: string; // 类型名称
  code: string; // 系统自动生成的字母+数字组合
  description?: string; // 描述
  sortOrder: number; // 排序
  isActive: boolean; // 是否启用
  parentCode?: string; // 上级类别编码
  parentName?: string; // 上级类别名称
  level: number; // 层级，1为顶级
  path?: string; // 类别路径，如：/电子产品/手机配件
  hasChildren?: boolean; // 是否有子类别
  childrenCount?: number; // 子类别数量
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
}

/**
 * 产品类目表单数据接口
 */
export interface ProductCategoryFormData {
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  parentCode?: string; // 上级类别编码
}

/**
 * 产品类目查询参数接口
 */
export interface ProductCategoryQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: boolean;
  parentCode?: string; // 按上级类别筛选
  level?: number; // 按层级筛选
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 产品类目状态枚举
 */
export enum ProductCategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

/**
 * 产品类别排序字段枚举
 */
export enum ProductCategorySortField {
  NAME = 'name',
  CODE = 'code',
  SORT_ORDER = 'sortOrder',
  LEVEL = 'level',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

/**
 * 产品类别移动操作接口
 */
export interface ProductCategoryMoveRequest {
  categoryId: string;
  newParentCode?: string; // 新的父级编码，为空表示移动到顶级
  newSortOrder?: number; // 新的排序位置
}

/**
 * 产品类别导入数据接口
 */
export interface ProductCategoryImportData {
  name: string;
  description?: string;
  parentCode?: string; // 上级类别编码
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * 产品类别导入结果接口
 */
export interface ProductCategoryImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: ProductCategoryImportData;
    error: string;
  }>;
  createdCategories: ProductCategoryInfo[];
}

/**
 * 产品类目导出参数接口
 */
export interface ProductCategoryExportParams {
  format: 'excel' | 'csv';
  includeInactive?: boolean;
  level?: number; // 导出指定层级
  parentCode?: string; // 导出指定父级下的类别
}