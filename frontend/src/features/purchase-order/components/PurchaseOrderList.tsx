import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderListParams, ProductInfo } from '@zyerp/shared';
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

/**
 * 扁平化的采购订单行数据结构
 * 用于支持表格行合并展示
 */
interface PurchaseOrderFlatRow {
  id: string; // 唯一标识
  orderId: string;
  isHead: boolean; // 是否为合并行的首行
  rowSpan: number; // 合并行数

  // 订单层级信息
  orderNo: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: string;
  totalAmount: number;
  currency: string;
  productCount: number; // 产品种数

  // 产品明细层级信息
  productName?: string;
  productCode?: string;
  specification?: string;
  unitName?: string;
  quantity?: number;
  price?: number;
  amount?: number;
  warehouseName?: string;

  // 原始数据引用
  originOrder: PurchaseOrder;
  originItem?: PurchaseOrderItem;
}

/**
 * 扩展 PurchaseOrder 类型以包含列表接口可能返回的额外字段
 * 避免在代码中使用 as any
 */
interface PurchaseOrderWithDetails extends PurchaseOrder {
  items?: PurchaseOrderItem[];
  supplier?: { name: string };
  supplierName?: string;
  expectedDeliveryDate?: string | Date;
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onAdd,
  onView,
  onEdit,
  onDelete,
  refreshKey,
}) => {
  
  // 扁平化数据处理
  const flattenPurchaseOrders = (orders: PurchaseOrder[]): PurchaseOrderFlatRow[] => {
    const flatRows: PurchaseOrderFlatRow[] = [];

    orders.forEach(order => {
      // 使用类型断言处理可能的额外字段
      const orderWithDetails = order as PurchaseOrderWithDetails;
      const items = orderWithDetails.items || [];
      const rowSpan = Math.max(items.length, 1);
      const supplierName = orderWithDetails.supplier?.name || orderWithDetails.supplierName || '-';

      const commonFields = {
        orderId: order.id,
        orderNo: order.orderNo || order.id,
        supplierName,
        orderDate: order.orderDate ? dayjs(order.orderDate).format('YYYY-MM-DD') : '-',
        expectedDeliveryDate: orderWithDetails.expectedDeliveryDate ? dayjs(orderWithDetails.expectedDeliveryDate).format('YYYY-MM-DD') : '-',
        status: order.status,
        totalAmount: order.amount || 0,
        currency: order.currency || 'CNY',
        productCount: items.length,
        originOrder: order,
      };

      if (items.length === 0) {
        // 无明细的订单
        flatRows.push({
          id: order.id,
          isHead: true,
          rowSpan: 1,
          ...commonFields,
        });
      } else {
        // 有明细的订单
        items.forEach((item, index) => {
          const product = item.product as ProductInfo | undefined;
          flatRows.push({
            id: item.id || `${order.id}_${index}`,
            isHead: index === 0,
            rowSpan: rowSpan,
            ...commonFields,
            
            productName: product?.name || item.product?.name,
            productCode: product?.code || item.product?.code,
            specification: product?.specification || '-',
            unitName: item.unit?.name || item.unit?.symbol || '-',
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
            warehouseName: item.warehouse?.name || '-',
            
            originItem: item,
          });
        });
      }
    });

    return flatRows;
  };

  const columns = useMemo<ProColumns<PurchaseOrderFlatRow>[]>(() => [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 140,
      fixed: 'left',
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false, // 使用隐藏的搜索字段
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
      copyable: true,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      width: 140,
      ellipsis: true,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false, // 使用隐藏的搜索字段
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      valueType: 'date',
      width: 100,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
    },
    {
      title: '预期交付',
      dataIndex: 'expectedDeliveryDate',
      valueType: 'date',
      width: 100,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
      render: (_, record) => {
        if (record.expectedDeliveryDate === '-') return '-';
        const date = dayjs(record.expectedDeliveryDate);
        const today = dayjs();
        const isOverdue = date.isBefore(today, 'day');
        const isNearDue = Math.abs(date.diff(today, 'day')) <= 7 && !isOverdue;
        
        return (
          <div style={{ 
            color: isOverdue ? '#ff4d4f' : isNearDue ? '#fa8c16' : '#262626',
            fontWeight: isOverdue || isNearDue ? 600 : 'normal'
          }}>
            {record.expectedDeliveryDate}
          </div>
        );
      }
    },
    {
      title: '采购产品明细',
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
          title: '规格',
          dataIndex: 'specification',
          width: 100,
          ellipsis: true,
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
          render: (val, record) => `${record.currency === 'CNY' ? '¥' : record.currency} ${Number(val)?.toFixed(2) || '0.00'}`,
        },
        {
          title: '金额',
          dataIndex: 'amount',
          width: 100,
          align: 'right',
          render: (val, record) => (
            <span style={{ fontWeight: 600, color: '#52c41a' }}>
              {record.currency === 'CNY' ? '¥' : record.currency} {Number(val)?.toFixed(2) || '0.00'}
            </span>
          ),
        },
      ]
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO,
      width: 80,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false, // 使用隐藏的搜索字段
      render: (_dom, record) => {
        const statusConfig = PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO[record.status as keyof typeof PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO];
        const statusType = statusConfig?.status;
        const color = statusType === 'Success'
          ? 'success'
          : statusType === 'Error'
          ? 'error'
          : statusType === 'Processing'
          ? 'processing'
          : 'default';
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {statusConfig?.text}
          </Tag>
        );
      },
    },
    // 隐藏的搜索字段
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'search_orderNo',
      hideInTable: true,
    },
    {
      title: '供应商',
      dataIndex: 'supplierId', // 搜索通常用 ID 选择，或者名称模糊搜索。Params 有 supplierId。
      key: 'search_supplierId', // 保持与 Params 一致
      hideInTable: true,
      // 这里可以加 valueType: 'select' 如果有供应商列表 options
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'search_productName',
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'search_status',
      hideInTable: true,
      valueEnum: PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO,
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
      width: 160,
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
    <ProTable<PurchaseOrderFlatRow>
      columns={columns}
      params={{ refreshKey }}
      bordered
      request={async (params) => {
        const base = normalizeTableParams(params as unknown as Record<string, unknown>);
        const query: PurchaseOrderListParams = {
          page: base.page,
          pageSize: base.pageSize,
          orderNo: params.orderNo as string,
          supplierId: params.supplierId as string, // 注意这里用的 supplierId
          productName: params.productName as string,
          status: params.status as string,
          startDate: params.startDate as string,
          endDate: params.endDate as string,
        };
        
        const response = await purchaseOrderService.getList(query);
        
        const flatData = flattenPurchaseOrders(response.data || []);
        
        return {
          data: flatData,
          success: response.success,
          total: response.pagination.total,
        };
      }}
      rowKey="id"
      options={{ density: true, fullScreen: true, reload: true, setting: true }}
      search={{ labelWidth: 'auto' }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增采购订单
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

export default PurchaseOrderList;