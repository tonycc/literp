import React from 'react';
import { Tag, Tooltip } from 'antd';
import type { StatusTagProps } from '@zyerp/shared';
import { ACQUISITION_METHOD_MAP, PRODUCT_STATUS_MAP, PRODUCT_TYPE_MAP } from '@zyerp/shared';

// 状态映射配置
const statusConfig: Record<string, { label: string; color: string; tooltip?: string }> = {
  ...PRODUCT_TYPE_MAP,
  ...PRODUCT_STATUS_MAP,
  ...ACQUISITION_METHOD_MAP,
};

export const StatusTag: React.FC<StatusTagProps> = ({
  value,
  type = 'status',
  showTooltip = true,
  className
}) => {
  // 构建完整的key（type + value）
  const fullKey = `${type}.${value}`;
  const config = statusConfig[fullKey] || statusConfig[value];

  if (!config) {
    return <Tag>{value}</Tag>;
  }

  const tag = (
    <Tag color={config.color} className={className}>
      {config.label}
    </Tag>
  );

  if (showTooltip && config.tooltip) {
    return (
      <Tooltip title={config.tooltip}>
        {tag}
      </Tooltip>
    );
  }

  return tag;
};

export default StatusTag;
