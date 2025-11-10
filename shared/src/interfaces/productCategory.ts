/**
 * 产品类别管理API接口定义
 */
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import type { ApiResponse, PaginatedResponse, ID } from '../types/common';
import type {
  ProductCategoryInfo,
  ProductCategoryQueryParams
} from '../types/productCategory';

/**
 * 产品类别创建请求接口
 */
export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  parentCode?: string; // 上级类别编码
}

/**
 * 产品类别更新请求接口
 */
export interface UpdateProductCategoryRequest {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  parentCode?: string; // 上级类别编码
}

/**
 * 产品类别列表响应接口
 */
export interface ProductCategoryListResponse {
  data: ProductCategoryInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 产品类别树形结构节点接口
 */
export interface ProductCategoryTreeNode {
  id: string;
  name: string;
  code: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  level: number;
  children?: ProductCategoryTreeNode[];
  parentCode?: string;
  parentName?: string;
}

/**
 * 产品类别树形响应接口
 */
export interface ProductCategoryTreeResponse {
  data: ProductCategoryTreeNode[];
  total: number;
}

/**
 * 编码生成请求接口
 */
export interface GenerateCodeRequest {
  parentCode?: string; // 上级类别编码，为空时生成一级类别编码
}

/**
 * 编码生成响应接口
 */
export interface GenerateCodeResponse {
  code: string;
  level: number;
  parentCode?: string;
}

/**
 * 编码验证请求接口
 */
export interface ValidateCodeRequest {
  code: string;
  excludeId?: string; // 排除的ID（用于编辑时验证）
}

/**
 * 编码验证响应接口
 */
export interface ValidateCodeResponse {
  isValid: boolean;
  isUnique: boolean;
  message?: string;
}

/**
 * 批量操作请求接口
 */
export interface BatchOperationRequest {
  ids: string[];
  operation: 'activate' | 'deactivate' | 'delete';
}

/**
 * 批量操作响应接口
 */
export interface BatchOperationResponse {
  successCount: number;
  failureCount: number;
  failures?: Array<{
    id: string;
    reason: string;
  }>;
}

/**
 * 产品类别统计信息接口
 */
export interface ProductCategoryStats {
  total: number;
  active: number;
  inactive: number;
  level1Count: number;
  level2Count: number;
  byLevel: Record<number, number>;
}

/**
 * 产品类别选项接口（用于下拉选择）
 */
export interface ProductCategoryOption {
  value: string; // 编码
  label: string; // 名称
  level: number;
  parentCode?: string;
  disabled?: boolean;
}

/**
 * 产品类别选项列表响应接口
 */
export interface ProductCategoryOptionsResponse {
  data: ProductCategoryOption[];
}

/**
 * 产品类别API接口
 */
export interface ProductCategoryApi {
  /**
   * 获取产品类别列表（分页）
   */
  getList(_params?: ProductCategoryQueryParams): Promise<PaginatedResponse<ProductCategoryInfo>>;

  /**
   * 获取产品类别树形结构
   */
  getTree(_params?: { isActive?: boolean }): Promise<ApiResponse<ProductCategoryTreeNode[]>>;

  /**
   * 获取产品类别选项（用于下拉选择）
   */
  getOptions(_params?: { 
    _level?: number; 
    _parentCode?: string; 
    _isActive?: boolean 
  }): Promise<ApiResponse<ProductCategoryOption[]>>;

  /**
   * 根据ID获取产品类别详情
   */
  getById(_id: ID): Promise<ApiResponse<ProductCategoryInfo>>;

  /**
   * 根据编码获取产品类别详情
   */
  getByCode(_code: string): Promise<ApiResponse<ProductCategoryInfo>>;

  /**
   * 创建产品类别
   */
  create(_data: CreateProductCategoryRequest): Promise<ApiResponse<ProductCategoryInfo>>;

  /**
   * 更新产品类别
   */
  update(_id: ID, _data: UpdateProductCategoryRequest): Promise<ApiResponse<ProductCategoryInfo>>;

  /**
   * 删除产品类别
   */
  delete(_id: ID): Promise<ApiResponse<void>>;

  /**
   * 切换产品类别状态
   */
  toggleStatus(_id: ID, _isActive: boolean): Promise<ApiResponse<void>>;

  /**
   * 批量操作
   */
  batchOperation(_data: BatchOperationRequest): Promise<ApiResponse<BatchOperationResponse>>;

  /**
   * 生成产品类别编码
   */
  generateCode(_data: GenerateCodeRequest): Promise<ApiResponse<GenerateCodeResponse>>;

  /**
   * 验证产品类别编码
   */
  validateCode(_data: ValidateCodeRequest): Promise<ApiResponse<ValidateCodeResponse>>;

  /**
   * 获取产品类别统计信息
   */
  getStats(): Promise<ApiResponse<ProductCategoryStats>>;

  /**
   * 调整排序
   */
  updateSortOrder(_data: Array<{ id: string; sortOrder: number }>): Promise<ApiResponse<void>>;

  /**
   * 移动类别（更改父级）
   */
  moveCategory(_id: ID, _newParentCode?: string): Promise<ApiResponse<ProductCategoryInfo>>;
}