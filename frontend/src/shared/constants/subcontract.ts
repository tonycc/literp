export const SUBCONTRACT_ORDER_STATUS_VALUE_ENUM_PRO: Record<string, { text: string; status: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {
  draft: { text: '草稿', status: 'Default' },
  released: { text: '已下达', status: 'Processing' },
  in_progress: { text: '进行中', status: 'Processing' },
  received: { text: '已收货', status: 'Success' },
  completed: { text: '已完成', status: 'Success' },
  cancelled: { text: '已取消', status: 'Error' },
}

export const SUBCONTRACT_ORDER_ITEM_STATUS_VALUE_ENUM_PRO: Record<string, { text: string; status: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {
  pending: { text: '待收货', status: 'Processing' },
  partially_received: { text: '部分收货', status: 'Warning' },
  received: { text: '已收货', status: 'Success' },
  cancelled: { text: '已取消', status: 'Error' },
}

export const SUBCONTRACT_RECEIPT_STATUS_VALUE_ENUM_PRO: Record<string, { text: string; status: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {
  draft: { text: '草稿', status: 'Default' },
  confirmed: { text: '已确认', status: 'Processing' },
  posted: { text: '已过账', status: 'Success' },
}