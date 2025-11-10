import type { SupplierUser } from '../types'

// Demo账号类型
export interface DemoAccount {
  id: string
  username: string
  password: string
  type: 'supplier' | 'customer'
  displayName: string
  user: SupplierUser
}

// Demo供应商账号
export const demoSupplierAccounts: DemoAccount[] = [
  {
    id: 'supplier-001',
    username: 'supplier@demo.com',
    password: '123456',
    type: 'supplier',
    displayName: '供应商一号有限公司',
    user: {
      id: 'supplier-001',
      username: 'supplier@demo.com',
      companyName: '供应商一号有限公司',
      contactPerson: '张经理',
      email: 'supplier@demo.com',
      phone: '13800138001',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'supplier-002',
    username: 'supplier2@demo.com',
    password: '123456',
    type: 'supplier',
    displayName: '供应商二号有限公司',
    user: {
      id: 'supplier-002',
      username: 'supplier2@demo.com',
      companyName: '供应商二号有限公司',
      contactPerson: '李总监',
      email: 'supplier2@demo.com',
      phone: '13800138002',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'supplier-003',
    username: 'supplier3@demo.com',
    password: '123456',
    type: 'supplier',
    displayName: '供应商三号有限公司',
    user: {
      id: 'supplier-003',
      username: 'supplier3@demo.com',
      companyName: '供应商三号有限公司',
      contactPerson: '王主管',
      email: 'supplier3@demo.com',
      phone: '13800138003',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  }
]

// Demo客户账号
export const demoCustomerAccounts: DemoAccount[] = [
  {
    id: 'customer-001',
    username: 'customer@demo.com',
    password: '123456',
    type: 'customer',
    displayName: '客户一号有限公司',
    user: {
      id: 'customer-001',
      username: 'customer@demo.com',
      companyName: '客户一号有限公司',
      contactPerson: '陈采购',
      email: 'customer@demo.com',
      phone: '13900139001',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'customer-002',
    username: 'customer2@demo.com',
    password: '123456',
    type: 'customer',
    displayName: '客户二号有限公司',
    user: {
      id: 'customer-002',
      username: 'customer2@demo.com',
      companyName: '客户二号有限公司',
      contactPerson: '刘部长',
      email: 'customer2@demo.com',
      phone: '13900139002',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  }
]

// 所有demo账号
export const allDemoAccounts: DemoAccount[] = [
  ...demoSupplierAccounts,
  ...demoCustomerAccounts
]

// 根据用户名查找demo账号
export const findDemoAccount = (username: string): DemoAccount | undefined => {
  return allDemoAccounts.find(account => account.username === username)
}

// 验证demo账号登录
export const validateDemoLogin = (username: string, password: string): DemoAccount | null => {
  const account = findDemoAccount(username)
  if (account && account.password === password) {
    return account
  }
  return null
}