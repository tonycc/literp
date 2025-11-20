import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { ProCard, ProDescriptions, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import type { SalesOrder, SalesOrderItem } from '@zyerp/shared';
import { salesOrderService } from '../services/sales-order.service';
import { useMessage } from '@/shared/hooks';

interface SalesOrderDetailProps {
  visible: boolean;
  orderId?: string;
  onClose: () => void;
}

export const SalesOrderDetail: React.FC<SalesOrderDetailProps> = ({ visible, orderId, onClose }) => {
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalesOrder | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!visible || !orderId) return;
      setLoading(true);
      try {
        const res = await salesOrderService.getById(orderId);
        if (res.success) setData(res.data as unknown as SalesOrder);
        else message.error(res.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [visible, orderId]);

  const columns: ProColumns<SalesOrderItem>[] = [
    { title: '产品', dataIndex: ['product', 'name'] },
    { title: '数量', dataIndex: 'quantity', valueType: 'digit', width: 100 },
    { title: '单价', dataIndex: 'price', valueType: 'money', width: 120 },
    { title: '金额', dataIndex: 'amount', valueType: 'money', width: 120 },
    { title: '单位', dataIndex: ['unit', 'name'], width: 100 },
    { title: '仓库', dataIndex: ['warehouse', 'name'], width: 160 },
  ];

  const items: ProDescriptionsItemProps<SalesOrder>[] = [
    { title: '订单号', dataIndex: 'id' },
    { title: '客户名称', dataIndex: 'customerName' },
    { title: '订单日期', dataIndex: 'orderDate', valueType: 'date' },
    { title: '状态', dataIndex: 'status' },
    { title: '总金额', dataIndex: 'totalAmount', valueType: 'money' },
    { title: '备注', dataIndex: 'remark', span: 2 },
  ];

  return (
    <Drawer open={visible} width={900} onClose={onClose} destroyOnClose title="订单详情">
      <ProCard loading={loading} split="horizontal" gutter={16}>
        <ProCard>
          <ProDescriptions<SalesOrder> column={2} dataSource={data || undefined} items={items} bordered />
        </ProCard>
        <ProCard title="明细项">
          <ProTable<SalesOrderItem>
            rowKey="id"
            search={false}
            options={false}
            pagination={false}
            dataSource={data?.items || []}
            columns={columns}
            toolBarRender={false}
          />
        </ProCard>
      </ProCard>
    </Drawer>
  );
};

export default SalesOrderDetail;