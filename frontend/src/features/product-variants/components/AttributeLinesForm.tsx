import React, { useMemo } from 'react'
import { Button } from 'antd'
import { ProForm, ProFormList, ProFormSelect } from '@ant-design/pro-components'
import { useProductAttributeOptions } from '../hooks/useProductAttributeOptions'
import { useProductAttributeLines } from '../hooks/useProductAttributeLines'
import { useMessage } from '@/shared/hooks'
import type { ProductAttributeLineInput } from '@zyerp/shared'

type AttributeLinesFormValues = { attributes: ProductAttributeLineInput[] }

export const AttributeLinesForm: React.FC<{ productId: string; onSaved?: () => void }> = ({ productId, onSaved }) => {
  const { attributeNameOptions, valuesMap, loading } = useProductAttributeOptions()
  const { attributes, save } = useProductAttributeLines(productId)
  const message = useMessage()
  const initialValues = useMemo(() => ({ attributes }), [attributes])
  return (
    <ProForm<AttributeLinesFormValues>
      initialValues={initialValues}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      onFinish={async (vals: AttributeLinesFormValues) => {
        const ok = await save(vals.attributes || [])
        if (ok) {
          message.success('属性线已保存')
          onSaved?.()
        }
      }}
      submitter={{
        render: () => (
          <Button type="primary" htmlType="submit" loading={loading}>保存属性线</Button>
        )
      }}
    >
      <ProFormList name="attributes" creatorButtonProps={{ creatorButtonText: '添加属性' }}>
        <ProFormSelect name={["attributeName"]} label="属性" rules={[{ required: true }]} options={attributeNameOptions} />
        <ProFormSelect
          name={["values"]}
          label="取值"
          rules={[{ required: true }]} fieldProps={{ mode: 'multiple' }}
          dependencies={["attributeName"]}
          request={async (params: Record<string, unknown>) => {
            const raw = params?.attributeName
            const name = typeof raw === 'string' ? raw : undefined
            const values = name ? valuesMap[name] || [] : []
            return await Promise.resolve(values.map((v: string) => ({ label: v, value: v })))
          }}
        />
      </ProFormList>
    </ProForm>
  )
}

export default AttributeLinesForm
