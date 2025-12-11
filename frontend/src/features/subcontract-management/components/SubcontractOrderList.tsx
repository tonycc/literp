import React, { useMemo, useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { SubcontractOrder } from '@zyerp/shared'
import { subcontractOrderService } from '../services/subcontract-order.service'
import { SUBCONTRACT_ORDER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/subcontract'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'
import type { TableParams } from '@/shared/utils/normalizeTableParams'
import { useMessage, useModal } from '@/shared/hooks'
import { Modal } from 'antd'
import SubcontractOrderDetail from './SubcontractOrderDetail'
import { operationService } from '@/features/operation/services/operation.service'
import { getUsers } from '@/shared/services'

const SubcontractOrderList: React.FC = () => {
  const message = useMessage()
  const modal = useModal()
  const actionRef = useRef<ActionType | undefined>(undefined)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailOrderId, setDetailOrderId] = useState<string | undefined>(undefined)

  const [opNameMap, setOpNameMap] = useState<Record<string, string>>({})
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({})

  React.useEffect(() => {
    void (async () => {
      try {
        const ops = await operationService.getOptions({ isActive: true })
        const map: Record<string, string> = {}
        for (const o of ops.data || []) { if (o.value && o.label) map[o.value] = o.label }
        setOpNameMap(map)
      } catch { /* ignore */ }
      try {
        const users = await getUsers({ page: 1, pageSize: 999 })
        const map: Record<string, string> = {}
        for (const u of users.data || []) { if (u.id && u.username) map[u.id] = u.username }
        setUserNameMap(map)
      } catch { /* ignore */ }
    })()
  }, [])

  const columns: ProColumns<SubcontractOrder>[] = useMemo(() => ([
    { title: '委外订单号', dataIndex: 'orderNo', width: 160 },
    { title: '状态', dataIndex: 'status', width: 100, valueEnum: SUBCONTRACT_ORDER_STATUS_VALUE_ENUM_PRO },
    { title: '供应商', dataIndex: 'supplierName', width: 160 },
    { title: '交期', dataIndex: 'expectedDeliveryDate', width: 140, render: (_, r) => (r.expectedDeliveryDate ? new Date(r.expectedDeliveryDate).toLocaleDateString() : '-') },
    { title: '工单', dataIndex: 'firstWorkOrderId', width: 180, render: (_, r) => r.firstWorkOrderNo ?? r.firstWorkOrderId ?? '-' },
    { title: '产品', dataIndex: 'firstProductName', width: 200, render: (_, r) => r.firstProductName ? `${r.firstProductName}${r.firstProductCode ? `(${r.firstProductCode})` : ''}` : (r.firstProductCode ?? '-') },
    { title: '工序', dataIndex: 'firstOperationId', width: 160, render: (_, r) => r.firstOperationName ?? (r.firstOperationId ? (opNameMap[String(r.firstOperationId)] ?? r.firstOperationId) : '-') },
    { title: '单价', dataIndex: 'firstPrice', width: 120, render: (_, r) => (typeof r.firstPrice === 'number' ? r.firstPrice.toFixed(4) : '-') },
    { title: '总额', dataIndex: 'totalAmount', width: 140 },
    { title: '提交人', dataIndex: 'submittedBy', width: 140, render: (_, r) => r.submittedByName ?? (r.submittedBy ? (userNameMap[String(r.submittedBy)] ?? r.submittedBy) : '-') },
    { title: '提交时间', dataIndex: 'submittedAt', width: 180, render: (_, r) => (typeof r.submittedAt === 'string' ? new Date(r.submittedAt).toLocaleString() : (r.submittedAt instanceof Date ? r.submittedAt.toLocaleString() : '-')) },
    {
      title: '操作',
      dataIndex: 'actions',
      valueType: 'option',
      fixed: 'right',
      width: 200,
      render: (_, record) => [
        <a key="view" onClick={() => { setDetailOrderId(record.id); setDetailVisible(true) }}>查看</a>,
        <a key="delete" onClick={() => {
          modal.confirm({
            title: '确认删除',
            okType: 'danger',
            onOk: async () => {
              try {
                const resp = await subcontractOrderService.delete(record.id)
                if (resp.success) {
                  message.success('删除成功')
                  void actionRef.current?.reload?.()
                } else {
                  message.error(resp.message || '删除失败')
                }
              } catch {
                message.error('删除失败')
              }
            }
          })
        }}>删除</a>,
      ],
    },
  ]), [])

  return (
    <>
      <ProTable<SubcontractOrder>
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        columns={columns}
        request={async (params: Record<string, unknown>) => {
          const base = normalizeTableParams(params as TableParams)
          const res = await subcontractOrderService.getList({ page: base.page, pageSize: base.pageSize, status: typeof params.status === 'string' ? params.status : undefined })
          return { data: res.data, success: res.success, total: res.pagination.total }
        }}
        pagination={{ showSizeChanger: true, showQuickJumper: true }}
      />
      <Modal
        open={detailVisible}
        width={720}
        title={detailOrderId ? '委外订单详情' : '委外订单详情'}
        footer={null}
        onCancel={() => { setDetailVisible(false); setDetailOrderId(undefined) }}
        destroyOnClose
      >
        <SubcontractOrderDetail orderId={detailOrderId} visible={detailVisible} onClose={() => { setDetailVisible(false); setDetailOrderId(undefined) }} />
      </Modal>
    </>
  )
}

export default SubcontractOrderList