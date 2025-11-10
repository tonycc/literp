/**
 * 工作中心相关类型定义
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
// 工作中心类型枚举（与后端约定保持一致）
export enum WorkcenterType {
  INTERNAL = 'internal',
  OUTSOURCING = 'outsourcing',
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * 工作中心信息接口
 */
export interface WorkcenterInfo {
  id: string;
  code: string;
  name: string;
  type?: string;
  active: boolean;
  description?: string;
  companyId?: string;
  capacity: number;
  timeEfficiency: number;
  oeeTarget: number;
  timeStart: number;
  timeStop: number;
  costsHour: number;
  costsHourEmployee: number;
  teamSize?: number;
  skillLevel?: string;
  shiftPattern?: string;
  teamMembers?: string;
  shiftSchedule?: string;
  managerId?: string;
  equipmentId?: string;
  maintenanceCycle?: number;
  parentId?: string;
  manager?: {
    id: string;
    username: string;
    email: string;
  };
  parent?: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/**
 * 工作中心创建请求接口
 */
export interface CreateWorkcenterRequest {
  code: string;
  name: string;
  type?: string;
  active?: boolean;
  description?: string;
  companyId?: string;
  capacity?: number;
  timeEfficiency?: number;
  oeeTarget?: number;
  timeStart?: number;
  timeStop?: number;
  costsHour?: number;
  costsHourEmployee?: number;
  teamSize?: number;
  skillLevel?: string;
  shiftPattern?: string;
  managerId?: string;
  equipmentId?: string;
  maintenanceCycle?: number;
  parentId?: string;
}

/**
 * 工作中心更新请求接口
 */
export interface UpdateWorkcenterRequest {
  code?: string;
  name?: string;
  type?: string;
  active?: boolean;
  description?: string;
  companyId?: string;
  capacity?: number;
  timeEfficiency?: number;
  oeeTarget?: number;
  timeStart?: number;
  timeStop?: number;
  costsHour?: number;
  costsHourEmployee?: number;
  teamSize?: number;
  skillLevel?: string;
  shiftPattern?: string;
  managerId?: string;
  equipmentId?: string;
  maintenanceCycle?: number;
  parentId?: string;
}

/**
 * 工作中心查询参数接口
 */
export interface WorkcenterQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  active?: boolean;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 工作中心列表响应接口
 */
export interface WorkcenterListResponse {
  data: WorkcenterInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 工作中心编码验证请求接口
 */
export interface WorkcenterValidateCodeRequest {
  code: string;
  excludeId?: string;
}

/**
 * 工作中心编码验证响应接口
 */
export interface WorkcenterValidateCodeResponse {
  isValid: boolean;
  isUnique: boolean;
  message?: string;
}

/**
 * 工作中心选项接口
 */
export interface WorkcenterOption {
  value: string;
  label: string;
  code: string;
  type?: string;
  disabled?: boolean;
}