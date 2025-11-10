/**
 * 部门管理相关类型定义
 */

import type { ID, Timestamp } from './common';
import type { DepartmentPosition } from './position';

// 部门基础信息
export interface Department {
  id: ID;
  name: string;
  code?: string;
  description?: string;
  parentId?: ID;
  managerId?: ID;
  sort: number;
  level: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // 关联数据
  parent?: Department;
  children?: Department[];
  manager?: {
    id: ID;
    username: string;
    email: string;
  };
  userCount?: number;
  childrenCount?: number;
}

// 部门树节点
export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  level: number;
  path: string[];
}

// 用户部门关联
export interface UserDepartment {
  id: ID;
  userId: ID;
  departmentId: ID;
  position: DepartmentPosition; // 使用标准化的职位枚举
  isMain: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // 关联数据
  department?: Department;
  user?: {
    id: ID;
    username: string;
    email: string;
  };
}

// 创建部门数据
export interface CreateDepartmentData {
  name: string;
  code?: string;
  description?: string;
  parentId?: ID;
  managerId?: ID;
  sort?: number;
  isActive?: boolean;
}

// 更新部门数据
export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  parentId?: ID;
  managerId?: ID;
  sort?: number;
  isActive?: boolean;
}

// 部门查询参数
export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: ID;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 部门列表响应
export interface DepartmentListResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 部门统计信息
export interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  totalUsers: number;
  maxDepth: number;
  departmentDistribution: {
    departmentId: ID;
    departmentName: string;
    userCount: number;
    percentage: number;
  }[];
}

// 部门移动操作
export interface MoveDepartmentData {
  departmentId: ID;
  newParentId?: ID;
  newSort?: number;
}

// 批量操作数据
export interface BatchDepartmentOperation {
  departmentIds: ID[];
  operation: 'activate' | 'deactivate' | 'delete' | 'move';
  targetParentId?: ID;
}

// 用户部门职位分配数据
export interface AssignUserToDepartmentData {
  userId: ID;
  departmentId: ID;
  position: DepartmentPosition;
  isMain?: boolean;
}

// 更新用户部门职位数据
export interface UpdateUserDepartmentData {
  position?: DepartmentPosition;
  isMain?: boolean;
}

// 部门成员信息
export interface DepartmentMember {
  id: ID;
  userId: ID;
  departmentId: ID;
  position: DepartmentPosition;
  isMain: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user: {
    id: ID;
    username: string;
    email: string;
    avatar?: string;
  };
}

// 部门成员列表参数
export interface DepartmentMemberListParams {
  departmentId: ID;
  page?: number;
  limit?: number;
  search?: string;
  position?: DepartmentPosition;
  isMain?: boolean;
}

// 部门成员列表响应
export interface DepartmentMemberListResponse {
  data: DepartmentMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}