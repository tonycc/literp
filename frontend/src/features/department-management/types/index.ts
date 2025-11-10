/**
 * 部门管理类型定义
 */

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  parent?: Department;
  children?: Department[];
}

export interface DepartmentTreeNode {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  status: 'active' | 'inactive';
  children?: DepartmentTreeNode[];
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentListResponse {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  maxLevel: number;
  departmentsByLevel: {
    level: number;
    count: number;
  }[];
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentSearchParams {
  search?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}