import type { ProductionPlanStatus } from '@zyerp/shared'

export const PRODUCTION_PLAN_STATUS_OPTIONS: Array<{ label: string; value: ProductionPlanStatus }> = [
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

export const PRODUCTION_PLAN_STATUS_VALUE_ENUM_PRO: Record<ProductionPlanStatus, { text: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {
  draft: { text: '草稿', status: 'Default' },
  confirmed: { text: '已确认', status: 'Processing' },
  completed: { text: '已完成', status: 'Success' },
  cancelled: { text: '已取消', status: 'Error' },
}