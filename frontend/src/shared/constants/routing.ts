/**
 * 工艺路线时间模式
 */
export const TIME_MODE = {
  MANUAL: 'manual',
  AUTO: 'auto',
  FIXED: 'fixed',
  VARIABLE: 'variable',
  CYCLE: 'cycle',
} as const;

export const TIME_MODE_OPTIONS = [
  { label: '手动', value: TIME_MODE.MANUAL },
  { label: '自动', value: TIME_MODE.AUTO },
  { label: '固定', value: TIME_MODE.FIXED },
  { label: '可变', value: TIME_MODE.VARIABLE },
  { label: '周期', value: TIME_MODE.CYCLE },
];

export const TIME_MODE_VALUE_ENUM_PRO = {
  [TIME_MODE.MANUAL]: { text: '手动', status: 'Default' },
  [TIME_MODE.AUTO]: { text: '自动', status: 'Success' },
  [TIME_MODE.FIXED]: { text: '固定', status: 'Default' },
  [TIME_MODE.VARIABLE]: { text: '可变', status: 'Processing' },
  [TIME_MODE.CYCLE]: { text: '周期', status: 'Warning' },
};

export const TIME_MODE_MAP: Record<string, { text: string; color: string }> = {
  [TIME_MODE.MANUAL]: { text: '手动', color: 'default' },
  [TIME_MODE.AUTO]: { text: '自动', color: 'success' },
  [TIME_MODE.FIXED]: { text: '固定', color: 'blue' },
  [TIME_MODE.VARIABLE]: { text: '可变', color: 'orange' },
  [TIME_MODE.CYCLE]: { text: '周期', color: 'warning' },
};
