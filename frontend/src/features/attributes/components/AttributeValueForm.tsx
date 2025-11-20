import React, { useRef } from 'react'
import { ProForm, ProFormList, ProFormText, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components'
import type { ProFormInstance } from '@ant-design/pro-components'
import { Button } from 'antd'
import { useModal } from '@/shared/hooks'
import { useMessage } from '@/shared/hooks'
import { AttributesService, type AttributeValueInfo } from '../services/attributes.service'

type AttributeValuesFormValues = { values: Array<Partial<AttributeValueInfo>> }

export const AttributeValueForm: React.FC<{ attributeId: string; onSaved?: () => void; onChanged?: () => void }> = ({ attributeId, onSaved, onChanged }) => {
  const message = useMessage()
  const modal = useModal()
  const formRef = useRef<ProFormInstance<AttributeValuesFormValues> | undefined>(undefined)

  return (
    <ProForm<AttributeValuesFormValues>
      formRef={formRef}
      request={async () => {
        const resp = await AttributesService.getAttributeValues(attributeId)
        if (resp.success) return { values: resp.data }
        message.error('获取属性值失败')
        return { values: [] }
      }}
      params={{ attributeId }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      onFinish={async (vals) => {
        const list = (vals?.values || []).map((v) => ({ name: v.name, code: v.code, sortOrder: v.sortOrder, isActive: v.isActive }))
        const ok = await AttributesService.createAttributeValues(attributeId, list)
        if (ok) {
          message.success('属性值已保存')
          onSaved?.()
        } else {
          message.error('属性值保存失败')
        }
      }}
    >
      <ProFormList
        name="values"
        creatorButtonProps={{ creatorButtonText: '新增属性值' }}
        actionRender={(field, action, defaultAction) => {
          const allValues = formRef.current?.getFieldsValue?.()
          const id = allValues?.values?.[field.name]?.id
          return [
            ...defaultAction,
            <Button
              key="del"
              danger
              size="small"
              onClick={() => {
                modal.confirm({
                  title: '确认删除该属性值？',
                  onOk: async () => {
                    if (id) {
                      const ok = await AttributesService.deleteAttributeValue(id)
                      if (!ok) { message.error('删除失败，可能被引用，请先移除引用'); return }
                      message.success('删除成功')
                      onChanged?.()
                    }
                    action.remove(field.name)
                  }
                })
              }}
            >删除</Button>,
          ]
        }}
      >
        <ProFormText name={[ 'id' ]} hidden />
        <ProFormText name={[ 'name' ]} label="名称" rules={[{ required: true, message: '请输入属性值名称' }]} />
        <ProFormText name={[ 'code' ]} label="编码" />
        <ProFormDigit name={[ 'sortOrder' ]} label="排序" min={0} />
        <ProFormSwitch name={[ 'isActive' ]} label="启用" />
      </ProFormList>
    </ProForm>
  )
}

export default AttributeValueForm
