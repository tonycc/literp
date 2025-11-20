import React, { useMemo } from 'react'
import { Modal, Row, Col, Button } from 'antd'
import { ProCard, ProDescriptions, ProTable } from '@ant-design/pro-components'
import type { ProDescriptionsItemProps, ProColumns } from '@ant-design/pro-components'
import type { WorkOrderDetail } from '@zyerp/shared'
import { QrCode } from 'lucide-react'

interface PrintWorkOrderModalProps {
  visible: boolean
  workOrder?: WorkOrderDetail | null
  onClose: () => void
}

const PrintWorkOrderModal: React.FC<PrintWorkOrderModalProps> = ({ visible, workOrder, onClose }) => {
  const items: ProDescriptionsItemProps<WorkOrderDetail>[] = useMemo(() => ([
    { title: '工单编号', dataIndex: 'orderNo' },
    { title: '制造订单编号', dataIndex: 'moOrderNo' },
    { title: '产品编码', dataIndex: 'productCode' },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '单位', dataIndex: 'moUnit' },
    { title: '计划开始', dataIndex: 'plannedStart', valueType: 'date' },
    { title: '计划结束', dataIndex: 'plannedFinish', valueType: 'date' },
  ]), [])

  type OperationRow = { index: number; name: string }
  const operationRows: OperationRow[] = useMemo(() => {
    if (!workOrder) return []
    const s = typeof workOrder.sequenceStart === 'number' ? workOrder.sequenceStart : workOrder.sequence
    const e = typeof workOrder.sequenceEnd === 'number' ? workOrder.sequenceEnd : workOrder.sequence
    const labels = typeof workOrder.operationsLabel === 'string' ? workOrder.operationsLabel.split('、').filter(Boolean) : []
    const rows: OperationRow[] = []
    if (typeof s === 'number' && typeof e === 'number' && e >= s) {
      for (let i = s; i <= e; i += 1) {
        const idx = i - s
        const name = labels[idx] || `第${i}工序`
        rows.push({ index: i, name })
      }
    } else if (typeof workOrder.sequence === 'number') {
      const name = labels[0] || `第${workOrder.sequence}工序`
      rows.push({ index: workOrder.sequence, name })
    }
    return rows
  }, [workOrder])

  const opColumns: ProColumns<OperationRow>[] = [
    { title: '序号', dataIndex: 'index', width: 80 },
    { title: '工序名称', dataIndex: 'name' },
  ]

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      title="打印工单"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="print" type="primary" onClick={handlePrint}>打印</Button>,
        <Button key="close" onClick={onClose}>关闭</Button>,
      ]}
      width={720}
    >
      <ProCard>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ width: 140, height: 140, border: '1px solid #eee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={120} />
            </div>
          </Col>
          <Col span={18}>
            <ProDescriptions<WorkOrderDetail>
              title={workOrder?.name || workOrder?.orderNo || '工单信息'}
              dataSource={workOrder as WorkOrderDetail}
              columns={items}
              column={2}
            />
            <ProCard title="工序信息" style={{ marginTop: 16 }}>
              <ProTable<OperationRow>
                columns={opColumns}
                dataSource={operationRows}
                search={false}
                pagination={false}
                options={false}
                rowKey={(r) => String(r.index)}
              />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
    </Modal>
  )
}

export default PrintWorkOrderModal