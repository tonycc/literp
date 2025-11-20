import React, { useMemo, useRef, useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { SubcontractReceipt, SubcontractReceiptItem } from '@zyerp/shared'
import { subcontractReceiptService } from '../services/subcontract-receipt.service'
import { useMessage } from '@/shared/hooks'
import { Modal, Descriptions } from 'antd'
import AddSubcontractReceiptModal from '../components/AddSubcontractReceiptModal'
import { SUBCONTRACT_RECEIPT_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/subcontract'
import { useReceiptDicts } from '../hooks/useReceiptDicts'
import SubcontractReceiptList from '../components/SubcontractReceiptList'

const SubcontractReceiptManagement: React.FC = () => {
  const message = useMessage()
  const actionRef = useRef<ActionType | undefined>(undefined)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailId, setDetailId] = useState<string | undefined>(undefined)
  const [detail, setDetail] = useState<(SubcontractReceipt & { items: SubcontractReceiptItem[] }) | null>(null)
  const [createVisible, setCreateVisible] = useState(false)
  const dicts = useReceiptDicts()

  const handleView = async (record: SubcontractReceipt) => {
    try {
      const resp = await subcontractReceiptService.getById(record.id)
      if (resp.success && resp.data) {
        setDetail(resp.data)
        setDetailId(record.id)
        setDetailVisible(true)
      } else {
        message.error(resp.message || '加载收货详情失败')
      }
    } catch {
      message.error('加载收货详情失败')
    }
  }

  const handleConfirm = async (record: SubcontractReceipt) => {
    try {
      const resp = await subcontractReceiptService.updateStatus(record.id, 'confirmed')
      if (resp.success) {
        message.success('已确认')
        void actionRef.current?.reload?.()
      } else {
        message.error(resp.message || '确认失败')
      }
    } catch {
      message.error('确认失败')
    }
  }

  const handlePost = async (record: SubcontractReceipt) => {
    try {
      const resp = await subcontractReceiptService.updateStatus(record.id, 'posted')
      if (resp.success) {
        message.success('已过账')
        void actionRef.current?.reload?.()
      } else {
        message.error(resp.message || '过账失败')
      }
    } catch {
      message.error('过账失败')
    }
  }

  const itemColumns: ProColumns<SubcontractReceiptItem>[] = useMemo(() => ([
    { title: '订单明细ID', dataIndex: 'orderItemId', width: 220 },
    { title: '收货数量', dataIndex: 'receivedQuantity', width: 120 },
    { title: '仓库', dataIndex: 'warehouseId', width: 160 },
  ]), [])

  return (
    <>
      <SubcontractReceiptList
        actionRef={actionRef}
        onAdd={() => setCreateVisible(true)}
        onView={handleView}
        onConfirm={handleConfirm}
        onPost={handlePost}
      />
      <Modal
        open={detailVisible}
        width={720}
        title={detailId ? `收货单详情` : '收货单详情'}
        footer={null}
        onCancel={() => { setDetailVisible(false); setDetailId(undefined); setDetail(null) }}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions column={3} size="small">
              <Descriptions.Item label="收货单号">{detail.receiptNo}</Descriptions.Item>
              <Descriptions.Item label="收货日期">{typeof detail.receivedDate === 'string' ? new Date(detail.receivedDate).toLocaleDateString() : (detail.receivedDate instanceof Date ? detail.receivedDate.toLocaleDateString() : '-')}</Descriptions.Item>
              <Descriptions.Item label="委外订单">{detail.orderId ? (dicts.orderMap[String(detail.orderId)] ?? detail.orderId) : '-'}</Descriptions.Item>
              <Descriptions.Item label="供应商">{detail.supplierId ? (dicts.supplierMap[String(detail.supplierId)] ?? detail.supplierId) : (detail.orderId ? (dicts.orderSupplierMap[String(detail.orderId)] ?? '-') : '-')}</Descriptions.Item>
              <Descriptions.Item label="仓库">{detail.warehouseId ? (dicts.warehouseMap[String(detail.warehouseId)] ?? detail.warehouseId) : '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">{SUBCONTRACT_RECEIPT_STATUS_VALUE_ENUM_PRO[String(detail.status)]?.text ?? detail.status}</Descriptions.Item>
              <Descriptions.Item label="质检">{detail.qcStatus ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(detail.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{new Date(detail.updatedAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <ProTable<SubcontractReceiptItem>
              search={false}
              options={false}
              rowKey={(r) => r.id}
              columns={itemColumns}
              dataSource={Array.isArray(detail.items) ? detail.items : []}
            />
          </>
        )}
      </Modal>
      <AddSubcontractReceiptModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmitted={() => { setCreateVisible(false); void actionRef.current?.reload?.() }}
      />
    </>
  )
}

export default SubcontractReceiptManagement