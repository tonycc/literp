import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { ProCard, ProDescriptions, ProTable } from '@ant-design/pro-components';
import type {
  ProColumns,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import type { SalesReceiptInfo, SalesReceiptItem } from '@zyerp/shared';
import { salesReceiptService } from '../services/sales-receipt.service';
import { useMessage } from '@/shared/hooks';

interface SalesReceiptDetailProps {
  visible: boolean;
  receiptId?: string;
  onClose: () => void;
}

export const SalesReceiptDetail: React.FC<SalesReceiptDetailProps> = ({
  visible,
  receiptId,
  onClose,
}) => {
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalesReceiptInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!visible || !receiptId) return;
      setLoading(true);
      try {
        const res = await salesReceiptService.getById(receiptId);
        if (res.success) {
          setData(res.data ?? null);
        } else {
          message.error(res.message || '加载出库单详情失败');
        }
      } catch (error) {
        console.error('加载出库单详情失败', error);
        message.error('加载出库单详情失败');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [visible, receiptId, message]);

  const descriptionColumns: ProDescriptionsItemProps<SalesReceiptInfo>[] = [
    { title: '出库单号', dataIndex: 'receiptNo' },
    { title: '销售订单号', dataIndex: 'salesOrderNo' },
    { title: '客户名称', dataIndex: 'customerName' },
    { title: '状态', dataIndex: 'status' },
    { title: '出库日期', dataIndex: 'receiptDate', valueType: 'date' },
    { title: '经办人', dataIndex: 'handler' },
    { title: '备注', dataIndex: 'remarks', span: 2 },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime' },
    { title: '创建人', dataIndex: 'createdBy' },
    { title: '更新时间', dataIndex: 'updatedAt', valueType: 'dateTime' },
    { title: '更新人', dataIndex: 'updatedBy' },
  ];

  const columns: ProColumns<SalesReceiptItem>[] = [
    {
      title: '产品名称',
      dataIndex: 'productName',
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      width: 160,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      width: 120,
      align: 'right',
      valueType: 'money',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      align: 'right',
      valueType: 'money',
    },
    {
      title: '仓库',
      dataIndex: 'warehouseId',
      width: 160,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
    },
  ];

  return (
    <Drawer
      open={visible}
      width={900}
      onClose={onClose}
      destroyOnClose
      title="出库单详情"
    >
      <ProCard loading={loading} split="horizontal" gutter={16}>
        <ProCard>
          <ProDescriptions<SalesReceiptInfo>
            column={2}
            dataSource={data ?? undefined}
            columns={descriptionColumns}
            bordered
          />
        </ProCard>
        <ProCard title="出库明细">
          <ProTable<SalesReceiptItem>
            rowKey="id"
            search={false}
            options={false}
            pagination={false}
            dataSource={data?.items ?? []}
            columns={columns}
            toolBarRender={false}
            size="small"
          />
        </ProCard>
      </ProCard>
    </Drawer>
  );
};

