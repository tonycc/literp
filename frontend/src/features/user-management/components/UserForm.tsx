import React from 'react'
import { ProForm, ProFormText, ProFormSelect, ProFormTreeSelect, ProCard } from '@ant-design/pro-components'
import { Row, Col } from 'antd'
import type { ProFormInstance } from '@ant-design/pro-components'
import type { User } from '@zyerp/shared'
import type { UserFormValues } from '../hooks/useUser'
import { useAllRoles } from '@/features/role-management/hooks/useRoles'
import { useDepartmentTree } from '@/features/department-management/hooks/useDepartments'

export interface UserFormProps {
  formRef?: React.MutableRefObject<ProFormInstance<UserFormValues> | undefined>
  initialValues?: Partial<User>
  onSubmit?: (values: UserFormValues) => Promise<void> | void
}

const UserForm: React.FC<UserFormProps> = ({ formRef, initialValues, onSubmit }) => {
  const { roles, loading: rolesLoading } = useAllRoles()
  const { tree: departmentTree, loading: departmentLoading } = useDepartmentTree()

  const treeData = (departmentTree || []).map(n => ({ title: n.name, value: String(n.id), key: String(n.id), children: (n.children || []).map(c => ({ title: c.name, value: String(c.id), key: String(c.id) })) }))

  return (
    <ProCard>
      <ProForm<UserFormValues>
        name="userForm"
        formRef={formRef}
        initialValues={{
          username: initialValues?.username || '',
          email: initialValues?.email || '',
          isActive: typeof initialValues?.isActive === 'boolean' ? initialValues.isActive : true,
        roleIds: Array.isArray(initialValues?.roles) ? initialValues?.roles?.map(r => String(r.id)) : [],
        departmentId: initialValues?.mainDepartment?.id ? String(initialValues.mainDepartment.id) : undefined,
      }}
      onFinish={async (values) => { await onSubmit?.(values) }}
      layout="vertical"
    >
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }, { min: 1 }, { max: 20 }]} />
          </Col>
          <Col span={12}>
            <ProFormText name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效邮箱' }]} />
          </Col>
        </Row>
        {!initialValues?.id && (
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText.Password name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6 }]} />
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <ProFormSelect
              name="roleIds"
              label="用户角色"
              mode="multiple"
              fieldProps={{
                options: roles.map(r => ({ label: r.name, value: String(r.id) })),
                loading: rolesLoading,
                allowClear: true,
                showSearch: true,
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormTreeSelect
              name="departmentId"
              label="所属部门"
              fieldProps={{
                treeData,
                allowClear: true,
                showSearch: true,
                treeNodeFilterProp: 'title',
                loading: departmentLoading,
              }}
            />
          </Col>
        </Row>
      </ProForm>
    </ProCard>
  )
}

export default UserForm
