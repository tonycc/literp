/**
 * 工序维护相关类型定义
 */

/**
 * 工序信息接口
 */
export interface OperationInfo {
  id: string;
  name: string; // 工序名称
  code: string; // 工序编码
  description?: string; // 描述
  standardTime?: number; // 标准工时(分钟)
  wageRate?: number; // 工价费率
  costPerHour?: number; // 每小时成本
  unit?: string; // 工价单位
  isActive: boolean; // 是否启用
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  defectIds?: string[]; // 关联的不良品项ID列表
  defects?: { // 关联的不良品项详情
    id: string;
    code: string;
    name: string;
  }[];
}

/**
 * 工序表单数据接口
 */
export interface OperationFormData {
  name: string;
  code: string;
  description?: string;
  standardTime?: number;
  wageRate?: number; // 工价费率
  costPerHour?: number; // 每小时成本
  unit?: string; // 工价单位
  isActive: boolean;
  defectIds?: string[]; // 关联的不良品项ID列表
}

/**
 * 工序查询参数接口
 */
export interface OperationQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 工序状态枚举
 */
export enum OperationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

/**
 * 工序排序字段枚举
 */
export enum OperationSortField {
  NAME = 'name',
  CODE = 'code',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}