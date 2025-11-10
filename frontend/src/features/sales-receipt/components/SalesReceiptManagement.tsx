import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Card
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { 
  SalesReceipt, 
  SalesReceiptQueryParams,
  ReceiptStatus
} from '../types';
import { RECEIPT_STATUS_CONFIG } from '../types';
import AddSalesReceiptModal from './AddSalesReceiptModal';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据
const mockData: SalesReceipt[] = [
  {
    id: '1',
    receiptNumber: 'SR202401001',
    salesOrderNumber: 'SO202401001',
    customerName: '北京科技有限公司',
    customerContact: '张经理 13800138001',
    productName: '智能传感器',
    productCode: 'P001',
    specification: 'HW-S100',
    unit: '个',
    salesQuantity: 100,
    currentReceiptQuantity: 50,
    totalReceiptQuantity: 50,
    totalSalesPrice: 25000,
    receiptStatus: 'pending' as ReceiptStatus,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 10:30:00'
  },
  {
    id: '2',
    receiptNumber: 'SR202401002',
    salesOrderNumber: 'SO202401002',
    customerName: '上海制造有限公司',
    customerContact: '王总监 13900139002',
    productName: '工业控制器',
    productCode: 'P002',
    specification: 'S7-1200',
    unit: '台',
    salesQuantity: 20,
    currentReceiptQuantity: 20,
    totalReceiptQuantity: 20,
    totalSalesPrice: 60000,
    receiptStatus: 'confirmed' as ReceiptStatus,
    receiptConfirmTime: '2024-01-16 14:20:00',
    createdAt: '2024-01-16 09:15:00',
    updatedAt: '2024-01-16 14:20:00'
  },
  {
    id: '3',
    receiptNumber: 'SR202401003',
    salesOrderNumber: 'SO202401003',
    customerName: '深圳电子有限公司',
    customerContact: '刘主管 13700137003',
    productName: '电路板',
    productCode: 'P003',
    specification: 'PCB-A100',
    unit: '片',
    salesQuantity: 500,
    currentReceiptQuantity: 300,
    totalReceiptQuantity: 300,
    totalSalesPrice: 15000,
    receiptStatus: 'rejected' as ReceiptStatus,
    createdAt: '2024-01-17 11:45:00',
    updatedAt: '2024-01-17 16:30:00'
  }
];

export const SalesReceiptManagement: React.FC = () => {
  const [data, setData] = useState<SalesReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<SalesReceiptQueryParams>({
    page: 1,
    pageSize: 10
  });
  const [addModalVisible, setAddModalVisible] = useState(false);

  // 表格列定义
  const columns: ColumnsType<SalesReceipt> = [
    {
      title: '出库单编号',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 120,
      fixed: 'left'
    },
    {
      title: '销售订单编号',
      dataIndex: 'salesOrderNumber',
      key: 'salesOrderNumber',
      width: 130
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150
    },
    {
      title: '客户联系人',
      dataIndex: 'customerContact',
      key: 'customerContact',
      width: 150
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 100
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 120
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60
    },
    {
      title: '销售数量',
      dataIndex: 'salesQuantity',
      key: 'salesQuantity',
      width: 80,
      align: 'right'
    },
    {
      title: '本次出库数量',
      dataIndex: 'currentReceiptQuantity',
      key: 'currentReceiptQuantity',
      width: 100,
      align: 'right'
    },
    {
      title: '出库产品总数',
      dataIndex: 'totalReceiptQuantity',
      key: 'totalReceiptQuantity',
      width: 100,
      align: 'right'
    },
    {
      title: '产品合计售价',
      dataIndex: 'totalSalesPrice',
      key: 'totalSalesPrice',
      width: 120,
      align: 'right',
      render: (value: number) => `¥${value.toLocaleString()}`
    },
    {
      title: '收货状态',
      dataIndex: 'receiptStatus',
      key: 'receiptStatus',
      width: 100,
      render: (status: ReceiptStatus) => {
        const config = RECEIPT_STATUS_CONFIG[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '收货确认时间',
      dataIndex: 'receiptConfirmTime',
      key: 'receiptConfirmTime',
      width: 150,
      render: (time: string) => time || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (record: SalesReceipt) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条出库记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockData);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (field: keyof SalesReceiptQueryParams, value: string) => {
    setQueryParams(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  // 日期范围筛选
  const handleDateRangeFilter = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setQueryParams(prev => ({
        ...prev,
        startDate: dates[0]!.format('YYYY-MM-DD'),
        endDate: dates[1]!.format('YYYY-MM-DD'),
        page: 1
      }));
    } else {
      setQueryParams(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        page: 1
      }));
    }
  };

  // 状态筛选
  const handleStatusFilter = (status: ReceiptStatus | undefined) => {
    setQueryParams(prev => ({
      ...prev,
      receiptStatus: status,
      page: 1
    }));
  };

  // 查看详情
  const handleView = (record: SalesReceipt) => {
    console.log('查看详情:', record);
    message.info('查看详情功能待实现');
  };

  // 编辑
  const handleEdit = (record: SalesReceipt) => {
    console.log('编辑记录:', record);
    message.info('编辑功能待实现');
  };

  // 删除
  const handleDelete = async (id: string) => {
    try {
      console.log('删除记录:', id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 导出
  const handleExport = () => {
    message.info('导出功能待实现');
  };

  // 新增成功回调
  const handleAddSuccess = () => {
    setAddModalVisible(false);
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  return (
    <div style={{ padding: '24px' }}>
      {/* 搜索筛选区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col span={4}>
            <Input
              placeholder="出库单编号"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch('receiptNumber', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="销售订单编号"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch('salesOrderNumber', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="客户名称"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch('customerName', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={2}>
            <Select
              placeholder="收货状态"
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
              allowClear
            >
              {Object.entries(RECEIPT_STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeFilter}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                新增出库
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams(prev => ({ ...prev, page, pageSize }));
            }
          }}
        />
      </Card>

      {/* 新增弹窗 */}
      <AddSalesReceiptModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default SalesReceiptManagement;