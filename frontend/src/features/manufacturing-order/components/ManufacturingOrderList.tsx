import React from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import type { ManufacturingOrder } from '@zyerp/shared'
import { MANUFACTURING_ORDER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/manufacturing-order'
import { Progress } from 'antd'

export interface ManufacturingOrderListProps {
  data?: ManufacturingOrder[]
  loading?: boolean
  columns?: ProColumns<ManufacturingOrder>[]
  extraColumns?: ProColumns<ManufacturingOrder>[]
  onView?: (item: ManufacturingOrder) => void
  onConfirm?: (item: ManufacturingOrder) => void
  onCancel?: (item: ManufacturingOrder) => void
  onGenerateWorkOrders?: (item: ManufacturingOrder) => void
  onSchedule?: (item: ManufacturingOrder) => void
  onViewBom?: (item: ManufacturingOrder) => void
  onViewRouting?: (item: ManufacturingOrder) => void
  onDelete?: (item: ManufacturingOrder) => void
}

export const ManufacturingOrderList: React.FC<ManufacturingOrderListProps> = ({ data = [], loading, columns, extraColumns, onView, onConfirm, onCancel, onGenerateWorkOrders, onSchedule, onViewBom, onViewRouting, onDelete }) => {

  React.useEffect(() => {
    void 0
  }, [data])

  const SOURCE_TYPE_LABEL: Record<string, string> = {
    sales_order: '销售订单',
    production_plan: '生产计划',
    manual: '手工创建',
  }
  const defaultColumns: ProColumns<ManufacturingOrder>[] = [
    { title: '序号', dataIndex: 'index', valueType: 'indexBorder', width: 50 },
    { 
      title: '制造单号', 
      dataIndex: 'orderNo', 
      width: 160,
      render: (_, r) => (<a onClick={() => { void onView?.(r) }}>{r.orderNo}</a>)
    },
    { title: '父制造单', dataIndex: 'parentMoOrderNo', width: 160, hideInSearch: true, render: (_, r) => (r.parentMoId ? (r.parentMoOrderNo ?? '-') : '-') },
    { title: '来源', dataIndex: 'sourceType', width: 120, hideInSearch: true, render: (_, r) => SOURCE_TYPE_LABEL[String(r.sourceType || '')] || r.sourceType || '-' },
    { title: '来源订单号', dataIndex: 'sourceOrderNo', width: 160, hideInSearch: true, render: (_, r) => (r.sourceType === 'sales_order' ? (r.sourceOrderNo ?? '-') : (r.sourceRefId || '-')) },
    { 
      title: '产品信息', 
      dataIndex: 'productInfo', 
      width: 260,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.productName || '-'}</div>
          <div style={{ color: '#999' }}>{r.productCode || '-'} {r.unit ? `｜${r.unit}` : ''}</div>
        </div>
      )
    },
    { title: 'BOM版本', dataIndex: 'bomCode', width: 200, render: (_, r) => (r.bomCode ? (<a onClick={() => { void onViewBom?.(r) }}>{r.bomCode}</a>) : '-') },
    { title: '计划数量', dataIndex: 'quantity', valueType: 'digit', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 80, render: (_, r) => r.unit || '-' },
    { 
      title: '生产数量', 
      dataIndex: 'produced', 
      width: 120, 
      hideInSearch: true,
      render: (_, r) => {
        const produced = typeof r.pendingQuantity === 'number' ? Math.max(0, Number(r.quantity || 0) - Number(r.pendingQuantity || 0)) : Number(r.scheduledQuantity || 0)
        return `${produced} ${r.unit || ''}`.trim()
      }
    },
    { title: '工艺路线', dataIndex: 'routingCode', width: 120, render: (_, r) => (r.routingCode ? (<a onClick={() => { void onViewRouting?.(r) }}>{r.routingCode}</a>) : '-') },
    { title: '已排单数量', dataIndex: 'scheduledQuantity', valueType: 'digit', width: 120, hideInSearch: true },
    { title: '未排单数量', dataIndex: 'pendingQuantity', valueType: 'digit', width: 120, hideInSearch: true },
    { 
      title: '生产进度', 
      dataIndex: 'progress', 
      width: 180, 
      hideInSearch: true,
      render: (_, r) => {
        const total = Number(r.quantity || 0)
        const produced = typeof r.pendingQuantity === 'number' ? Math.max(0, total - Number(r.pendingQuantity || 0)) : Number(r.scheduledQuantity || 0)
        const percent = total > 0 ? Math.min(100, Math.round((produced / total) * 100)) : 0
        const status = r.status === 'completed' ? 'success' : (r.status === 'cancelled') ? 'exception' : 'active'
        return <Progress percent={percent} status={status as any} size="small" />
      }
    },
    { title: '交付日期', dataIndex: 'dueDate', valueType: 'date', width: 140, hideInSearch: true },
    { 
      title: '计划生产日期', 
      dataIndex: 'planRange', 
      width: 220, 
      hideInSearch: true,
      render: (_, r) => (
        <div>
          <div style={{ color: '#666' }}>开始：{r.plannedStart ? new Date(r.plannedStart).toLocaleDateString() : '-'}</div>
          <div style={{ color: '#666' }}>结束：{r.plannedFinish ? new Date(r.plannedFinish).toLocaleDateString() : '-'}</div>
        </div>
      )
    },
    { title: '状态', dataIndex: 'status', width: 100, valueType: 'select', valueEnum: MANUFACTURING_ORDER_STATUS_VALUE_ENUM_PRO },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 180, hideInSearch: true },
    { title: '更新时间', dataIndex: 'updatedAt', valueType: 'dateTime', width: 180, hideInSearch: true },
  ]

  const hasActions = !!(onView || onConfirm || onCancel || onGenerateWorkOrders || onSchedule || onDelete)
  const actionColumn: ProColumns<ManufacturingOrder> | undefined = hasActions
    ? {
        title: '操作',
        dataIndex: 'actions',
        fixed: 'right',
        width: 200,
        valueType: 'option',
        render: (_, record) => [
          onConfirm ? (
            <a
              key="confirm"
              onClick={() => { void onConfirm(record) }}
              style={{ pointerEvents: record.status === 'draft' ? 'auto' : 'none', color: record.status === 'draft' ? undefined : '#999' }}
            >
              确认
            </a>
          ) : undefined,
          onCancel ? (
            <a
              key="cancel"
              onClick={() => { void onCancel(record) }}
              style={{ pointerEvents: record.status === 'completed' ? 'none' : 'auto', color: record.status === 'completed' ? '#999' : undefined }}
            >
              取消
            </a>
          ) : undefined,
          onGenerateWorkOrders ? (
            <a key="generate" onClick={() => { void onGenerateWorkOrders(record) }}>生成工单</a>
          ) : undefined,
          onDelete ? (
            <a
              key="delete"
              onClick={() => { void onDelete(record) }}
              style={{ pointerEvents: (record.status === 'draft' || record.status === 'cancelled') ? 'auto' : 'none', color: (record.status === 'draft' || record.status === 'cancelled') ? undefined : '#999' }}
            >删除</a>
          ) : undefined,
        ].filter(Boolean) as React.ReactNode[],
      }
    : undefined

  const finalColumns: ProColumns<ManufacturingOrder>[] = columns ?? [...defaultColumns, ...(extraColumns || []), ...(actionColumn ? [actionColumn] : [])]

  return (
    <ProTable<ManufacturingOrder>
      columns={finalColumns}
      dataSource={data}
      loading={loading}
      rowKey={(r) => r.id}
      search={{ labelWidth: 'auto' }}
      pagination={{ showSizeChanger: true, showQuickJumper: true }}
      scroll={{ x: 2400 }}
    />
  )
}

export default ManufacturingOrderList