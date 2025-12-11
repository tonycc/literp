import React from 'react'
import { Modal, Row, Col, Progress } from 'antd'
import { ProCard, ProTable } from '@ant-design/pro-components'
import { useMessage } from '@/shared/hooks'
import { manufacturingOrderService } from '@/features/manufacturing-order/services/manufacturing-order.service'
import { subcontractOrderService } from '@/features/subcontract-management/services/subcontract-order.service'
import type { ProductionPlan, ManufacturingOrder, WorkOrder, SubcontractOrder } from '@zyerp/shared'
import { Alert } from 'antd'

interface ProductionPlanDetailModalProps {
  visible: boolean
  plan: ProductionPlan | null
  onClose: () => void
}

const ProductionPlanDetailModal: React.FC<ProductionPlanDetailModalProps> = ({ visible, plan, onClose }) => {
  const message = useMessage()
  const [loading, setLoading] = React.useState(false)
  const [mos, setMos] = React.useState<ManufacturingOrder[]>([])
  const [wos, setWos] = React.useState<WorkOrder[]>([])
  const [sos, setSos] = React.useState<SubcontractOrder[]>([])

  React.useEffect(() => {
    if (!visible || !plan) return
    void (async () => {
      try {
        setLoading(true)
        const moResp = await manufacturingOrderService.getList({ page: 1, pageSize: 500 })
        const filteredMos = (moResp.data || []).filter((m) => {
          const bySourceId = plan.orderId && m.sourceRefId ? String(m.sourceRefId) === String(plan.orderId) : false
          const bySourceNo = plan.orderNo && m.sourceOrderNo ? String(m.sourceOrderNo) === String(plan.orderNo) : false
          return bySourceId || bySourceNo
        })
        setMos(filteredMos)
        const allWos: WorkOrder[] = []
        for (const m of filteredMos) {
          const wResp = await manufacturingOrderService.getWorkOrders(m.id)
          if (wResp.success && Array.isArray(wResp.data)) allWos.push(...wResp.data)
        }
        setWos(allWos)
        const soResp = await subcontractOrderService.getList({ page: 1, pageSize: 500 })
        const woSet = new Set(allWos.map((w) => String(w.id)))
        const filteredSos = (soResp.data || []).filter((s) => s.firstWorkOrderId ? woSet.has(String(s.firstWorkOrderId)) : false)
        setSos(filteredSos)
      } catch {
        message.error('加载生产计划关联数据失败')
      } finally {
        setLoading(false)
      }
    })()
  }, [visible, plan, message])

  const summary = React.useMemo(() => {
    const woTotal = wos.length
    const woCompleted = wos.filter((w) => w.status === 'completed').length
    const moTotal = mos.length
    const moCompleted = mos.filter((m) => m.status === 'completed').length
    const woInProgress = wos.filter((w) => w.status === 'in_progress').length
    const soTotal = sos.length
    const progress = woTotal ? Math.round((woCompleted / woTotal) * 100) : 0
    return { woTotal, woCompleted, moTotal, moCompleted, woInProgress, soTotal, progress }
  }, [wos, mos, sos])

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={plan ? `生产计划详情 - ${plan.orderNo ?? '-'}` : '生产计划详情'}
      width={920}
      footer={null}
      destroyOnClose
    >
      {plan?.notes && (
        <Row>
          <Col span={24}>
            <Alert type="info" message="说明" description={plan.notes} showIcon />
          </Col>
        </Row>
      )}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <ProCard>
            <Row gutter={[16, 16]} align="middle">
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <strong>生产进度</strong>
                  <Progress percent={summary.progress} status={summary.progress === 100 ? 'success' : undefined} />
                </div>
              </Col>
              <Col span={16}>
                <Row gutter={[16, 8]}>
                  <Col span={6}>MO：{summary.moCompleted}/{summary.moTotal} 完成</Col>
                  <Col span={6}>WO：{summary.woCompleted}/{summary.woTotal} 完成</Col>
                  <Col span={6}>WO 进行中：{summary.woInProgress}</Col>
                  <Col span={6}>委外订单：{summary.soTotal}</Col>
                </Row>
              </Col>
            </Row>
          </ProCard>
        </Col>
        <Col span={24}>
          <ProCard title="制造订单">
            <ProTable<ManufacturingOrder>
              loading={loading}
              search={false}
              options={false}
              rowKey="id"
              columns={[
                { title: '制造订单号', dataIndex: 'orderNo', width: 160 },
                { title: '产品', dataIndex: 'productName', width: 200, render: (_, r: ManufacturingOrder) => r.productName ?? r.productCode ?? r.productId },
                { title: '数量', dataIndex: 'quantity', valueType: 'digit', width: 100 },
                { title: '状态', dataIndex: 'status', width: 120 },
                { title: '计划开始', dataIndex: 'plannedStart', valueType: 'date', width: 140 },
                { title: '计划完工', dataIndex: 'plannedFinish', valueType: 'date', width: 140 },
                { title: '排产数', dataIndex: 'scheduledQuantity', valueType: 'digit', width: 100 },
                { title: '待产数', dataIndex: 'pendingQuantity', valueType: 'digit', width: 100 },
              ]}
              dataSource={mos}
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </ProCard>
        </Col>
        <Col span={24}>
          <ProCard title="生产工单">
            <ProTable<WorkOrder>
              loading={loading}
              search={false}
              options={false}
              rowKey="id"
              columns={[
                { title: '工单号', dataIndex: 'orderNo', width: 140 },
                { title: '工序', dataIndex: 'operationsLabel', width: 220, ellipsis: true, render: (_, r: WorkOrder) => r.operationsLabel ?? r.operationId },
                { title: '数量', dataIndex: 'quantity', valueType: 'digit', width: 100 },
                { title: '状态', dataIndex: 'status', width: 120 },
                { title: '计划开始', dataIndex: 'plannedStart', valueType: 'date', width: 140 },
                { title: '计划完工', dataIndex: 'plannedFinish', valueType: 'date', width: 140 },
              ]}
              dataSource={wos}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </ProCard>
        </Col>
        <Col span={24}>
          <ProCard title="委外订单">
            <ProTable<SubcontractOrder>
              loading={loading}
              search={false}
              options={false}
              rowKey="id"
              columns={[
                { title: '委外订单号', dataIndex: 'orderNo', width: 160 },
                { title: '供应商', dataIndex: 'supplierName', width: 180 },
                { title: '工单', dataIndex: 'firstWorkOrderNo', width: 160, render: (_, r: SubcontractOrder) => r.firstWorkOrderNo ?? r.firstWorkOrderId ?? '-' },
                { title: '工序', dataIndex: 'firstOperationName', width: 160, render: (_, r: SubcontractOrder) => r.firstOperationName ?? r.firstOperationId ?? '-' },
                { title: '状态', dataIndex: 'status', width: 120 },
              ]}
              dataSource={sos}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </ProCard>
        </Col>
      </Row>
    </Modal>
  )
}

export default ProductionPlanDetailModal