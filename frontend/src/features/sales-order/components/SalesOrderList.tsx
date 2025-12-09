import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { SalesOrder, SalesOrderListParams, SalesOrderItem, ProductInfo } from '@zyerp/shared';
import { salesOrderService } from '../services/sales-order.service';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

export interface SalesOrderListProps {
  onAdd?: () => void;
  onView?: (item: SalesOrder) => void;
  onEdit?: (item: SalesOrder) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: SalesOrder[]) => void;
  refreshKey?: number;
}

/**
 * 扁平化的销售订单行数据结构
 * 用于支持表格行合并展示
 */
interface SalesOrderFlatRow {
  id: string; // 唯一标识：item.id 或 order.id (无明细时)
  orderId: string;
  isHead: boolean; // 是否为合并行的首行
  rowSpan: number; // 合并行数
  
  // 订单层级信息
  orderNo: string;
  customerName: string;
  customerCode?: string; // 如果有
  orderDate: string;
  deliveryDate: string;
  salesManager: string;
  totalAmount: number;
  paymentMethod?: string;
  
  // 产品明细层级信息
  productName?: string;
  productCode?: string;
  productType?: string;
  specification?: string;
  unitName?: string;
  quantity?: number;
  price?: number;
  amount?: number;
  
  // 原始数据引用
  originOrder: SalesOrder;
  originItem?: SalesOrderItem;
}

