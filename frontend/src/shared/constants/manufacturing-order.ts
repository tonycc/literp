import type { MoStatus } from '@zyerp/shared'

export const MANUFACTURING_ORDER_STATUS_OPTIONS: Array<{ label: string; value: MoStatus }> = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const MANUFACTURING_ORDER_STATUS_VALUE_ENUM_PRO: Record<MoStatus, { text: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {
  draft: { text: '草稿', status: 'Default' },
  confirmed: { text: '已确认', status: 'Processing' },
  in_progress: { text: '进行中', status: 'Processing' },
  completed: { text: '已完成', status: 'Success' },
  cancelled: { text: '已取消', status: 'Error' },
}