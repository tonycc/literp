import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { SalesOrder, SalesOrderListParams } from '@zyerp/shared';
import { salesOrderService } from '../services/sales-order.service';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import { SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO } from '@/shared/constants/sales-order';

export interface SalesOrderListProps {
  onAdd?: () => void;
  onView?: (item: SalesOrder) => void;
  onEdit?: (item: SalesOrder) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: SalesOrder[]) => void;
  refreshKey?: number;
}

export const SalesOrderList: React.FC<SalesOrderListProps> = ({
  onAdd,
  onView,
  onEdit,
  onDelete,
  selectedRowKeys,
  onSelectChange,
  refreshKey,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  // 格式化产品展示，支持多产品订单的优化显示
  const formatProductDisplay = (record: SalesOrder) => {
    const items = Array.isArray(record.items) ? record.items : [];
    const validItems = items.filter(item => item.product?.name);
    
    if (validItems.length === 0) return '-';
    
    if (validItems.length === 1) {
      const item = validItems[0];
      return (
        <Space direction="vertical" size={2}>
          <Tooltip title={`${item.product?.name}`}>
            <span style={{ fontWeight: 500 }}>{item.product?.name}</span>
          </Tooltip>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            数量: {item.quantity} | 单价: ¥{Number(item.price || 0).toFixed(2)}
          </span>
        </Space>
      );
    }
    
    // 多产品情况
    const displayCount = 2;
    const displayItems = validItems.slice(0, displayCount);
    const remainingCount = validItems.length - displayCount;
    
    return (
      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        {displayItems.map((item, index) => (
          <div key={index} style={{ 
            padding: '4px 8px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            borderLeft: '3px solid #1890ff'
          }}>
            <div style={{ fontWeight: 500, fontSize: '13px' }}>
              {item.product?.name}
            </div>
            <div style={{ fontSize: '11px', color: '#595959' }}>
              ×{item.quantity} | ¥{Number(item.price || 0).toFixed(2)}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <Tag color="blue" style={{ alignSelf: 'flex-start' }}>
            +{remainingCount} 更多产品
          </Tag>
        )}
      </Space>
    );
  };

  // 获取产品标签颜色
  const getProductTagColor = (index: number) => {
    const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan'];
    return colors[index % colors.length];
  };

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
  const columns = useMemo<ProColumns<SalesOrder>[]>(() => [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      render: (_, record) => record.orderNo || record.id,
      ellipsis: true,
      width: 120,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '产品信息',
      dataIndex: 'items',
      key: 'productInfo',
      width: 260,
      render: (_, record) => formatProductDisplay(record),
    },
    {
      title: '总数量',
      dataIndex: 'items',
      key: 'totalQuantity',
      valueType: 'digit',
      width: 80,
      render: (_, record) => {
        const totalQty = (record.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
        const itemCount = (record.items || []).length;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#1890ff' }}>{totalQty}</div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              {itemCount}种产品
            </div>
          </div>
        );
      },
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      valueType: 'date',
      width: 100,
      sorter: true,
    },
    {
      title: '交货日期',
      dataIndex: 'deliveryDate',
      valueType: 'date',
      width: 100,
      sorter: true,
      render: (_, record) => {
        if (!record.deliveryDate) return '-';
        const deliveryDate = dayjs(record.deliveryDate);
        const today = dayjs();
        const isOverdue = deliveryDate.isBefore(today, 'day');
        const isNearDue = Math.abs(deliveryDate.diff(today, 'day')) <= 7 && !isOverdue;
         
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              color: isOverdue ? '#ff4d4f' : isNearDue ? '#fa8c16' : '#262626',
              fontWeight: isOverdue || isNearDue ? 600 : 'normal'
            }}>
              {deliveryDate.format('YYYY-MM-DD')}
            </div>
            {isOverdue && (
              <Tag color="red" style={{ fontSize: '10px', marginTop: '2px' }}>已逾期</Tag>
            )}
            {isNearDue && (
              <Tag color="orange" style={{ fontSize: '10px', marginTop: '2px' }}>即将到期</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: '销售经理',
      dataIndex: 'salesManager',
      width: 100,
      ellipsis: true,
      render: (_, record) => record.salesManager || '-',
    },
    {
      title: '付款方式',
      dataIndex: 'paymentMethod',
      width: 100,
      valueEnum: SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO,
      filters: true,
      onFilter: true,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      width: 50,
      render: (_, record) => {
        const amount = getTotalAmount(record);
        const items = Array.isArray(record.items) ? record.items : [];
        const hasMultipleProducts = items.length > 1;
        
        return (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: '#52c41a', fontSize: '14px' }}>
              ¥{amount.toFixed(2)}
            </div>
            {hasMultipleProducts && (
              <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              共{items.length}项
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => [
        <Button key="view" type="link" onClick={() => onView?.(record)}>查看</Button>,
        <Button key="edit" type="link" onClick={() => onEdit?.(record)}>编辑</Button>,
        <Button key="delete" type="link" danger onClick={() => onDelete?.(record.id)}>删除</Button>,
      ],
    },
  ], [onView, onEdit, onDelete]);

  // 展开行渲染函数
  const expandedRowRender = (record: SalesOrder) => {
    const items = Array.isArray(record.items) ? record.items : [];
    
    if (items.length <= 2) return null; // 少于等于2个产品的不显示展开内容
    
    return (
      <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
        <div style={{ marginBottom: '12px', fontWeight: 600, color: '#262626' }}>
          产品详情 ({items.length}项)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {items.map((item, index) => (
            <div key={index} style={{
              padding: '12px',
              backgroundColor: '#fff',
              borderRadius: '6px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#262626', marginBottom: '4px' }}>
                    {item.product?.name || '未知产品'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#595959' }}>
                产品编码: {item.product?.code || '无编码'}
              </div>
                </div>
                <Tag color={getProductTagColor(index)} style={{ marginLeft: '8px' }}>
                  #{index + 1}
                </Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>数量: <strong>{item.quantity}</strong></span>
                <span>单价: <strong>¥{Number(item.price || 0).toFixed(2)}</strong></span>
                <span>小计: <strong style={{ color: '#52c41a' }}>¥{(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ProTable<SalesOrder>
      columns={columns}
      params={{ refreshKey }}
      request={async (params) => {
        const base = normalizeTableParams(params as unknown as Record<string, unknown>);
        const query: SalesOrderListParams = {
          page: base.page,
          pageSize: base.pageSize,
        };
        const response = await salesOrderService.getSalesOrders(query);
        return {
          data: response.data,
          success: response.success,
          total: response.pagination.total,
        };
      }}
      rowKey="id"
      options={{ density: true, fullScreen: true, reload: true, setting: true }}
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
     
      expandable={{
        expandedRowRender,
        expandedRowKeys,
        onExpandedRowsChange: setExpandedRowKeys,
        rowExpandable: (record) => {
          const items = Array.isArray(record.items) ? record.items : [];
          return items.length > 2; // 只有超过2个产品的订单可以展开
        },
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
