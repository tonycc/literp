import React, { useRef, useState, useEffect } from 'react'
import { Modal, Button } from 'antd'
import type { ProFormInstance } from '@ant-design/pro-components'
import type { User } from '@zyerp/shared'
import { usePermissions } from '@/shared/hooks'
import { useMessage } from '@/shared/hooks'
import UserList from '../components/UserList'
import UserForm from '../components/UserForm'
import useUser, { type UserFormValues } from '../hooks/useUser'

const UserManagement: React.FC = () => {
  const { hasPermission } = usePermissions()
  const canCreate = hasPermission('user:create')
  const canUpdate = hasPermission('user:update')
  const canDelete = hasPermission('user:delete')
  const formRef = useRef<ProFormInstance<UserFormValues> | undefined>(undefined)
  const message = useMessage()

  const { fetchList, createUser, updateUser, deleteUser } = useUser()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => { void fetchList() }, [fetchList])

  const handleAdd = () => {
    if (!canCreate) { message.error('无新增权限'); return }
    setEditingUser(null)
    setIsModalVisible(true)
  }

  const handleEdit = (u: User) => {
    if (!canUpdate) { message.error('无编辑权限'); return }
    setEditingUser(u)
    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) { message.error('无删除权限'); return }
    const ok = await deleteUser(id)
    if (ok) { setRefreshKey((k) => k + 1); void fetchList() }
  }

  const handleSubmit = async (values: UserFormValues) => {
    if (editingUser) {
      const u = await updateUser(String(editingUser.id), values)
      if (u) { setIsModalVisible(false); setRefreshKey((k) => k + 1); void fetchList() }
    } else {
      if (!values.password) { message.error('密码不能为空'); return }
      const u = await createUser(values)
      if (u) { setIsModalVisible(false); setRefreshKey((k) => k + 1); void fetchList() }
    }
  }

  return (
    <div>
      <UserList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={async (id) => { await handleDelete(id) }}
        onRefresh={() => { setRefreshKey((k) => k + 1); void fetchList() }}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={(keys) => { setSelectedRowKeys(keys) }}
        refreshKey={refreshKey}
      />
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <UserForm formRef={formRef} initialValues={editingUser ?? undefined} onSubmit={async (v) => { await handleSubmit(v) }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={() => setIsModalVisible(false)}>取消</Button>
          <Button type="primary" onClick={() => { formRef.current?.submit?.() }}>提交</Button>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement
