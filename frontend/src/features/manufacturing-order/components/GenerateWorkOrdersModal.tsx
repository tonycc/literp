// 生成工单模态框：基于制造订单（MO）一次性生成单个工单，并允许编辑工序/工作中心与需领取物料
// 架构说明：
// - 使用 Ant Design Pro 的 ProForm/EditableProTable 实现表单与可编辑列表
// - 业务逻辑：优先按工序生成；可切换为按工作中心聚合显示；物料按 BOM 比例自动计算，可手动修正
// - 数据规范：遵循项目的 Service 层数据格式转换与严格类型约束；避免 any 与不安全成员访问
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Row, Col, Tabs } from 'antd'
import { EditableProTable, ProForm, ProFormDateTimePicker, ProFormDigit, ProFormSelect, ProCard } from '@ant-design/pro-components'
import dayjs from 'dayjs'
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components'
// 使用项目封装的 message hook，避免使用 antd 静态 API（message.success 等）
import { useMessage } from '@/shared/hooks'
import type { ManufacturingOrder, GenerateWorkOrdersRequest, WorkOrder, CreateWorkOrderRequest } from '@zyerp/shared'
import routingService from '@/features/routing/services/routing.service'
import { warehouseService } from '@/shared/services/warehouse.service'
import { workcenterService } from '@/features/workcenter/services/workcenter.service'
import { BomService } from '@/features/bom/services/bom.service'
import type { BomItem, CreateWorkOrderMaterialInput } from '@zyerp/shared'
import { workOrderService } from '@/features/work-order/services/work-order.service'
import { getUsers } from '@/shared/services'
import type { User } from '@zyerp/shared'

// 组件 Props：
// - visible：模态框是否显示
// - mo：当前制造订单对象（包含产品、BOM、工艺路由等信息）
// - onClose：关闭模态框回调
// - onSuccess：生成工单成功后的回调（返回新工单）
interface GenerateWorkOrdersModalProps {
  visible: boolean
  mo: ManufacturingOrder
  onClose: () => void
  onSuccess?: (created: WorkOrder[]) => void
}

// 列表行模型（工单计划行）：
// - 当 mode=operation 时表示单工序行；当 mode=workcenter 时表示聚合后的工作中心段
// - plannedStart/Finish 使用字符串存储，避免时区漂移，格式由 ProForm transform 统一处理
type RowItem = {
  id: string
  sequence: number
  operationId: string
  workcenterId?: string | null
  userId?: string | null
}

