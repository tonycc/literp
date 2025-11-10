// 外部用户登录表单数据
export interface SupplierLoginForm {
  username: string // 邮箱或手机号
  password: string
  remember?: boolean
}

// 供应商用户信息
export interface SupplierUser {
  id: string
  username: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

// 登录响应
export interface SupplierLoginResponse {
  token: string
  user: SupplierUser
  expiresIn: number
}

// 认证上下文
export interface SupplierAuthContext {
  user: SupplierUser | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: SupplierLoginForm) => Promise<void>
  logout: () => void
  loading: boolean
}