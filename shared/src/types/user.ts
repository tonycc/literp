import type { ID, Timestamp } from './common'
import type { Department, UserDepartment } from './department'

export interface Permission {
  id: ID
  name: string
  code: string
  description?: string
  resource: string
  action: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Role {
  id: ID
  name: string
  code: string
  description?: string
  permissions: Permission[]
  userCount?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface User {
  id: ID
  username: string
  email: string
  avatar?: string
  roles: Role[]
  isActive: boolean
  lastLoginAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  departments?: UserDepartment[]
  mainDepartment?: Department
  departmentId?: ID
}
