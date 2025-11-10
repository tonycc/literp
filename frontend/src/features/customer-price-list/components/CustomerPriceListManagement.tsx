import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Space,
  Tag,
  Image,
  Tooltip,
  message,
  Modal,
  Popconfirm,
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  CustomerPriceList,
  CustomerPriceListParams,
} from '../types';
import {
  PriceListStatus,
  VATRate,
  Unit,
} from '../types';
import AddCustomerPriceListModal from './AddCustomerPriceListModal';

// 模拟数据
const mockData: CustomerPriceList[] = [
  {
    id: '1',
    customerId: 'C001',
    customerName: '华为技术有限公司',
    productName: '机械零件A',
    productImage: 'https://via.placeholder.com/60x60',
    productCode: 'FP001',
    customerProductCode: 'HW-FP001',

    specification: '精密加工，表面镀锌',
    unit: Unit.PCS,
    priceIncludingTax: 145.00,
    vatRate: VATRate.RATE_13,
    priceExcludingTax: 128.32,
    taxAmount: 16.68,
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31',
    status: PriceListStatus.ACTIVE,
    salesManager: '张三',
    submittedBy: '李四',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
    createdBy: '李四',
    updatedBy: '李四',
  },
  {
    id: '2',
    customerId: 'C002',
    customerName: '腾讯科技有限公司',
    productName: '精密齿轮',
    productImage: 'https://via.placeholder.com/60x60',
    productCode: 'FP002',
    customerProductCode: 'TX-FP002',
    specification: '高精度齿轮，模数2.5',
    unit: Unit.PCS,
    priceIncludingTax: 280.00,
    vatRate: VATRate.RATE_13,
    priceExcludingTax: 247.79,
    taxAmount: 32.21,
    effectiveDate: '2024-02-01',
    expiryDate: '2024-12-31',
    status: PriceListStatus.ACTIVE,
    salesManager: '王五',
    submittedBy: '赵六',
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-02-01 09:00:00',
    createdBy: '赵六',
    updatedBy: '赵六',
  },
  {
    id: '3',
    customerId: 'C003',
    customerName: '阿里巴巴集团',
    productName: '液压缸体',
    productImage: 'https://via.placeholder.com/60x60',
    productCode: 'FP003',
    customerProductCode: 'ALI-FP003',
    specification: '耐压25MPa，行程200mm',
    unit: Unit.PCS,
    priceIncludingTax: 1850.00,
    vatRate: VATRate.RATE_13,
    priceExcludingTax: 1637.17,
    taxAmount: 212.83,
    effectiveDate: '2024-03-01',
    expiryDate: '2024-12-31',
    status: PriceListStatus.ACTIVE,
    salesManager: '李四',
    submittedBy: '张三',
    createdAt: '2024-03-01 14:00:00',
    updatedAt: '2024-03-01 14:00:00',
    createdBy: '张三',
    updatedBy: '张三',
  },
  {
    id: '4',
    customerId: 'C004',
    customerName: '百度在线网络技术有限公司',
    productName: '电机外壳',
    productImage: 'https://via.placeholder.com/60x60',
    productCode: 'FP004',
    customerProductCode: 'BD-FP004',
    specification: '铝合金材质，防护等级IP65',
    unit: Unit.PCS,
    priceIncludingTax: 320.00,
    vatRate: VATRate.RATE_13,
    priceExcludingTax: 283.19,
    taxAmount: 36.81,
    effectiveDate: '2024-04-01',
    expiryDate: '2024-12-31',
    status: PriceListStatus.PENDING,
    salesManager: '赵六',
    submittedBy: '王五',
    createdAt: '2024-04-01 11:00:00',
    updatedAt: '2024-04-01 11:00:00',
    createdBy: '王五',
    updatedBy: '王五',
  },
  {
    id: '5',
    customerId: 'C001',
    customerName: '华为技术有限公司',
    productName: '传动轴',
    productImage: 'https://via.placeholder.com/60x60',
    productCode: 'FP005',
    customerProductCode: 'HW-FP005',
    specification: '45#钢调质，表面硬度HRC45-50',
    unit: Unit.PCS,
    priceIncludingTax: 680.00,
    vatRate: VATRate.RATE_13,
    priceExcludingTax: 601.77,
    taxAmount: 78.23,
    effectiveDate: '2024-05-01',
    expiryDate: '2024-12-31',
    status: PriceListStatus.ACTIVE,
    salesManager: '张三',
    submittedBy: '李四',
    createdAt: '2024-05-01 16:00:00',
    updatedAt: '2024-05-01 16:00:00',
    createdBy: '李四',
    updatedBy: '李四',
  },
];

