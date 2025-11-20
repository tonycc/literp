import React from 'react'
import { ProForm, ProFormText, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components'
import type { AttributeInfo } from '../services/attributes.service'

export const AttributeForm: React.FC<{ initialValues?: Partial<AttributeInfo>; onSubmit: (vals: Partial<AttributeInfo>) => Promise<void> }> = ({ initialValues, onSubmit }) => {
  return (
    <ProForm<Partial<AttributeInfo>>
      initialValues={initialValues}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      onFinish={onSubmit}
    >
      <ProFormText name="name" label="属性名称" rules={[{ required: true, message: '请输入属性名称' }]} />
      <ProFormText name="code" label="编码" placeholder="可选，未填将自动生成" />
      <ProFormText name="description" label="描述" />
      <ProFormDigit name="sortOrder" label="排序" min={0} />
      <ProFormSwitch name="isGlobal" label="全局属性" />
      <ProFormSwitch name="isActive" label="启用" />
    </ProForm>
  )
}

export default AttributeForm

