import React, { useRef } from 'react';
import { Button, Space, Tag, Image, Tooltip } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { CustomerPriceList, CustomerPriceListParams } from '../types';
import { PriceListStatus, VATRate, Unit } from '../types';
import { customerPriceListService } from '../services/customer-price-list.service';

export interface CustomerPriceListListProps {
  onAdd?: () => void;
  onEdit?: (item: CustomerPriceList) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: CustomerPriceList[]) => void;
}

export interface CustomerPriceListListHandle {
  reload: () => void;
}

const CustomerPriceListList = React.forwardRef<CustomerPriceListListHandle, CustomerPriceListListProps>(({
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  selectedRowKeys,
  onSelectChange,
}, ref) => {
  const actionRef = useRef<ActionType>(null);

  React.useImperativeHandle(ref, () => ({
    reload: () => actionRef.current?.reload?.(),
  }));

  const statusOptions = [
    { label: '生效', value: PriceListStatus.ACTIVE, color: 'green' },
    { label: '失效', value: PriceListStatus.INACTIVE, color: 'red' },
    { label: '待生效', value: PriceListStatus.PENDING, color: 'orange' },
    { label: '已过期', value: PriceListStatus.EXPIRED, color: 'gray' },
  ];

  const getStatusColor = (status: PriceListStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'default';
  };

  const getStatusText = (status: PriceListStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  const columns: ProColumns<CustomerPriceList>[] = [
    { title: '客户', dataIndex: 'customerName', key: 'customerName', width: 150, fixed: 'left' },
    { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 150 },
    {
      title: '产品图片', dataIndex: 'productImage', key: 'productImage', width: 80,
      render: (_, record) => (
        record.productImage ? (
          <Image src={record.productImage} alt="产品图片" width={50} height={50} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 50, height: 50, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>暂无图片</div>
        )
      ),
    },
    { title: '产品编码', dataIndex: 'productCode', key: 'productCode', width: 120 },
    { title: '客户产品编码', dataIndex: 'customerProductCode', key: 'customerProductCode', width: 130, render: (_, r) => r.customerProductCode || '-' },
    { title: '规格型号', dataIndex: 'specification', key: 'specification', width: 120, render: (_, r) => r.specification || '-' },
    {
      title: '单位', dataIndex: 'unit', key: 'unit', width: 80, valueType: 'select',
      valueEnum: {
        [Unit.PCS]: { text: '件' },
        [Unit.SET]: { text: '套' },
        [Unit.BOX]: { text: '箱' },
        [Unit.KG]: { text: '千克' },
        [Unit.G]: { text: '克' },
        [Unit.M]: { text: '米' },
        [Unit.CM]: { text: '厘米' },
        [Unit.M2]: { text: '平方米' },
        [Unit.M3]: { text: '立方米' },
        [Unit.L]: { text: '升' },
        [Unit.ML]: { text: '毫升' },
        [Unit.PAIR]: { text: '对' },
        [Unit.DOZEN]: { text: '打' },
      },
    },
    { title: '销售单价(含税)', dataIndex: 'priceIncludingTax', key: 'priceIncludingTax', width: 130, render: (_, r) => `¥${r.priceIncludingTax.toLocaleString()}`, align: 'right' },
    {
      title: '增值税税率', dataIndex: 'vatRate', key: 'vatRate', width: 100, render: (_, r) => `${r.vatRate}%`, align: 'center', valueType: 'select',
      valueEnum: {
        [VATRate.RATE_0]: { text: '0%' },
        [VATRate.RATE_3]: { text: '3%' },
        [VATRate.RATE_6]: { text: '6%' },
        [VATRate.RATE_9]: { text: '9%' },
        [VATRate.RATE_13]: { text: '13%' },
      },
    },
    { title: '销售单价(不含税)', dataIndex: 'priceExcludingTax', key: 'priceExcludingTax', width: 140, render: (_, r) => `¥${r.priceExcludingTax.toLocaleString()}`, align: 'right' },
    { title: '税额', dataIndex: 'taxAmount', key: 'taxAmount', width: 100, render: (_, r) => `¥${r.taxAmount.toLocaleString()}`, align: 'right' },
    {
      title: '生效日期', dataIndex: 'effectiveDate', key: 'effectiveDate', width: 110, valueType: 'date',
      render: (_, r) => dayjs(r.effectiveDate).format('YYYY-MM-DD'),
      search: { transform: (value) => ({ effectiveDateStart: value }) },
    },
    {
      title: '失效日期', dataIndex: 'expiryDate', key: 'expiryDate', width: 110, valueType: 'date',
      render: (_, r) => r.expiryDate ? dayjs(r.expiryDate).format('YYYY-MM-DD') : '-',
      search: { transform: (value) => ({ expiryDate: value }) },
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80, valueType: 'select',
      render: (_, r) => (<Tag color={getStatusColor(r.status)}>{getStatusText(r.status)}</Tag>),
      valueEnum: {
        [PriceListStatus.ACTIVE]: { text: '生效' },
        [PriceListStatus.INACTIVE]: { text: '失效' },
        [PriceListStatus.PENDING]: { text: '待生效' },
        [PriceListStatus.EXPIRED]: { text: '已过期' },
      },
    },
    { title: '销售负责人', dataIndex: 'salesManager', key: 'salesManager', width: 100 },
    { title: '创建人', dataIndex: 'createdByName', key: 'createdByName', width: 120 },
    {
      title: '操作', key: 'action', width: 120, fixed: 'right', valueType: 'option',
      render: (_, record) => [
        <Tooltip key="edit" title="编辑">
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit?.(record)} />
        </Tooltip>,
        <Tooltip key="delete" title="删除">
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => onDelete?.(record.id)} />
        </Tooltip>,
      ],
    },
  ];

  const loadData = async (params: CustomerPriceListParams) => {
    const res = await customerPriceListService.getList(params);
    return { data: res.data, total: res.pagination.total, success: res.success };
  };

  return (
    <ProTable<CustomerPriceList>
      headerTitle="客户价格表管理"
      columns={columns}
      request={async (params) => {
        const queryParams: CustomerPriceListParams = {
          page: params.current,
          pageSize: params.pageSize,
          keyword: params.keyword as string,
          status: params.status as PriceListStatus,
          salesManager: params.salesManager as string,
          productCode: params.productCode as string,
          customerId: params.customerId as string,
          effectiveDateStart: params.effectiveDateStart as string,
          effectiveDateEnd: params.effectiveDateEnd as string,
          expiryDate: params.expiryDate as string,
        };
        const result = await loadData(queryParams);
        onRefresh?.();
        return result;
      }}
      rowKey="id"
      actionRef={actionRef}
      rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
      scroll={{ x: 1800 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
      }}
      search={{ labelWidth: 'auto', span: 6, defaultCollapsed: false, collapsed: false }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>新增价格表</Button>,
      ]}
      tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
        <Space size={24}>
          <span>
            已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
            <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>取消选择</a>
          </span>
        </Space>
      )}
      tableAlertOptionRender={() => (
        <Space size={16}>
          {/* 批量操作在父组件触发 */}
        </Space>
      )}
      options={{ setting: { listsHeight: 400 }, fullScreen: false, reload: true, density: false }}
    />
  );
});

export default CustomerPriceListList;