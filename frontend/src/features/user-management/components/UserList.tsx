import React, { useMemo, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ProTableProps, ActionType } from '@ant-design/pro-components'
import type { User } from '@zyerp/shared'
import { Button, Space, Tag, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { USER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/user'
import { useEffect, useState } from 'react'
import { getDict } from '@/shared/services/dictionary.service'
import { useMessage } from '@/shared/hooks'
import userService from '../services/user.service'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'

export interface UserListProps {
  onAdd?: () => void
  onEdit?: (item: User) => void
  onDelete?: (id: string) => Promise<void>
  onRefresh?: () => void
  selectedRowKeys?: React.Key[]
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: User[]) => void
  refreshKey?: number
}

const UserList: React.FC<UserListProps> = ({ onAdd, onEdit, onDelete, onRefresh, refreshKey }) => {
  const message = useMessage()
  const actionRef = useRef<ActionType | undefined>(undefined)

  const [statusValueEnum, setStatusValueEnum] = useState<Record<string, { text: string; status: 'Success' | 'Default' | 'Error' }>>(USER_STATUS_VALUE_ENUM_PRO)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      const d = await getDict('user-status')
      const v: Record<string, { text: string; status: 'Success' | 'Default' | 'Error' }> = {}
      Object.entries(d.valueEnum).forEach(([k, val]) => {
        const s = val.status
        const mapped = s === 'Success' || s === 'Default' || s === 'Error' ? s : 'Default'
        v[k] = { text: val.text, status: mapped }
      })
      if (mounted && Object.keys(v).length > 0) setStatusValueEnum(v)
    }
    void run()
    return () => { mounted = false }
  }, [])

  const columns: ProColumns<User>[] = useMemo(() => ([
    { title: '序号', dataIndex: 'index', valueType: 'indexBorder', width: 48 },
    { title: '用户名', dataIndex: 'username', ellipsis: true, width: 160 },
    { title: '邮箱', dataIndex: 'email', ellipsis: true, width: 220 },
    { title: '角色', dataIndex: 'roles', width: 200, render: (_, r) => (
      <>
        {Array.isArray(r.roles) && r.roles.length > 0 ? r.roles.map((role) => (
          <Tag key={String(role.id)} color="blue">{role.name}</Tag>
        )) : <Tag color="default">无角色</Tag>}
      </>
    ) },
    { title: '部门', dataIndex: 'mainDepartment', width: 160, render: (_, r) => (
      <Tag color={r.mainDepartment ? 'green' : 'default'}>{r.mainDepartment?.name || '未分配'}</Tag>
    ) },
    { title: '状态', dataIndex: 'isActive', width: 100, valueType: 'select', valueEnum: statusValueEnum },
    { title: '创建时间', dataIndex: 'createdAt', width: 180, valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180, valueType: 'dateTime' },
    { title: '操作', valueType: 'option', width: 160, fixed: 'right', render: (_, r) => (
      <Space size="small">
        <Button type="link" icon={<EditOutlined />} onClick={() => onEdit?.(r)}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={() => { void onDelete?.(String(r.id)) }}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    ) },
  ]), [onEdit, onDelete, statusValueEnum])

  const request: ProTableProps<User, Record<string, unknown>>['request'] = async (params) => {
    try {
      const base = normalizeTableParams(params)
      const res = await userService.getUsers({ page: base.page, limit: base.pageSize, search: typeof params['keyword'] === 'string' ? params['keyword'] : undefined, isActive: typeof params['isActive'] === 'string' ? params['isActive'] === 'true' : undefined })
      return { data: res.data, success: res.success, total: res.pagination?.total || 0 }
    } catch {
      message.error('获取用户列表失败')
      return { data: [], success: false, total: 0 }
    }
  }

  return (
    <ProTable<User>
      columns={columns}
      actionRef={actionRef}
      params={{ refreshKey }}
      form={{ name: 'userListSearch' }}
      request={request}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      search={{ labelWidth: 'auto' }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>新增</Button>,
        <Button key="refresh" onClick={() => { void actionRef.current?.reload?.(); void onRefresh?.() }}>刷新</Button>,
      ]}
      pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条` }}
    />
  )
}

export default UserList
