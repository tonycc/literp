import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ProCard, ProDescriptions, ProTable, ModalForm, ProFormDigit } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import type { MaterialIssueOrder, MaterialIssueOrderItem } from '@zyerp/shared'
import { materialIssueService } from '../services/material-issue.service'
import { useMessage, useModal } from '@/shared/hooks'

interface MaterialIssueDetailProps {
  orderId: string
}

const MaterialIssueDetail: React.FC<MaterialIssueDetailProps> = ({ orderId }) => {
  const [order, setOrder] = useState<MaterialIssueOrder | null>(null)
  const [currentItem, setCurrentItem] = useState<MaterialIssueOrderItem | null>(null)
  const actionRef = useRef<ActionType | undefined>(undefined)
  const message = useMessage()
  const modal = useModal()

  const load = async () => {
    try {
      const resp = await materialIssueService.getById(orderId)
      setOrder(resp.data ?? null)
    } catch {
      message.error('加载订单失败')
    }
  }

  useEffect(() => { void load() }, [orderId])

  const items: MaterialIssueOrderItem[] = useMemo(() => order?.items ?? [], [order])

  const columns: ProColumns<MaterialIssueOrderItem>[] = [
    { title: '物料编码', dataIndex: 'materialCode', width: 180, render: (_, r) => r.materialCode || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 220, render: (_, r) => r.materialName || '-' },
    { title: '规格', dataIndex: 'specification', width: 180, render: (_, r) => r.specification || '-' },
    { title: '单位', dataIndex: 'unit', width: 100, render: (_, r) => r.unit || '-' },
    { title: '需求数量', dataIndex: 'requiredQuantity', width: 120 },
    { title: '已领取', dataIndex: 'issuedQuantity', width: 120 },
    { title: '待领取', dataIndex: 'pendingQuantity', width: 120 },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 140, render: (_, r) => r.warehouseCode || r.warehouseName || '-' },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 180,
      render: (_, r) => [
        <a key="partial" onClick={() => setCurrentItem(r)}>部分领取</a>,
      ],
    },
  ]

  return (
    <ProCard split="horizontal">
      <ProCard title="订单信息">
        <ProDescriptions dataSource={order ?? undefined} column={1} columns={[
          { title: '订单编号', dataIndex: 'orderNo' },
          { title: '工单编号', dataIndex: 'workOrderNo' },
          { title: '制造订单编号', dataIndex: 'moOrderNo' },
          { title: '状态', dataIndex: 'status' },
          { title: '仓库编码', dataIndex: 'warehouseCode', render: (_, r) => r?.warehouseCode || r?.warehouseName || '-' },
        ]} />
      </ProCard>
      <ProCard title="物料明细">
        <ProTable<MaterialIssueOrderItem>
          actionRef={actionRef}
          rowKey={(r) => r.id as string}
          columns={columns}
          search={false}
          toolBarRender={false}
          dataSource={items}
          pagination={{ showSizeChanger: true, showQuickJumper: true }}
        />
      </ProCard>

      <ModalForm<{ quantity: number }>
        title="部分领取"
        open={Boolean(currentItem)}
        modalProps={{ onCancel: () => setCurrentItem(null) }}
        onFinish={async (vals) => {
          if (!order || !currentItem) return false
          const qty = Number(vals.quantity || 0)
          if (!Number.isFinite(qty) || qty <= 0) {
            message.warning('请输入有效数量')
            return false
          }
          try {
            const resp = await materialIssueService.issueItem(order.id as string, currentItem.id as string, qty)
            setOrder(resp.data ?? order)
            setCurrentItem(null)
            message.success('已部分领取')
            return true
          } catch {
            message.error('部分领取失败')
            return false
          }
        }}
      >
        <ProFormDigit name="quantity" label="领取数量" min={1} fieldProps={{ precision: 4 }} />
      </ModalForm>
    </ProCard>
  )
}

export default MaterialIssueDetail