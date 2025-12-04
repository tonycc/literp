import React, { useState, useEffect } from 'react';
import { Button, Space, Tag, Tooltip } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Supplier } from '@zyerp/shared';
import { SupplierStatus } from '@zyerp/shared';
import { SUPPLIER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/supplier';
import { getDict } from '@/shared/services/dictionary.service';
import { supplierService } from '../services/supplier.service';

interface SupplierListProps {
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  selectedRowKeys: React.Key[];
  onSelectChange: (keys: React.Key[]) => void;
  onAdd: () => void;
  onEdit: (supplier: Supplier) => void;
  onView: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onBatchStatusChange: (status: SupplierStatus) => void;
  onBatchDelete: () => void;
  onImport: () => void;
  onExport: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  actionRef,
  selectedRowKeys,
  onSelectChange,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onBatchStatusChange,
  onBatchDelete,
}) => {
  const [categoryValueEnum, setCategoryValueEnum] = useState<Record<string, { text: string; status?: string }>>({});

  useEffect(() => {
    void getDict('supplier-category').then((res) => {
      setCategoryValueEnum(res.valueEnum);
    });
  }, []);

  const renderStatus = (status: SupplierStatus) => {
    const statusConfig = {
      [SupplierStatus.ACTIVE]: { color: 'green', text: '启用' },
      [SupplierStatus.INACTIVE]: { color: 'gray', text: '停用' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderCategory = (category: string) => {
    const item = categoryValueEnum[category];
    const statusColorMap: Record<string, string> = {
      Success: 'green',
      Processing: 'blue',
      Error: 'red',
      Warning: 'orange',
      Default: 'default',
    };
    const color = item?.status ? statusColorMap[item.status] : 'default';
    return <Tag color={color}>{item?.text || category}</Tag>;
  };

  const columns: ProColumns<Supplier>[] = [
    {
      title: '供应商编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      hideInSearch: true
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (_, record: Supplier) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          {record.shortName && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.shortName}</div>
          )}
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      valueType: 'select',
      valueEnum: categoryValueEnum,
      render: (_, record: Supplier) => renderCategory(record.category)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: SUPPLIER_STATUS_VALUE_ENUM_PRO,
      render: (_, record: Supplier) => renderStatus(record.status)
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactPerson',
      width: 100,
      hideInSearch: true
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'contactPhone',
      width: 120,
      hideInSearch: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record: Supplier) => new Date(record.createdAt).toLocaleString()
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 200,
      render: (_, record: Supplier) => [
        <Tooltip key="view" title="查看详情">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
        </Tooltip>,
        <Tooltip key="edit" title="编辑">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>,
        <Tooltip key="delete" title="删除">
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          />
        </Tooltip>
      ]
    }
  ];

  return (
    <ProTable<Supplier>
      headerTitle="供应商管理"
      columns={columns}
      actionRef={actionRef}
      rowKey="id"
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      scroll={{ x: 1500 }}
      request={async (params) => {
        const resp = await supplierService.getList(params)
        return {
          data: resp.data,
          success: resp.success,
          total: resp.total,
        }
      }}
      search={{
        labelWidth: 'auto',
        span: 6,
        defaultCollapsed: false,
      }}
      toolBarRender={() => [
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          新增供应商
        </Button>
      ]}
      tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
        <Space size={24}>
          <span>
            已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
            <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
              取消选择
            </a>
          </span>
        </Space>
      )}
      tableAlertOptionRender={({ selectedRowKeys }) => (
        <Space size={16}>
          <Button
            size="small"
            onClick={() => onBatchStatusChange(SupplierStatus.ACTIVE)}
            disabled={selectedRowKeys.length === 0}
          >
            批量启用
          </Button>
          <Button
            size="small"
            onClick={() => onBatchStatusChange(SupplierStatus.INACTIVE)}
            disabled={selectedRowKeys.length === 0}
          >
            批量停用
          </Button>
          <Button
            size="small"
            danger
            onClick={onBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>
        </Space>
      )}
    />
  );
};

export default SupplierList;
