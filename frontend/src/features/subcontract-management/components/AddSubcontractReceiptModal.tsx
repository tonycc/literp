import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { SubcontractOrder, SubcontractOrderItem } from '@zyerp/shared'
import { subcontractOrderService } from '../services/subcontract-order.service'
import SubcontractReceiptForm from './SubcontractReceiptForm'
import { useMessage } from '@/shared/hooks'
import { Modal, Select, Divider, InputNumber } from 'antd'

export interface AddSubcontractReceiptModalProps {
  visible: boolean
  onClose: () => void
  onSubmitted?: () => void
}

const AddSubcontractReceiptModal: React.FC<AddSubcontractReceiptModalProps> = ({ visible, onClose, onSubmitted }) => {
  const message = useMessage()
  const [orderOptions, setOrderOptions] = useState<Array<{ label: string; value: string }>>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined)
  const [orderDetail, setOrderDetail] = useState<(SubcontractOrder & { items: SubcontractOrderItem[] }) | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number | undefined>>({})
  const actionRef = useRef<ActionType | undefined>(undefined)

  useEffect(() => {
    if (!visible) return
    void (async () => {
      try {
        const res = await subcontractOrderService.getList({ page: 1, pageSize: 500 })
        setOrderOptions((res.data || []).map(o => ({ label: `${o.orderNo}${o.supplierName ? `｜${o.supplierName}` : ''}`, value: o.id })))
      } catch {
        message.error('加载委外订单列表失败')
      }
    })()
  }, [visible, message])

  useEffect(() => {
    if (!selectedOrderId) { setOrderDetail(null); setQuantities({}); return }
    void (async () => {
      try {
        const resp = await subcontractOrderService.getById(selectedOrderId)
        if (resp.success && resp.data) {
          setOrderDetail(resp.data)
          setQuantities({})
        } else {
          message.error(resp.message || '加载订单详情失败')
        }
      } catch {
        message.error('加载订单详情失败')
      }
    })()
  }, [selectedOrderId, message])

  const columns: ProColumns<SubcontractOrderItem>[] = useMemo(() => ([
    { title: '产品', dataIndex: 'productName', width: 220, render: (_, r) => r.productName ?? r.productCode ?? r.productId },
    { title: '工序', dataIndex: 'operationId', width: 140, render: (_, r) => r.operationName ?? r.operationId ?? '-' },
    { title: '数量', dataIndex: 'quantity', width: 120 },
    { title: '交期', dataIndex: 'dueDate', width: 140, render: (_, r) => (typeof r.dueDate === 'string' ? new Date(r.dueDate).toLocaleDateString() : (r.dueDate instanceof Date ? r.dueDate.toLocaleDateString() : '-')) },
    {
      title: '收货数量',
      dataIndex: 'receivedQuantity',
      width: 160,
      render: (_, r) => (
        <InputNumber
          min={0}
          step={1}
          precision={0}
          placeholder="请输入收货数量"
          value={quantities[r.id]}
          onChange={(val) => {
            setQuantities(prev => ({
              ...prev,
              [r.id]: typeof val === 'number' && Number.isFinite(val) ? val : undefined,
            }))
          }}
          style={{ width: '100%' }}
        />
      )
    },
  ]), [quantities])

  const itemsForSubmit = useMemo(() => {
    if (!orderDetail) return []
    const rows = (orderDetail.items || [])
      .map(it => {
        const q = quantities[it.id]
        return typeof q === 'number' && Number.isFinite(q) && q > 0
          ? { orderItemId: it.id, receivedQuantity: q }
          : null
      })
      .filter((x): x is { orderItemId: string; receivedQuantity: number } => !!x)
    return rows
  }, [orderDetail, quantities])

  return (
    <Modal
      open={visible}
      width={880}
      title={"新增收货"}
      footer={null}
      onCancel={() => { onClose() }}
      destroyOnClose
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 6 }}>选择委外订单</div>
        <Select
          showSearch
          placeholder="请选择委外订单"
          style={{ width: '100%' }}
          options={orderOptions}
          value={selectedOrderId}
          onChange={(v) => setSelectedOrderId(String(v))}
          filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
        />
      </div>
      <Divider style={{ margin: '12px 0' }} />
      {orderDetail && (
        <ProTable<SubcontractOrderItem>
          actionRef={actionRef}
          search={false}
          options={false}
          pagination={false}
          rowKey={(r) => r.id}
          columns={columns}
          dataSource={Array.isArray(orderDetail.items) ? orderDetail.items : []}
          scroll={{ x: 'max-content' }}
        />
      )}
      <Divider style={{ margin: '12px 0' }} />
      {selectedOrderId && itemsForSubmit.length > 0 ? (
        <SubcontractReceiptForm
          orderId={selectedOrderId}
          items={itemsForSubmit}
          onSubmitted={onSubmitted}
        />
      ) : (
        <div style={{ color: '#999' }}>请选择委外订单，并为至少一条明细填写收货数量</div>
      )}
    </Modal>
  )
}

export default AddSubcontractReceiptModal