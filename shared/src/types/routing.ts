/**
 * 工艺路线相关类型定义
 */

/**
 * 工艺路线信息接口
 */
export interface RoutingInfo {
  id: string;
  name: string;
  code: string;
  active: boolean;
  description?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

/**
 * 工艺路线作业信息接口
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkcenterType } from './workcenter';
/* eslint-enable @typescript-eslint/no-unused-vars */
export interface RoutingWorkcenterInfo {
  id: string;
  routingId: string;
  workcenterId: string;
  // 工作中心类型（用于判断外协等业务逻辑）
  workcenterType?: WorkcenterType;
  operationId: string;
  name: string;
  sequence: number;
  timeMode: string;
  timeCycleManual: number;
  wageRate: number;
  batch: boolean;
  batchSize: number;
  worksheetType?: string;
  worksheetLink?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 工艺路线工序输入（用于一次性提交/更新工序）
 */
export interface RoutingWorkcenterInput {
  workcenterId: string;
  operationId: string;
  name: string;
  sequence: number;
  timeMode: string;
  timeCycleManual: number;
  batch: boolean;
  batchSize: number;
  wageRate?: number;
  worksheetType?: string;
  worksheetLink?: string;
  description?: string;
}

/**
 * 工艺路线创建请求接口
 */
export interface CreateRoutingRequest {
  name: string;
  code: string;
  active: boolean;
  description?: string;
  companyId?: string;
  // 一次性提交排序后的工序
  operations?: RoutingWorkcenterInput[];
}

/**
 * 工艺路线更新请求接口
 */
export interface UpdateRoutingRequest {
  name?: string;
  code?: string;
  active?: boolean;
  description?: string;
  companyId?: string;
  // 一次性更新/替换工序（全量替换）
  operations?: RoutingWorkcenterInput[];
}

/**
 * 工艺路线表单数据接口
 */
export interface RoutingFormData extends CreateRoutingRequest {
  // 扩展表单特定字段（如果需要）
}

/**
 * 工艺路线作业创建请求接口
 */
export interface CreateRoutingWorkcenterRequest {
  routingId: string;
  workcenterId: string;
  operationId: string;
  name: string;
  sequence: number;
  timeMode: string;
  timeCycleManual: number;
  batch: boolean;
  batchSize: number;
  worksheetType?: string;
  worksheetLink?: string;
  description?: string;
}

/**
 * 工艺路线作业更新请求接口
 */
export interface UpdateRoutingWorkcenterRequest {
  workcenterId?: string;
  operationId?: string;
  name?: string;
  sequence?: number;
  timeMode?: string;
  timeCycleManual?: number;
  batch?: boolean;
  batchSize?: number;
  worksheetType?: string;
  worksheetLink?: string;
  description?: string;
}

/**
 * 工艺路线查询参数接口
 */
export interface RoutingQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 工艺路线列表响应接口
 */
export interface RoutingListResponse {
  data: RoutingInfo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 工艺路线编码验证请求接口
 */
export interface RoutingValidateCodeRequest {
  code: string;
  excludeId?: string;
}

/**
 * 工艺路线编码验证响应接口
 */
export interface RoutingValidateCodeResponse {
  isValid: boolean;
  isUnique: boolean;
  message?: string;
}

