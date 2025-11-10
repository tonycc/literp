// 用户类型
export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
  updatedAt: Date
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页类型
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 角色类型
export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}

// 操作类型
export interface Operation {
  id: string
  name: string
  code: string
  type: 'create' | 'update' | 'delete' | 'view'
  description?: string
  createdAt: Date
  updatedAt: Date
}

// 客户价格列表类型
export interface CustomerPriceList {
  id: string
  customerId: string
  productId: string
  price: number
  currency: string
  validFrom: Date
  validTo?: Date
  createdAt: Date
  updatedAt: Date
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

// 性能指标类型
export interface PerformanceMetrics {
  buildTime: number
  apiResponseTime: {
    p50: number
    p90: number
    p95: number
    p99: number
  }
  pageLoadTime: {
    fcp: number // First Contentful Paint
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
  }
  timestamp: Date
}

// 测试覆盖率类型
export interface CoverageReport {
  workspace: 'frontend' | 'backend' | 'shared' | 'external-portal'
  lineCoverage: number
  branchCoverage: number
  functionCoverage: number
  linesTotal: number
  linesCovered: number
  timestamp: Date
}
