import { PriceListStatus, VATRate, Unit } from '@/features/customer-price-list/types';

export const PRICE_LIST_STATUS_OPTIONS: Array<{ label: string; value: PriceListStatus }> = [
  { label: '生效', value: PriceListStatus.ACTIVE },
  { label: '失效', value: PriceListStatus.INACTIVE },
  { label: '待生效', value: PriceListStatus.PENDING },
  { label: '已过期', value: PriceListStatus.EXPIRED },
];

export const VAT_RATE_OPTIONS: Array<{ label: string; value: VATRate }> = [
  { label: '0%', value: VATRate.RATE_0 },
  { label: '3%', value: VATRate.RATE_3 },
  { label: '6%', value: VATRate.RATE_6 },
  { label: '9%', value: VATRate.RATE_9 },
  { label: '13%', value: VATRate.RATE_13 },
];

export const UNIT_OPTIONS: Array<{ label: string; value: Unit }> = [
  { label: '件', value: Unit.PCS },
  { label: '套', value: Unit.SET },
  { label: '箱', value: Unit.BOX },
  { label: '千克', value: Unit.KG },
  { label: '克', value: Unit.G },
  { label: '米', value: Unit.M },
  { label: '厘米', value: Unit.CM },
  { label: '平方米', value: Unit.M2 },
  { label: '立方米', value: Unit.M3 },
  { label: '升', value: Unit.L },
  { label: '毫升', value: Unit.ML },
  { label: '对', value: Unit.PAIR },
  { label: '打', value: Unit.DOZEN },
];