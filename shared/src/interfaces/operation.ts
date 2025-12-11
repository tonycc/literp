/**
 * 工序管理API接口定义
 */
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import type { ApiResponse, PaginatedResponse, ID } from '../types/common';
import type {
  OperationInfo,
  OperationQueryParams
} from '../types/operation';

/**
 * 工序创建请求接口
 */
export interface CreateOperationRequest {
  name: string;
  code: string;
  description?: string;
  standardTime?: number;
  wageRate?: number; // 工价费率
  costPerHour?: number; // 每小时成本
  unit?: string; // 工价单位
  isActive: boolean;
}

/**
 * 工序更新请求接口
 */
export interface UpdateOperationRequest {
  name?: string;
  code?: string;
  description?: string;
  standardTime?: number;
  wageRate?: number; // 工价费率
  costPerHour?: number; // 每小时成本
  unit?: string; // 工价单位
  isActive?: boolean;
}

/**
 * 工序列表响应接口
 */
export interface OperationListResponse {
  data: OperationInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 工序编码验证请求接口
 */
export interface OperationValidateCodeRequest {
  code: string;
  excludeId?: string;
}

/**
 * 工序编码验证响应接口
 */
export interface OperationValidateCodeResponse {
  isValid: boolean;
  isUnique: boolean;
  message?: string;
}

/**
 * 工序名称验证请求接口
 */
export interface OperationValidateNameRequest {
  name: string;
  excludeId?: string;
}

/**
 * 工序名称验证响应接口
 */
export interface OperationValidateNameResponse {
  isValid: boolean;
  isUnique: boolean;
  message?: string;
}

/**
 * 工序统计信息接口
 */
export interface OperationStats {
  total: number;
  active: number;
  inactive: number;
}

/**
 * 工序选项接口（用于下拉选择）
 */
export interface OperationOption {
  value: string; // ID
  label: string; // 名称
  code: string;  // 编码
  disabled?: boolean;
}

/**
 * 工序选项列表响应接口
 */
export interface OperationOptionsResponse {
  data: OperationOption[];
}

/**
 * 工序API接口
 */
export interface OperationApi {
  /**
   * 获取工序列表（分页）
   */
  getList(_params?: OperationQueryParams): Promise<PaginatedResponse<OperationInfo>>;

  /**
   * 获取工序选项（用于下拉选择）
   */
  getOptions(_params?: { 
    isActive?: boolean 
  }): Promise<ApiResponse<OperationOption[]>>;

  /**
   * 根据ID获取工序详情
   */
  getById(_id: ID): Promise<ApiResponse<OperationInfo>>;

  /**
   * 根据编码获取工序详情
   */
  getByCode(_code: string): Promise<ApiResponse<OperationInfo>>;

  /**
   * 创建工序
   */
  create(_data: CreateOperationRequest): Promise<ApiResponse<OperationInfo>>;

  /**
   * 更新工序
   */
  update(_id: ID, _data: UpdateOperationRequest): Promise<ApiResponse<OperationInfo>>;

  /**
   * 删除工序
   */
  delete(_id: ID): Promise<ApiResponse<void>>;

  /**
   * 切换工序状态
   */
  toggleStatus(_id: ID, _isActive: boolean): Promise<ApiResponse<void>>;

  /**
   * 验证工序编码
   */
  validateCode(_data: OperationValidateCodeRequest): Promise<ApiResponse<OperationValidateCodeResponse>>;

  /**
   * 验证工序名称
   */
  validateName(_data: OperationValidateNameRequest): Promise<ApiResponse<OperationValidateNameResponse>>;

  /**
   * 获取工序统计信息
   */
  getStats(): Promise<ApiResponse<OperationStats>>;
}