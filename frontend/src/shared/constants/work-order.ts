import type { WorkOrderStatus } from '@zyerp/shared'

export const WORK_ORDER_STATUS_OPTIONS: Array<{ label: string; value: WorkOrderStatus }> = [
  { label: '草稿', value: 'draft' },
  { label: '已排程', value: 'scheduled' },
  { label: '进行中', value: 'in_progress' },
  { label: '暂停', value: 'paused' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const WORK_ORDER_STATUS_VALUE_ENUM_PRO: Record<WorkOrderStatus, { text: string; status: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {
  draft: { text: '草稿', status: 'Default' },
  scheduled: { text: '已排程', status: 'Processing' },
  in_progress: { text: '进行中', status: 'Success' },
  paused: { text: '暂停', status: 'Warning' },
  completed: { text: '已完成', status: 'Success' },
  cancelled: { text: '已取消', status: 'Error' },
}

export const WORK_ORDER_OUTSOURCING_VALUE_ENUM_PRO: Record<string, { text: string; status: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {
  true: { text: '需要外协', status: 'Error' },
  false: { text: '无需外协', status: 'Success' },
}