import React from 'react';
import { Button, Space } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import type { 
  CustomerPriceList, 
  CustomerPriceListParams 
} from '@zyerp/shared';
import { customerPriceListService } from '../services/customer-price-list.service';
import { PRICE_LIST_STATUS_VALUE_ENUM, UNIT_VALUE_ENUM } from '../constants';

interface CustomerPriceListListProps {
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  onCreate?: () => void; // Alias for onAdd
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: CustomerPriceList[]) => void;
}

const CustomerPriceListList: React.FC<CustomerPriceListListProps> = ({
  actionRef,
  onAdd,
  onCreate,
  onEdit,
  onDelete,
  onBatchDelete,
  selectedRowKeys,
  onSelectChange,
}) => {
  const handleCreate = onCreate || onAdd;

  const columns: ProColumns<CustomerPriceList>[] = [
    {
      title: '客户名称',
      dataIndex: 'customerName',
      width: 150,
      fixed: 'left',
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      width: 150,
    },
    {
      title: '客户产品编码',
      dataIndex: 'customerProductCode',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
      valueEnum: UNIT_VALUE_ENUM,
      hideInSearch: true,
    },
    {
      title: '含税单价',
      dataIndex: 'priceIncludingTax',
      width: 100,
      valueType: 'money',
      hideInSearch: true,
    },
    {
      title: '税率(%)',
      dataIndex: 'vatRate',
      width: 80,
      hideInSearch: true,
      render: (_, record) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return `${record.vatRate}%`;
      },
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      width: 100,
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '失效日期',
      dataIndex: 'expiryDate',
      width: 100,
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: PRICE_LIST_STATUS_VALUE_ENUM,
    },
    {
      title: '销售负责人',
      dataIndex: 'salesManager',
      width: 100,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record: CustomerPriceList) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const id = record.id;
        return (
          <Space>
            <a onClick={() => onEdit?.(id)}>编辑</a>
            <a onClick={() => onDelete?.(id)} style={{ color: 'red' }}>删除</a>
          </Space>
        );
      },
    },
  ];

  return (
    <ProTable<CustomerPriceList, CustomerPriceListParams>
      headerTitle="客户价格表"
      actionRef={actionRef}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增价格表
        </Button>,
        selectedRowKeys && selectedRowKeys.length > 0 && (
          <Button 
            key="batchDelete" 
            danger 
            onClick={() => onBatchDelete?.(selectedRowKeys as string[])}
          >
            批量删除
          </Button>
        ),
      ]}
      request={async (params: CustomerPriceListParams & { current?: number }) => {
        const { current, pageSize, ...rest } = params;
        const res = await customerPriceListService.getList({
          page: current,
          pageSize: pageSize,
          ...rest,
        });
        return {
          data: res.data?.data || [],
          success: true,
          total: res.data?.total || 0,
        };
      }}
      columns={columns}
      rowSelection={
        onSelectChange
          ? {
              selectedRowKeys,
              onChange: onSelectChange,
            }
          : undefined
      }
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
      }}
    />
  );
};

export default CustomerPriceListList;
