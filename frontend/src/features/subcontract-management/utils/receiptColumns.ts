import type { ProColumns } from '@ant-design/pro-components'
import type { SubcontractReceipt } from '@zyerp/shared'
import type { ReceiptDicts } from '../hooks/useReceiptDicts'

export interface BuildReceiptColumnsOptions {
  showItemsCount?: boolean
}

export const buildReceiptColumns = (
  dicts: ReceiptDicts,
  options?: BuildReceiptColumnsOptions,
): ProColumns<SubcontractReceipt>[] => {
  const { orderMap, supplierMap, orderSupplierMap, warehouseMap, userMap } = dicts
  const cols: ProColumns<SubcontractReceipt>[] = [
    { title: '收货单号', dataIndex: 'receiptNo', width: 160 },
    { title: '收货日期', dataIndex: 'receivedDate', width: 140, render: (_, r) => new Date(r.receivedDate).toLocaleDateString() },
    { title: '委外订单', dataIndex: 'orderId', width: 180, render: (_, r) => r.orderId ? (orderMap[String(r.orderId)] ?? r.orderId) : '-' },
    { title: '供应商', dataIndex: 'supplierId', width: 160, render: (_, r) => r.supplierId ? (supplierMap[String(r.supplierId)] ?? r.supplierId) : (r.orderId ? (orderSupplierMap[String(r.orderId)] ?? '-') : '-') },
    { title: '仓库', dataIndex: 'warehouseId', width: 160, render: (_, r) => r.warehouseId ? (warehouseMap[String(r.warehouseId)] ?? r.warehouseId) : '-' },
    { title: '质检', dataIndex: 'qcStatus', width: 120, render: (_, r) => r.qcStatus ?? '-' },
    { title: '订单数量', dataIndex: 'receivedQuantityTotal', width: 120, render: (_, r) => {
      if (typeof r.receivedQuantityTotal === 'number') return String(r.receivedQuantityTotal)
      if (Array.isArray(r.items)) return String(r.items.reduce((sum, it) => sum + (typeof it.receivedQuantity === 'number' ? it.receivedQuantity : 0), 0))
      return '-'
    } },
  ]

  if (options?.showItemsCount) {
    cols.push({ title: '明细条数', dataIndex: 'items', width: 120, render: (_, r) => Array.isArray(r.items) ? String(r.items.length) : '-' })
  }

  cols.push(
    { title: '创建人', dataIndex: 'createdBy', width: 140, render: (_, r) => r.createdBy ? (userMap[String(r.createdBy)] ?? r.createdBy) : '-' },
    { title: '创建时间', dataIndex: 'createdAt', width: 180, render: (_, r) => new Date(r.createdAt).toLocaleString() },
  )

  return cols
}