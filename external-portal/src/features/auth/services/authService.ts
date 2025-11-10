import axios from 'axios'
import type { SupplierLoginForm, SupplierLoginResponse, SupplierUser } from '../types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api'
const SUPPLIER_API_PREFIX = (import.meta as any).env?.VITE_SUPPLIER_API_PREFIX || '/supplier'

// 创建axios实例
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${SUPPLIER_API_PREFIX}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supplier_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('supplier_token')
      localStorage.removeItem('supplier_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // 供应商登录
  async login(credentials: SupplierLoginForm): Promise<SupplierLoginResponse> {
    try {
      const response = await apiClient.post<SupplierLoginResponse>('/auth/login', credentials)
      
      // 存储token和用户信息
      const { token, user } = response.data
      localStorage.setItem('supplier_token', token)
      localStorage.setItem('supplier_user', JSON.stringify(user))
      
      return response.data
    } catch (error) {
      console.error('供应商登录失败:', error)
      throw new Error('登录失败，请检查用户名和密码')
    }
  },

  // 供应商登出
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 无论请求是否成功，都清除本地存储
      localStorage.removeItem('supplier_token')
      localStorage.removeItem('supplier_user')
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<SupplierUser> {
    const response = await apiClient.get<SupplierUser>('/auth/me')
    return response.data
  },

  // 刷新token
  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh')
    const { token } = response.data
    localStorage.setItem('supplier_token', token)
    return token
  },

  // 检查token是否有效
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  },

  // 从本地存储获取用户信息
  getStoredUser(): SupplierUser | null {
    try {
      const userStr = localStorage.getItem('supplier_user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  },

  // 从本地存储获取token
  getStoredToken(): string | null {
    return localStorage.getItem('supplier_token')
  },
}

export default authService