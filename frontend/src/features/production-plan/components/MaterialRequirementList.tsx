import React from 'react';
import { Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { MaterialRequirement } from '@zyerp/shared';

export interface MaterialRequirementListProps {
  data?: MaterialRequirement[];
  loading?: boolean;
  localeEmptyText?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: MaterialRequirement[]) => void;
  onPurchaseSuggestion?: (item: MaterialRequirement) => void;
  onOutsourceSuggestion?: (item: MaterialRequirement) => void;
  showActions?: boolean;
}

export const MaterialRequirementList: React.FC<MaterialRequirementListProps> = ({
  data = [],
  loading,
  localeEmptyText,
  onPurchaseSuggestion,
  onOutsourceSuggestion,
  showActions = true,
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
      title: '获取方式',
      valueType: 'text',
      width: 120,
      render: (_, record) => (record.needOutsource ? '外协' : '采购'),
    },
    {
      title: '需采购',
      dataIndex: 'needPurchase',
      valueType: 'text',
      width: 100,
      render: (_, record) => (record.shortageQuantity > 0 ? '需要' : '不需要'),    },
    {
      title: '需外协',
      dataIndex: 'needOutsource',
      valueType: 'text',
      width: 100,
      render: (_, record) => (record.needOutsource ? '需要' : '不需要'),
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="po"
          type="link"
          disabled={!(Number(record.shortageQuantity) > 0)}
          onClick={() => onPurchaseSuggestion?.(record)}
        >采购建议</Button>,
        <Button
          key="outs"
          type="link"
          disabled={!(record.needOutsource && Number(record.shortageQuantity) > 0)}
          onClick={() => onOutsourceSuggestion?.(record)}
        >外协建议</Button>,
      ],
    },
  ];

  const finalColumns: ProColumns<MaterialRequirement>[] = showActions ? columns : columns.filter(c => c.title !== '操作');

  return (
    <ProTable<MaterialRequirement>
      columns={finalColumns}
      dataSource={data}
      loading={loading}
      rowKey={(row) => row.materialId}
      search={false}
      locale={localeEmptyText ? { emptyText: localeEmptyText } : undefined}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
      }}
    />
  );
};