const GenerateWorkOrdersModal: React.FC<GenerateWorkOrdersModalProps> = ({ visible, mo, onClose, onSuccess }) => {
  const message = useMessage()
  // ProForm 引用：提供初始值以避免 TS2554；访问时使用可选链
  const formRef = useRef<ProFormInstance<GenerateWorkOrdersRequest> | undefined>(undefined)
  const [rows, setRows] = useState<RowItem[]>([])
  const [opRows, setOpRows] = useState<RowItem[]>([])
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([])
  const [, setLoading] = useState(false)
  const [workcenterOptions, setWorkcenterOptions] = useState<Array<{ label: string; value: string }>>([])
  const [warehouseOptions, setWarehouseOptions] = useState<Array<{ label: string; value: string }>>([])
  const [materials, setMaterials] = useState<Array<{ key: string; materialId: string; materialCode?: string; materialName?: string; unitId: string; unitName?: string; quantity: number; warehouseId?: string | null }>>([])
  const [operationNames, setOperationNames] = useState<Record<string, string>>({})
  const [userOptions, setUserOptions] = useState<Array<{ label: string; value: string }>>([])


  // 首次显示时加载工序、BOM 物料、工作中心与仓库选项
  useEffect(() => {
    if (!visible) return
    setLoading(true)
    void (async () => {
      try {
        const opsResp = await routingService.getOperations(String(mo.routingId))
        const ops = (opsResp.data || []).sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        setOperationNames(Object.fromEntries(ops.map(op => [String(op.operationId || op.id), String(op.name || '')])))
        const nextRows: RowItem[] = []
        for (const op of ops) {
          nextRows.push({
            id: String(op.id),
            sequence: Number(op.sequence || 0),
            operationId: String(op.operationId || op.id),
            workcenterId: op.workcenterId || null,
          })
        }
        setOpRows(nextRows)
        setRows(nextRows)
        setEditableKeys(nextRows.map(r => r.id))
      } catch {
        message.error('加载工序失败')
      }
      try {
        if (mo.bomId) {
          const [bomResp, itemsResp] = await Promise.all([BomService.getById(String(mo.bomId)), BomService.getItems(String(mo.bomId))])
          const bom = bomResp.data
          // BOM 物料列表：后端分页数据已在 Service 层映射；此处做数组类型收窄
          const list: BomItem[] = Array.isArray(itemsResp.data) ? itemsResp.data : []
          const scheduled = typeof mo.scheduledQuantity === 'number' ? mo.scheduledQuantity : 0
          // 待排产数量：若后端直接给出 pendingQuantity 则使用，否则用 quantity - scheduledQuantity 兜底
          const pendingQty = Math.max(1, Number(mo.pendingQuantity ?? Math.max(0, Number(mo.quantity) - scheduled)))
          const baseQty = Number(bom?.baseQuantity || 1)
          const ratio = baseQty > 0 ? pendingQty / baseQty : 1
          const mats = list.map(it => ({
            key: String(it.id),
            materialId: String(it.materialId),
            materialCode: it.materialCode,
            materialName: it.materialName,
            unitId: String(it.unitId),
            unitName: it.unitName,
            quantity: Number(it.quantity || 0) * ratio,
            warehouseId: null,
          }))
          setMaterials(mats)
        } else {
          setMaterials([])
        }
      } catch {
        message.error('加载物料失败')
      }
      try {
        const wcs = await workcenterService.getList({ page: 1, pageSize: 999 })
        setWorkcenterOptions((wcs.data || []).map(w => ({ label: w.name, value: w.id })))
        const managerMap: Record<string, string | null> = {}
        for (const w of (wcs.data || [])) managerMap[w.id] = (w.managerId ?? w.manager?.id) ? String(w.managerId ?? w.manager?.id) : null
        setOpRows(prev => prev.map(r => ({ ...r, userId: r.userId ?? (r.workcenterId ? managerMap[String(r.workcenterId)] ?? null : null) })))
        setRows(prev => prev.map(r => ({ ...r, userId: r.userId ?? (r.workcenterId ? managerMap[String(r.workcenterId)] ?? null : null) })))
      } catch {
        message.error('加载工作中心失败')
      }
      try {
        const res = await getUsers({ page: 1, pageSize: 999 })
        setUserOptions((res.data || []).map((u: User) => ({ label: u.username ?? (u as { name?: string }).name ?? String(u.id), value: String(u.id) })))
      } catch {
        // 忽略用户选项加载失败，允许为空
      }
      try {
        const ws = await warehouseService.getOptions({ isActive: true })
        setWarehouseOptions((ws || []).map(w => ({ label: w.label, value: w.value })))
      } catch {
        message.error('加载仓库选项失败')
      }
      setLoading(false)
    })()
  }, [visible, mo, message])

  

  const columns: ProColumns<RowItem>[] = useMemo(() => {
    const cols: ProColumns<RowItem>[] = [
      { title: '工序序号', dataIndex: 'sequence', width: 80 ,editable: false},
      { title: '工序名称', dataIndex: 'operationId', width: 200, render: (_, r) => operationNames[r.operationId] || r.operationId, editable: false },
      { title: '生产班组', dataIndex: 'workcenterId', valueType: 'select', width: 200, fieldProps: { options: workcenterOptions } ,editable: false},
      { title: '生产负责人', dataIndex: 'userId', valueType: 'select', width: 200, fieldProps: { options: userOptions }, editable: () => true }
    ]
    return cols
  }, [workcenterOptions, operationNames, userOptions])

  // 行同步：编辑表格时保持 rows 与 opRows 一致
  useEffect(() => {
    setRows(opRows.map(r => ({ ...r })))
  }, [opRows])

  return (
    <Modal
      open={visible}
      title={`生成工单 - ${mo.orderNo}`}
      width={900}
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      {/* 表单：包含数量、领料仓库、基准时间，以及行编辑与物料编辑 */}
      <ProForm<GenerateWorkOrdersRequest>
        formRef={formRef as unknown as React.MutableRefObject<ProFormInstance<GenerateWorkOrdersRequest>>}
        initialValues={{ quantity: Math.max(1, Number(mo.pendingQuantity ?? Math.max(0, Number(mo.quantity) - Number(mo.scheduledQuantity || 0)))) }}
        submitter={{ searchConfig: { submitText: '生成工单' } }}
        onFinish={async (values: GenerateWorkOrdersRequest) => {
          try {
            const qty = Number(values.quantity || 0)
            if (!qty || qty <= 0) {
              message.error('请输入有效的生产数量')
              return false
            }
        const operations = opRows.map(r => ({ routingWorkcenterId: r.id }))
        const payload: CreateWorkOrderRequest = {
          moId: mo.id,
          quantity: qty,
          workcenterId: (opRows[0]?.workcenterId ?? undefined) || undefined,
          ownerId: (opRows[0]?.userId ?? undefined) || undefined,
          plannedStart: values.baselineStart,
          plannedFinish: values.baselineFinish,
          issueWarehouseId: values.issueWarehouseId,
          operations,
          materials: materials.map(m => ({ materialId: m.materialId, unitId: m.unitId, quantity: Number(m.quantity || 0), warehouseId: m.warehouseId || undefined })) as CreateWorkOrderMaterialInput[],
        }
            const resp = await workOrderService.create(payload)
            if (resp.success) {
              message.success('生成工单成功')
              onSuccess?.(resp.data ? [resp.data as unknown as WorkOrder] : [])
              onClose()
              return true
            }
            message.error(resp.message || '生成工单失败')
            return false
          } catch {
            message.error('生成工单失败')
            return false
          }
        }}
      >
        <ProCard bordered style={{ marginBottom: 12 }}>
          
          <Row gutter={[16, 8]}>
            <Col span={4}>
              <ProFormDigit name="quantity" label="生产数量" rules={[{ required: true, message: '请输入生产数量' }]} fieldProps={{ min: 1, precision: 0 }} />
            </Col>
            <Col span={8}>
              <ProFormSelect name="issueWarehouseId" label="领料仓库" options={warehouseOptions} />
            </Col>
            <Col span={6}>
              {/* 开始时间：使用 transform 统一格式化为字符串，避免时区与类型不一致问题 */}
              <ProFormDateTimePicker
                name="baselineStart"
                label="工单开始日期"
                rules={[{ required: true, message: '请选择工单开始日期' }]}
                transform={(value: unknown) => {
                  if (typeof value === 'string') {
                    const d = dayjs(value)
                    return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : value
                  }
                  if (value && typeof value === 'object' && 'format' in value && typeof (value as { format: (fmt: string) => string }).format === 'function') {
                    return (value as { format: (fmt: string) => string }).format('YYYY-MM-DD HH:mm:ss')
                  }
                  return undefined
                }}
              />
            </Col>
            <Col span={6}>
              {/* 结束时间：同上，统一格式化输出 */}
              <ProFormDateTimePicker
                name="baselineFinish"
                label="工单结束日期"
                rules={[{ required: true, message: '请选择工单结束日期' }]}
                transform={(value: unknown) => {
                  if (typeof value === 'string') {
                    const d = dayjs(value)
                    return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : value
                  }
                  if (value && typeof value === 'object' && 'format' in value && typeof (value as { format: (fmt: string) => string }).format === 'function') {
                    return (value as { format: (fmt: string) => string }).format('YYYY-MM-DD HH:mm:ss')
                  }
                  return undefined
                }}
              />
            </Col>
          </Row>
        </ProCard>
        <ProCard bordered style={{ marginTop: 12 }}>
          <Tabs
            defaultActiveKey="materials"
            items={[
              {
                key: 'materials',
                label: '物料信息',
                children: (
                  <EditableProTable<{ key: string; materialId: string; materialCode?: string; materialName?: string; unitId: string; unitName?: string; quantity: number; warehouseId?: string | null }>
                    rowKey="key"
                    value={materials}
                    onChange={(vals) => setMaterials([...vals])}
                    recordCreatorProps={false}
                    editable={{ type: 'multiple' }}
                    columns={[
                      { title: '物料编码', dataIndex: 'materialCode', width: 140 },
                      { title: '物料名称', dataIndex: 'materialName', width: 160 },
                      { title: '发料仓库', dataIndex: 'warehouseId', valueType: 'select', fieldProps: { options: warehouseOptions }, width: 160 },
                    ]}
                  />
                ),
              },
              {
                key: 'details',
                label: '工序信息',
                children: (
                  <EditableProTable<RowItem>
                    rowKey="id"
                    columns={columns}
                    recordCreatorProps={false}
                    value={rows}
                    onChange={(vals) => {
                      setRows([...vals])
                      setOpRows([...vals])
                    }}
                    editable={{
                      type: 'multiple',
                      editableKeys,
                      onChange: setEditableKeys,
                      onValuesChange: (_record, rowList) => {
                        setRows([...rowList])
                        setOpRows([...rowList])
                      },
                    }}
                  />
                ),
              },
            ]}
          />
        </ProCard>
      </ProForm>
    </Modal>
  )
}

export default GenerateWorkOrdersModal