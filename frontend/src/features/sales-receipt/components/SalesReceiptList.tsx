import React, { useMemo, useCallback } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Popconfirm } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { salesReceiptService } from '../services/sales-receipt.service';
import { useMessage } from '@/shared/hooks/useMessage';
import { useWarehouseOptions } from '@/shared/hooks/useWarehouseOptions';
import { SalesReceiptStatus } from '@zyerp/shared';
import type {
  SalesReceiptInfo, 
  SalesReceiptItem,
  SalesReceiptQueryParams,
} from '@zyerp/shared';

interface SalesReceiptListProps {
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  onCreate?: () => void;
  onView?: (record: SalesReceiptInfo) => void;
}

interface SalesReceiptFlatRow {
  id: string;
  receiptId: string;
  isHead: boolean;
  rowSpan: number;
  receiptNo: string;
  salesOrderNo: string;
  customerName: string;
  status: SalesReceiptStatus;
  receiptDate: string;
  handler?: string;
  createdAt: string;
  productName?: string;
  productCode?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  warehouseId?: string;
  remarks?: string;
  originReceipt: SalesReceiptInfo;
  originItem?: SalesReceiptItem;
}

export const SalesReceiptList: React.FC<SalesReceiptListProps> = ({
  actionRef,
  onCreate,
  onView,
}) => {
  const message = useMessage();
  const { options: warehouseOptions } = useWarehouseOptions({ isActive: true });

  const warehouseNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const w of warehouseOptions) {
      const rawLabel = String(w.label ?? '');
      const idx = rawLabel.indexOf('(');
      const name = idx > 0 ? rawLabel.slice(0, idx).trim() : rawLabel;
      map[String(w.value)] = name;
    }
    return map;
  }, [warehouseOptions]);

  const handleConfirm = useCallback(async (id: string) => {
    try {
      const res = await salesReceiptService.confirm(id);
      if (res.success) {
        message.success('出库单确认成功');
        void actionRef?.current?.reload();
      } else {
        message.error(res.message || '确认失败');
      }
    } catch (error) {
      console.error(error);
      let errorMessage = '确认失败';
      if (error && typeof error === 'object') {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
      message.error(errorMessage);
    }
  }, [actionRef, message]);

  const handleCancel = useCallback(async (id: string) => {
    try {
      const res = await salesReceiptService.cancel(id);
      if (res.success) {
        message.success('出库单作废成功');
        void actionRef?.current?.reload();
      } else {
        message.error(res.message || '作废失败');
      }
    } catch (error) {
      console.error(error);
      let errorMessage = '作废失败';
      if (error && typeof error === 'object') {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
      message.error(errorMessage);
    }
  }, [actionRef, message]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await salesReceiptService.delete(id);
      if (res.success) {
        message.success('删除成功');
        void actionRef?.current?.reload();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      console.error(error);
      message.error('删除失败');
    }
  }, [actionRef, message]);

  const flattenReceipts = (receipts: SalesReceiptInfo[]): SalesReceiptFlatRow[] => {
    const flatRows: SalesReceiptFlatRow[] = [];

    receipts.forEach((receipt) => {
      const items = Array.isArray(receipt.items) && receipt.items.length > 0 ? receipt.items : [];
      const rowSpan = Math.max(items.length, 1);

      if (items.length === 0) {
        flatRows.push({
          id: receipt.id,
          receiptId: receipt.id,
          isHead: true,
          rowSpan: 1,
          receiptNo: receipt.receiptNo,
          salesOrderNo: receipt.salesOrderNo,
          customerName: receipt.customerName,
          status: receipt.status,
          receiptDate: receipt.receiptDate,
          handler: receipt.handler,
          createdAt: receipt.createdAt,
          remarks: receipt.remarks,
          originReceipt: receipt,
        });
      } else {
        items.forEach((item, index) => {
          flatRows.push({
            id: item.id || `${receipt.id}_${index}`,
            receiptId: receipt.id,
            isHead: index === 0,
            rowSpan,
            receiptNo: receipt.receiptNo,
            salesOrderNo: receipt.salesOrderNo,
            customerName: receipt.customerName,
            status: receipt.status,
            receiptDate: receipt.receiptDate,
            handler: receipt.handler,
            createdAt: receipt.createdAt,
            productName: item.productName,
            productCode: item.productCode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            warehouseId: item.warehouseId,
            remarks: receipt.remarks ?? item.remarks,
            originReceipt: receipt,
            originItem: item,
          });
        });
      }
    });

    return flatRows;
  };

  const columns = useMemo<ProColumns<SalesReceiptFlatRow>[]>(() => [
    {
      title: '出库单号',
      dataIndex: 'receiptNo',
      width: 140,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '销售订单号',
      dataIndex: 'salesOrderNo',
      width: 140,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      width: 160,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      ellipsis: true,
    },
   
    {
      title: '出库产品明细',
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
          width: 120,
          ellipsis: true,
        },
        {
          title: '数量',
          dataIndex: 'quantity',
          width: 80,
          align: 'right',
        },
        {
          title: '单价',
          dataIndex: 'unitPrice',
          width: 100,
          align: 'right',
          render: (val) => (val != null ? `¥ ${Number(val).toFixed(2)}` : '-'),
        },
        {
          title: '金额',
          dataIndex: 'amount',
          width: 110,
          align: 'right',
          render: (val) =>
            val != null ? (
              <span style={{ fontWeight: 600, color: '#52c41a' }}>
                ¥ {Number(val).toFixed(2)}
              </span>
            ) : (
              '-'
            ),
        },
        {
          title: '仓库',
          dataIndex: 'warehouseId',
          width: 140,
          ellipsis: true,
          render: (_, record) => {
            const id = record.warehouseId;
            if (!id) {
              return '-';
            }
            return warehouseNameMap[id] ?? id;
          },
        },
      ],
    },
     {
      title: '出库日期',
      dataIndex: 'receiptDate',
      valueType: 'date',
      width: 110,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      sorter: true,
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      width: 200,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      ellipsis: true,
      search: false,
    },
     {
      title: '经办人',
      dataIndex: 'handler',
      width: 100,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      valueEnum: {
        [SalesReceiptStatus.DRAFT]: { text: '草稿', status: 'Default' },
        [SalesReceiptStatus.CONFIRMED]: { text: '已确认', status: 'Success' },
        [SalesReceiptStatus.CANCELLED]: { text: '已作废', status: 'Error' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 190,
      fixed: 'right',
      onCell: (record) => ({ rowSpan: record.isHead ? record.rowSpan : 0 }),
      render: (_, record) => [
        record.status === SalesReceiptStatus.DRAFT && (
          <Popconfirm
            key="confirm"
            title="确认出库?"
            description="确认后库存将被扣减且不可修改"
            onConfirm={() => void handleConfirm(record.receiptId)}
          >
            <Button type="link" size="small" icon={<CheckOutlined />}>
              确认
            </Button>
          </Popconfirm>
        ),
        record.status === SalesReceiptStatus.DRAFT && (
          <Popconfirm
            key="delete"
            title="删除出库单?"
            description="删除后数据无法恢复，且不会自动回滚库存变更"
            onConfirm={() => void handleDelete(record.receiptId)}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        ),
        record.status === SalesReceiptStatus.CONFIRMED && (
          <Popconfirm
            key="cancel"
            title="作废出库单?"
            description="作废后库存将回滚"
            onConfirm={() => void handleCancel(record.receiptId)}
          >
            <Button type="link" danger size="small" icon={<CloseOutlined />}>
              作废
            </Button>
          </Popconfirm>
        ),
        <Button
          key="view"
          type="link"
          size="small"
          onClick={() => {
            onView?.(record.originReceipt);
          }}
        >
          详情
        </Button>,
      ],
    },
  ], [onView, handleConfirm, handleCancel, handleDelete, warehouseNameMap]);

  const request = async (params: Record<string, unknown>) => {
    const { current, pageSize, ...rest } = params;
    const pageLike = current ?? 1;
    const pageSizeLike = pageSize ?? 10;
    const page = typeof pageLike === 'number' ? pageLike : Number(pageLike) || 1;
    const size =
      typeof pageSizeLike === 'number' ? pageSizeLike : Number(pageSizeLike) || 10;

    const query: SalesReceiptQueryParams = {
      page,
      pageSize: size,
      ...(rest as Partial<SalesReceiptQueryParams>),
    };

    const result = await salesReceiptService.getList(query);
    const flatData = flattenReceipts(result.data || []);

    return {
      data: flatData,
      success: true,
      total: result.pagination.total,
    };
  };

  return (
    <ProTable<SalesReceiptFlatRow>
      headerTitle="销售出库单列表"
      actionRef={actionRef}
      rowKey="id"
      scroll={{ x: 1500 }}
      search={{
        labelWidth: 120,

      }}
      toolBarRender={() => [
        <Button
          type="primary"
          key="primary"
          onClick={() => {
            onCreate?.();
          }}
        >
          <PlusOutlined /> 新建出库单
        </Button>,
      ]}
      request={request}
      columns={columns}
    />
  );
};
