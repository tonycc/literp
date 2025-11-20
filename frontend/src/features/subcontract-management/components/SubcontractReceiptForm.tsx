import React from 'react'
import { ProForm, ProFormText, ProFormDatePicker, ProFormSelect } from '@ant-design/pro-components'
import type { ProFormInstance } from '@ant-design/pro-components'
import { subcontractReceiptService } from '../services/subcontract-receipt.service'
import { useMessage } from '@/shared/hooks'
import { warehouseService } from '@/shared/services/warehouse.service'

export interface SubcontractReceiptFormProps {
  orderId: string
  items: Array<{ orderItemId: string; receivedQuantity: number; warehouseId?: string | null }>
  formRef?: React.MutableRefObject<ProFormInstance<Record<string, unknown>> | undefined>
  onSubmitted?: () => void
}

const SubcontractReceiptForm: React.FC<SubcontractReceiptFormProps> = ({ orderId, items, formRef, onSubmitted }) => {
  const message = useMessage()
  return (
    <ProForm<Record<string, unknown>>
      formRef={formRef}
      layout="vertical"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      onFinish={async (values) => {
        const receivedDate = typeof values['receivedDate'] === 'string' ? values['receivedDate'] : undefined
        const warehouseId = typeof values['warehouseId'] === 'string' ? values['warehouseId'] : undefined
        const resp = await subcontractReceiptService.create({ orderId, supplierId: undefined, receivedDate, warehouseId, items })
        if (resp.success) {
          message.success('创建收货单成功')
          onSubmitted?.()
        } else {
          message.error(resp.message || '创建收货单失败')
        }
      }}
    >
      <ProFormDatePicker name="receivedDate" label="收货日期" rules={[{ required: true, message: '请选择收货日期' }]} />
      <ProFormSelect 
        name="warehouseId" 
        label="仓库" 
        placeholder="请选择收货仓库"
        request={async () => {
          const opts = await warehouseService.getOptions({ isActive: true })
          return (opts || []).map(w => ({ label: w.label, value: w.value }))
        }}
        fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
      />
    </ProForm>
  )
}

export default SubcontractReceiptForm