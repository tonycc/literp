import React, { useMemo } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { SubcontractReceipt } from '@zyerp/shared'
import { subcontractReceiptService } from '../services/subcontract-receipt.service'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'
import type { TableParams } from '@/shared/utils/normalizeTableParams'
import { useReceiptDicts } from '../hooks/useReceiptDicts'
import { buildReceiptColumns } from '../utils/receiptColumns'

export interface SubcontractReceiptListProps {
  actionRef?: React.MutableRefObject<ActionType | undefined>
  onAdd?: () => void
  onView?: (item: SubcontractReceipt) => Promise<void> | void
  onConfirm?: (item: SubcontractReceipt) => Promise<void> | void
  onPost?: (item: SubcontractReceipt) => Promise<void> | void
}

const SubcontractReceiptList: React.FC<SubcontractReceiptListProps> = ({ actionRef, onAdd, onView, onConfirm, onPost }) => {
  const dicts = useReceiptDicts()

  const columns: ProColumns<SubcontractReceipt>[] = useMemo(() => {
    const base = buildReceiptColumns(dicts)
    const operation: ProColumns<SubcontractReceipt> = {
      title: '操作',
      dataIndex: 'actions',
      valueType: 'option',
      fixed: 'right',
      width: 220,
      render: (_, record) => [
        <a key="view" onClick={() => { void onView?.(record) }}>查看</a>,
        <a key="confirm" style={{ pointerEvents: record.status === 'draft' ? 'auto' : 'none', color: record.status === 'draft' ? undefined : '#999' }} onClick={() => { void onConfirm?.(record) }}>确认</a>,
        <a key="post" style={{ pointerEvents: record.status === 'confirmed' ? 'auto' : 'none', color: record.status === 'confirmed' ? undefined : '#999' }} onClick={() => { void onPost?.(record) }}>过账</a>,
      ],
    }
    return [...base, operation]
  }, [dicts, onView, onConfirm, onPost])

  return (
    <ProTable<SubcontractReceipt>
      actionRef={actionRef}
      rowKey={(r) => r.id}
      search={{ labelWidth: 'auto' }}
      columns={columns}
      request={async (params: Record<string, unknown>) => {
        const base = normalizeTableParams(params as TableParams)
        const res = await subcontractReceiptService.getList({ page: base.page, pageSize: base.pageSize })
        return { data: res.data, success: res.success, total: res.pagination.total }
      }}
      pagination={{ showSizeChanger: true, showQuickJumper: true }}
      toolBarRender={() => [
        <>
          {onAdd && (
            <button key="add" className="ant-btn ant-btn-primary" onClick={() => onAdd?.()}>新增收货</button>
          )}
        </>
      ]}
    />
  )
}

export default SubcontractReceiptList