export type CurrencyCode = 'CNY' | 'USD' | 'EUR'

export const GLOBAL_CURRENCY_OPTIONS: Array<{ label: string; value: CurrencyCode }> = [
  { label: '人民币 CNY', value: 'CNY' },
  { label: '美元 USD', value: 'USD' },
  { label: '欧元 EUR', value: 'EUR' },
]

export const GLOBAL_CURRENCY_VALUE_ENUM_PRO = {
  CNY: { text: '人民币' },
  USD: { text: '美元' },
  EUR: { text: '欧元' },
} as const