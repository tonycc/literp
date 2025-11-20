import React, { useEffect, useState } from 'react'
import { Drawer, Button } from 'antd'
import { ProCard, ProDescriptions } from '@ant-design/pro-components'
import type { ProDescriptionsItemProps } from '@ant-design/pro-components'
import type { ManufacturingOrder, ProductionPlan } from '@zyerp/shared'
import { manufacturingOrderService } from '../services/manufacturing-order.service'
import { useMessage } from '@/shared/hooks'
import { useNavigate } from 'react-router-dom'
import { productionPlanService } from '@/features/production-plan/services/production-plan.service'

interface ManufacturingOrderDetailProps {
  visible: boolean
  moId?: string
  onClose: () => void
}

export const ManufacturingOrderDetail: React.FC<ManufacturingOrderDetailProps> = ({ visible, moId, onClose }) => {
  const message = useMessage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ManufacturingOrder | null>(null)
  const [plan, setPlan] = useState<ProductionPlan | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!visible || !moId) return
      setLoading(true)
      try {
        const res = await manufacturingOrderService.getById(moId)
        if (res.success) setData(res.data as unknown as ManufacturingOrder)
        else message.error(res.message || '加载失败')
        if (res.success && res.data && (res.data as any).sourceRefId) {
          try {
            const list = await productionPlanService.getList({ page: 1, pageSize: 1, orderId: String((res.data as any).sourceRefId) })
            setPlan((list.data || [])[0] || null)
          } catch {}
        } else {
          setPlan(null)
        }
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [visible, moId])

  const items: ProDescriptionsItemProps<ManufacturingOrder>[] = [
    { title: '单号', dataIndex: 'orderNo' },
    { title: '状态', dataIndex: 'status' },
    { title: '产品编码', dataIndex: 'productCode' },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '单位', dataIndex: 'unit' },
    { title: 'BOM版本', dataIndex: 'bomCode' },
    { title: '工艺路线', dataIndex: 'routingCode' },
    { title: '计划开始', dataIndex: 'plannedStart', valueType: 'dateTime' },
    { title: '计划完成', dataIndex: 'plannedFinish', valueType: 'dateTime' },
    { title: '交付日期', dataIndex: 'dueDate', valueType: 'date' },
  ]

  return (
    <Drawer open={visible} width={900} onClose={onClose} destroyOnClose title="制造订单详情">
      <ProCard loading={loading} gutter={16}>
        <ProDescriptions<ManufacturingOrder>
          column={2}
          dataSource={data || undefined}
          columns={items}
          bordered
          extra={
            <Button type="primary" onClick={() => { void navigate(`/work-order-scheduling?moId=${moId}`) }}>
              排产视图
            </Button>
          }
        />
        <ProDescriptions<ProductionPlan>
          title="关联生产计划"
          column={2}
          dataSource={plan || undefined}
          bordered
          columns={[
            { title: '计划单号', dataIndex: 'orderNo' },
            { title: '计划名称', dataIndex: 'name' },
            { title: '状态', dataIndex: 'status' },
            { title: '计划开始', dataIndex: 'plannedStart', valueType: 'dateTime' },
            { title: '计划完成', dataIndex: 'plannedFinish', valueType: 'dateTime' },
          ]}
        />
      </ProCard>
    </Drawer>
  )
}

export default ManufacturingOrderDetail