const CustomerPriceListManagement: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const actionRef = useRef<ActionType>(null);

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      // 这里应该调用API删除数据
      console.log('删除客户价格表:', id);
      message.success('删除成功');
      // 重新加载数据
      actionRef.current?.reload();
    } catch {
      message.error('删除失败');
    }
  };

  // 处理编辑
  const handleEdit = (record: CustomerPriceList) => {
    console.log('编辑记录:', record);
    message.info('编辑功能开发中...');
  };

  // 处理新增
  const handleAdd = () => {
    setAddModalOpen(true);
  };

  // 批量删除
  const handleBatchDelete = async () => {
    Modal.confirm({
      title: '确定要删除选中的价格表吗？',
      content: `将删除 ${selectedRowKeys.length} 个价格表，删除后无法恢复，请确认操作。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          console.log('批量删除价格表:', selectedRowKeys);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          // 重新加载数据
          actionRef.current?.reload();
        } catch {
          message.error('批量删除失败');
        }
      }
    });
  };

  // 状态选项
  const statusOptions = [
    { label: '生效', value: PriceListStatus.ACTIVE, color: 'green' },
    { label: '失效', value: PriceListStatus.INACTIVE, color: 'red' },
    { label: '待生效', value: PriceListStatus.PENDING, color: 'orange' },
    { label: '已过期', value: PriceListStatus.EXPIRED, color: 'gray' },
  ];

  // 获取状态标签颜色
  const getStatusColor = (status: PriceListStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'default';
  };

  // 获取状态标签文本
  const getStatusText = (status: PriceListStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  // 表格列定义
  const columns: ProColumns<CustomerPriceList> = [
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      fixed: 'left',
      search: true,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      search: true,
    },
    {
      title: '产品图片',
      dataIndex: 'productImage',
      key: 'productImage',
      width: 80,
      render: (_, record) => (
        record.productImage ? (
          <Image
            src={record.productImage}
            alt="产品图片"
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 50, height: 50, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            暂无图片
          </div>
        )
      ),
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      search: true,
    },
    {
      title: '客户产品编码',
      dataIndex: 'customerProductCode',
      key: 'customerProductCode',
      width: 130,
      render: (_, record) => record.customerProductCode || '-',
      search: true,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
      render: (_, record) => record.specification || '-',
      search: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      valueType: 'select',
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
      search: true,
    },
    {
      title: '销售单价(含税)',
      dataIndex: 'priceIncludingTax',
      key: 'priceIncludingTax',
      width: 130,
      render: (_, record) => `¥${record.priceIncludingTax.toLocaleString()}`,
      align: 'right',
    },
    {
      title: '增值税税率',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 100,
      render: (_, record) => `${record.vatRate}%`,
      align: 'center',
      valueType: 'select',
      valueEnum: {
        [VATRate.RATE_0]: { text: '0%' },
        [VATRate.RATE_3]: { text: '3%' },
        [VATRate.RATE_6]: { text: '6%' },
        [VATRate.RATE_9]: { text: '9%' },
        [VATRate.RATE_13]: { text: '13%' },
      },
      search: true,
    },
    {
      title: '销售单价(不含税)',
      dataIndex: 'priceExcludingTax',
      key: 'priceExcludingTax',
      width: 140,
      render: (_, record) => `¥${record.priceExcludingTax.toLocaleString()}`,
      align: 'right',
    },
    {
      title: '税额',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 100,
      render: (_, record) => `¥${record.taxAmount.toLocaleString()}`,
      align: 'right',
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 110,
      render: (_, record) => dayjs(record.effectiveDate).format('YYYY-MM-DD'),
      valueType: 'date',
      search: {
        transform: (value) => {
          return {
            effectiveDateStart: value,
          };
        },
      },
    },
    {
      title: '失效日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (_, record) => record.expiryDate ? dayjs(record.expiryDate).format('YYYY-MM-DD') : '-',
      valueType: 'date',
      search: {
        transform: (value) => {
          return {
            expiryDate: value,
          };
        },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
      valueType: 'select',
      valueEnum: {
        [PriceListStatus.ACTIVE]: { text: '生效' },
        [PriceListStatus.INACTIVE]: { text: '失效' },
        [PriceListStatus.PENDING]: { text: '待生效' },
        [PriceListStatus.EXPIRED]: { text: '已过期' },
      },
      search: true,
    },
    {
      title: '销售负责人',
      dataIndex: 'salesManager',
      key: 'salesManager',
      width: 100,
      search: true,
    },
    {
      title: '提交人',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip key="edit" title="编辑">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="确定要删除这条价格表记录吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          />
        </Popconfirm>,
      ],
    },
  ];

  // 加载数据，适配ProTable的request属性
  const loadData = async (params: CustomerPriceListParams) => {
    // 模拟加载状态
    try {
      // 这里应该调用实际的API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟API响应
      const result = {
        data: mockData,
        total: mockData.length,
        success: true,
      };
      
      return result;
    } catch {
      message.error('加载数据失败');
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <ProTable<CustomerPriceList>
        headerTitle="客户价格表管理"
        columns={columns}
        request={async (params) => {
          // 将ProTable的参数转换为客户价格表参数
          const queryParams: CustomerPriceListParams = {
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.keyword,
            status: params.status as PriceListStatus,
            salesManager: params.salesManager,
            productCode: params.productCode,
            customerProductCode: params.customerProductCode,
            specification: params.specification,
            unit: params.unit as Unit,
            vatRate: params.vatRate !== undefined ? Number(params.vatRate) as VATRate : undefined,
            effectiveDateStart: params.effectiveDateStart,
            effectiveDateEnd: params.effectiveDateEnd,
            expiryDate: params.expiryDate,
          };
          
          return await loadData(queryParams);
        }}
        rowKey="id"
        actionRef={actionRef}
        rowSelection={rowSelection}
        scroll={{ x: 1800 }}
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
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增价格表
          </Button>,
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

      {/* 新增客户价格表弹窗 */}
      <AddCustomerPriceListModal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onSuccess={() => {
           setAddModalOpen(false);
           // 重新加载数据
           actionRef.current?.reload();
         }}
      />
    </div>
  );
};

export default CustomerPriceListManagement;