import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType } from '@ant-design/pro-components'
import { Drawer, Tooltip, Dropdown } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import GenerateSubcontractOrderModal from '@/features/subcontract-management/components/GenerateSubcontractOrderModal'
import PrintWorkOrderModal from './PrintWorkOrderModal'
import type { ProColumns } from '@ant-design/pro-components'
import type { WorkOrderDetail, WorkOrderMaterialLine } from '@zyerp/shared'
import { workOrderService } from '../services/work-order.service'
import { materialIssueService } from '@/features/material-issue/services/material-issue.service'
import { WORK_ORDER_STATUS_VALUE_ENUM_PRO, WORK_ORDER_OUTSOURCING_VALUE_ENUM_PRO } from '@/shared/constants/work-order'
import { workcenterService } from '@/features/workcenter/services/workcenter.service'
import { supplierService } from '@/features/supplier-management/services/supplier.service'
import { useMessage, useModal } from '@/shared/hooks'
import ManufacturingOrderDetail from '@/features/manufacturing-order/components/ManufacturingOrderDetail'
import SubcontractOrderDetail from '@/features/subcontract-management/components/SubcontractOrderDetail'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'
import type { TableParams } from '@/shared/utils/normalizeTableParams'

export interface WorkOrderSchedulingListProps {
  presetMoId?: string
}

