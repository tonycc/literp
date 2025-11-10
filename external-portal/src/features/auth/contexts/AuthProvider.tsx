import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { SupplierUser, SupplierLoginForm, SupplierAuthContext } from '../types'
import { authService } from '../services/authService'
import { validateDemoLogin } from '../data/demoAccounts'

// 创建认证上下文
const AuthContext = createContext<SupplierAuthContext | undefined>(undefined)

// AuthProvider组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupplierUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = authService.getStoredToken()
        const storedUser = authService.getStoredUser()

        if (storedToken && storedUser) {
          // 对于demo token，直接认为有效
          if (storedToken.startsWith('demo-token-')) {
            setToken(storedToken)
            setUser(storedUser)
            setIsAuthenticated(true)
          } else {
            // 对于真实token，验证是否仍然有效
            const isValid = await authService.validateToken()
            if (isValid) {
              setToken(storedToken)
              setUser(storedUser)
              setIsAuthenticated(true)
            } else {
              // Token无效，清除存储
              authService.logout()
            }
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // 登录
  const login = useCallback(async (credentials: SupplierLoginForm) => {
    setLoading(true)
    try {
      // 首先检查是否为demo账号
      const demoAccount = validateDemoLogin(credentials.username, credentials.password)
      
      if (demoAccount) {
        // Demo账号登录
        const token = `demo-token-${demoAccount.id}`
        const user = demoAccount.user
        
        // 存储到localStorage
        localStorage.setItem('supplier_token', token)
        localStorage.setItem('supplier_user', JSON.stringify(user))
        localStorage.setItem('userType', demoAccount.type)
        
        // 更新状态
        setToken(token)
        setUser(user)
        setIsAuthenticated(true)
      } else {
        // 非demo账号，使用正常登录流程
        const response = await authService.login(credentials)
        setToken(response.token)
        setUser(response.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // 登出
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
    }
  }, [])

  const value: SupplierAuthContext = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 使用认证上下文的hook
export const useAuth = (): SupplierAuthContext => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider