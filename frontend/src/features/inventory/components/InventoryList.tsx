import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { ProductStockInfo } from '@zyerp/shared';
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
      // valueEnum 可在后续接入字典
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      ellipsis: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      ellipsis: true,
      width: 80,
    },
    {
      title: '现有库存',
      dataIndex: 'currentStock',
      valueType: 'digit',
      width: 120,
    },
    {
      title: '预留库存',
      dataIndex: 'reservedStock',
      valueType: 'digit',
      width: 120,
    },
    {
      title: '可用库存',
      dataIndex: 'availableStock',
      valueType: 'digit',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      // valueEnum 可在后续接入字典
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
        <Button key="delete" type="link" danger onClick={() => onDelete?.(record.id)}>
          删除
        </Button>,
      ],
    },
  ];

  return (
    <ProTable<ProductStockInfo>
      columns={columns}
      request={async (params) => {
        const base = normalizeTableParams(params as any)
        const response = await inventoryService.getList({ current: base.page, pageSize: base.pageSize, ...(params as any) });
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
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
      }}
    />
  );
};

export default InventoryList;
