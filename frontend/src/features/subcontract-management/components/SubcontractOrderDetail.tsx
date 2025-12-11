import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { SubcontractOrder, SubcontractOrderItem } from '@zyerp/shared'
import { subcontractOrderService } from '../services/subcontract-order.service'
import { useMessage } from '@/shared/hooks'
import { SUBCONTRACT_ORDER_ITEM_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/subcontract'
import { Card, Row, Col } from 'antd'
import { supplierService } from '@/features/supplier-management/services/supplier.service'

export interface SubcontractOrderDetailProps {
  orderId?: string
  visible?: boolean
  onClose?: () => void
}

const SubcontractOrderDetail: React.FC<SubcontractOrderDetailProps> = ({ orderId, visible }) => {
  const [detail, setDetail] = useState<(SubcontractOrder & { items: SubcontractOrderItem[] }) | null>(null)
  const message = useMessage()
  const actionRef = useRef<ActionType | undefined>(undefined)
  

  useEffect(() => {
    if (!visible || !orderId) return
    void (async () => {
      try {
        const resp = await subcontractOrderService.getById(orderId)
        if (resp.success && resp.data) {
          setDetail(resp.data)
          } else {
            message.error('加载委外订单失败')
          }
      } catch {
        message.error('加载委外订单失败')
      }
    })()
  }, [visible, orderId, message])

  useEffect(() => {
    void (async () => {
      if (detail && !detail.supplierName && detail.supplierId) {
        try {
          const resp = await supplierService.getById(detail.supplierId)
          if (resp.success && resp.data?.name) {
            setDetail({ ...detail, supplierName: resp.data.name })
          }
        } catch { /* ignore */ }
      }
    })()
  }, [detail])

  const columns: ProColumns<SubcontractOrderItem>[] = useMemo(() => ([
    { title: '工单', dataIndex: 'workOrderId', width: 180, render: (_, r) => r.workOrderNo ?? r.workOrderId ?? '-' },
    { title: '工序', dataIndex: 'operationId', width: 140, render: (_, r) => r.operationName ?? r.operationId ?? '-' },
    { title: '产品', dataIndex: 'productName', width: 200, render: (_, r) => r.productName ?? r.productCode ?? r.productId },
    { title: '数量', dataIndex: 'quantity', width: 120 },
    { title: '单价', dataIndex: 'price', width: 120, render: (_, r) => (typeof r.price === 'number' ? r.price.toFixed(4) : '-') },
    { title: '金额', dataIndex: 'amount', width: 140 },
    { title: '交期', dataIndex: 'dueDate', width: 140, render: (_, r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-') },
    { title: '状态', dataIndex: 'status', width: 120, valueEnum: SUBCONTRACT_ORDER_ITEM_STATUS_VALUE_ENUM_PRO },
  ]), [])

  return (
    <>
      <Card title="基础信息">
        <Row gutter={16}>
          <Col span={8}>
            <div>订单号</div>
            <div>{detail?.orderNo ?? '-'}</div>
          </Col>
          <Col span={8}>
            <div>供应商</div>
            <div>{detail?.supplierName ?? '-'}</div>
          </Col>
          <Col span={8}>
            <div>交期</div>
            <div>{detail?.expectedDeliveryDate ? new Date(detail.expectedDeliveryDate).toLocaleDateString() : '-'}</div>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <ProTable<SubcontractOrderItem>
          actionRef={actionRef}
          search={false}
          options={false}
          rowKey="id"
          columns={columns}
          dataSource={Array.isArray(detail?.items) ? detail?.items : []}
        />
      </Card>
      
    </>
  )
}

export default SubcontractOrderDetail
