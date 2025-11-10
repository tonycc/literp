import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { MaterialRequirement } from '@zyerp/shared';

export interface ProductionPlanListProps {
  data?: MaterialRequirement[];
  onAdd?: () => void;
  onEdit?: (item: MaterialRequirement) => void;
  onView?: (item: MaterialRequirement) => void;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: MaterialRequirement[]) => void;
}

export const ProductionPlanList: React.FC<ProductionPlanListProps> = ({
  data = [],
  onAdd,
  onEdit,
  onView,
  onDelete,
  onRefresh,
  selectedRowKeys,
  onSelectChange,
}) => {
  const columns: ProColumns<MaterialRequirement>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      ellipsis: true,
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      ellipsis: true,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      ellipsis: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
    },
    {
      title: '需求数量',
      dataIndex: 'requiredQuantity',
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
      title: '缺口数量',
      dataIndex: 'shortageQuantity',
      valueType: 'digit',
      width: 120,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button key="view" type="link" onClick={() => onView?.(record)}>查看</Button>,
        <Button key="edit" type="link" onClick={() => onEdit?.(record)}>编辑</Button>,
        <Button key="delete" type="link" danger onClick={() => onDelete?.(record.materialId)}>删除</Button>,
      ],
    },
  ];

  return (
    <ProTable<MaterialRequirement>
      columns={columns}
      dataSource={data}
      rowKey={(row) => row.materialId}
      search={false}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>新增</Button>,
        <Button key="refresh" icon={<ReloadOutlined />} onClick={onRefresh}>刷新</Button>,
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