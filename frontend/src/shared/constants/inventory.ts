import { InventoryStatus } from '@zyerp/shared';

export const INVENTORY_STATUS_OPTIONS = [
  { label: '正常', value: InventoryStatus.NORMAL },
  { label: '库存不足', value: InventoryStatus.LOW_STOCK },
  { label: '缺货', value: InventoryStatus.OUT_OF_STOCK },
  { label: '库存过多', value: InventoryStatus.OVERSTOCKED },
  { label: '已预留', value: InventoryStatus.RESERVED },
  { label: '损坏', value: InventoryStatus.DAMAGED },
  { label: '过期', value: InventoryStatus.EXPIRED },
] as const;

export const INVENTORY_STATUS_VALUE_ENUM_PRO: Record<
  InventoryStatus,
  { text: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }
> = {
  [InventoryStatus.NORMAL]: { text: '正常', status: 'Success' },
  [InventoryStatus.LOW_STOCK]: { text: '库存不足', status: 'Warning' },
  [InventoryStatus.OUT_OF_STOCK]: { text: '缺货', status: 'Error' },
  [InventoryStatus.OVERSTOCKED]: { text: '库存过多', status: 'Warning' },
  [InventoryStatus.RESERVED]: { text: '已预留', status: 'Processing' },
  [InventoryStatus.DAMAGED]: { text: '损坏', status: 'Error' },
  [InventoryStatus.EXPIRED]: { text: '过期', status: 'Error' },
};

