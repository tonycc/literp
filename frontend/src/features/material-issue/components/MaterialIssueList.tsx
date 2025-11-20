import React, { useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import type { MaterialIssueOrder } from '@zyerp/shared'
import type { MaterialIssueOrderItem } from '@zyerp/shared'
import { materialIssueService } from '../services/material-issue.service'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'
import type { TableParams } from '@/shared/utils/normalizeTableParams'
import { MATERIAL_ISSUE_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/material-issue'
import { Modal } from 'antd'
import MaterialIssueDetail from './MaterialIssueDetail'

const MaterialIssueList: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])

  const columns: ProColumns<MaterialIssueOrder>[] = [
    { title: '领料订单', dataIndex: 'orderNo', width: 200 },
    { title: '关联工单', dataIndex: 'workOrderNo', width: 220, render: (_, r) => r.workOrderNo || '-' },
    { title: '制造订单', dataIndex: 'moOrderNo', width: 220, render: (_, r) => r.moOrderNo || '-' },
    { title: '物料名称', dataIndex: 'itemsNames', width: 200, ellipsis: true, hideInSearch: true, render: (_, r) => {
      const items = Array.isArray(r.items) ? r.items : []
      const names = items.map(i => i.materialName || i.materialCode || '').filter(Boolean)
      const text = names.length > 0 ? (names.slice(0, 2).join('、') + (names.length > 2 ? ` 等${names.length}项` : '')) : '-'
      return text
    } },
    { title: '总需求数量', dataIndex: 'totalRequired', width: 120, hideInSearch: true, render: (_, r) => {
      const items = Array.isArray(r.items) ? r.items : []
      return items.reduce((sum, it) => sum + Number(it.requiredQuantity || 0), 0)
    } },
    { title: '已领取数量', dataIndex: 'totalIssued', width: 120, hideInSearch: true, render: (_, r) => {
      const items = Array.isArray(r.items) ? r.items : []
      return items.reduce((sum, it) => sum + Number(it.issuedQuantity || 0), 0)
    } },
    { title: '出库仓库', dataIndex: 'warehouseCode', width: 160, render: (_, r) => r.warehouseCode || r.warehouseName || '-' },
    { title: '状态', dataIndex: 'status', valueType: 'select', valueEnum: MATERIAL_ISSUE_STATUS_VALUE_ENUM_PRO },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      render: (_, r) => [
        <a key="detail" onClick={() => { setDetailId(r.id ?? r.workOrderId); setDetailOpen(true) }}>详情</a>,
      ],
    }
  ]

  const itemColumns: ProColumns<MaterialIssueOrderItem>[] = [
    { title: '物料编码', dataIndex: 'materialCode', width: 160 },
    { title: '物料名称', dataIndex: 'materialName', width: 220 },
    { title: '规格', dataIndex: 'specification', width: 180 },
    { title: '单位', dataIndex: 'unit', width: 100 },
    { title: '需求数量', dataIndex: 'requiredQuantity', width: 120 },
    { title: '已领取', dataIndex: 'issuedQuantity', width: 120 },
    { title: '待领取', dataIndex: 'pendingQuantity', width: 120 },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 140, render: (_, r) => r.warehouseCode || r.warehouseName || '-' },
  ]

  return (
    <>
    <ProTable<MaterialIssueOrder>
      actionRef={actionRef}
      rowKey={(r) => r.workOrderId}
      columns={columns}
      search={{ labelWidth: 'auto' }}
      request={async (params) => {
        const base = normalizeTableParams(params as TableParams)
        const res = await materialIssueService.getList({ page: base.page, pageSize: base.pageSize })
        return { data: res.data, success: res.success, total: res.pagination.total }
      }}
      onDataSourceChange={(data) => {
        const keys = (data || []).filter(r => Array.isArray(r.items) && r.items.length > 1).map(r => r.workOrderId)
        setExpandedRowKeys(keys)
      }}
      expandable={{
        expandedRowKeys,
        onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]),
        rowExpandable: (r) => Array.isArray(r.items) && r.items.length > 1,
        expandedRowRender: (record) => (
          <ProTable<MaterialIssueOrderItem>
            columns={itemColumns}
            dataSource={Array.isArray(record.items) ? record.items : []}
            search={false}
            pagination={false}
            rowKey={(i) => i.id ?? `${i.materialCode ?? i.materialId}-${i.unitId}`}
            toolBarRender={false}
            size="small"
          />
        ),
      }}
      pagination={{ showSizeChanger: true, showQuickJumper: true }}
    />
    <Modal
      title="领料订单详情"
      open={detailOpen}
      onCancel={() => { setDetailOpen(false); setDetailId(null) }}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {detailId ? <MaterialIssueDetail orderId={detailId} /> : null}
    </Modal>
    </>
  )
}

export default MaterialIssueList