import React, { useEffect } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { ManufacturingOrder, ManufacturingOrderListParams } from '@zyerp/shared'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'
import { MANUFACTURING_ORDER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/manufacturing-order'
import { manufacturingOrderService } from '../services/manufacturing-order.service'
import { useMessage } from '@/shared/hooks'
import { useModal } from '@/shared/hooks'
import { Drawer } from 'antd'
import ManufacturingOrderDetail from '../components/ManufacturingOrderDetail'
import GenerateWorkOrdersModal from '../components/GenerateWorkOrdersModal'
import { BomService } from '@/features/bom/services/bom.service'
import routingService from '@/features/routing/services/routing.service'
import type { BomItem, RoutingWorkcenterInfo, WorkcenterOption } from '@zyerp/shared'

export const ManufacturingOrderManagement: React.FC = () => {
  const message = useMessage()
  const modal = useModal()
  const actionRef = React.useRef<ActionType | undefined>(undefined)
  const [currentMo, setCurrentMo] = React.useState<ManufacturingOrder | null>(null)
  const [generateVisible, setGenerateVisible] = React.useState(false)
  const [detailVisible, setDetailVisible] = React.useState(false)
  const [detailMoId, setDetailMoId] = React.useState<string | undefined>(undefined)
  const [bomVisible, setBomVisible] = React.useState(false)
  const [bomItems, setBomItems] = React.useState<BomItem[]>([])
  const [routingVisible, setRoutingVisible] = React.useState(false)
  const [routingOps, setRoutingOps] = React.useState<RoutingWorkcenterInfo[]>([])
  const [workcenterOptions, setWorkcenterOptions] = React.useState<WorkcenterOption[]>([])

  useEffect(() => { void 0 }, [])

  useEffect(() => {
    void (async () => {
      try {
        const res = await routingService.getWorkcenterOptions({ _active: true })
        setWorkcenterOptions(res.data || [])
      } catch {
        message.error('加载工作中心选项失败')
      }
    })()
  }, [message])

  const handleView = (record: ManufacturingOrder) => {
    setDetailMoId(record.id)
    setDetailVisible(true)
  }

  const handleConfirm = (record: ManufacturingOrder) => {
    modal.confirm({
      title: '确认制造订单',
      content: `确认制造订单 ${record.orderNo}？`,
      onOk: async () => {
        try {
          const resp = await manufacturingOrderService.confirm(record.id)
          if (resp.success) {
            message.success('确认成功')
            void actionRef.current?.reload?.()
          } else {
            message.error(resp.message || '确认失败')
          }
        } catch {
          message.error('确认失败')
        }
      },
    })
  }

  const handleCancel = (record: ManufacturingOrder) => {
    modal.confirm({
      title: '取消制造订单',
      content: `取消制造订单 ${record.orderNo}？`,
      onOk: async () => {
        try {
          const resp = await manufacturingOrderService.cancel(record.id)
          if (resp.success) {
            message.success('取消成功')
            void actionRef.current?.reload?.()
          } else {
            message.error(resp.message || '取消失败')
          }
        } catch {
          message.error('取消失败')
        }
      },
    })
  }

  const handleGenerate = (record: ManufacturingOrder) => {
    setCurrentMo(record)
    setGenerateVisible(true)
  }

  const handleDelete = (record: ManufacturingOrder) => {
    modal.confirm({
      title: '删除制造订单',
      content: `确认删除制造订单 ${record.orderNo}？`,
      onOk: async () => {
        const resp = await manufacturingOrderService.delete(record.id)
        if (resp.success) {
          message.success('删除成功')
          void actionRef.current?.reload?.()
        } else {
          message.error(resp.message || '删除失败')
        }
      },
    })
  }

  const handleViewBom = async (record: ManufacturingOrder) => {
    try {
      if (!record.bomId) {
        message.error('该制造订单未关联BOM')
        return
      }
      const resp = await BomService.getItems(record.bomId)
      const list = Array.isArray(resp.data) ? resp.data : []
      setBomItems(list)
      setCurrentMo(record)
      setBomVisible(true)
    } catch {
      message.error('加载物料列表失败')
    }
  }

  const handleViewRouting = async (record: ManufacturingOrder) => {
    try {
      if (!record.routingId) {
        message.error('该制造订单未关联工艺路线')
        return
      }
      const resp = await routingService.getOperations(record.routingId)
      const ops = resp.data || []
      setRoutingOps(ops)
      setCurrentMo(record)
      setRoutingVisible(true)
    } catch {
      message.error('加载工艺路线工序失败')
    }
  }

  const columns: ProColumns<ManufacturingOrder>[] = [
    { title: '序号', dataIndex: 'index', valueType: 'indexBorder', width: 50 },
    { title: '制造单号', dataIndex: 'orderNo', width: 160, render: (_, r) => (<a onClick={() => { void handleView(r) }}>{r.orderNo}</a>) },
    { title: '父制造单', dataIndex: 'parentMoOrderNo', width: 160, hideInSearch: true, render: (_, r) => (r.parentMoId ? (r.parentMoOrderNo ?? '-') : '-') },
    { title: '来源', dataIndex: 'sourceType', width: 120, hideInSearch: true, render: (_, r) => ({ sales_order: '销售订单', production_plan: '生产计划', manual: '手工创建' }[String(r.sourceType || '')] || r.sourceType || '-') },
    { title: '来源订单号', dataIndex: 'sourceOrderNo', width: 160, hideInSearch: true, render: (_, r) => (r.sourceType === 'sales_order' ? (r.sourceOrderNo ?? '-') : (r.sourceRefId || '-')) },
    { title: '产品信息', dataIndex: 'productInfo', width: 260, hideInSearch: true, render: (_, r) => (<div><div style={{ fontWeight: 500 }}>{r.productName || '-'}</div><div style={{ color: '#999' }}>{r.productCode || '-'} {r.unit ? `｜${r.unit}` : ''}</div></div>) },
    { title: 'BOM版本', dataIndex: 'bomCode', width: 200, hideInSearch: true, render: (_, r) => (r.bomCode ? (<a onClick={() => { void handleViewBom(r) }}>{r.bomCode}</a>) : '-') },
    { title: '计划数量', dataIndex: 'quantity', valueType: 'digit', width: 120, hideInSearch: true },
    { title: '单位', dataIndex: 'unit', width: 80, hideInSearch: true, render: (_, r) => r.unit || '-' },
    { title: '生产数量', dataIndex: 'produced', width: 120, hideInSearch: true, render: (_, r) => { const produced = typeof r.pendingQuantity === 'number' ? Math.max(0, Number(r.quantity || 0) - Number(r.pendingQuantity || 0)) : Number(r.scheduledQuantity || 0); return `${produced} ${r.unit || ''}`.trim() } },
    { title: '工艺路线', dataIndex: 'routingCode', width: 120, hideInSearch: true, render: (_, r) => (r.routingCode ? (<a onClick={() => { void handleViewRouting(r) }}>{r.routingCode}</a>) : '-') },
    { title: '已排单数量', dataIndex: 'scheduledQuantity', valueType: 'digit', width: 120, hideInSearch: true },
    { title: '未排单数量', dataIndex: 'pendingQuantity', valueType: 'digit', width: 120, hideInSearch: true },
    { title: '交付日期', dataIndex: 'dueDate', valueType: 'date', width: 140, hideInSearch: true },
    { title: '计划开始', dataIndex: 'plannedStart', valueType: 'date', width: 140, hideInSearch: true },
    { title: '计划完工', dataIndex: 'plannedFinish', valueType: 'date', width: 140, hideInSearch: true },
    { title: '状态', dataIndex: 'status', width: 100, valueType: 'select', valueEnum: MANUFACTURING_ORDER_STATUS_VALUE_ENUM_PRO },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 180, hideInSearch: true },
    { title: '更新时间', dataIndex: 'updatedAt', valueType: 'dateTime', width: 180, hideInSearch: true },
    // 搜索字段（仅用于筛选，不在表格中显示）
    { title: '产品编码', dataIndex: 'productCode', valueType: 'text', hideInTable: true },
    { title: '来源订单号', dataIndex: 'sourceOrderNo', valueType: 'text', hideInTable: true },
    {
      title: '操作', dataIndex: 'actions', fixed: 'right', width: 200, valueType: 'option',
      render: (_, record) => [
        <a key="confirm" onClick={() => { void handleConfirm(record) }} style={{ pointerEvents: record.status === 'draft' ? 'auto' : 'none', color: record.status === 'draft' ? undefined : '#999' }}>确认</a>,
        <a key="cancel" onClick={() => { void handleCancel(record) }} style={{ pointerEvents: record.status === 'completed' ? 'none' : 'auto', color: record.status === 'completed' ? '#999' : undefined }}>取消</a>,
        <a key="generate" onClick={() => { void handleGenerate(record) }}>生成工单</a>,
        <a key="delete" onClick={() => { void handleDelete(record) }} style={{ pointerEvents: (record.status === 'draft' || record.status === 'cancelled') ? 'auto' : 'none', color: (record.status === 'draft' || record.status === 'cancelled') ? undefined : '#999' }}>删除</a>,
      ],
    },
  ]

  return (
    <>
      <ProTable<ManufacturingOrder>
        headerTitle="制造订单列表"
        columns={columns}
        actionRef={actionRef}
        request={async (params: Record<string, unknown>) => {
          const base = normalizeTableParams(params)
          const p = params
          const query: ManufacturingOrderListParams = {
            page: base.page,
            pageSize: base.pageSize,
            status: typeof p.status === 'string' ? p.status : undefined,
            orderNo: typeof p.orderNo === 'string' ? p.orderNo : undefined,
            productCode: typeof p.productCode === 'string' ? p.productCode : undefined,
            sourceOrderNo: typeof p.sourceOrderNo === 'string' ? p.sourceOrderNo : undefined,
          }
          const resp = await manufacturingOrderService.getList(query)
          return { data: resp.data, success: true, total: resp.pagination.total }
        }}
        rowKey={(r: ManufacturingOrder) => r.id}
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 2400 }}
        pagination={{ showSizeChanger: true, showQuickJumper: true }}
      />
      {currentMo && (
        <GenerateWorkOrdersModal
          visible={generateVisible}
          mo={currentMo}
          onClose={() => setGenerateVisible(false)}
          onSuccess={(_created) => {
            void actionRef.current?.reload?.()
          }}
        />
      )}
      <ManufacturingOrderDetail visible={detailVisible} moId={detailMoId} onClose={() => setDetailVisible(false)} />
      <Drawer
        open={bomVisible}
        onClose={() => setBomVisible(false)}
        title={currentMo ? `物料列表 - ${currentMo.orderNo}` : '物料列表'}
        width={720}
      >
        <ProTable<BomItem>
          columns={[
            { title: '物料编码', dataIndex: 'materialCode', width: 140 },
            { title: '物料名称', dataIndex: 'materialName' },
            { title: '用量', dataIndex: 'quantity', width: 100 },
            { title: '单位', dataIndex: 'unitName', width: 100, render: (_, r: BomItem) => r.unitName || '-' },
            { title: '需求类型', dataIndex: 'requirementType', width: 120 },
          ]}
          dataSource={bomItems}
          rowKey={(r: BomItem) => r.id}
          search={false}
          pagination={false}
        />
      </Drawer>
      <Drawer
        open={routingVisible}
        onClose={() => setRoutingVisible(false)}
        title={currentMo ? `工艺路线工序 - ${currentMo.orderNo}` : '工艺路线工序'}
        width={720}
      >
        <ProTable<RoutingWorkcenterInfo>
          columns={[
            { title: '工序序号', dataIndex: 'sequence', width: 100 },
            { title: '工序名称', dataIndex: 'name' },
            { title: '工作中心', dataIndex: 'workcenterId', width: 160, render: (_, r: RoutingWorkcenterInfo) => {
              const label = workcenterOptions.find((o) => o.value === r.workcenterId)?.label
              return label || r.workcenterId || '—'
            } },
            { title: '标准工时', dataIndex: 'timeCycleManual', width: 120, render: (_, r: RoutingWorkcenterInfo) => `${r.timeCycleManual ?? 0} 分钟` },
          ]}
          dataSource={routingOps}
          rowKey={(r: RoutingWorkcenterInfo) => r.id}
          search={false}
          pagination={false}
        />
      </Drawer>
    </>
  )
}

export default ManufacturingOrderManagement