import React, { useRef } from 'react'
import { ProForm, ProFormText, ProFormDigit, ProFormSwitch, ProFormList } from '@ant-design/pro-components'
import type { ProFormInstance } from '@ant-design/pro-components'
import { Row, Col, Space, Button } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import type { AttributeInfo, AttributeValueInfo } from '../services/attributes.service'

export type AttributeFormValues = Partial<AttributeInfo> & {
  attributeValues?: Partial<AttributeValueInfo>[]
}

export const AttributeForm: React.FC<{
  initialValues?: Partial<AttributeInfo>;
  onSubmit: (vals: AttributeFormValues) => Promise<void>
}> = ({ initialValues, onSubmit }) => {
  const formRef = useRef<ProFormInstance<AttributeFormValues>>(null)

  return (
    <ProForm<AttributeFormValues>
      formRef={formRef}
      initialValues={initialValues}
      layout="horizontal"
      onFinish={onSubmit}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      submitter={{
        render: (props, doms) => {
          return (
            <Row justify="end">
              <Space>{doms}</Space>
            </Row>
          )
        }
      }}
    >
      <ProFormText
        name="name"
        label="属性"
        placeholder="属性名称，如:颜色"
        rules={[{ required: true, message: '请输入属性名称' }]}
      />
      
      <ProFormText
        name="code"
        label="简码"
        placeholder="属性简码，用于自动生成SKU，如:color"
        rules={[
          { required: true, message: '请输入编码' },
          { pattern: /^[a-zA-Z]+$/, message: '编码必须是字母' }
        ]}
      />

      {/* 隐藏字段，默认启用 */}
      <ProFormSwitch name="isGlobal" hidden />
      <ProFormSwitch name="isActive" hidden />

      <ProFormList
        name="attributeValues"
        label="属性值"
        creatorRecord={{ isActive: true, sortOrder: 0 }}
        creatorButtonProps={{
          creatorButtonText: '添加属性值',
          type: 'link',
          icon: <PlusOutlined />,
          style: { width: 'fit-content', paddingLeft: 0 }
        }}
        deleteIconProps={false}
        actionRender={(field, action) => [
            <Button
              key="delete"
              type="text"
              icon={<CloseOutlined style={{ color: '#999' }} />}
              onClick={() => action.remove(field.name)}
              style={{ marginLeft: 8 }}
            />
        ]}
        itemRender={({ listDom, action }) => {
          return (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>{listDom}</div>
              {action}
            </div>
          )
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              name="name"
              placeholder="属性值名称，如:白色"
              rules={[{ required: true, message: '请输入' }]}
              fieldProps={{ style: { marginBottom: 0 } }}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              name="code"
              placeholder="属性值简码，如:white"
              rules={[
                { required: true, message: '请输入' },
                { pattern: /^[a-zA-Z]+$/, message: '必须是字母' }
              ]}
              fieldProps={{ style: { marginBottom: 0 } }}
            />
          </Col>
          {/* 隐藏字段，用于默认值 */}
          <ProFormSwitch name="isActive" hidden />
          <ProFormDigit name="sortOrder" hidden />
          {/* 隐藏ID字段，用于编辑时识别 */}
          <ProFormText name="id" hidden />
        </Row>
      </ProFormList>
    </ProForm>
  )
}

export default AttributeForm

