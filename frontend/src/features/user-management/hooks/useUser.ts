import { useCallback, useState } from 'react'
import type { User } from '@zyerp/shared'
import userService from '../services/user.service'
import { useMessage } from '@/shared/hooks'

export interface UserFormValues {
  username: string
  email: string
  password?: string
  isActive: boolean
  roleIds?: string[]
  departmentId?: string
}

export const useUser = () => {
  const message = useMessage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = useCallback(async (params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) => {
    setLoading(true)
    try {
      const res = await userService.getUsers({ page: params?.page ?? page, limit: params?.pageSize ?? pageSize, search: params?.search, isActive: params?.isActive })
      setUsers(res.data || [])
      setTotal(res.pagination?.total || 0)
      setPage(res.pagination?.page || 1)
      setPageSize(res.pagination?.pageSize || 10)
    } catch {
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [message, page, pageSize])

  const createUser = useCallback(async (values: UserFormValues) => {
    // 创建用户时密码必填
    if (!values.password) {
      message.error('创建用户时密码不能为空')
      return null
    }

    try {
      // 显式构造参数以满足类型要求（password 确认为 string）
      const u = await userService.createUser({
        ...values,
        password: values.password,
      })
      message.success('创建用户成功')
      return u
    } catch (error) {
      console.error('[useUser] createUser error:', error)
      message.error('创建用户失败')
      return null
    }
  }, [message])

  const updateUser = useCallback(async (id: string, values: UserFormValues) => {
    try {
      const u = await userService.updateUser(id, values)
      message.success('更新用户成功')
      return u
    } catch {
      message.error('更新用户失败')
      return null
    }
  }, [message])

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.deleteUser(id)
      message.success('删除用户成功')
      return true
    } catch {
      message.error('删除用户失败')
      return false
    }
  }, [message])

  const toggleStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      await userService.updateUserStatus(id, isActive)
      message.success(isActive ? '启用成功' : '禁用成功')
      return true
    } catch {
      message.error(isActive ? '启用失败' : '禁用失败')
      return false
    }
  }, [message])

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
    void fetchList({ page: newPage, pageSize: newPageSize })
  }, [fetchList])

  const handleSearch = useCallback((keyword?: string, status?: boolean) => {
    setPage(1)
    void fetchList({ page: 1, pageSize, search: keyword, isActive: status })
  }, [fetchList, pageSize])

  return { users, loading, total, page, pageSize, fetchList, createUser, updateUser, deleteUser, toggleStatus, handlePageChange, handleSearch, setPage, setPageSize }
}

export default useUser
