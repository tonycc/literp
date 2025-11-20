import { PurchaseOrderStatus } from '@zyerp/shared'

export const PURCHASE_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: PurchaseOrderStatus.DRAFT },
  { label: '已审批', value: PurchaseOrderStatus.APPROVED },
  { label: '已收货', value: PurchaseOrderStatus.RECEIVED },
  { label: '已关闭', value: PurchaseOrderStatus.CLOSED },
  { label: '已取消', value: PurchaseOrderStatus.CANCELLED },
]

export const PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO = {
  [PurchaseOrderStatus.DRAFT]: { text: '草稿', status: 'Default' },
  [PurchaseOrderStatus.APPROVED]: { text: '已审批', status: 'Processing' },
  [PurchaseOrderStatus.RECEIVED]: { text: '已收货', status: 'Success' },
  [PurchaseOrderStatus.CLOSED]: { text: '已关闭', status: 'Default' },
  [PurchaseOrderStatus.CANCELLED]: { text: '已取消', status: 'Error' },
} as const