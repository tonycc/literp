import React, { useState, useEffect } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  EyeOutlined,
  UserOutlined,
  CrownOutlined,
  BankOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Customer, CustomerCategory, CustomerStatus, CreditLevel, CustomerListParams } from '../types';
import { getDict } from '@/shared/services/dictionary.service';
import { customerService } from '../services/customer.service';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

interface CustomerListProps {
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  selectedRowKeys: React.Key[];
  onSelectChange: (keys: React.Key[]) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onView: (record: Customer) => void;
  onDelete: (id: string) => void;
  onBatchDelete: () => void;
  onExport: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  actionRef,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onExport,
}) => {
  const [categoryValueEnum, setCategoryValueEnum] = useState<Record<string, { text: string }>>({});
  const [statusValueEnum, setStatusValueEnum] = useState<Record<string, { text: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }>>({});
  const [creditValueEnum, setCreditValueEnum] = useState<Record<string, { text: string }>>({});

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const [dc, ds, dl] = await Promise.all([
        getDict('customer-category'),
        getDict('customer-status'),
        getDict('customer-credit-level'),
      ]);
      
      if (mounted) {
        if (Object.keys(dc.valueEnum).length > 0) {
          const v: Record<string, { text: string }> = {};
          Object.entries(dc.valueEnum).forEach(([k, val]) => { v[k] = { text: val.text }; });
          setCategoryValueEnum(v);
        }
        if (Object.keys(ds.valueEnum).length > 0) setStatusValueEnum(ds.valueEnum);
        if (Object.keys(dl.valueEnum).length > 0) {
          const v2: Record<string, { text: string }> = {};
          Object.entries(dl.valueEnum).forEach(([k, val]) => { v2[k] = { text: val.text }; });
          setCreditValueEnum(v2);
        }
      }
    };
    void run();
    return () => { mounted = false; };
  }, []);

  const getStatusTag = (status: CustomerStatus) => {
    const config = statusValueEnum[status];
    if (!config) return <Tag>{status}</Tag>;
    
    // 映射 status 到 Tag color
    const statusColorMap: Record<string, string> = {
      Success: 'green',
      Processing: 'blue',
      Error: 'red',
      Warning: 'orange',
      Default: 'default',
    };
    const color = config.status ? statusColorMap[config.status] : 'default';
    return <Tag color={color}>{config.text}</Tag>;
  };

  const getCategoryTag = (category: CustomerCategory) => {
    const categoryConfig = {
      enterprise: { color: 'blue', icon: <BankOutlined /> },
      individual: { color: 'green', icon: <UserOutlined /> },
      government: { color: 'red', icon: <CrownOutlined /> },
      institution: { color: 'purple', icon: <TeamOutlined /> },
    };
    const config = categoryConfig[category as keyof typeof categoryConfig] || { color: 'default' };
    const text = categoryValueEnum[category]?.text || category;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {text}
      </Tag>
    );
  };

  const getCreditLevelTag = (creditLevel: CreditLevel) => {
    const levelConfig: Record<string, string> = {
      AAA: 'gold',
      AA: 'orange',
      A: 'green',
      BBB: 'blue',
      BB: 'purple',
      B: 'red',
      C: 'black',
    };
    const color = levelConfig[creditLevel] || 'default';
    const text = creditValueEnum[creditLevel]?.text || creditLevel;
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ProColumns<Customer>[] = [
    {
      title: '客户编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      search: false,
    },
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      render: (_, record) => (
        <Tooltip placement="topLeft" title={record.name}>
          {record.name}
        </Tooltip>
      ),
    },
    {
      title: '客户分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (_, record) => getCategoryTag(record.category),
      valueType: 'select',
      valueEnum: categoryValueEnum,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
      search: false,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      search: false,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <Tooltip placement="topLeft" title={record.email}>
          {record.email}
        </Tooltip>  
      ),
      search: false,
    },
    {
      title: '信用等级',
      dataIndex: 'creditLevel',
      key: 'creditLevel',
      width: 100,
      render: (_, record) => getCreditLevelTag(record.creditLevel),
      valueType: 'select',
      valueEnum: creditValueEnum,
      search: false,
    },
    {
      title: '信用额度',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      width: 120,
      render: (_, record) => record.creditLimit ? `¥${record.creditLimit.toLocaleString()}` : '-',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => getStatusTag(record.status),
      valueType: 'select',
      valueEnum: statusValueEnum,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
      valueType: 'dateTime',
      hideInSearch: true
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip key="view" title="查看详情">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
        </Tooltip>,
        <Tooltip key="edit" title="编辑">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record.id)}
          />
        </Tooltip>,
        <Tooltip key="delete" title="删除">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          />
        </Tooltip>
      ],
    },
  ];

  const request = async (params: Record<string, unknown>) => {
    try {
      const base = normalizeTableParams(params);
    const query: CustomerListParams = {
      page: base.page,
      pageSize: base.pageSize,
      keyword: params.name as string | undefined,
      category: params.category as CustomerCategory | undefined,
      status: params.status as CustomerStatus | undefined,
      creditLevel: params.creditLevel as CreditLevel | undefined,
    };
      const res = await customerService.getCustomerList(query);
      return { data: res.data, success: res.success, total: res.pagination.total };
    } catch {
      return { data: [], success: false, total: 0 };
    }
  };

  return (
    <ProTable<Customer>
      headerTitle="客户信息管理"
      columns={columns}
      request={request}
      rowKey="id"
      actionRef={actionRef}
      scroll={{ x: 1500 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: number[]) =>
          `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
      }}
      search={{
        labelWidth: 'auto',
        span: 6,
        defaultCollapsed: false,
      }}
      toolBarRender={() => [
        <Button
          key="export"
          icon={<ExportOutlined />}
          onClick={onExport}
        >
          导出数据
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          新增客户
        </Button>
      ]}
     
      options={{
        setting: {
          listsHeight: 400,
        },
        fullScreen: false,
        reload: true,
        density: false,
      }}
    />
  );
};

export default CustomerList;
