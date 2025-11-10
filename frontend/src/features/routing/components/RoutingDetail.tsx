import React from 'react';
import { Descriptions, Tag, Card } from 'antd';
import type { RoutingInfo } from '@zyerp/shared';

interface RoutingDetailProps {
  routing: RoutingInfo;
  loading?: boolean;
}

const RoutingDetail: React.FC<RoutingDetailProps> = ({
  routing,
  loading = false
}) => {
  return (
    <Card title="工艺路线详情" loading={loading}>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="工艺路线编码" span={1}>
          {routing?.code || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="工艺路线名称" span={1}>
          {routing?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="状态" span={1}>
          <Tag color={routing?.active ? 'success' : 'default'}>
            {routing?.active ? '启用' : '停用'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间" span={1}>
          {routing?.createdAt ? new Date(routing.createdAt).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间" span={1}>
          {routing?.updatedAt ? new Date(routing.updatedAt).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>
          {routing?.description || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default RoutingDetail;