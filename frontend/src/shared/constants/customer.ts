export type CustomerCategory = 'enterprise' | 'individual' | 'government' | 'institution'

export const CUSTOMER_CATEGORY_OPTIONS: Array<{ label: string; value: CustomerCategory }> = [
  { label: '企业客户', value: 'enterprise' },
  { label: '个人客户', value: 'individual' },
  { label: '政府客户', value: 'government' },
  { label: '机构客户', value: 'institution' },
]

export const CUSTOMER_CATEGORY_VALUE_ENUM: Record<CustomerCategory, { text: string }> = {
  enterprise: { text: '企业客户' },
  individual: { text: '个人客户' },
  government: { text: '政府客户' },
  institution: { text: '机构客户' },
}

export const CUSTOMER_CATEGORY_VALUE_ENUM_PRO: Record<CustomerCategory, { text: string; status?: 'Default' | 'Success' | 'Warning' | 'Processing' | 'Error' }> = {
  enterprise: { text: '企业客户', status: 'Default' },
  individual: { text: '个人客户', status: 'Success' },
  government: { text: '政府客户', status: 'Warning' },
  institution: { text: '机构客户', status: 'Processing' },
}

export type CustomerCreditLevel = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C'

export const CUSTOMER_CREDIT_LEVEL_OPTIONS: Array<{ label: string; value: CustomerCreditLevel }> = [
  { label: 'AAA', value: 'AAA' },
  { label: 'AA', value: 'AA' },
  { label: 'A', value: 'A' },
  { label: 'BBB', value: 'BBB' },
  { label: 'BB', value: 'BB' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
]

export const CUSTOMER_CREDIT_LEVEL_VALUE_ENUM: Record<CustomerCreditLevel, { text: string }> = {
  AAA: { text: 'AAA' },
  AA: { text: 'AA' },
  A: { text: 'A' },
  BBB: { text: 'BBB' },
  BB: { text: 'BB' },
  B: { text: 'B' },
  C: { text: 'C' },
}

export const CUSTOMER_CREDIT_LEVEL_VALUE_ENUM_PRO: Record<CustomerCreditLevel, { text: string; status?: 'Default' | 'Success' | 'Warning' | 'Processing' | 'Error' }> = {
  AAA: { text: 'AAA', status: 'Success' },
  AA: { text: 'AA', status: 'Processing' },
  A: { text: 'A', status: 'Default' },
  BBB: { text: 'BBB', status: 'Warning' },
  BB: { text: 'BB', status: 'Error' },
  B: { text: 'B', status: 'Error' },
  C: { text: 'C', status: 'Error' },
}

export type CustomerStatusEnum = 'active' | 'inactive' | 'suspended' | 'blacklisted'

export const CUSTOMER_STATUS_VALUE_ENUM_PRO: Record<CustomerStatusEnum, { text: string; status?: 'Default' | 'Success' | 'Warning' | 'Processing' | 'Error' }> = {
  active: { text: '活跃', status: 'Success' },
  inactive: { text: '非活跃', status: 'Default' },
  suspended: { text: '暂停', status: 'Warning' },
  blacklisted: { text: '黑名单', status: 'Error' },
}