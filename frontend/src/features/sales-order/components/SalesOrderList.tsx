import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { SalesOrder, SalesOrderQueryParams } from '../types';
import { SALES_ORDER_STATUS_CONFIG } from '../types';
import { salesOrderService } from '../services/sales-order.service';

export interface SalesOrderListProps {
  onAdd?: () => void;
  onView?: (item: SalesOrder) => void;
  onEdit?: (item: SalesOrder) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: SalesOrder[]) => void;
}

export const SalesOrderList: React.FC<SalesOrderListProps> = ({
  onAdd,
  onView,
  selectedRowKeys,
  onSelectChange,
}) => {
  // 状态枚举映射（强类型，避免 any）
  const statusValueEnum: Record<string, { text: string }> = Object.entries(SALES_ORDER_STATUS_CONFIG)
    .reduce((acc, [key, val]) => {
      acc[key] = { text: val.text };
      return acc;
    }, {} as Record<string, { text: string }>);

  // 总金额兼容处理（兼容后端可能提供的 totalAmount 字段）
  const getTotalAmount = (record: SalesOrder): number => {
    const maybeTotalAmount = (record as SalesOrder & { totalAmount?: number }).totalAmount;
    if (typeof maybeTotalAmount === 'number') {
      return maybeTotalAmount;
    }
    const items = Array.isArray(record.items) ? record.items : [];
    const sum = items.reduce((acc, it) => {
      if (typeof it.amount === 'number') {
        return acc + it.amount;
      }
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      return acc + price * qty;
    }, 0);
    return sum;
  };
  const columns: ProColumns<SalesOrder>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '订单号',
      dataIndex: 'id',
      render: (_, record) => record.id,
      ellipsis: true,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      ellipsis: true,
    },
    {
      title: '产品名称',
      dataIndex: 'items',
      key: 'productNames',
      ellipsis: true,
      render: (_, record) => {
        const names = (record.items || [])
          .map((it) => it.product?.name)
          .filter(Boolean) as string[];
        return names.length ? names.join('、') : '-';
      },
    },
    {
      title: '数量',
      dataIndex: 'items',
      key: 'totalQuantity',
      valueType: 'digit',
      width: 100,
      render: (_, record) => {
        const totalQty = (record.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
        return totalQty;
      },
    },
    
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      valueType: 'date',
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      render: (_, record) => getTotalAmount(record),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusValueEnum,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button key="view" type="link" onClick={() => onView?.(record)}>查看</Button>,
      ],
    },
  ];

  return (
    <ProTable<SalesOrder>
      columns={columns}
      request={async (params) => {
        const query: SalesOrderQueryParams = {
          page: params.current,
          pageSize: params.pageSize,
        };

        const response = await salesOrderService.getSalesOrders(query);
        return {
          data: response.data,
          success: response.success,
          total: response.pagination.total,
        };
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增
        </Button>,
      ]}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
      }}
    />
  );
};

export default SalesOrderList;