const WorkOrderSchedulingList: React.FC<WorkOrderSchedulingListProps> = ({ presetMoId }) => {
  const [workcenterOptions, setWorkcenterOptions] = useState<Array<{ label: string; value: string }>>([])
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailMoId, setDetailMoId] = useState<string | undefined>(undefined)
  const message = useMessage()
  const [materialsDrawerVisible, setMaterialsDrawerVisible] = useState(false)
  const [materialsDrawerRecord, setMaterialsDrawerRecord] = useState<WorkOrderDetail | null>(null)
  const modal = useModal()
  const actionRef = useRef<ActionType | undefined>(undefined)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<WorkOrderDetail[]>([])
  const [genVisible, setGenVisible] = useState(false)
  const [genRows, setGenRows] = useState<WorkOrderDetail[]>([])
  const [suppliers, setSuppliers] = useState<Array<{ label: string; value: string }>>([])
  const [subDetailVisible, setSubDetailVisible] = useState(false)
  const [subDetailOrderId, setSubDetailOrderId] = useState<string | undefined>(undefined)
  const [printVisible, setPrintVisible] = useState(false)
  const [printRecord, setPrintRecord] = useState<WorkOrderDetail | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const resp = await workcenterService.getList({ page: 1, pageSize: 999 })
        setWorkcenterOptions((resp.data || []).map(w => ({ label: w.name, value: w.id })))
      } catch {
        message.error('加载工作中心失败')
      }
      try {
        const s = await supplierService.getList({ page: 1, pageSize: 999 })
        setSuppliers((s.data || []).map(it => ({ label: it.name, value: it.id })))
      } catch {
        message.error('加载供应商失败')
      }
      
    })()
  }, [message])

  

  const renderSequenceSteps = useCallback((rec: WorkOrderDetail) => {
    const s = typeof rec.sequenceStart === 'number' ? rec.sequenceStart : rec.sequence
    const e = typeof rec.sequenceEnd === 'number' ? rec.sequenceEnd : rec.sequence
    const cur = typeof rec.sequence === 'number' ? rec.sequence : s
    const labels = typeof rec.operationsLabel === 'string' ? rec.operationsLabel.split('、').filter(Boolean) : []
    const statuses: Record<string, string> = {
      completed: '#52c41a',
      draft: '#d9d9d9',
      scheduled: '#2db7f5',
      in_progress: '#1890ff',
      paused: '#faad14',
      cancelled: '#ff4d4f',
      pending: '#bfbfbf',
    }
    const steps: number[] = []
    if (typeof s === 'number' && typeof e === 'number' && e >= s) {
      for (let i = s; i <= e; i += 1) steps.push(i)
    } else {
      steps.push(cur)
    }
    return (
      <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
        {steps.map(step => {
          const st = step < cur ? 'completed' : step === cur ? rec.status : 'pending'
          const color = statuses[st] || '#bfbfbf'
          const idx = typeof s === 'number' && typeof e === 'number' ? step - s : 0
          const name = labels[idx] || String(step)
          const textColor = st === 'draft' || st === 'pending' ? '#000' : '#fff'
          return (
            <Tooltip key={step}>
              <div style={{ maxWidth: 140, minWidth: 28, height: 18, padding: '0 6px', borderRadius: 3, background: color, color: textColor, fontSize: 12, lineHeight: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            </Tooltip>
          )
        })}
      </div>
    )
  }, [])

  const handleStart = useCallback((r: WorkOrderDetail) => {
    modal.confirm({
      title: '确认开始',
      content: `确定开始工单 ${r.orderNo ?? r.id} 吗？`,
      onOk: async () => {
        await workOrderService.updateStatus(r.id, 'in_progress')
        try {
          const created = await materialIssueService.createForWorkOrder(r.id)
          const orderNo = created.data?.orderNo || `MI-${r.orderNo ?? r.id}`
          message.success(`工单已开始，已生成领料订单 ${orderNo}`)
        } catch {
          message.warning('工单已开始，生成领料订单失败')
        }
        void actionRef.current?.reload?.()
      },
    })
  }, [modal, message])

  const handlePause = useCallback((r: WorkOrderDetail) => {
    modal.confirm({
      title: '暂停工单',
      content: `确定暂停工单 ${r.orderNo ?? r.id} 吗？`,
      onOk: async () => {
        await workOrderService.updateStatus(r.id, 'paused')
        message.success('工单已暂停')
        void actionRef.current?.reload?.()
      },
    })
  }, [modal, message])

  const handleResume = useCallback((r: WorkOrderDetail) => {
    modal.confirm({
      title: '继续开始',
      content: `确定继续开始工单 ${r.orderNo ?? r.id} 吗？`,
      onOk: async () => {
        await workOrderService.updateStatus(r.id, 'in_progress')
        message.success('工单已继续开始')
        void actionRef.current?.reload?.()
      },
    })
  }, [modal, message])

  const handleCancel = useCallback((r: WorkOrderDetail) => {
    modal.confirm({
      title: '取消工单',
      content: `确定取消工单 ${r.orderNo ?? r.id} 吗？`,
      onOk: async () => {
        await workOrderService.updateStatus(r.id, 'cancelled')
        message.success('工单已取消')
        void actionRef.current?.reload?.()
      },
    })
  }, [modal, message])

  const handleDelete = useCallback((r: WorkOrderDetail) => {
    modal.confirm({
      title: '删除工单',
      content: `确定删除工单 ${r.orderNo ?? r.id} 吗？此操作不可撤销。`,
      onOk: async () => {
        await workOrderService.delete(r.id)
        message.success('工单已删除')
        void actionRef.current?.reload?.()
      },
    })
  }, [modal, message])

  const columns: ProColumns<WorkOrderDetail>[] = useMemo(() => ([
    { title: '工单编号', dataIndex: 'orderNo', width: 160 },
    { title: '生产批次号', dataIndex: 'batchNo', width: 200 },
    { title: '制造订单编号', dataIndex: 'moOrderNo', width: 160, render: (_, r: WorkOrderDetail) => (r.moOrderNo ? (<a onClick={() => { setDetailMoId(r.moId); setDetailVisible(true) }}>{r.moOrderNo}</a>) : '-') },
    { title: '产品信息', dataIndex: 'productInfo', width: 200, render: (_, r: WorkOrderDetail) => (
      <div>
        <div style={{ fontWeight: 500 }}>{r.productName ?? '-'}</div>
        <div style={{ color: '#999' }}>{r.productCode ?? r.productId ?? '-'} {r.moUnit ? `｜${r.moUnit}` : ''}</div>
      </div>
    ) },
    { title: '生产数量', dataIndex: 'quantity', width: 100, render: (_, rec: WorkOrderDetail) => {
      const q = typeof rec.quantity === 'number' ? rec.quantity : undefined
      const u = typeof rec.moUnit === 'string' ? rec.moUnit : ''
      return q !== undefined ? `${q} ${u}` : '-'
    } },
    { title: '工序进度', dataIndex: 'sequenceSteps', render: (_, rec: WorkOrderDetail) => renderSequenceSteps(rec) },
    { title: '物料种类', dataIndex: 'materialsKinds', width: 100, render: (_, rec: WorkOrderDetail) => (
      <a onClick={() => { setMaterialsDrawerRecord(rec); setMaterialsDrawerVisible(true) }}>
        {typeof rec.materialsKinds === 'number' ? rec.materialsKinds : 0}
      </a>
    ) },
    { title: '外协需求', dataIndex: 'needsSubcontracting', width: 100, valueType: 'select', valueEnum: WORK_ORDER_OUTSOURCING_VALUE_ENUM_PRO, hideInSearch: true },
    { title: '外协工序数', dataIndex: 'outsourcedOperationCount', width: 120, hideInSearch: true },
    { title: '委外订单', dataIndex: 'subcontractOrderNo', width: 160, hideInSearch: true, render: (_, r: WorkOrderDetail) => (
      r.subcontractOrderId ? <a onClick={() => { setSubDetailOrderId(r.subcontractOrderId); setSubDetailVisible(true) }}>{r.subcontractOrderNo ?? r.subcontractOrderId}</a> : '-'
    ) },
    { title: '计划生产日期', dataIndex: 'planRange', width: 220, hideInSearch: true, render: (_, r: WorkOrderDetail) => (
      <div>
        <div style={{ color: '#666' }}>开始：{r.plannedStart ? new Date(r.plannedStart).toLocaleDateString() : '-'}</div>
        <div style={{ color: '#666' }}>结束：{r.plannedFinish ? new Date(r.plannedFinish).toLocaleDateString() : '-'}</div>
      </div>
    ) },
    { title: '状态', dataIndex: 'status', key: 'status_search', valueType: 'select', valueEnum: WORK_ORDER_STATUS_VALUE_ENUM_PRO, hideInTable: true },
    { title: '工作中心', dataIndex: 'workcenterId', key: 'workcenter_search', valueType: 'select', hideInTable: true, fieldProps: { options: workcenterOptions } },
    {
      title: '操作',
      dataIndex: 'actions',
      valueType: 'option',
      fixed: 'right',
      width: 200,
      render: (_, r: WorkOrderDetail) => {
        const moreItems = [
          {
            key: 'cancel',
            label: '取消',
            disabled: r.status === 'completed',
            onClick: () => handleCancel(r),
          },
          {
            key: 'delete',
            label: '删除',
            disabled: !(['draft', 'cancelled'].includes(r.status)),
            onClick: () => handleDelete(r),
          },
          {
            key: 'generate-subcontract',
            label: '生成委外订单',
            disabled: !r.needsSubcontracting,
            onClick: () => { setGenRows([r]); setGenVisible(true) },
          },
        ]
        return [
          <a key="start" style={{ pointerEvents: ['draft', 'scheduled'].includes(r.status) ? 'auto' : 'none', color: ['draft', 'scheduled'].includes(r.status) ? undefined : '#999' }} onClick={() => handleStart(r)}>确认开始</a>,
          <a key="pause" style={{ pointerEvents: r.status === 'in_progress' ? 'auto' : 'none', color: r.status === 'in_progress' ? undefined : '#999' }} onClick={() => handlePause(r)}>暂停</a>,
          <a key="resume" style={{ pointerEvents: r.status === 'paused' ? 'auto' : 'none', color: r.status === 'paused' ? undefined : '#999' }} onClick={() => handleResume(r)}>继续开始</a>,
          <a key="print" onClick={() => { setPrintRecord(r); setPrintVisible(true) }}>打印工单</a>,
          <Dropdown
            key="more"
            menu={{ items: moreItems.map(mi => ({ key: mi.key, label: mi.label, disabled: mi.disabled, onClick: mi.onClick })) }}
          >
            <a><MoreOutlined /></a>
          </Dropdown>,
        ]
      },
    },
  ]), [renderSequenceSteps, handleStart, handlePause, handleResume, handleCancel, handleDelete, workcenterOptions])

  const materialColumns: ProColumns<WorkOrderMaterialLine>[] = useMemo(() => ([
    { title: '物料', dataIndex: 'materialName', ellipsis: true, width: 220, render: (_, m: WorkOrderMaterialLine) => m.materialName ?? m.materialCode ?? m.materialId },
    { title: '数量', dataIndex: 'quantity', valueType: 'digit', width: 100 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '领取状态', dataIndex: 'issued', width: 100, render: (_, m: WorkOrderMaterialLine) => (m.issued ? '已领取' : '未领取') },
  ]), [])

  return (
    <>
    <ProTable<WorkOrderDetail>
      actionRef={actionRef}
      rowKey={(r) => r.id}
      search={{ labelWidth: 'auto' }}
      columns={columns}
      scroll={{ x: 'max-content' }}

      request={async (params: Record<string, unknown>) => {
        const rawRange = params['dateRange']
        const dateRange = Array.isArray(rawRange) && rawRange.length >= 2 && typeof rawRange[0] === 'string' && typeof rawRange[1] === 'string'
          ? [rawRange[0], rawRange[1]] as [string, string]
          : undefined
        const start = dateRange?.[0]
        const end = dateRange?.[1]
        const base = normalizeTableParams(params as TableParams)
        const res: import('@zyerp/shared').PaginatedResponse<WorkOrderDetail> = await workOrderService.getList({
          page: base.page,
          pageSize: base.pageSize,
          workcenterId: typeof params.workcenterId === 'string' ? params.workcenterId : undefined,
          status: typeof params.status === 'string' ? params.status : undefined,
          moId: typeof params.moId === 'string' ? params.moId : presetMoId,
          start,
          end,
        })
        
        return { data: res.data, success: res.success, total: res.pagination.total }
      }}
      pagination={{ showSizeChanger: true, showQuickJumper: true }}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows) },
      }}
      toolBarRender={() => [
        <a key="batch-generate" onClick={() => {
          if (!selectedRows.length) { message.warning('请选择工单'); return }
          setGenRows(selectedRows); setGenVisible(true)
        }}>批量生成委外订单</a>
      ]}
    />
    <Drawer
      open={materialsDrawerVisible}
      width={520}
      placement="right"
      title={materialsDrawerRecord ? `物料明细（工单：${materialsDrawerRecord.orderNo || '-'}）` : '物料明细'}
      onClose={() => { setMaterialsDrawerVisible(false); setMaterialsDrawerRecord(null) }}
    >
      <ProTable<WorkOrderMaterialLine>
        rowKey={(r) => `${materialsDrawerRecord?.id || ''}-${r.materialId}-${r.unitId}`}
        search={false}
        options={false}
        pagination={false}
        columns={materialColumns}
        dataSource={Array.isArray(materialsDrawerRecord?.materials) ? materialsDrawerRecord?.materials : []}
      />
    </Drawer>
    <GenerateSubcontractOrderModal
      visible={genVisible}
      onClose={() => setGenVisible(false)}
      workOrders={genRows}
      supplierOptions={suppliers}
      onGenerated={() => { setGenVisible(false); setSelectedRowKeys([]); setSelectedRows([]); void actionRef.current?.reload?.() }}
    />
    <ManufacturingOrderDetail visible={detailVisible} moId={detailMoId} onClose={() => setDetailVisible(false)} />
    <Drawer
      open={subDetailVisible}
      width={720}
      placement="right"
      title={subDetailOrderId ? `委外订单详情` : '委外订单详情'}
      onClose={() => { setSubDetailVisible(false); setSubDetailOrderId(undefined) }}
    >
      <SubcontractOrderDetail orderId={subDetailOrderId} visible={subDetailVisible} onClose={() => { setSubDetailVisible(false); setSubDetailOrderId(undefined) }} />
    </Drawer>
    <PrintWorkOrderModal visible={printVisible} workOrder={printRecord || undefined} onClose={() => { setPrintVisible(false); setPrintRecord(null) }} />
    </>
  )
}

export default WorkOrderSchedulingList