export const SalesOrderList: React.FC<SalesOrderListProps> = ({
  onAdd,
  onView,
  onEdit,
  onDelete,
  refreshKey,
}) => {
  // 扁平化数据处理
  const flattenSalesOrders = (orders: SalesOrder[]): SalesOrderFlatRow[] => {
    const flatRows: SalesOrderFlatRow[] = [];
    
    orders.forEach(order => {
      const items = Array.isArray(order.items) && order.items.length > 0 
        ? order.items 
        : [];
      
      const rowSpan = Math.max(items.length, 1);
      
      // 计算总金额
      const totalAmount = order.totalAmount ?? items.reduce((sum, item) => {
        return sum + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0);

      if (items.length === 0) {
        // 无明细的订单，显示一行
        flatRows.push({
          id: order.id,
          orderId: order.id,
          isHead: true,
          rowSpan: 1,
          orderNo: order.orderNo || order.id,
          customerName: order.customerName || '-',
          customerCode: '-', // 暂无客户编码字段
          orderDate: order.orderDate ? dayjs(order.orderDate).format('YYYY-MM-DD') : '-',
          deliveryDate: order.deliveryDate ? dayjs(order.deliveryDate).format('YYYY-MM-DD') : '-',
          salesManager: order.salesManager || '-',
          totalAmount,
          paymentMethod: order.paymentMethod || undefined,
          originOrder: order,
        });
      } else {
        // 有明细的订单，生成多行
        items.forEach((item, index) => {
          flatRows.push({
            id: item.id || `${order.id}_${index}`,
            orderId: order.id,
            isHead: index === 0,
            rowSpan: rowSpan,
            orderNo: order.orderNo || order.id,
            customerName: order.customerName || '-',
            customerCode: '-',
            orderDate: order.orderDate ? dayjs(order.orderDate).format('YYYY-MM-DD') : '-',
            deliveryDate: order.deliveryDate ? dayjs(order.deliveryDate).format('YYYY-MM-DD') : '-',
            salesManager: order.salesManager || '-',
            totalAmount,
            paymentMethod: order.paymentMethod || undefined,
            
            productName: item.product?.name,
            productCode: item.product?.code,
            productType: (item.product as ProductInfo)?.type,
            specification: (item.product as ProductInfo)?.specification || '-',
            unitName: (typeof item.unit === 'string' ? item.unit : item.unit?.name) || (item.product as ProductInfo)?.unit?.name || '-',
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
            
            originOrder: order,
            originItem: item,
          });
        });
      }
    });
    
    return flatRows;
  };

  const columns = useMemo<ProColumns<SalesOrderFlatRow>[]>(() => [
    {
      title: '客户编码', // 图示中的列名
      dataIndex: 'customerName', // 暂时展示客户名称，因为没有编码
      width: 120,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '订单签订日期',
      dataIndex: 'orderDate',
      valueType: 'date',
      width: 110,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
    },
    {
      title: '订单交货日期',
      dataIndex: 'deliveryDate',
      valueType: 'date',
      width: 110,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
      render: (_, record) => {
        if (record.deliveryDate === '-') return '-';
        const deliveryDate = dayjs(record.deliveryDate);
        const today = dayjs();
        const isOverdue = deliveryDate.isBefore(today, 'day');
        const isNearDue = Math.abs(deliveryDate.diff(today, 'day')) <= 7 && !isOverdue;
        
        return (
          <div style={{ 
            color: isOverdue ? '#ff4d4f' : isNearDue ? '#fa8c16' : '#262626',
            fontWeight: isOverdue || isNearDue ? 600 : 'normal'
          }}>
            {record.deliveryDate}
          </div>
        );
      }
    },
    {
      title: '销售负责人',
      dataIndex: 'salesManager',
      width: 100,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false, // 使用隐藏的搜索字段
    },
    {
      title: '销售订单编号',
      dataIndex: 'orderNo',
      width: 140,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false, // 使用隐藏的搜索字段
    },
    {
      title: '销售产品明细',
      children: [
        {
          title: '产品名称',
          dataIndex: 'productName',
          width: 150,
          ellipsis: true,
        },
        {
          title: '产品编码',
          dataIndex: 'productCode',
          width: 100,
        },
        {
          title: '数量',
          dataIndex: 'quantity',
          width: 80,
          align: 'right',
          render: (val, record) => (
             <span>
               <span style={{ fontWeight: 500, color: '#1890ff' }}>{val}</span>
               {record.unitName !== '-' && <span style={{ fontSize: '12px', color: '#999', marginLeft: 4 }}>{record.unitName}</span>}
             </span>
          ),
        },
        {
          title: '单价',
          dataIndex: 'price',
          width: 100,
          align: 'right',
          render: (val) => `¥ ${Number(val)?.toFixed(2) || '0.00'}`,
        },
        {
          title: '金额',
          dataIndex: 'amount',
          width: 100,
          align: 'right',
          render: (val) => (
            <span style={{ fontWeight: 600, color: '#52c41a' }}>
              ¥ {Number(val)?.toFixed(2) || '0.00'}
            </span>
          ),
        },
      ]
    },
    // 隐藏的搜索字段
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'search_orderNo',
      hideInTable: true,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'search_customerName',
      hideInTable: true,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'search_productName',
      hideInTable: true,
    },
    {
      title: '销售经理',
      dataIndex: 'salesManager',
      key: 'search_salesManager',
      hideInTable: true,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      hideInTable: true,
      valueEnum: {
        pending: { text: '待处理', status: 'Default' },
        processing: { text: '处理中', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Error' },
      },
    },
    {
      title: '订单日期',
      dataIndex: 'orderDateRange',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value: string[]) => ({
          startDate: value[0],
          endDate: value[1],
        }),
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      render: (_, record) => [
        <Button key="view" type="link" size="small" onClick={() => onView?.(record.originOrder)}>详情</Button>,
        <Button key="edit" type="link" size="small" onClick={() => onEdit?.(record.originOrder)}>编辑</Button>,
        <Button key="delete" type="link" size="small" danger onClick={() => void onDelete?.(record.originOrder.id)}>删除</Button>,
      ],
    },
  ], [onView, onEdit, onDelete]);

  return (
    <ProTable<SalesOrderFlatRow>
      columns={columns}
      params={{ refreshKey }}
      bordered
      request={async (params) => {
        const base = normalizeTableParams(params as unknown as Record<string, unknown>);
        const query: SalesOrderListParams = {
          page: base.page,
          pageSize: base.pageSize,
          orderNumber: params.orderNo as string,
          customerName: params.customerName as string,
          productName: params.productName as string,
          status: params.status as string,
          startDate: params.startDate as string,
          endDate: params.endDate as string,
        };
        const response = await salesOrderService.getSalesOrders(query);
        
        const flatData = flattenSalesOrders(response.data || []);
        
        return {
          data: flatData,
          success: response.success,
          // 注意：这里如果返回 total: flatData.length 会导致分页混乱
          // 我们保持 total 为订单总数，但 ProTable 可能会因为数据行数 > pageSize 而显示异常
          // 在这种特殊合并行场景下，通常接受这种显示差异，或者将 pageSize 设大一点
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
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 个订单`,
        defaultPageSize: 10,
      }}
    />
  );
};

export default SalesOrderList;
