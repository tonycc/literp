import React from 'react';
import { Button, Tag, Tooltip, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderListParams } from '@zyerp/shared';
import { purchaseOrderService } from '../services/purchase-order.service';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import { PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/purchase-order';

export interface PurchaseOrderListProps {
  onAdd?: () => void;
  onView?: (item: PurchaseOrder) => void;
  onEdit?: (item: PurchaseOrder) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: PurchaseOrder[]) => void;
  refreshKey?: number;
}

type PurchaseOrderListRow = PurchaseOrder & { 
  supplierName?: string; 
  expectedDeliveryDate?: string; 
  totalAmount?: number; 
  items?: PurchaseOrderItem[];
  productCount?: number;
};

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onAdd,
  onView,
  onEdit,
  onDelete,
  selectedRowKeys,
  onSelectChange,
  refreshKey,
}) => {
  // 子表格列配置
  const productColumns: ColumnsType<PurchaseOrderItem> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 48,
      render: (_value, _record, index) => index + 1,
    },
    {
      title: '产品名称',
      dataIndex: ['product', 'name'],
      key: 'productName',
      ellipsis: true,
      width: 180,
    },
    {
      title: '产品编码',
      dataIndex: ['product', 'code'],
      key: 'productCode',
      width: 120,
      render: (code: string) => code || '-',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'right' as const,
      render: (quantity: number) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {quantity}
        </span>
      ),
    },
    {
      title: '单位',
      dataIndex: ['unit', 'name'],
      key: 'unit',
      width: 60,
      render: (name: string, record: PurchaseOrderItem) => 
        name || record.unit?.symbol || '-',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right' as const,
      render: (price: number) => `¥${price?.toFixed(2) || '0.00'}`,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          ¥{amount?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      title: '仓库',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
      width: 120,
      ellipsis: true,
      render: (name: string) => name || '-',
    },
  ];

  const columns: ProColumns<PurchaseOrderListRow>[] = [
    { title: '序号', dataIndex: 'index', valueType: 'indexBorder', width: 48, fixed: 'left' },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      ellipsis: true,
      width: 140,
      copyable: true,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      ellipsis: true,
      width: 140,
    },
    {
      title: '产品数量',
      dataIndex: 'items',
      key: 'productCount',
      width: 100,
      align: 'center' as const,
      render: (_, record) => {
        const items = record.items || [];
        if (items.length === 0) return '-';
        
        return (
          <Tag color="blue" style={{ margin: 0, fontSize: '14px' }}>
            {items.length} 种产品
          </Tag>
        );
      },
    },
    {
      title: '总数量',
      dataIndex: 'items',
      key: 'totalQuantity',
      valueType: 'digit',
      width: 80,
      render: (_, record) => {
        const totalQuantity = (record.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        return (
          <Tooltip title={`共 ${record.items?.length || 0} 种产品，总数量 ${totalQuantity}`}>
            <span>{totalQuantity}</span>
          </Tooltip>
        );
      },
    },
    { title: '订单日期', dataIndex: 'orderDate', valueType: 'date', width: 100 },
    { title: '预期交付', dataIndex: 'expectedDeliveryDate', valueType: 'date', width: 100 },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      valueType: 'money',
      width: 120,
      render: (_, record) => {
        const amount = record.amount || 0;
        const currency = record.currency || 'CNY';
        return (
          <Tooltip title={`${currency} ${amount.toFixed(2)}`}>
            <span style={{ fontWeight: 500, color: '#1890ff' }}>
              {currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : `${currency} `}
              {amount.toFixed(2)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO,
      width: 80,
      render: (status) => {
        const statusConfig = PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO[String(status)];
        const color = statusConfig?.status === 'Success'
          ? 'success'
          : statusConfig?.status === 'Error'
          ? 'error'
          : statusConfig?.status === 'Warning'
          ? 'warning'
          : 'default';
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {statusConfig?.text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      fixed: 'right',
      render: (_, record) => [
        <Button key="view" type="link" size="small" onClick={() => onView?.(record)}>查看</Button>,
        <Button key="edit" type="link" size="small" onClick={() => onEdit?.(record)}>编辑</Button>,
        <Button key="delete" type="link" danger size="small" onClick={() => onDelete?.(record.id)}>删除</Button>,
      ],
    },
  ];

  return (
    <ProTable<PurchaseOrderListRow>
      columns={columns}
      params={{ refreshKey }}
      request={async (params) => {
        const base = normalizeTableParams(params as unknown as import('@/shared/utils/normalizeTableParams').TableParams);
        const query: PurchaseOrderListParams = {
          page: base.page,
          pageSize: base.pageSize,
        };
        const response = await purchaseOrderService.getList(query);
        
        // 增强数据展示，添加产品数量统计
        const enhancedData = response.data.map(order => {
          const items = (order as { items?: PurchaseOrderItem[] }).items;
          const safeItems = Array.isArray(items) ? items : [];
          return {
            ...order,
            items: safeItems,
            productCount: safeItems.length,
          } as PurchaseOrderListRow;
        });
        
        return {
          data: enhancedData,
          success: response.success,
          total: response.pagination.total,
        };
      }}
      rowKey="id"
      search={{ 
        labelWidth: 'auto',
        defaultCollapsed: true,
        span: 6,
      }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增采购订单
        </Button>,
      ]}
      rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
        pageSizeOptions: [10, 20, 50, 100],
        defaultPageSize: 20,
      }}
      scroll={{ x: 1000 }}
      size="middle"
      options={{
        density: true,
        fullScreen: true,
        reload: () => onRefresh?.(),
        setting: true,
      }}
      expandable={{
        expandedRowRender: (record) => {
          const items = record.items || [];
          if (items.length === 0) {
            return <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>暂无产品信息</div>;
          }
          
          return (
            <div style={{ 
              margin: 0, 
              padding: '20px', 
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e8e8e8'
            }}>
              <div style={{ 
                marginBottom: '16px', 
                fontWeight: 600, 
                color: '#1890ff',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  backgroundColor: '#1890ff', 
                  color: '#fff', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {items.length}
                </span>
                产品明细
              </div>
              <Table
                columns={productColumns}
                dataSource={items}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
                summary={() => {
                  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
                  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                  
                  return (
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                      <Table.Summary.Cell index={0}>
                        <span style={{ fontWeight: 600, color: '#333' }}>合计</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={3} style={{ textAlign: 'right', fontWeight: 600, color: '#1890ff' }}>
                        {totalQuantity}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
                      <Table.Summary.Cell index={6} style={{ textAlign: 'right', fontWeight: 600, color: '#52c41a', fontSize: '14px' }}>
                        ¥{totalAmount.toFixed(2)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>-</Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>
          );
        },
        rowExpandable: (record) => (record.items?.length || 0) > 0,
        expandRowByClick: false,
        expandIcon: ({ expanded, onExpand, record }) => {
          const items = record.items || [];
          if (items.length === 0) return null;
          
          return (
            <Button
              type="link"
              size="small"
              icon={
                expanded ? 
                  <span style={{ fontSize: '12px' }}>▼</span> : 
                  <span style={{ fontSize: '12px' }}>▶</span>
              }
              onClick={(e) => {
                e.stopPropagation();
                onExpand(record, e);
              }}
              style={{ padding: 0, marginRight: '8px' }}
            >
              {expanded ? '收起' : '展开'}
            </Button>
          );
        },
      }}
    />
  );
};

export default PurchaseOrderList;