import React from 'react'
import { useMemo } from 'react'
import { useAuth } from '../../features/auth/hooks/useAuth'

// 用户类型
export type UserType = 'supplier' | 'customer'

// 权限定义
export interface Permission {
  key: string
  name: string
  description: string
  userTypes: UserType[]
}

// 菜单项权限配置
export interface MenuPermission {
  path: string
  name: string
  icon: React.ReactNode
  permissions: string[]
  userTypes: UserType[]
}

// 预定义权限
export const PERMISSIONS: Permission[] = [
  {
    key: 'purchase-orders:view',
    name: '查看采购订单',
    description: '允许查看采购订单列表和详情',
    userTypes: ['supplier']
  },
  {
    key: 'inventory:view',
    name: '查看库存信息',
    description: '允许查看库存信息',
    userTypes: ['customer']
  },
  {
    key: 'orders:view',
    name: '查看订单信息',
    description: '允许查看订单信息',
    userTypes: ['customer']
  },
  {
    key: 'profile:view',
    name: '查看个人资料',
    description: '允许查看和编辑个人资料',
    userTypes: ['supplier', 'customer']
  },
  {
    key: 'finance:view',
    name: '查看财务信息',
    description: '允许查看财务概览',
    userTypes: ['supplier', 'customer']
  },
  {
    key: 'statements:view',
    name: '对账单查看',
    description: '查看和下载供应商对账单',
    userTypes: ['supplier']
  }
]

// 权限管理 Hook
export const usePermissions = () => {
  const { user } = useAuth()

  // 获取当前用户类型
  const userType = useMemo((): UserType | null => {
    // 从 localStorage 获取用户类型
    const storedUserType = localStorage.getItem('userType')
    if (storedUserType === 'supplier' || storedUserType === 'customer') {
      return storedUserType
    }
    return null
  }, [user])

  // 检查用户是否有特定权限
  const hasPermission = useMemo(() => {
    return (permissionKey: string): boolean => {
      if (!userType) return false
      
      const permission = PERMISSIONS.find(p => p.key === permissionKey)
      if (!permission) return false
      
      return permission.userTypes.includes(userType)
    }
  }, [userType])

  // 检查用户是否有任意一个权限
  const hasAnyPermission = useMemo(() => {
    return (permissionKeys: string[]): boolean => {
      return permissionKeys.some(key => hasPermission(key))
    }
  }, [hasPermission])

  // 检查用户是否有所有权限
  const hasAllPermissions = useMemo(() => {
    return (permissionKeys: string[]): boolean => {
      return permissionKeys.every(key => hasPermission(key))
    }
  }, [hasPermission])

  // 获取用户可访问的权限列表
  const userPermissions = useMemo(() => {
    if (!userType) return []
    
    return PERMISSIONS.filter(permission => 
      permission.userTypes.includes(userType)
    ).map(permission => permission.key)
  }, [userType])

  // 检查用户类型
  const isSupplier = useMemo(() => userType === 'supplier', [userType])
  const isCustomer = useMemo(() => userType === 'customer', [userType])

  return {
    userType,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
    isSupplier,
    isCustomer
  }
}