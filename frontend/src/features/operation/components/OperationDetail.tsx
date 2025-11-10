import React from 'react';
import { Descriptions, Tag, Card } from 'antd';
import type { OperationInfo } from '@zyerp/shared';

interface OperationDetailProps {
  operation: OperationInfo;
  loading?: boolean;
}

const OperationDetail: React.FC<OperationDetailProps> = ({
  operation,
  loading = false
}) => {
  return (
    <Card title="工序详情" loading={loading}>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="工序编码" span={1}>
          {operation?.code || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="工序名称" span={1}>
          {operation?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="标准工时" span={1}>
          {operation?.standardTime ? `${operation.standardTime} 分钟` : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="工价费率" span={1}>
          {operation?.wageRate ? `${operation.wageRate} 元/件` : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="每小时成本" span={1}>
          {operation?.costPerHour ? `${operation.costPerHour} 元/小时` : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="工价单位" span={1}>
          {operation?.unit || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="状态" span={1}>
          <Tag color={operation?.isActive ? 'success' : 'default'}>
            {operation?.isActive ? '启用' : '停用'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间" span={1}>
          {operation?.createdAt ? new Date(operation.createdAt).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间" span={1}>
          {operation?.updatedAt ? new Date(operation.updatedAt).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>
          {operation?.description || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default OperationDetail;