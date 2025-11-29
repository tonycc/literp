import type { Role } from './user'

export interface RoleFormData {
  name: string
  description?: string
  permissionIds: string[]
}

export interface CreateRoleData {
  name: string
  code?: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleData {
  name?: string
  code?: string
  description?: string
  permissionIds?: string[]
}

export interface RoleListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface RoleListResponse {
  data: Role[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AssignPermissionsData {
  permissionIds: string[]
}
