import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { ProductStockInfo, ProductStockQueryParams } from '@zyerp/shared';
import { PRODUCT_TYPE_VALUE_ENUM_PRO } from '@/shared/constants/product';
import { INVENTORY_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/inventory';
import { inventoryService } from '../services/inventory.service';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

interface InventoryListProps {
  onAdd?: () => void;
  onEdit?: (item: ProductStockInfo) => void;
  onView?: (item: ProductStockInfo) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: ProductStockInfo[]) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({
  onAdd,
  onEdit,
  onView,
  onDelete,
  onRefresh,
  selectedRowKeys,
  onSelectChange,
}) => {
  const columns: ProColumns<ProductStockInfo>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
      search: false,
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      ellipsis: true,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      ellipsis: true,
    },
    {
      title: '产品属性',
      dataIndex: 'productType',
      valueType: 'select',
      valueEnum: PRODUCT_TYPE_VALUE_ENUM_PRO,
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      ellipsis: true,
      width: 80,
      hideInSearch: true,
      render: (_, record) => record.unit ?? '-',
    },
    {
      title: '现有库存',
      dataIndex: 'currentStock',
      valueType: 'digit',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '预留库存',
      dataIndex: 'reservedStock',
      valueType: 'digit',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '可用库存',
      dataIndex: 'availableStock',
      valueType: 'digit',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: INVENTORY_STATUS_VALUE_ENUM_PRO,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button key="view" type="link" onClick={() => onView?.(record)}>
          查看
        </Button>,
        <Button key="edit" type="link" onClick={() => onEdit?.(record)}>
          编辑
        </Button>,
        <Button key="delete" type="link" danger onClick={() => { void onDelete?.(record.id); }}>
          删除
        </Button>,
      ],
    },
  ];

  return (
    <ProTable<ProductStockInfo>
      columns={columns}
      request={async (params) => {
        const base = normalizeTableParams(params as Record<string, unknown>);
        const queryParams = {
          ...params,
          current: base.page,
          pageSize: base.pageSize,
        } as unknown as { current?: number; pageSize?: number } & Partial<ProductStockQueryParams>;
        
        const response = await inventoryService.getList(queryParams);
        return {
          data: response.data,
          success: response.success,
          total: response.total,
        };
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增
        </Button>,
        <Button key="refresh" onClick={onRefresh}>
          刷新
        </Button>,
      ]}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
      }}
    />
  );
};

export default InventoryList;
