/**
 * 工作中心管理API接口定义
 */
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import type { ApiResponse, PaginatedResponse, ID } from '../types/common';
import type {
  WorkcenterInfo,
  WorkcenterQueryParams,
  CreateWorkcenterRequest,
  UpdateWorkcenterRequest,
  WorkcenterValidateCodeRequest,
  WorkcenterValidateCodeResponse,
  WorkcenterOption
} from '../types/workcenter';

/**
 * 工作中心API接口
 */
export interface WorkcenterApi {
  /**
   * 获取工作中心列表（分页）
   */
  getList(_params?: WorkcenterQueryParams): Promise<PaginatedResponse<WorkcenterInfo>>;

  /**
   * 获取工作中心选项（用于下拉选择）
   */
  getOptions(_params?: { 
    _active?: boolean,
    _type?: string
  }): Promise<ApiResponse<WorkcenterOption[]>>;

  /**
   * 根据ID获取工作中心详情
   */
  getById(_id: ID): Promise<ApiResponse<WorkcenterInfo>>;

  /**
   * 根据编码获取工作中心详情
   */
  getByCode(_code: string): Promise<ApiResponse<WorkcenterInfo>>;

  /**
   * 创建工作中心
   */
  create(_data: CreateWorkcenterRequest): Promise<ApiResponse<WorkcenterInfo>>;

  /**
   * 更新工作中心
   */
  update(_id: ID, _data: UpdateWorkcenterRequest): Promise<ApiResponse<WorkcenterInfo>>;

  /**
   * 删除工作中心
   */
  delete(_id: ID): Promise<ApiResponse<void>>;

  /**
   * 切换工作中心状态
   */
  toggleStatus(_id: ID, _isActive: boolean): Promise<ApiResponse<WorkcenterInfo>>;

  /**
   * 验证工作中心编码
   */
  validateCode(_data: WorkcenterValidateCodeRequest): Promise<ApiResponse<WorkcenterValidateCodeResponse>>;

  /**
   * 更新车间成员
   */
  updateTeamMembers(_id: ID, _memberIds: string[]): Promise<ApiResponse<WorkcenterInfo>>;

  /**
   * 获取车间成员
   */
  getTeamMembers(_id: ID): Promise<ApiResponse<{ members: string[] }>>;

  /**
   * 更新排班信息
   */
  updateShiftSchedule(_id: ID, _schedule: any): Promise<ApiResponse<WorkcenterInfo>>;

  /**
   * 获取排班信息
   */
  getShiftSchedule(_id: ID): Promise<ApiResponse<{ schedule: any }>>;
}