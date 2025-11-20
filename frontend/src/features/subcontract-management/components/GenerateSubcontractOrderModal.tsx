import React, { useEffect, useMemo, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import type { WorkOrderDetail } from '@zyerp/shared'
import { Modal, Select, DatePicker, InputNumber, Card, Row, Col } from 'antd'
import { GLOBAL_CURRENCY_OPTIONS } from '@/shared/constants/currency'
import { useMessage } from '@/shared/hooks'
import { subcontractOrderService } from '../services/subcontract-order.service'
import { operationService } from '@/features/operation/services/operation.service'
import { getFirstOutsourcingOperationNameByRoutingCode } from '@/shared/utils/outsourceOperation'

export interface GenerateSubcontractOrderModalProps {
  visible: boolean
  onClose: () => void
  workOrders: WorkOrderDetail[]
  supplierOptions: Array<{ label: string; value: string }>
  onGenerated?: () => void
}

const GenerateSubcontractOrderModal: React.FC<GenerateSubcontractOrderModalProps> = ({ visible, onClose, workOrders, supplierOptions, onGenerated }) => {
  const message = useMessage()
  const [supplierId, setSupplierId] = useState<string | undefined>(supplierOptions[0]?.value)
  const [expectedDate, setExpectedDate] = useState<string | undefined>(undefined)
  const [currency, setCurrency] = useState<string>('CNY')
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [opNames, setOpNames] = useState<Record<string, string>>({})
  const [outsourceOpNames, setOutsourceOpNames] = useState<Record<string, string>>({})

  const rows = useMemo(() => workOrders.map(wo => ({
    id: wo.id,
    orderNo: wo.orderNo,
    productName: wo.productName,
    productCode: wo.productCode,
    operationId: wo.operationId,
    routingCode: wo.moRoutingCode,
    quantity: typeof wo.quantity === 'number' ? wo.quantity : (typeof wo.moQuantity === 'number' ? wo.moQuantity : 1),
  })), [workOrders])

  const columns: ProColumns<typeof rows[number]>[] = useMemo(() => ([
    { title: '工单', dataIndex: 'orderNo', width: 160 },
    { title: '产品', dataIndex: 'productName', width: 220, render: (_, r) => r.productName ? `${r.productName}${r.productCode ? `(${r.productCode})` : ''}` : (r.productCode ?? '-') },
    { title: '工序', dataIndex: 'operationId', width: 160, render: (_, r) => (
      outsourceOpNames[String(r.routingCode ?? '')] ?? opNames[String(r.operationId)] ?? String(r.operationId ?? '-')
    ) },
    { title: '数量', dataIndex: 'quantity', width: 120, render: (_, r) => (
      <InputNumber min={0} precision={0} value={quantities[r.id] ?? Number(r.quantity || 0)} onChange={(val) => {
        const q = typeof val === 'number' ? val : Number(val || 0)
        setQuantities(prev => ({ ...prev, [r.id]: q }))
      }} style={{ width: '100%' }} />
    ) },
    { title: '单价', dataIndex: 'price', width: 140, render: (_, r) => (
      <InputNumber min={0} precision={4} value={prices[r.id] ?? 0} onChange={(val) => {
        const p = typeof val === 'number' ? val : Number(val || 0)
        setPrices(prev => ({ ...prev, [r.id]: p }))
      }} style={{ width: '100%' }} />
    ) },
  ]), [prices, quantities, opNames, outsourceOpNames])

  const totalAmount = useMemo(() => rows.reduce((acc, r) => acc + (Number(prices[r.id] || 0) * Number((quantities[r.id] ?? r.quantity) || 0)), 0), [rows, prices, quantities])

  useEffect(() => {
    if (!visible) return
    const opIds = Array.from(new Set(rows.map(r => String(r.operationId)).filter(Boolean)))
    if (opIds.length === 0) return
    void (async () => {
      try {
        const list = await operationService.getList({ page: 1, pageSize: Math.max(100, opIds.length) })
        const wageMap = new Map<string, number>((list.data || []).map(op => [op.id, typeof op.wageRate === 'number' ? op.wageRate : 0]))
        setPrices(prev => {
          const next = { ...prev }
          for (const r of rows) {
            const p = wageMap.get(String(r.operationId))
            if (typeof p === 'number' && p > 0 && !Number.isFinite(prev[r.id])) {
              next[r.id] = p
            }
          }
          return next
        })
        setOpNames(prev => {
          const next = { ...prev }
          for (const op of (list.data || [])) {
            if (opIds.includes(op.id) && typeof op.name === 'string' && op.name.length > 0) {
              next[op.id] = op.name
            }
          }
          return next
        })
      } catch {
        message.warning('未能预填工序单价，将按后端默认单价处理')
      }
    })()
  }, [visible, rows, message])

  useEffect(() => {
    if (!visible) return
    const routingCodes = Array.from(new Set(rows.map(r => r.routingCode).filter((x): x is string => typeof x === 'string' && x.length > 0)))
    if (routingCodes.length === 0) return
    void (async () => {
      try {
        const next: Record<string, string> = {}
        let foundAny = false
        const entries: string[] = []
        for (const code of routingCodes) {
          const name = await getFirstOutsourcingOperationNameByRoutingCode(code)
          if (typeof name === 'string' && name.length > 0) {
            next[code] = name
            foundAny = true
          }
          entries.push(`${code}:${name ?? '-'}`)
        }
        setOutsourceOpNames(prev => ({ ...prev, ...next }))
        if (!foundAny) message.warning('当前工艺路线无外协工序')
      } catch {
        message.warning('当前工艺路线无外协工序')
      }
    })()
  }, [visible, rows, message])

  const handleOk = async () => {
    if (!supplierId) { message.warning('请选择供应商'); return }
    const overrides = rows.map(r => ({ workOrderId: r.id, price: Number(prices[r.id] || 0) })).filter(x => x.price > 0)
    const resp = await subcontractOrderService.generateByWorkOrders({
      workOrderIds: rows.map(r => r.id),
      defaultSupplierId: supplierId,
      expectedDeliveryDate: expectedDate,
      currency,
      itemPriceOverrides: overrides,
    })
    if (resp.success) { message.success('生成委外订单成功'); onGenerated?.() }
    else { message.error(resp.message || '生成失败') }
  }

  return (
    <Modal
      open={visible}
      width={960}
      title="生成委外订单"
      onCancel={onClose}
      onOk={() => { void handleOk() }}
      destroyOnClose
    >
      <Card title="基础信息" bordered style={{ marginBottom: 12 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 6 }}>供应商</div>
            <Select style={{ width: '100%' }} options={supplierOptions} value={supplierId} onChange={(v) => setSupplierId(String(v))} />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 6 }}>期望交期</div>
            <DatePicker style={{ width: '100%' }} onChange={(d) => setExpectedDate(d ? d.format('YYYY-MM-DD') : undefined)} />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 6 }}>币种</div>
            <Select style={{ width: '100%' }} value={currency} onChange={(v) => setCurrency(String(v))} options={GLOBAL_CURRENCY_OPTIONS} />
          </Col>
        </Row>
      </Card>
      <Card title="工单明细" bordered>
        <ProTable<typeof rows[number]>
          rowKey={(r) => r.id}
          search={false}
          options={false}
          pagination={false}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 'max-content' }}
        />
        <Row justify="end" style={{ marginTop: 12 }}>
          <Col>
            <div style={{ fontWeight: 600 }}>总额：{totalAmount.toFixed(2)} {currency}</div>
          </Col>
        </Row>
      </Card>
    </Modal>
  )
}

export default GenerateSubcontractOrderModal