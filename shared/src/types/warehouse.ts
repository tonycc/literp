/**
 * 仓库管理相关类型定义
 */

/**
 * 仓库类型枚举
 */
export enum WarehouseType {
  MAIN = 'main',         // 主仓
  BRANCH = 'branch',     // 分仓
  VIRTUAL = 'virtual'    // 虚拟仓
}

/**
 * 仓库状态枚举
 */
export enum WarehouseStatus {
  ACTIVE = 'active',     // 启用
  INACTIVE = 'inactive', // 停用
  MAINTENANCE = 'maintenance' // 维护中
}

/**
 * 仓库信息接口
 */
export interface WarehouseInfo {
  id: string;
  code: string;           // 仓库编码
  name: string;           // 仓库名称
  type: WarehouseType;    // 仓库类型
  address?: string;       // 仓库地址
  managerId?: string;     // 仓库管理员ID
  managerName?: string;   // 仓库管理员姓名
  phone?: string;         // 联系电话
  email?: string;         // 联系邮箱
  capacity?: number;      // 仓库容量
  area?: number;          // 仓库面积
  description?: string;   // 仓库描述
  remark?: string;        // 备注
  isActive: boolean;      // 是否启用
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 仓库表单数据接口
 */
export interface WarehouseFormData {
  code: string;
  name: string;
  type: WarehouseType;
  address?: string;
  managerId?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  area?: number;
  description?: string;
  remark?: string;
  isActive: boolean;
}

/**
 * 仓库查询参数接口
 */
export interface WarehouseQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  code?: string;
  name?: string;
  type?: WarehouseType;
  managerId?: string;
  isActive?: boolean;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 仓库列表响应接口
 */
export interface WarehouseListResponse {
  success: boolean;
  data: WarehouseInfo[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
  timestamp: Date;
}