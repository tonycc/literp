/**
 * 工艺路线管理API接口定义
 */
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import type { ApiResponse, PaginatedResponse, ID } from '../types/common';
import type {
  RoutingInfo,
  RoutingQueryParams,
  CreateRoutingRequest,
  UpdateRoutingRequest,
  RoutingValidateCodeRequest,
  RoutingValidateCodeResponse,
  RoutingWorkcenterInfo,
} from '../types/routing';
import type { WorkcenterOption } from '../types/workcenter';
import type { OperationOption } from '../interfaces/operation';

/**
 * 工艺路线API接口
 */
export interface RoutingApi {
  /**
   * 获取工艺路线列表（分页）
   */
  getList(_params?: RoutingQueryParams): Promise<PaginatedResponse<RoutingInfo>>;

  /**
   * 获取工艺路线选项（用于下拉选择）
   */
  getOptions(_params?: { 
    _active?: boolean 
  }): Promise<ApiResponse<RoutingOption[]>>;

  /**
   * 根据ID获取工艺路线详情
   */
  getById(_id: ID): Promise<ApiResponse<RoutingInfo>>;

  /**
   * 创建工艺路线
   */
  create(_data: CreateRoutingRequest): Promise<ApiResponse<RoutingInfo>>;

  /**
   * 更新工艺路线
   */
  update(_id: ID, _data: UpdateRoutingRequest): Promise<ApiResponse<RoutingInfo>>;

  /**
   * 删除工艺路线
   */
  delete(_id: ID): Promise<ApiResponse<void>>;

  /**
   * 切换工艺路线状态
   */
  toggleStatus(_id: ID, _isActive: boolean): Promise<ApiResponse<RoutingInfo>>;

  /**
   * 验证工艺路线编码
   */
  validateCode(_data: RoutingValidateCodeRequest): Promise<ApiResponse<RoutingValidateCodeResponse>>;

  /**
   * 获取工作中心选项
   */
  getWorkcenterOptions(_params?: { 
    _active?: boolean 
  }): Promise<ApiResponse<WorkcenterOption[]>>;

  /**
   * 获取工序选项
   */
  getOperationOptions(_params?: { 
    _active?: boolean 
  }): Promise<ApiResponse<OperationOption[]>>;

  /**
   * 获取指定工艺路线的工序列表
   */
  getOperations(_id: ID): Promise<ApiResponse<RoutingWorkcenterInfo[]>>;
}

/**
 * 工艺路线选项接口（用于下拉选择）
 */
export interface RoutingOption {
  value: string; // ID
  label: string; // 名称
  code: string;  // 编码
  disabled?: boolean;
}