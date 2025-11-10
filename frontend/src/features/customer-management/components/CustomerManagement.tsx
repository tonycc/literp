/**
 * 客户信息管理主页面组件
 */

import React, { useState, useEffect, useRef } from 'react';
import { AddCustomerModal } from './AddCustomerModal';
import {
  Button,
  Space,
  Tag,
  message,
  Tooltip,
  Modal,
} from 'antd';
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
import type {
  Customer,
  CustomerCategory,
  CustomerStatus,
  CreditLevel,
} from '../types';

// 模拟数据
const mockData: Customer[] = [
  {
    id: '1',
    code: 'CUS001',
    name: '深圳市华为技术有限公司',
    category: 'enterprise' as CustomerCategory,
    contactPerson: '张经理',
    phone: '13800138001',
    email: 'zhang@huawei.com',
    address: '深圳市龙岗区华为基地',
    creditLevel: 'AAA' as CreditLevel,
    creditLimit: 5000000,
    status: 'active' as CustomerStatus,
    taxNumber: '91440300708461136T',
    bankAccount: '6225880123456789',
    bankName: '中国银行深圳分行',
    website: 'https://www.huawei.com',
    industry: '通信设备制造',
    establishedDate: '1987-09-15',
    registeredCapital: 4040000000,
    businessLicense: '91440300708461136T',
    legalRepresentative: '任正非',
    remark: '重要客户，优先处理',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-20 14:20:00',
    createdBy: 'admin',
    updatedBy: 'admin',
  },
  {
    id: '2',
    code: 'CUS002',
    name: '北京小米科技有限责任公司',
    category: 'enterprise' as CustomerCategory,
    contactPerson: '李总监',
    phone: '13900139002',
    email: 'li@xiaomi.com',
    address: '北京市海淀区小米科技园',
    creditLevel: 'AA' as CreditLevel,
    creditLimit: 3000000,
    status: 'active' as CustomerStatus,
    taxNumber: '91110108551385082Q',
    bankAccount: '6225880987654321',
    bankName: '招商银行北京分行',
    website: 'https://www.mi.com',
    industry: '消费电子',
    establishedDate: '2010-03-03',
    registeredCapital: 1850000000,
    businessLicense: '91110108551385082Q',
    legalRepresentative: '雷军',
    remark: '长期合作伙伴',
    createdAt: '2024-01-16 09:15:00',
    updatedAt: '2024-01-18 16:45:00',
    createdBy: 'admin',
    updatedBy: 'admin',
  },
];

const CustomerManagement: React.FC = () => {
  const [data, setData] = useState<Customer[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const actionRef = useRef<ActionType>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 这里应该调用API获取数据
      // const response = await customerService.getCustomerList(searchParams);
      // setData(response.data);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockData);
    } catch {
      message.error('加载客户数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      // 这里应该调用API删除数据
      // await customerService.deleteCustomer(id);
      
      console.log('删除客户:', id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  // 导出数据
  const handleExport = () => {
    // 这里应该实现导出功能
    message.info('导出功能开发中...');
  };

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
  const columns: ProColumns<Customer> = [
    {
      title: '客户编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      search: false
    },
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => (
        <Tooltip placement="topLeft" title={record.name}>
          {record.name}
        </Tooltip>
      ),
      search: true
    },
    {
      title: '客户分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (_, record) => getCategoryTag(record.category),
      valueType: 'select',
      valueEnum: {
        enterprise: { text: '企业客户', status: 'Default' },
        individual: { text: '个人客户', status: 'Success' },
        government: { text: '政府客户', status: 'Warning' },
        institution: { text: '机构客户', status: 'Processing' },
      },
      search: true
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
      search: true
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      search: true
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => (
        <Tooltip placement="topLeft" title={record.email}>
          {record.email}
        </Tooltip>
      ),
      search: true
    },
    {
      title: '信用等级',
      dataIndex: 'creditLevel',
      key: 'creditLevel',
      width: 100,
      render: (_, record) => getCreditLevelTag(record.creditLevel),
      valueType: 'select',
      valueEnum: {
        AAA: { text: 'AAA', status: 'Success' },
        AA: { text: 'AA', status: 'Processing' },
        A: { text: 'A', status: 'Default' },
        BBB: { text: 'BBB', status: 'Warning' },
        BB: { text: 'BB', status: 'Error' },
        B: { text: 'B', status: 'Error' },
        C: { text: 'C', status: 'Error' },
      },
      search: true
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
      valueEnum: {
        active: { text: '活跃', status: 'Success' },
        inactive: { text: '非活跃', status: 'Default' },
        suspended: { text: '暂停', status: 'Warning' },
        blacklisted: { text: '黑名单', status: 'Error' },
      },
      search: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
      valueType: 'dateTime',
      search: false
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
            onClick={() => {
              // 这里应该打开详情页面
              message.info('查看详情功能开发中...');
            }}
          />
        </Tooltip>,
        <Tooltip key="edit" title="编辑">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              // 这里应该打开编辑表单
              message.info('编辑功能开发中...');
            }}
          />
        </Tooltip>,
        <Tooltip key="delete" title="删除">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确定要删除这个客户吗？',
                content: '删除后无法恢复，请确认操作。',
                okText: '确定',
                cancelText: '取消',
                onOk: () => handleDelete(record.id)
              });
            }}
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

  // 批量删除
  const handleBatchDelete = async () => {
    Modal.confirm({
      title: '确定要删除选中的客户吗？',
      content: `将删除 ${selectedRowKeys.length} 个客户，删除后无法恢复，请确认操作。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 这里应该调用API批量删除数据
          // await customerService.batchDeleteCustomers(selectedRowKeys as string[]);
          
          console.log('批量删除客户:', selectedRowKeys);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          loadData();
        } catch {
          message.error('批量删除失败');
        }
      }
    });
  };

  return (
    <div style={{ padding: '0' }}>
      {/* 主要内容卡片 */}
        <ProTable<Customer>
          headerTitle="客户信息管理"
          columns={columns}
          dataSource={data}
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
                // 这里应该实现导出功能
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
        onCancel={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          loadData(); // 刷新列表数据
        }}
      />
    </div>
  );
};

export default CustomerManagement;