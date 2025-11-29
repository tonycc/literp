/**
 * 客户信息管理主页面组件
 */

import React, { useState, useRef } from 'react';
import { AddCustomerModal } from './AddCustomerModal';
import CustomerDetail from './CustomerDetail';
import { Button, Space, Tag, Tooltip } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
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
import { CUSTOMER_CATEGORY_VALUE_ENUM_PRO, CUSTOMER_CREDIT_LEVEL_VALUE_ENUM_PRO, CUSTOMER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/customer';
import { useEffect, useState } from 'react'
import { getDict } from '@/shared/services/dictionary.service'
import { customerService } from '../services/customer.service';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import { useMessage } from '@/shared/hooks';
import { useCustomer } from '../hooks/useCustomer';

const CustomerManagement: React.FC = () => {
  const message = useMessage();

  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const actionRef = useRef<ActionType>(null);

  const {
    handleDelete: hookHandleDelete,
    handleBatchDelete: hookHandleBatchDelete,
  } = useCustomer(() => actionRef.current?.reload?.());

  const request = async (params: Record<string, unknown>) => {
    setLoading(true);
    try {
      const base = normalizeTableParams(params);
      const query: CustomerListParams = {
        page: base.page,
        pageSize: base.pageSize,
        keyword: (params as Record<string, unknown>).name as string | undefined,
        category: (params as Record<string, unknown>).category as string | undefined,
        status: (params as Record<string, unknown>).status as string | undefined,
        creditLevel: (params as Record<string, unknown>).creditLevel as string | undefined,
      };
      const res = await customerService.getCustomerList(query);
      return { data: res.data, success: res.success, total: res.pagination.total };
    } catch {
      message.error('加载客户数据失败');
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => hookHandleDelete(id);


  // 获取状态标签
  const getStatusTag = (status: CustomerStatus) => {
    const statusConfig = {
      active: { color: 'green', text: '活跃' },
      inactive: { color: 'orange', text: '非活跃' },
      suspended: { color: 'red', text: '暂停' },
      blacklisted: { color: 'black', text: '黑名单' },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取分类标签
  const getCategoryTag = (category: CustomerCategory) => {
    const categoryConfig = {
      enterprise: { color: 'blue', text: '企业客户', icon: <BankOutlined /> },
      individual: { color: 'green', text: '个人客户', icon: <UserOutlined /> },
      government: { color: 'red', text: '政府客户', icon: <CrownOutlined /> },
      institution: { color: 'purple', text: '机构客户', icon: <TeamOutlined /> },
    };
    const config = categoryConfig[category];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 获取信用等级标签
  const getCreditLevelTag = (creditLevel: CreditLevel) => {
    const levelConfig = {
      AAA: { color: 'gold', text: 'AAA' },
      AA: { color: 'orange', text: 'AA' },
      A: { color: 'green', text: 'A' },
      BBB: { color: 'blue', text: 'BBB' },
      BB: { color: 'purple', text: 'BB' },
      B: { color: 'red', text: 'B' },
      C: { color: 'black', text: 'C' },
    };
    const config = levelConfig[creditLevel];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const [categoryValueEnum, setCategoryValueEnum] = useState<Record<string, { text: string }>>(CUSTOMER_CATEGORY_VALUE_ENUM_PRO)
  const [statusValueEnum, setStatusValueEnum] = useState<Record<string, { text: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }>>(CUSTOMER_STATUS_VALUE_ENUM_PRO)
  const [creditValueEnum, setCreditValueEnum] = useState<Record<string, { text: string }>>(CUSTOMER_CREDIT_LEVEL_VALUE_ENUM_PRO)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      const dc = await getDict('customer-category')
      const ds = await getDict('customer-status')
      const dl = await getDict('customer-credit-level')
      if (mounted) {
        if (Object.keys(dc.valueEnum).length > 0) {
          const v: Record<string, { text: string }> = {}
          Object.entries(dc.valueEnum).forEach(([k, val]) => { v[k] = { text: val.text } })
          setCategoryValueEnum(v)
        }
        if (Object.keys(ds.valueEnum).length > 0) setStatusValueEnum(ds.valueEnum)
        if (Object.keys(dl.valueEnum).length > 0) {
          const v2: Record<string, { text: string }> = {}
          Object.entries(dl.valueEnum).forEach(([k, val]) => { v2[k] = { text: val.text } })
          setCreditValueEnum(v2)
        }
      }
    }
    void run()
    return () => { mounted = false }
  }, [])

  const columns: ProColumns<Customer> = [
    {
      title: '客户编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      hideInSearch: true
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
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
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
    },
    {
      title: '信用等级',
      dataIndex: 'creditLevel',
      key: 'creditLevel',
      width: 100,
      render: (_, record) => getCreditLevelTag(record.creditLevel),
      valueType: 'select',
      valueEnum: creditValueEnum,
    },
    {
      title: '信用额度',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      width: 120,
      render: (_, record) => record.creditLimit ? `¥${record.creditLimit.toLocaleString()}` : '-',
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
            onClick={async () => {
              try {
                const res = await customerService.getById(record.id);
                if (res.success) {
                  setDetailCustomer(res.data);
                  setDetailOpen(true);
                } else {
                  message.error(res.message || '加载失败');
                }
              } catch {
                message.error('加载失败');
              }
            }}
          />
        </Tooltip>,
        <Tooltip key="edit" title="编辑">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCustomerId(record.id);
              setAddModalOpen(true);
            }}
          />
        </Tooltip>,
        <Tooltip key="delete" title="删除">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Tooltip>
      ],
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const handleBatchDelete = async () => {
    const ids = selectedRowKeys as string[];
    await hookHandleBatchDelete(ids);
    setSelectedRowKeys([]);
  };

  return (
    <div style={{ padding: '0' }}>
      {/* 主要内容卡片 */}
        <ProTable<Customer>
          headerTitle="客户信息管理"
          columns={columns}
          request={request}
          rowKey="id"
          loading={loading}
          actionRef={actionRef}
          rowSelection={rowSelection}
          scroll={{ x: 1500 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          search={{
            labelWidth: 'auto',
            span: 6,
            defaultCollapsed: false,
            collapsed: false,
          }}
          toolBarRender={() => [
            <Button
              key="export"
              icon={<ExportOutlined />}
              onClick={() => {
                message.info('导出功能开发中...');
              }}
            >
              导出数据
            </Button>,
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalOpen(true)}
            >
              新增客户
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
          tableAlertOptionRender={() => (
            <Space size={16}>
              <Button
                size="small"
                danger
                onClick={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                批量删除
              </Button>
            </Space>
          )}
          options={{
            setting: {
              listsHeight: 400,
            },
            fullScreen: false,
            reload: true,
            density: false,
          }}
        />

      {/* 新增客户弹窗 */}
  <AddCustomerModal
    open={addModalOpen}
    onCancel={() => {
      setAddModalOpen(false);
      setEditingCustomerId(null);
    }}
    onSuccess={() => {
      setAddModalOpen(false);
      setEditingCustomerId(null);
      actionRef.current?.reload?.();
    }}
    customerId={editingCustomerId || undefined}
  />
  <CustomerDetail
    open={detailOpen}
    customer={detailCustomer}
    onClose={() => {
      setDetailOpen(false);
      setDetailCustomer(null);
    }}
  />
    </div>
  );
};

export default CustomerManagement;
