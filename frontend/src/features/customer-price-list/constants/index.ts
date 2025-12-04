import { PriceListStatus, Unit, VATRate } from '@zyerp/shared';

export const PRICE_LIST_STATUS_OPTIONS = [
  { label: '待生效', value: PriceListStatus.PENDING },
  { label: '生效中', value: PriceListStatus.ACTIVE },
  { label: '已失效', value: PriceListStatus.INACTIVE },
  { label: '已过期', value: PriceListStatus.EXPIRED },
];

export const PRICE_LIST_STATUS_VALUE_ENUM = {
  [PriceListStatus.PENDING]: { text: '待生效', status: 'Warning' },
  [PriceListStatus.ACTIVE]: { text: '生效中', status: 'Success' },
  [PriceListStatus.INACTIVE]: { text: '已失效', status: 'Default' },
  [PriceListStatus.EXPIRED]: { text: '已过期', status: 'Error' },
};

export const UNIT_OPTIONS = [
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

export const UNIT_VALUE_ENUM = {
  [Unit.PCS]: { text: '件' },
  [Unit.SET]: { text: '套' },
  [Unit.BOX]: { text: '箱' },
  [Unit.KG]: { text: '千克' },
  [Unit.G]: { text: '克' },
  [Unit.M]: { text: '米' },
  [Unit.CM]: { text: '厘米' },
  [Unit.M2]: { text: '平方米' },
  [Unit.M3]: { text: '立方米' },
  [Unit.L]: { text: '升' },
  [Unit.ML]: { text: '毫升' },
  [Unit.PAIR]: { text: '对' },
  [Unit.DOZEN]: { text: '打' },
};

export const VAT_RATE_OPTIONS = [
  { label: '0%', value: VATRate.RATE_0 },
  { label: '3%', value: VATRate.RATE_3 },
  { label: '6%', value: VATRate.RATE_6 },
  { label: '9%', value: VATRate.RATE_9 },
  { label: '13%', value: VATRate.RATE_13 },
];
