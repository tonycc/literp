export const DEPARTMENT_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '启用', value: 'true' },
  { label: '禁用', value: 'false' },
]

export const DEPARTMENT_STATUS_VALUE_ENUM_PRO: Record<string, { text: string; status: 'Success' | 'Default' | 'Error' }> = {
  true: { text: '启用', status: 'Success' },
  false: { text: '禁用', status: 'Default' },
}
